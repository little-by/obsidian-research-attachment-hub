import { App, TFile, TFolder, Notice } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';

/**
 * 附件标签管理器
 * 负责为每个附件创建、更新和管理对应的MD文件
 */
export class AttachmentTagManager {
	private app: App;
	private plugin: ResearchAttachmentHubPlugin;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	/**
	 * 为附件创建MD文件
	 */
	async createMDFile(record: AttachmentRecord, forceCreate: boolean = false): Promise<void> {
		try {
			// 检查是否应该创建MD文件（除非强制创建）
			if (!forceCreate && !this.shouldCreateMDFile(record)) {
				return;
			}

			const mdFilePath = this.getMDFilePath(record);
			const content = this.generateMDFileContent(record);
			
			await this.writeMDFile(mdFilePath, content);
			
			// 更新记录状态
			record.hasMDFile = true;
			record.mdFilePath = mdFilePath;
			record.mdLastSync = Date.now();
			record.mdFileLost = false; // 清除丢失状态
			
			// 注意：不在这里调用数据库更新，避免死循环
			// 数据库更新由调用方负责
			
			new Notice(`已为 ${record.title} 创建MD文件`);
		} catch (error) {
			console.error('Error creating MD file:', error);
			new Notice(`${this.plugin.languageManager.t('notices.MDFileCreateFailed')}: ${error.message}`);
		}
	}

	/**
	 * 更新附件的MD文件
	 */
	async updateMDFile(record: AttachmentRecord): Promise<void> {
		try {
			if (!record.hasMDFile || !record.mdFilePath) {
				return;
			}

			// 读取现有文件，保留用户笔记
			const existingContent = await this.readMDFile(record.mdFilePath);
			const userNotes = this.extractUserNotes(existingContent);
			
			const content = this.generateMDFileContent(record, userNotes);
			await this.writeMDFile(record.mdFilePath, content);
			
			// 更新同步时间（不调用数据库更新，避免死循环）
			record.mdLastSync = Date.now();
			
		} catch (error) {
			console.error('Error updating MD file:', error);
			new Notice(`${this.plugin.languageManager.t('notices.MDFileUpdateFailed')}: ${error.message}`);
		}
	}

	/**
	 * 从MD文件同步信息到数据库记录
	 */
	async syncFromMDFile(record: AttachmentRecord): Promise<void> {
		try {
			if (!record.hasMDFile || !record.mdFilePath) {
				return;
			}

			const existingFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
			if (!(existingFile instanceof TFile)) {
				return;
			}

			const content = await this.app.vault.read(existingFile);
			
			// 解析YAML frontmatter
			const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
			if (yamlMatch) {
				const yamlContent = yamlMatch[1];
				
				// 更新记录信息
				this.updateRecordFromYAML(record, yamlContent);
				
				// 解析标签
				const tags = this.parseTagsFromContent(content);
				record.tags = tags;
				
				// 注意：不在这里调用数据库更新，避免死循环
				// 数据库更新由调用方负责
				
				new Notice(`已从MD文件同步 ${record.title} 的信息`);
			}
		} catch (error) {
			console.error('Error syncing from MD file:', error);
			new Notice(`${this.plugin.languageManager.t('notices.MDSyncFailed')}: ${error.message}`);
		}
	}

	/**
	 * 从YAML内容更新记录信息
	 */
	private updateRecordFromYAML(record: AttachmentRecord, yamlContent: string): void {
		const lines = yamlContent.split('\n');
		let currentKey = '';
		let inReferences = false;
		let inTags = false;
		let currentReference: any = {};
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmedLine = line.trim();
			
			// 跳过空行
			if (!trimmedLine) continue;
			
			// 检查是否进入引用列表
			if (trimmedLine === 'references:') {
				inReferences = true;
				record.references = [];
				continue;
			}
			
			// 检查是否进入标签列表
			if (trimmedLine === 'tags:') {
				inTags = true;
				record.tags = [];
				continue;
			}
			
			// 处理引用信息
			if (inReferences && trimmedLine.startsWith('- ')) {
				// 新的引用项
				if (currentReference.file_path) {
					record.references.push(currentReference);
				}
				currentReference = {};
				continue;
			}
			
			if (inReferences && trimmedLine.includes(':')) {
				const [key, value] = trimmedLine.split(':').map(s => s.trim());
				if (key && value) {
					switch (key) {
						case 'file_path':
							currentReference.filePath = value.replace(/^"|"$/g, '');
							break;
						case 'file_name':
							currentReference.fileName = value.replace(/^"|"$/g, '');
							break;
						case 'line_number':
							currentReference.lineNumber = parseInt(value) || 0;
							break;
						case 'reference_type':
							currentReference.referenceType = value.replace(/^"|"$/g, '') as any;
							break;
					}
				}
				continue;
			}
			
			// 处理标签
			if (inTags && trimmedLine.startsWith('- ')) {
				const tag = trimmedLine.substring(2).trim();
				record.tags.push(tag);
				continue;
			}
			
			// 处理普通键值对
			if (trimmedLine.includes(':') && !inReferences && !inTags) {
				const [key, value] = trimmedLine.split(':').map(s => s.trim());
				if (key && value) {
					switch (key) {
						case 'title':
							record.title = value.replace(/^"|"$/g, '');
							break;
						case 'author':
							record.author = value.replace(/^"|"$/g, '');
							break;
						case 'year':
							record.year = value.replace(/^"|"$/g, '');
							break;
						case 'doi':
							record.doi = value.replace(/^"|"$/g, '');
							break;
						case 'publisher':
							record.publisher = value.replace(/^"|"$/g, '');
							break;
						case 'journal_level':
							record.journalLevel = value.replace(/^"|"$/g, '') as any;
							break;
						case 'file_type':
							record.fileType = value.replace(/^"|"$/g, '');
							break;
						case 'bibtex':
							// 处理块标量格式的BibTeX
							if (value === '|') {
								// 块标量开始，读取后续行直到缩进减少
								let bibTextLines: string[] = [];
								let j = i + 1;
								while (j < lines.length) {
									const nextLine = lines[j];
									if (nextLine.trim() === '' || !nextLine.startsWith('  ')) {
										break;
									}
									bibTextLines.push(nextLine.substring(2)); // 移除缩进
									j++;
								}
								record.bibText = bibTextLines.join('\n');
								i = j - 1; // 更新索引
							} else {
								// 普通字符串格式（兼容旧版本）
								record.bibText = value.replace(/^"|"$/g, '').replace(/\\"/g, '"');
							}
							break;
					}
				}
			}
		}
		
		// 添加最后一个引用
		if (inReferences && currentReference.file_path) {
			record.references.push(currentReference);
		}
		
		// 更新引用计数
		record.referenceCount = record.references ? record.references.length : 0;
	}

	/**
	 * 验证MD文件状态
	 */
	async validateMDFileStatus(record: AttachmentRecord): Promise<void> {
		try {
			if (record.hasMDFile && record.mdFilePath) {
				// 检查MD文件是否真的存在
				const existingFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
				if (!(existingFile instanceof TFile)) {
					// 文件不存在，标记为丢失状态
					record.hasMDFile = false;
					record.mdFilePath = undefined;
					record.mdLastSync = undefined;
					record.mdFileLost = true; // 标记为丢失状态
					console.log(`MD file not found for ${record.title}, marking as lost`);
				}
			} else if (!record.hasMDFile && !record.mdFilePath) {
				// 检查是否应该创建MD文件
				if (this.shouldCreateMDFile(record)) {
					// 尝试创建MD文件
					await this.createMDFile(record);
				}
			}
		} catch (error) {
			console.error('Error validating MD file status:', error);
		}
	}

	/**
	 * 检查是否有丢失的MD文件需要处理
	 */
	async checkForLostMDFiles(): Promise<AttachmentRecord[]> {
		const records = this.plugin.database.getAllRecords();
		const lostFiles: AttachmentRecord[] = [];
		
		for (const record of records) {
			if (record.mdFileLost) {
				lostFiles.push(record);
			}
		}
		
		return lostFiles;
	}

	/**
	 * 重新指认MD文件路径
	 */
	async reassignMDFilePath(record: AttachmentRecord, newPath: string): Promise<boolean> {
		try {
			// 检查新路径是否存在
			const existingFile = this.app.vault.getAbstractFileByPath(newPath);
			if (!(existingFile instanceof TFile)) {
				return false; // 新路径不存在
			}
			
			// 更新记录状态
			record.mdFilePath = newPath;
			record.hasMDFile = true;
			record.mdFileLost = false;
			record.mdLastSync = Date.now();
			
			// 保存到数据库
			await this.plugin.database.updateRecord(record);
			
			new Notice(`已重新指认 ${record.title} 的MD文件路径`);
			return true;
		} catch (error) {
			console.error('Error reassigning MD file path:', error);
			return false;
		}
	}

	/**
	 * 删除附件的MD文件
	 */
	async deleteMDFile(record: AttachmentRecord): Promise<void> {
		try {
			if (!record.hasMDFile || !record.mdFilePath) {
				return;
			}

			const existingFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
			if (existingFile instanceof TFile) {
				await this.app.vault.delete(existingFile);
			}
			
			// 更新记录状态
			record.hasMDFile = false;
			record.mdFilePath = undefined;
			record.mdLastSync = undefined;
			record.mdUserNotes = undefined;
			
			// 注意：不在这里调用数据库更新，避免死循环
			// 数据库更新由调用方负责
			
			new Notice(`已删除 ${record.title} 的MD文件`);
		} catch (error) {
			console.error('Error deleting MD file:', error);
			new Notice(`${this.plugin.languageManager.t('notices.MDFileDeleteFailed')}: ${error.message}`);
		}
	}

	/**
	 * 同步所有附件的MD文件
	 * 优化：添加批量操作和延迟，减少对 Obsidian 索引的影响
	 */
	async syncAllMDFiles(): Promise<void> {
		try {
			const records = this.plugin.database.getAllRecords();
			let updatedCount = 0;
			
			// 分批处理，每批处理10个文件，批次间延迟100ms
			const batchSize = 10;
			const batches = [];
			
			for (let i = 0; i < records.length; i += batchSize) {
				batches.push(records.slice(i, i + batchSize));
			}
			
			for (let i = 0; i < batches.length; i++) {
				const batch = batches[i];
				
				// 处理当前批次
				for (const record of batch) {
					if (this.shouldCreateMDFile(record)) {
						if (record.hasMDFile && record.mdFilePath) {
							// 更新现有文件
							await this.updateMDFile(record);
						} else {
							// 创建新文件
							await this.createMDFile(record);
						}
						updatedCount++;
					}
				}
				
				// 批次间延迟，让 Obsidian 有时间处理文件变化
				if (i < batches.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}
			
			new Notice(`已同步 ${updatedCount} 个附件的MD文件`);
		} catch (error) {
			console.error('Error syncing all MD files:', error);
			new Notice(`${this.plugin.languageManager.t('notices.MDSyncAllFailed')}: ${error.message}`);
		}
	}

	/**
	 * 从MD文件同步标签到附件记录
	 * 优化：添加批量操作和延迟，减少对 Obsidian 索引的影响
	 */
	async syncTagsFromMDFiles(): Promise<void> {
		try {
			const records = this.plugin.database.getAllRecords();
			let updatedCount = 0;
			
			// 分批处理，每批处理15个文件，批次间延迟50ms
			const batchSize = 15;
			const batches = [];
			
			for (let i = 0; i < records.length; i += batchSize) {
				batches.push(records.slice(i, i + batchSize));
			}
			
			for (let i = 0; i < batches.length; i++) {
				const batch = batches[i];
				
				// 处理当前批次
				for (const record of batch) {
					if (record.hasMDFile && record.mdFilePath) {
						const existingFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
						if (existingFile instanceof TFile) {
							const content = await this.app.vault.read(existingFile);
							const tags = this.parseTagsFromContent(content);
							
							// 检查标签是否有变化
							if (JSON.stringify(tags.sort()) !== JSON.stringify(record.tags.sort())) {
								record.tags = tags;
								await this.plugin.database.updateRecord(record);
								updatedCount++;
							}
						}
					}
				}
				
				// 批次间延迟，让 Obsidian 有时间处理文件变化
				if (i < batches.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 50));
				}
			}
			
			if (updatedCount > 0) {
				new Notice(`已从MD文件同步 ${updatedCount} 个附件的标签`);
			} else {
				new Notice(this.plugin.languageManager.t('notices.allTagsAreUpToDate'));
			}
		} catch (error) {
			console.error('Error syncing tags from MD files:', error);
			new Notice(this.plugin.languageManager.t('notices.syncTagsFromMDFailed') + ': ' + error.message);
		}
	}

	/**
	 * 检查是否应该为附件创建MD文件
	 */
	private shouldCreateMDFile(record: AttachmentRecord): boolean {
		if (!this.plugin.settings.enableAutoMDCreation) {
			return false;
		}

		const fileType = record.fileType.toLowerCase();
		
		// 检查是否在排除列表中
		if (this.plugin.settings.excludeMDFileTypes.includes(fileType)) {
			return false;
		}
		
		// 检查是否在自动创建列表中
		if (this.plugin.settings.autoMDFileTypes.includes(fileType)) {
			return true;
		}
		
		return false;
	}

	/**
	 * 获取MD文件路径
	 */
	public getMDFilePath(record: AttachmentRecord): string {
		const settings = this.plugin.settings;
		
		// 解析路径模板
		let mdPath = settings.mdFileLocation;
		let fileName = settings.mdFileNameTemplate;
		
		// 替换变量
		mdPath = this.replacePathVariables(mdPath, record);
		fileName = this.replacePathVariables(fileName, record);
		
		// 确保文件名安全
		fileName = this.sanitizeFileName(fileName);
		
		// 组合完整路径
		const fullPath = mdPath.endsWith('/') ? mdPath + fileName : mdPath + '/' + fileName;
		return fullPath + '.md';
	}

	/**
	 * 替换路径中的变量
	 */
	private replacePathVariables(template: string, record: AttachmentRecord): string {
		return template
			// 基础路径变量
			.replace(/\{\{current_folder\}\}/g, this.getCurrentFolder(record))
			.replace(/\{\{note_folder_path\}\}/g, this.getNoteFolderPath(record))
			.replace(/\{\{note_file_name\}\}/g, this.getNoteFileName(record))
			
			// 附件相关变量
			.replace(/\{\{attachment_name\}\}/g, this.getAttachmentName(record))
			.replace(/\{\{original_attachment_file_extension\}\}/g, this.getOriginalAttachmentFileExtension(record))
			.replace(/\{\{attachment_file_name\}\}/g, record.fileName || 'unknown')
			
			// 元数据变量
			.replace(/\{\{title\}\}/g, this.sanitizeFileName(record.title || 'untitled'))
			.replace(/\{\{author\}\}/g, this.sanitizeFileName(record.author || 'unknown'))
			.replace(/\{\{year\}\}/g, record.year || 'unknown')
			.replace(/\{\{file_type\}\}/g, record.fileType || 'unknown')
			.replace(/\{\{doi\}\}/g, this.sanitizeFileName(record.doi || 'no-doi'))
			.replace(/\{\{publisher\}\}/g, this.sanitizeFileName(record.publisher || 'unknown'))
			.replace(/\{\{journal_level\}\}/g, this.sanitizeFileName(record.journalLevel || 'unknown'))
			
			// 时间变量
			.replace(/\{\{date:YYYY\}\}/g, new Date().getFullYear().toString())
			.replace(/\{\{date:MM\}\}/g, (new Date().getMonth() + 1).toString().padStart(2, '0'))
			.replace(/\{\{date:DD\}\}/g, new Date().getDate().toString().padStart(2, '0'))
			.replace(/\{\{date:HH\}\}/g, new Date().getHours().toString().padStart(2, '0'))
			.replace(/\{\{date:mm\}\}/g, new Date().getMinutes().toString().padStart(2, '0'))
			.replace(/\{\{date:ss\}\}/g, new Date().getSeconds().toString().padStart(2, '0'))
			.replace(/\{\{date:SSS\}\}/g, new Date().getMilliseconds().toString().padStart(3, '0'))
			.replace(/\{\{date:YYYYMMDD\}\}/g, this.formatDate('YYYYMMDD'))
			.replace(/\{\{date:YYYYMMDDHHmm\}\}/g, this.formatDate('YYYYMMDDHHmm'))
			.replace(/\{\{date:YYYYMMDDHHmmss\}\}/g, this.formatDate('YYYYMMDDHHmmss'))
			.replace(/\{\{date:YYYYMMDDHHmmssSSS\}\}/g, this.formatDate('YYYYMMDDHHmmssSSS'))
			
			// 组合变量
			.replace(/\{\{note_file_name\}-{date:YYYYMMDDHHmmssSSS\}\}/g, `${this.getNoteFileName(record)}-${this.formatDate('YYYYMMDDHHmmssSSS')}`)
			.replace(/\{\{title\}-{date:YYYYMMDD\}\}/g, `${this.sanitizeFileName(record.title || 'untitled')}-${this.formatDate('YYYYMMDD')}`)
			.replace(/\{\{author\}-{year\}-{title\}\}/g, `${this.sanitizeFileName(record.author || 'unknown')}-${record.year || 'unknown'}-${this.sanitizeFileName(record.title || 'untitled')}`);
	}

	/**
	 * 获取当前文件夹
	 */
	private getCurrentFolder(record: AttachmentRecord): string {
		const filePath = record.filePath;
		const lastSlashIndex = filePath.lastIndexOf('/');
		if (lastSlashIndex === -1) {
			return '';
		}
		return filePath.substring(0, lastSlashIndex);
	}

	/**
	 * 获取附件名称（不含扩展名）
	 */
	private getAttachmentName(record: AttachmentRecord): string {
		const fileName = record.fileName;
		const lastDotIndex = fileName.lastIndexOf('.');
		if (lastDotIndex === -1) {
			return fileName;
		}
		return fileName.substring(0, lastDotIndex);
	}

	/**
	 * 获取笔记文件夹路径
	 */
	private getNoteFolderPath(record: AttachmentRecord): string {
		const filePath = record.filePath;
		const lastSlashIndex = filePath.lastIndexOf('/');
		if (lastSlashIndex === -1) {
			return '';
		}
		return filePath.substring(0, lastSlashIndex);
	}

	/**
	 * 获取笔记文件名（不含扩展名）
	 */
	private getNoteFileName(record: AttachmentRecord): string {
		const filePath = record.filePath;
		const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
		const lastDotIndex = fileName.lastIndexOf('.');
		if (lastDotIndex === -1) {
			return fileName;
		}
		return fileName.substring(0, lastDotIndex);
	}

	/**
	 * 获取原始附件文件扩展名
	 */
	private getOriginalAttachmentFileExtension(record: AttachmentRecord): string {
		const fileName = record.fileName;
		const lastDotIndex = fileName.lastIndexOf('.');
		if (lastDotIndex === -1) {
			return '';
		}
		return fileName.substring(lastDotIndex + 1);
	}

	/**
	 * 格式化日期
	 */
	private formatDate(format: string): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		const seconds = now.getSeconds().toString().padStart(2, '0');
		const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

		switch (format) {
			case 'YYYYMMDD':
				return `${year}${month}${day}`;
			case 'YYYYMMDDHHmm':
				return `${year}${month}${day}${hours}${minutes}`;
			case 'YYYYMMDDHHmmss':
				return `${year}${month}${day}${hours}${minutes}${seconds}`;
			case 'YYYYMMDDHHmmssSSS':
				return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
			default:
				return `${year}${month}${day}`;
		}
	}

	/**
	 * 清理文件名中的特殊字符
	 */
	private sanitizeFileName(fileName: string): string {
		return fileName
			.replace(/[<>:"/\\|?*]/g, '_') // 替换Windows不允许的字符
			.replace(/\s+/g, '_') // 替换空格为下划线
			.replace(/[^\w\u4e00-\u9fa5_-]/g, '_') // 只保留字母、数字、中文、下划线和连字符
			.replace(/_+/g, '_') // 多个下划线替换为单个
			.replace(/^_|_$/g, ''); // 移除开头和结尾的下划线
	}

	/**
	 * 生成MD文件内容
	 */
	private generateMDFileContent(record: AttachmentRecord, userNotes?: string): string {
		let content = `---\n`;
		// YAML头部包含所有元数据，作为唯一的数据源
		content += `title: "${record.title || 'Untitled'}"\n`;
		content += `author: "${record.author || 'Unknown'}"\n`;
		content += `year: "${record.year || 'Unknown'}"\n`;
		content += `doi: "${record.doi || 'No DOI'}"\n`;
		content += `publisher: "${record.publisher || 'Unknown'}"\n`;
		content += `journal_level: "${record.journalLevel || 'Unknown'}"\n`;
		content += `file_path: "${record.filePath}"\n`;
		content += `file_type: "${record.fileType}"\n`;
		content += `file_size: ${record.fileSize || 0}\n`;
		content += `added_time: "${record.addedTime}"\n`;
		content += `last_sync: ${Date.now()}\n`;
		content += `tags:\n`;
		
		// 添加标签
		record.tags.forEach(tag => {
			content += `  - ${tag}\n`;
		});
		
		// 添加引用信息到YAML
		if (record.references && record.references.length > 0) {
			content += `references:\n`;
			record.references.forEach(ref => {
				content += `  - file_path: "${ref.filePath}"\n`;
				content += `    file_name: "${ref.fileName}"\n`;
				content += `    line_number: ${ref.lineNumber || 0}\n`;
				content += `    reference_type: "${ref.referenceType}"\n`;
			});
		}
		
		// 添加BibTeX到YAML（使用块标量格式避免解析问题）
		if (record.bibText) {
			// 清理BibTeX内容，移除可能导致YAML解析问题的字符
			const cleanBibText = this.cleanBibTeXForYAML(record.bibText);
			content += `bibtex: |\n`;
			content += `  ${cleanBibText.split('\n').join('\n  ')}\n`;
		}
		
		content += `---\n\n`;
		
		// 正文只包含标题和用户笔记，避免重复
		content += `# ${record.title || 'Untitled'}\n\n`;
		
		// 用户笔记区域
		content += `## ✍️ 用户笔记\n\n`;
		content += `> 💡 在此区域添加您的笔记、想法和评论\n\n---\n\n`;
		
		if (userNotes) {
			content += userNotes;
		} else {
			content += `*在此添加您的笔记...*\n\n`;
			content += `### 📖 阅读笔记\n\n`;
			content += `### 🎯 关键观点\n\n`;
			content += `### 🔍 相关研究\n\n`;
			content += `### ✅ 待办事项\n\n`;
		}
		
		content += `\n---\n\n`;
		content += `*此文件由 Research Attachment Hub 插件自动生成和维护。*\n`;
		content += `*最后同步时间: ${new Date().toLocaleString()}*\n`;
		
		return content;
	}

	/**
	 * 清理BibTeX内容，使其适合YAML解析
	 */
	private cleanBibTeXForYAML(bibText: string): string {
		return bibText
			// 移除或替换可能导致YAML解析问题的字符
			.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 移除控制字符
			.replace(/\r\n/g, '\n') // 统一换行符
			.replace(/\r/g, '\n') // 统一换行符
			.replace(/\t/g, '  ') // 替换制表符为空格
			.trim(); // 移除首尾空白
	}

	/**
	 * 格式化文件大小
	 */
	private formatFileSize(bytes?: number): string {
		if (!bytes) return 'Unknown';
		
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;
		
		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}
		
		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}

	/**
	 * 从内容中提取用户笔记
	 */
	private extractUserNotes(content: string): string {
		const userNotesMatch = content.match(/## 用户笔记\n\n> 💡 在此区域添加您的笔记、想法和评论\n\n---\n\n([\s\S]*?)\n\n---\n\n/);
		if (userNotesMatch) {
			return userNotesMatch[1].trim();
		}
		return '';
	}

	/**
	 * 从内容中解析标签
	 */
	private parseTagsFromContent(content: string): string[] {
		const tags: string[] = [];
		
		// 从YAML frontmatter中解析标签
		const yamlMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
		if (yamlMatch) {
			const yamlContent = yamlMatch[1];
			const tagsMatch = yamlContent.match(/^tags:\s*\n((?:\s*-\s*[^\n]+\n?)*)/m);
			if (tagsMatch) {
				const tagLines = tagsMatch[1].split('\n');
				tagLines.forEach(line => {
					const tagMatch = line.match(/^\s*-\s*(.+)$/);
					if (tagMatch) {
						tags.push(tagMatch[1].trim());
					}
				});
			}
		}
		
		// 从内联标签中解析（作为备用）
		if (tags.length === 0) {
			const inlineTagMatches = content.match(/#([a-zA-Z0-9\u4e00-\u9fa5_-]+)/g);
			if (inlineTagMatches) {
				inlineTagMatches.forEach(match => {
					const tag = match.substring(1); // 移除#号
					if (!tags.includes(tag)) {
						tags.push(tag);
					}
				});
			}
		}
		
		return tags;
	}

	/**
	 * 写入MD文件
	 */
	private async writeMDFile(filePath: string, content: string): Promise<void> {
		try {
			// 确保目录存在
			await this.ensureDirectoryExists(filePath);
			
			// 检查文件是否已存在
			const existingFile = this.app.vault.getAbstractFileByPath(filePath);
			
			if (existingFile && existingFile instanceof TFile) {
				// 更新现有文件
				await this.app.vault.modify(existingFile, content);
			} else {
				// 创建新文件
				await this.app.vault.create(filePath, content);
			}
			
		} catch (error) {
			console.error('Error writing MD file:', error);
			throw error;
		}
	}

	/**
	 * 读取MD文件
	 */
	private async readMDFile(filePath: string): Promise<string> {
		try {
			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file instanceof TFile) {
				return await this.app.vault.read(file);
			}
			return '';
		} catch (error) {
			console.error('Error reading MD file:', error);
			return '';
		}
	}

	/**
	 * 确保目录存在
	 */
	private async ensureDirectoryExists(filePath: string): Promise<void> {
		const pathParts = filePath.split('/');
		if (pathParts.length <= 1) return;
		
		pathParts.pop(); // 移除文件名
		const dirPath = pathParts.join('/');
		
		if (dirPath) {
			const dir = this.app.vault.getAbstractFileByPath(dirPath);
			if (!dir) {
				await this.app.vault.createFolder(dirPath);
			}
		}
	}

	/**
	 * 获取所有MD文件路径
	 */
	getAllMDFilePaths(): string[] {
		const records = this.plugin.database.getAllRecords();
		return records
			.filter(record => record.hasMDFile && record.mdFilePath)
			.map(record => record.mdFilePath!);
	}

	/**
	 * 检查MD文件是否存在
	 */
	async checkMDFileExists(record: AttachmentRecord): Promise<boolean> {
		if (!record.mdFilePath) return false;
		
		const file = this.app.vault.getAbstractFileByPath(record.mdFilePath);
		return file instanceof TFile;
	}

	/**
	 * 验证并更新MD文件状态
	 */
	async validateAndUpdateMDFileStatus(record: AttachmentRecord): Promise<boolean> {
		try {
			if (record.hasMDFile && record.mdFilePath) {
				// 检查MD文件是否真的存在
				const exists = await this.checkMDFileExists(record);
				if (!exists) {
					// 文件不存在，更新状态
					record.hasMDFile = false;
					record.mdFilePath = undefined;
					record.mdLastSync = undefined;
					record.mdFileLost = true;
					console.log(`MD文件不存在，更新状态: ${record.title}`);
					return false;
				}
				return true;
			} else {
				// 检查是否应该创建MD文件
				if (this.shouldCreateMDFile(record)) {
					// 尝试创建MD文件
					await this.createMDFile(record, true);
					return true;
				}
				return false;
			}
		} catch (error) {
			console.error('Error validating MD file status:', error);
			return false;
		}
	}

	/**
	 * 重新创建所有MD文件
	 * 优化：添加批量操作和延迟，减少对 Obsidian 索引的影响
	 */
	async recreateAllMDFiles(): Promise<void> {
		try {
			const records = this.plugin.database.getAllRecords();
			let createdCount = 0;
			
			// 分批处理，每批处理8个文件，批次间延迟150ms（因为要删除+创建）
			const batchSize = 8;
			const batches = [];
			
			for (let i = 0; i < records.length; i += batchSize) {
				batches.push(records.slice(i, i + batchSize));
			}
			
			for (let i = 0; i < batches.length; i++) {
				const batch = batches[i];
				
				// 处理当前批次
				for (const record of batch) {
					if (this.shouldCreateMDFile(record)) {
						// 先删除现有文件（如果存在）
						if (record.hasMDFile && record.mdFilePath) {
							await this.deleteMDFile(record);
						}
						
						// 重新创建
						await this.createMDFile(record);
						createdCount++;
					}
				}
				
				// 批次间延迟，让 Obsidian 有时间处理文件变化
				if (i < batches.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 150));
				}
			}
			
			new Notice(`已重新创建 ${createdCount} 个附件的MD文件`);
		} catch (error) {
			console.error('Error recreating MD files:', error);
			new Notice(`${this.plugin.languageManager.t('notices.MDRecreateFailed')}: ${error.message}`);
		}
	}
}
