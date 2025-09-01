import { App, TFile, Notice } from 'obsidian';
import { AttachmentRecord } from '../main';

export class PDFProcessor {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	// 处理PDF文件，提取元数据
	async processPDF(file: TFile): Promise<Partial<AttachmentRecord>> {
		try {
			const metadata: Partial<AttachmentRecord> = {
				fileName: file.basename,
				filePath: file.path,
				addedTime: new Date().toISOString(),
				referenceCount: 0,
				tags: []
			};

			// 尝试从文件名提取信息
			const fileNameInfo = this.extractInfoFromFileName(file.basename);
			if (fileNameInfo.title) metadata.title = fileNameInfo.title;
			if (fileNameInfo.author) metadata.author = fileNameInfo.author;
			if (fileNameInfo.year) metadata.year = fileNameInfo.year;

			// 尝试从PDF内容提取DOI
			try {
				const doi = await this.extractDOIFromPDF(file);
				if (doi) metadata.doi = doi;
			} catch (error) {
				console.log('Failed to extract DOI from PDF:', error);
			}

			// 尝试从PDF内容提取标题和作者
			try {
				const pdfMetadata = await this.extractMetadataFromPDF(file);
				if (pdfMetadata.title && !metadata.title) metadata.title = pdfMetadata.title;
				if (pdfMetadata.author && !metadata.author) metadata.author = pdfMetadata.author;
				if (pdfMetadata.year && !metadata.year) metadata.year = pdfMetadata.year;
			} catch (error) {
				console.log('Failed to extract metadata from PDF:', error);
			}

			// 如果已有DOI，调用 Crossref 获取权威元数据
			if (metadata.doi) {
				try {
					const cross = await this.fetchCrossrefByDOI(metadata.doi);
					if (cross) {
						metadata.title = cross.title || metadata.title;
						metadata.author = cross.author || metadata.author;
						metadata.year = cross.year || metadata.year;
					}
				} catch (e) {
					console.log('Crossref lookup failed:', e);
				}
			}

			return metadata;
		} catch (error) {
			console.error('Error processing PDF:', error);
			throw error;
		}
	}

	// 从文件名提取信息
	private extractInfoFromFileName(fileName: string): { title?: string; author?: string; year?: string } {
		const info: { title?: string; author?: string; year?: string } = {};
		
		// 尝试匹配 [标题]_[作者]_[年份] 格式
		const pattern = /\[([^\]]+)\]_\[([^\]]+)\]_\[([^\]]+)\]/;
		const match = fileName.match(pattern);
		
		if (match) {
			info.title = match[1].trim();
			info.author = match[2].trim();
			info.year = match[3].trim();
		} else {
			// 尝试匹配其他常见格式
			const parts = fileName.split(/[_\-\s]+/);
			if (parts.length >= 3) {
				// 假设最后一部分是年份
				const yearMatch = parts[parts.length - 1].match(/\d{4}/);
				if (yearMatch) {
					info.year = yearMatch[0];
					info.title = parts.slice(0, -1).join(' ');
				}
			}
		}
		
		return info;
	}

	// 从PDF内容提取DOI
	private async extractDOIFromPDF(file: TFile): Promise<string | null> {
		try {
			// 读取PDF文件的前几KB来查找DOI
			const buffer = await this.app.vault.readBinary(file);
			const text = this.bufferToString(buffer);
			
			// DOI正则表达式模式
			const doiPattern = /10\.\d{4,}(?:\.\d+)*\/\S+(?:\?\S+)?/g;
			const matches = text.match(doiPattern);
			
			if (matches && matches.length > 0) {
				// 返回第一个匹配的DOI
				return matches[0];
			}
			
			return null;
		} catch (error) {
			console.log('Error extracting DOI from PDF:', error);
			return null;
		}
	}

	// 从PDF内容提取元数据
	private async extractMetadataFromPDF(file: TFile): Promise<{ title?: string; author?: string; year?: string }> {
		try {
			const buffer = await this.app.vault.readBinary(file);
			const text = this.bufferToString(buffer);
			
			const metadata: { title?: string; author?: string; year?: string } = {};
			
			// 尝试多种标题线索
			let titleMatch = text.match(/Title[:\s]+([^\n\r]+)/i);
			if (titleMatch) metadata.title = titleMatch[1].trim();
			if (!metadata.title) {
				const t2 = text.match(/\n\s*([^\n\r]{10,100})\n(?:[^\n\r]{0,80})\n/i);
				if (t2) metadata.title = t2[1].trim();
			}
			
			// 提取作者
			const authorMatch = text.match(/Author[:\s]+([^\n\r]+)/i);
			if (authorMatch) metadata.author = authorMatch[1].trim();
			if (!metadata.author) {
				const a2 = text.match(/\bby\s+([^\n\r]{3,100})/i);
				if (a2) metadata.author = a2[1].trim();
			}
			
			// 提取年份
			const yearMatch = text.match(/\b(19|20)\d{2}\b/);
			if (yearMatch) metadata.year = yearMatch[0];
			
			return metadata;
		} catch (error) {
			console.log('Error extracting metadata from PDF:', error);
			return {};
		}
	}

	// 通过 Crossref 获取 DOI 元数据
	private async fetchCrossrefByDOI(doi: string): Promise<{title?: string; author?: string; year?: string} | null> {
		try {
			const resp = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
			if (!resp.ok) return null;
			const data = await resp.json();
			const m = data?.message;
			if (!m) return null;
			const title = Array.isArray(m.title) ? m.title[0] : m.title;
			const author = Array.isArray(m.author) ? m.author.map((a: any) => `${a.given ?? ''} ${a.family ?? ''}`.trim()).filter(Boolean).join(', ') : undefined;
			const year = (m['published-print']?.['date-parts']?.[0]?.[0] || m['published-online']?.['date-parts']?.[0]?.[0] || m.created?.['date-parts']?.[0]?.[0])?.toString();
			return { title, author, year };
		} catch (_) {
			return null;
		}
	}

	// 将Buffer转换为字符串
	private bufferToString(buffer: ArrayBuffer): string {
		const uint8Array = new Uint8Array(buffer);
		let text = '';
		
		// 只处理前100KB以避免内存问题
		const maxBytes = Math.min(uint8Array.length, 100 * 1024);
		
		for (let i = 0; i < maxBytes; i++) {
			const byte = uint8Array[i];
			// 只保留可打印的ASCII字符
			if (byte >= 32 && byte <= 126) {
				text += String.fromCharCode(byte);
			}
		}
		
		return text;
	}

	// 生成文件名
	generateFileName(template: string, metadata: Partial<AttachmentRecord>): string {
		let fileName = template;
		
		// 替换模板变量
		fileName = fileName.replace(/\{\{title\}\}/g, metadata.title || 'Unknown');
		fileName = fileName.replace(/\{\{author\}\}/g, metadata.author || 'Unknown');
		fileName = fileName.replace(/\{\{year\}\}/g, metadata.year || 'Unknown');
		fileName = fileName.replace(/\{\{doi\}\}/g, metadata.doi || 'Unknown');
		
		// 清理文件名中的非法字符
		fileName = fileName.replace(/[<>:"/\\|?*]/g, '_');
		fileName = fileName.replace(/\s+/g, '_');
		
		return fileName;
	}

	// 验证PDF文件
	async validatePDF(file: TFile): Promise<boolean> {
		try {
			const buffer = await this.app.vault.readBinary(file);
			
			// 检查PDF文件头
			const header = this.bufferToString(buffer.slice(0, 8));
			return header.startsWith('%PDF');
		} catch (error) {
			return false;
		}
	}

	// 获取PDF文件大小
	async getPDFSize(file: TFile): Promise<number> {
		try {
			const buffer = await this.app.vault.readBinary(file);
			return buffer.byteLength;
		} catch (error) {
			return 0;
		}
	}

	// 复制PDF文件到目标路径
	async copyPDFToPath(sourceFile: TFile, targetPath: string): Promise<TFile> {
		try {
			const buffer = await this.app.vault.readBinary(sourceFile);
			await this.app.vault.adapter.writeBinary(targetPath, buffer);
			
			// 获取新创建的文件
			const newFile = this.app.vault.getAbstractFileByPath(targetPath);
			if (newFile instanceof TFile) {
				return newFile;
			} else {
				throw new Error('Failed to get copied file');
			}
		} catch (error) {
			console.error('Error copying PDF:', error);
			throw error;
		}
	}

	// 移动PDF文件到目标路径
	async movePDFToPath(sourceFile: TFile, targetPath: string): Promise<TFile> {
		try {
			// 先复制文件
			const newFile = await this.copyPDFToPath(sourceFile, targetPath);
			
			// 删除原文件
			await this.app.vault.delete(sourceFile);
			
			return newFile;
		} catch (error) {
			console.error('Error moving PDF:', error);
			throw error;
		}
	}

	// 生成BibTeX条目
	generateBibTeX(record: AttachmentRecord): string {
		const key = record.doi.replace(/[^a-zA-Z0-9]/g, '') || 
				   record.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
		
		return `@article{${key},
  doi = {${record.doi}},
  title = {${record.title}},
  author = {${record.author}},
  year = {${record.year}},
  file = {${record.filePath}},
  tags = {${record.tags.join(', ')}}
}`;
	}

	// 生成引用文本
	generateCitation(record: AttachmentRecord, format: 'apa' | 'mla' | 'chicago' = 'apa'): string {
		switch (format) {
			case 'apa':
				return `${record.author} (${record.year}). ${record.title}. https://doi.org/${record.doi}`;
			case 'mla':
				return `${record.author}. "${record.title}." ${record.year}. https://doi.org/${record.doi}`;
			case 'chicago':
				return `${record.author}. "${record.title}." ${record.year}. doi: ${record.doi}`;
			default:
				return `${record.author} (${record.year}). ${record.title}. https://doi.org/${record.doi}`;
		}
	}
}
