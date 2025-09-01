import { App, TFile, TFolder, Notice } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';

/**
 * Obsidian标签索引器
 * 负责在Obsidian中创建标签文件，让Obsidian能够检索到附件的标签
 */
export class ObsidianTagIndexer {
	private app: App;
	private plugin: ResearchAttachmentHubPlugin;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	/**
	 * 为每个标签创建专门的标签文件（使用文件链接而不是标签链接）
	 */
	async createTagFiles(): Promise<void> {
		try {
			const records = this.plugin.database.getAllRecords();
			const tagIndex = this.buildTagIndex(records);
			
			// 为每个标签创建一个专门的标签文件
			for (const [tag, tagRecords] of tagIndex) {
				await this.createTagFile(tag, tagRecords);
			}
			
			// new Notice(`已创建 ${tagIndex.size} 个标签文件`);
		} catch (error) {
			console.error('Error creating tag files:', error);
			// new Notice(this.plugin.languageManager.t('notices.tagFileCreateFailed') + ': ' + error.message);
		}
	}

	/**
	 * 创建单个标签文件
	 */
	private async createTagFile(tag: string, records: AttachmentRecord[]): Promise<void> {
		try {
			// 使用标签名作为文件名，避免特殊字符问题
			const safeTagName = this.sanitizeFileName(tag);
			const tagFileName = `标签-${safeTagName}.md`;
			const tagContent = this.generateTagFileContent(tag, records);
			
			const existingTagFile = this.app.vault.getAbstractFileByPath(tagFileName);
			if (existingTagFile instanceof TFile) {
				// 更新现有标签文件
				await this.app.vault.modify(existingTagFile, tagContent);
			} else {
				// 创建新标签文件
				await this.app.vault.create(tagFileName, tagContent);
			}
		} catch (error) {
			console.error(`Error creating tag file for ${tag}:`, error);
		}
	}

	/**
	 * 生成标签文件内容（使用文件链接）
	 */
	private generateTagFileContent(tag: string, records: AttachmentRecord[]): string {
		let content = `# 标签: #${tag}\n\n`;
		content += `> 此文件包含所有使用 #${tag} 标签的附件\n\n`;
		content += `**相关附件数量**: ${records.length}\n`;
		content += `**最后更新**: ${new Date().toLocaleString()}\n\n`;
		
		// 添加标签搜索提示
		content += `## 在Obsidian中搜索\n\n`;
		content += `在Obsidian的搜索框中使用以下语法搜索：\n\n`;
		content += `- \`tag:${tag}\` - 搜索所有使用此标签的文件\n`;
		content += `- \`#${tag}\` - 搜索所有使用此标签的文件\n\n`;
		
		content += `## 相关附件\n\n`;
		
		records.forEach(record => {
			content += `### [[${record.title}]]\n`;
			content += `- **作者**: ${record.author || '未知'}\n`;
			content += `- **年份**: ${record.year || '未知'}\n`;
			content += `- **文件**: [[${record.filePath}]]\n`;
			
			// 如果有MD文件，添加链接
			if (record.hasMDFile && record.mdFilePath) {
				content += `- **MD文件**: [[${record.mdFilePath}]]\n`;
			}
			
			// 添加所有标签
			if (record.tags && record.tags.length > 0) {
				content += `- **标签**: ${record.tags.map(t => `#${t}`).join(' ')}\n`;
			}
			
			content += `\n`;
		});
		
		// 添加相关标签链接
		const allTags = new Set<string>();
		records.forEach(record => {
			record.tags.forEach(t => allTags.add(t));
		});
		allTags.delete(tag); // 移除当前标签
		
		if (allTags.size > 0) {
			content += `## 相关标签\n\n`;
			content += `这些附件还使用了以下标签：\n\n`;
			Array.from(allTags).sort().forEach(relatedTag => {
				content += `- [[标签-${this.sanitizeFileName(relatedTag)}|#${relatedTag}]]\n`;
			});
		}
		
		content += `\n---\n\n`;
		content += `*此文件由 Research Attachment Hub 插件自动生成，请勿手动修改。*\n`;
		
		return content;
	}

	/**
	 * 清理文件名中的特殊字符
	 */
	private sanitizeFileName(fileName: string): string {
		return fileName
			.replace(/[<>:"/\\|?*]/g, '_') // 替换Windows不允许的字符
			.replace(/\s+/g, '_') // 替换空格为下划线
			.replace(/[^\w\u4e00-\u9fa5_-]/g, '_'); // 只保留字母、数字、中文、下划线和连字符
	}

	/**
	 * 搜索包含特定标签的附件
	 */
	async searchByTag(tag: string): Promise<AttachmentRecord[]> {
		try {
			const records = this.plugin.database.getAllRecords();
			return records.filter(record => record.tags.includes(tag));
		} catch (error) {
			console.error('Error searching by tag:', error);
			return [];
		}
	}

	/**
	 * 获取所有标签
	 */
	getAllTags(): string[] {
		try {
			const records = this.plugin.database.getAllRecords();
			const tags = new Set<string>();
			
			records.forEach(record => {
				record.tags.forEach(tag => tags.add(tag));
			});
			
			return Array.from(tags).sort();
		} catch (error) {
			console.error('Error getting all tags:', error);
			return [];
		}
	}

	/**
	 * 清理孤立的标签文件
	 */
	async cleanupOrphanedTagFiles(): Promise<void> {
		try {
			const allTags = this.getAllTags();
			const vaultFiles = this.app.vault.getMarkdownFiles();
			
			// 查找孤立的标签文件（没有对应标签的.md文件）
			for (const file of vaultFiles) {
				const fileName = file.basename;
				if (fileName.startsWith('标签-')) {
					// 检查文件内容是否包含标签信息
					const content = await this.app.vault.read(file);
					if (content.includes('Research Attachment Hub') && content.includes('标签:')) {
						// 这是标签文件，检查是否还有对应的标签
						const tagName = fileName.replace('标签-', '');
						if (!allTags.includes(tagName)) {
							// 没有附件使用这个标签，删除标签文件
							await this.app.vault.delete(file);
							// console.log(`Deleted orphaned tag file: ${fileName}`);
						}
					}
				}
			}
			
			new Notice(this.plugin.languageManager.t('notices.orphanTagsCleaned'));
		} catch (error) {
			console.error('Error cleaning up orphaned tag files:', error);
			new Notice(this.plugin.languageManager.t('notices.cleanupTagsFailed') + ': ' + error.message);
		}
	}

	/**
	 * 同步标签到Obsidian标签系统
	 */
	async syncTagsToObsidian(): Promise<void> {
		try {
			// 创建标签文件
			await this.createTagFiles();
			
			// new Notice(this.plugin.languageManager.t('notices.tagsSynced'));
		} catch (error) {
			console.error('Error syncing tags to Obsidian:', error);
			// new Notice(this.plugin.languageManager.t('notices.syncTagsFailed') + ': ' + error.message);
		}
	}

	/**
	 * 创建标签搜索索引（用于快速搜索）
	 */
	async createTagSearchIndex(): Promise<void> {
		try {
			const records = this.plugin.database.getAllRecords();
			const tagIndex = this.buildTagIndex(records);
			
			// 创建一个专门的搜索索引文件
			const searchIndexContent = this.generateSearchIndexContent(tagIndex);
			const searchIndexFile = '标签搜索索引.md';
			
			const existingFile = this.app.vault.getAbstractFileByPath(searchIndexFile);
			if (existingFile instanceof TFile) {
				await this.app.vault.modify(existingFile, searchIndexContent);
			} else {
				await this.app.vault.create(searchIndexFile, searchIndexContent);
			}
			
			// new Notice(this.plugin.languageManager.t('notices.tagIndexCreated'));
		} catch (error) {
			console.error('Error creating tag search index:', error);
			// new Notice(this.plugin.languageManager.t('notices.tagIndexCreateFailed') + ': ' + error.message);
		}
	}

	/**
	 * 构建标签索引
	 */
	private buildTagIndex(records: AttachmentRecord[]): Map<string, AttachmentRecord[]> {
		const tagIndex = new Map<string, AttachmentRecord[]>();
		
		records.forEach(record => {
			record.tags.forEach(tag => {
				if (!tagIndex.has(tag)) {
					tagIndex.set(tag, []);
				}
				tagIndex.get(tag)!.push(record);
			});
		});
		
		return tagIndex;
	}

	/**
	 * 生成搜索索引内容
	 */
	private generateSearchIndexContent(tagIndex: Map<string, AttachmentRecord[]>): string {
		let content = `# 标签搜索索引\n\n`;
		content += `> 使用此文件快速查找所有标签和附件\n\n`;
		content += `**最后更新**: ${new Date().toLocaleString()}\n`;
		content += `**总标签数**: ${tagIndex.size}\n\n`;
		
		content += `## 快速搜索指南\n\n`;
		content += `在Obsidian搜索框中使用以下语法：\n\n`;
		content += `- \`tag:标签名\` - 搜索特定标签\n`;
		content += `- \`#标签名\` - 搜索特定标签\n`;
		content += `- \`tag:标签1 AND tag:标签2\` - 搜索同时包含两个标签的文件\n`;
		content += `- \`tag:标签1 OR tag:标签2\` - 搜索包含任一标签的文件\n\n`;
		
		content += `## 所有标签列表\n\n`;
		
		const sortedTags = Array.from(tagIndex.keys()).sort();
		sortedTags.forEach(tag => {
			const records = tagIndex.get(tag)!;
			content += `### #${tag} (${records.length} 个附件)\n`;
			content += `- **搜索语法**: \`tag:${tag}\` 或 \`#${tag}\`\n`;
			content += `- **标签文件**: [[标签-${this.sanitizeFileName(tag)}]]\n`;
			content += `- **附件数量**: ${records.length}\n\n`;
		});
		
		content += `---\n\n`;
		content += `*此文件由 Research Attachment Hub 插件自动生成，请勿手动修改。*\n`;
		
		return content;
	}
}
