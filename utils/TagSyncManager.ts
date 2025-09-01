import { App, TFile, Notice } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import type { AttachmentRecord } from '../main';

export class TagSyncManager {
	private app: App;
	private plugin: ResearchAttachmentHubPlugin;
	private readonly TAG_INDEX_HEADER = '# Attachment Manager Tags\n\nThis file contains all tags from the Attachment Manager database for Obsidian to index.\n\n';
	
	// 防死循环机制
	private isSyncing = false;
	private lastSyncTime = 0;
	private readonly MIN_SYNC_INTERVAL = 5000; // 最小同步间隔：5秒

	constructor(app: App, plugin: ResearchAttachmentHubPlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	/**
	 * 同步数据库标签到 Obsidian 标签系统
	 */
	async syncTagsToObsidian(): Promise<void> {
		try {
			// 防死循环检查
			if (this.isSyncing) {
				console.log('Tag sync already in progress, skipping...');
				return;
			}

			const now = Date.now();
			if (now - this.lastSyncTime < this.MIN_SYNC_INTERVAL) {
				console.log('Tag sync too frequent, skipping...');
				return;
			}

			// 设置同步状态
			this.isSyncing = true;
			this.lastSyncTime = now;

			// 获取数据库中的所有标签
			const allTags = this.plugin.database.getAllTags();
			
			if (allTags.length === 0) {
				// console.log('No tags found in database to sync');
				this.isSyncing = false;
				return;
			}

			// console.log(`Syncing ${allTags.length} tags to Obsidian:`, allTags);

			// 方法1: 创建标签索引文件
			await this.createTagIndexFile(allTags);

			// 方法2: 尝试强制刷新 Obsidian 的索引
			await this.forceRefreshObsidianIndex();

			// console.log(`Tags synced successfully to Obsidian`);
			// new Notice(this.plugin.languageManager.t('notices.tagsSynced'));

		} catch (error) {
			console.error('Error syncing tags to Obsidian:', error);
			// new Notice(this.plugin.languageManager.t('notices.tagSyncFailed'));
		} finally {
			// 重置同步状态
			this.isSyncing = false;
		}
	}

	/**
	 * 创建标签索引文件
	 */
	private async createTagIndexFile(tags: string[]): Promise<void> {
		try {
			// 创建标签索引文件内容
			const content = this.createTagIndexContent(tags);
			
			// 写入标签索引文件
			await this.writeTagIndexFile(content);
			
			// console.log('Tag index file created/updated successfully');
		} catch (error) {
			console.error('Error creating tag index file:', error);
			// new Notice(this.plugin.languageManager.t('notices.tagIndexCreateFailed'));
			throw error;
		}
	}

	/**
	 * 创建标签索引文件内容
	 */
	private createTagIndexContent(tags: string[]): string {
		let content = this.TAG_INDEX_HEADER;
		
		// 按字母顺序排序标签
		const sortedTags = [...tags].sort();

		// 为每个标签创建一个 Markdown 格式的条目，使用多种格式确保被识别
		sortedTags.forEach(tag => {
			// 使用多种标签格式
			content += `#${tag}\n`;
			content += `标签: #${tag}\n`;
			content += `Tag: #${tag}\n\n`;
		});

		// 添加标签统计信息
		content += `## Tag Statistics\n`;
		content += `- Total Tags: ${tags.length}\n`;
		content += `- Last Updated: ${new Date().toISOString()}\n`;
		content += `- Source: Attachment Manager Database\n\n`;

		// 添加标签列表（用于 Obsidian 索引）
		content += `## All Tags\n`;
		sortedTags.forEach(tag => {
			content += `- #${tag}\n`;
		});

		// 标签-文件关系功能已弃用，使用新的MD文件管理系统

		return content;
	}

	/**
	 * 创建标签-文件关系内容
	 */
	private createTagFileRelationsContent(tags: string[]): string {
		let content = '\n## Tag-File Relationships\n\n';
		
		// 获取所有附件记录
		const allRecords = this.plugin.database.getAllRecords();
		
		// 按标签分组记录
		const tagGroups: Record<string, AttachmentRecord[]> = {};
		tags.forEach(tag => {
			tagGroups[tag] = allRecords.filter(record => 
				record.tags.includes(tag)
			);
		});

		// 为每个标签创建文件列表
		tags.forEach(tag => {
			const records = tagGroups[tag];
			if (records.length > 0) {
				content += `### #${tag} (${records.length} files)\n\n`;
				
				records.forEach(record => {
					content += `- **${record.title}** - ${record.author} (${record.year})\n`;
					content += `  - File: \`${record.fileName}\`\n`;
					content += `  - Path: \`${record.filePath}\`\n`;
					if (record.doi) {
						content += `  - DOI: \`${record.doi}\`\n`;
					}
					content += `  - Added: ${new Date(record.addedTime).toLocaleDateString()}\n`;
					content += `  - References: ${record.referenceCount}\n\n`;
				});
			} else {
				content += `### #${tag} (0 files)\n\n`;
				content += `*No files currently use this tag*\n\n`;
			}
		});

		// 添加总体统计
		content += `## Summary\n\n`;
		content += `- **Total Tags**: ${tags.length}\n`;
		content += `- **Total Files**: ${allRecords.length}\n`;
		content += `- **Most Used Tag**: ${this.getMostUsedTag(tagGroups)}\n`;
		content += `- **Least Used Tag**: ${this.getLeastUsedTag(tagGroups)}\n`;
		content += `- **Average Files per Tag**: ${(allRecords.length / Math.max(tags.length, 1)).toFixed(1)}\n`;

		return content;
	}

	/**
	 * 获取使用最多的标签
	 */
	private getMostUsedTag(tagGroups: Record<string, AttachmentRecord[]>): string {
		let mostUsed = '';
		let maxCount = 0;
		
		Object.entries(tagGroups).forEach(([tag, records]) => {
			if (records.length > maxCount) {
				maxCount = records.length;
				mostUsed = tag;
			}
		});
		
		return mostUsed || 'None';
	}

	/**
	 * 获取使用最少的标签
	 */
	private getLeastUsedTag(tagGroups: Record<string, AttachmentRecord[]>): string {
		let leastUsed = '';
		let minCount = Infinity;
		
		Object.entries(tagGroups).forEach(([tag, records]) => {
			if (records.length > 0 && records.length < minCount) {
				minCount = records.length;
				leastUsed = tag;
			}
		});
		
		return leastUsed || 'None';
	}

	/**
	 * 写入标签索引文件
	 * 注意：现在每个附件都有独立的MD文件，不再需要单独的标签索引文件
	 */
	private async writeTagIndexFile(content: string): Promise<void> {
		try {
			// console.log('Tag index file creation is deprecated - each attachment now has its own MD file');
			// 不再创建单独的标签索引文件
		} catch (error) {
			console.error('Error writing tag index file:', error);
			throw error;
		}
	}

	/**
	 * 强制刷新 Obsidian 的索引
	 * 注意：此方法已被优化，不再创建临时文件以避免频繁重新索引
	 */
	private async forceRefreshObsidianIndex(): Promise<void> {
		try {
			// console.log('Obsidian index refresh optimized - no temporary files created');
			
			// 使用更温和的方式：等待 Obsidian 自然更新索引
			// 而不是强制创建和删除文件
			await new Promise(resolve => setTimeout(resolve, 200));
			
			// console.log('Obsidian index refresh completed (optimized)');
		} catch (error) {
			console.error('Error in optimized index refresh:', error);
		}
	}

	/**
	 * 刷新 Obsidian 的标签缓存
	 */
	private async refreshObsidianTagCache(): Promise<void> {
		try {
			// 等待一小段时间让缓存更新
			await new Promise(resolve => setTimeout(resolve, 100));
			
			console.log('Obsidian tag cache refreshed');
		} catch (error) {
			console.error('Error refreshing tag cache:', error);
		}
	}

	/**
	 * 获取 Obsidian 中可用的标签（包括数据库标签）
	 */
	getAvailableTags(): Set<string> {
		try {
			// 获取所有 Markdown 文件中的标签
			const allTags = new Set<string>();
			const markdownFiles = this.app.vault.getMarkdownFiles();
			
			// 遍历所有 Markdown 文件，提取标签
			for (const file of markdownFiles) {
				try {
					const cache = this.app.metadataCache.getFileCache(file);
					if (cache && cache.tags) {
						cache.tags.forEach(tag => {
							allTags.add(tag.tag);
						});
					}
				} catch (error) {
					console.error(`Error processing file ${file.path}:`, error);
				}
			}

			// 添加数据库标签
			const databaseTags = this.plugin.database.getAllTags();
			databaseTags.forEach(tag => {
				allTags.add(tag);
			});

			console.log(`Total available tags: ${allTags.size} (${databaseTags.length} from database)`);
			return allTags;

		} catch (error) {
			console.error('Error getting available tags:', error);
			// 如果获取失败，至少返回数据库标签
			return new Set(this.plugin.database.getAllTags());
		}
	}

	/**
	 * 检查标签是否在 Obsidian 中可用
	 */
	isTagAvailableInObsidian(tag: string): boolean {
		try {
			const markdownFiles = this.app.vault.getMarkdownFiles();
			
			// 遍历所有 Markdown 文件，查找标签
			for (const file of markdownFiles) {
				try {
					const cache = this.app.metadataCache.getFileCache(file);
					if (cache && cache.tags) {
						const found = cache.tags.find(t => t.tag === tag);
						if (found) return true;
					}
				} catch (error) {
					console.error(`Error processing file ${file.path}:`, error);
				}
			}
			
			return false;
		} catch (error) {
			console.error('Error checking tag availability:', error);
			return false;
		}
	}

	/**
	 * 获取标签使用统计
	 */
	getTagUsageStats(): Record<string, number> {
		try {
			const stats: Record<string, number> = {};
			const markdownFiles = this.app.vault.getMarkdownFiles();
			
			// 统计 Obsidian 原生标签使用次数
			for (const file of markdownFiles) {
				try {
					const cache = this.app.metadataCache.getFileCache(file);
					if (cache && cache.tags) {
						cache.tags.forEach(tag => {
							stats[tag.tag] = (stats[tag.tag] || 0) + 1;
						});
					}
				} catch (error) {
					console.error(`Error processing file ${file.path}:`, error);
				}
			}

			// 统计数据库标签（如果没有在 Obsidian 中找到，设为 0）
			const databaseTags = this.plugin.database.getAllTags();
			databaseTags.forEach(tag => {
				if (!stats.hasOwnProperty(tag)) {
					stats[tag] = 0;
				}
			});

			return stats;

		} catch (error) {
			console.error('Error getting tag usage stats:', error);
			return {};
		}
	}

	/**
	 * 清理标签索引文件
	 */
	async cleanupTagIndexFile(): Promise<void> {
		try {
			console.log('Tag index file cleanup is deprecated - each attachment now has its own MD file');
			// 不再需要清理单独的标签索引文件
		} catch (error) {
			console.error('Error cleaning up tag index file:', error);
		}
	}

	/**
	 * 自动同步标签（在数据库变化时调用）
	 */
	async autoSyncTags(): Promise<void> {
		// 自动标签同步功能已弃用，使用新的MD文件管理系统
		console.log('Auto tag sync is deprecated - using new MD file management system');
		return;
	}

	/**
	 * 检查是否正在更新引用统计
	 */
	private isReferenceUpdateInProgress(): boolean {
		// 通过检查数据库中的引用计数来判断
		// 如果大部分记录的引用计数为0，可能正在更新引用统计
		const records = this.plugin.database.getAllRecords();
		if (records.length === 0) return false;
		
		const zeroRefCount = records.filter(r => r.referenceCount === 0).length;
		const totalRecords = records.length;
		
		// 如果超过80%的记录引用计数为0，可能正在更新引用统计
		return (zeroRefCount / totalRecords) > 0.8;
	}

	/**
	 * 调试方法：检查标签同步状态
	 */
	async debugTagSync(): Promise<void> {
		try {
			console.log('=== Tag Sync Debug Info ===');
			
			// 检查数据库标签
			const databaseTags = this.plugin.database.getAllTags();
			console.log('Database tags:', databaseTags);
			
			// 检查标签索引文件
			console.log('Tag index file check is deprecated - each attachment now has its own MD file');
			// 不再需要检查单独的标签索引文件
			
			// 检查 Obsidian 中的标签
			const availableTags = this.getAvailableTags();
			console.log('Available tags in Obsidian:', Array.from(availableTags));
			
			// 检查特定标签是否可用
			databaseTags.forEach(tag => {
				const isAvailable = this.isTagAvailableInObsidian(tag);
				console.log(`Tag "${tag}" available in Obsidian:`, isAvailable);
			});
			
			console.log('=== End Debug Info ===');
		} catch (error) {
			console.error('Error in debugTagSync:', error);
		}
	}
}
