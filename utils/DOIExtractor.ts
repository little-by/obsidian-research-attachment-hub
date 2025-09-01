export class DOIExtractor {
	
	// 从URL中提取DOI
	extractDOIFromURL(url: string): string | null {
		try {
			const urlObj = new URL(url);
			
			// 处理常见的学术网站URL格式
			if (urlObj.hostname.includes('doi.org')) {
				// 直接从doi.org提取
				return urlObj.pathname.substring(1);
			}
			
			if (urlObj.hostname.includes('arxiv.org')) {
				// arXiv的ID可以转换为DOI
				const arxivMatch = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d+\.\d+)/);
				if (arxivMatch) {
					return `10.48550/arXiv.${arxivMatch[1]}`;
				}
			}
			
			if (urlObj.hostname.includes('researchgate.net')) {
				// ResearchGate可能包含DOI
				const doiMatch = url.match(/doi=([^&]+)/);
				if (doiMatch) {
					return decodeURIComponent(doiMatch[1]);
				}
			}
			
			if (urlObj.hostname.includes('scholar.google.com')) {
				// Google Scholar可能包含DOI
				const doiMatch = url.match(/doi=([^&]+)/);
				if (doiMatch) {
					return decodeURIComponent(doiMatch[1]);
				}
			}
			
			// 通用DOI模式匹配
			const doiPattern = /10\.\d{4,}(?:\.\d+)*\/\S+(?:\?\S+)?/g;
			const matches = url.match(doiPattern);
			if (matches && matches.length > 0) {
				return matches[0];
			}
			
			return null;
		} catch (error) {
			console.log('Error extracting DOI from URL:', error);
			return null;
		}
	}

	// 从文本中提取DOI
	extractDOIFromText(text: string): string | null {
		const doiPattern = /10\.\d{4,}(?:\.\d+)*\/\S+(?:\?\S+)?/g;
		const matches = text.match(doiPattern);
		
		if (matches && matches.length > 0) {
			// 返回第一个匹配的DOI
			return matches[0];
		}
		
		return null;
	}

	// 验证DOI格式
	validateDOI(doi: string): boolean {
		const doiPattern = /^10\.\d{4,}(?:\.\d+)*\/\S+(?:\?\S+)?$/;
		return doiPattern.test(doi);
	}

	// 清理DOI字符串
	cleanDOI(doi: string): string {
		return doi.trim().replace(/^https?:\/\/doi\.org\//, '');
	}

	// 从多个来源尝试提取DOI
	async extractDOIFromMultipleSources(sources: string[]): Promise<string | null> {
		for (const source of sources) {
			if (!source) continue;
			
			// 尝试从URL提取
			if (source.startsWith('http')) {
				const doi = this.extractDOIFromURL(source);
				if (doi && this.validateDOI(doi)) {
					return this.cleanDOI(doi);
				}
			}
			
			// 尝试从文本提取
			const doi = this.extractDOIFromText(source);
			if (doi && this.validateDOI(doi)) {
				return this.cleanDOI(doi);
			}
		}
		
		return null;
	}

	// 生成DOI链接
	generateDOILink(doi: string): string {
		return `https://doi.org/${doi}`;
	}

	// 从DOI生成短标识符
	generateShortID(doi: string): string {
		// 移除DOI前缀，只保留后面的部分
		const shortPart = doi.replace(/^10\.\d{4,}(?:\.\d+)*\//, '');
		
		// 清理特殊字符，生成短ID
		return shortPart.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
	}

	// 检查DOI是否可访问
	async checkDOIAccessibility(doi: string): Promise<boolean> {
		try {
			const response = await fetch(this.generateDOILink(doi), {
				method: 'HEAD',
				redirect: 'follow'
			});
			return response.ok;
		} catch (error) {
			console.log('Error checking DOI accessibility:', error);
			return false;
		}
	}

	// 从DOI获取元数据（通过DOI.org API）
	async getMetadataFromDOI(doi: string): Promise<any> {
		try {
			const response = await fetch(`https://api.crossref.org/works/${doi}`);
			if (response.ok) {
				const data = await response.json();
				return data.message;
			}
		} catch (error) {
			console.log('Error fetching metadata from DOI:', error);
		}
		return null;
	}

	// 从DOI生成BibTeX键
	generateBibTeXKey(doi: string): string {
		const cleanDOI = doi.replace(/[^a-zA-Z0-9]/g, '');
		return cleanDOI.substring(0, 30);
	}

	// 从DOI生成引用链接
	generateCitationLink(doi: string, format: string = 'apa'): string {
		const baseUrl = 'https://citation.crosscite.org/format';
		return `${baseUrl}?doi=${encodeURIComponent(doi)}&style=${format}`;
	}
}
