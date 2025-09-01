import { App, TFile, TFolder, Notice } from 'obsidian';
import { AttachmentRecord } from '../main';
import type ResearchAttachmentHubPlugin from '../main';

interface AttachmentData {
	records: AttachmentRecord[];
	lastUpdated: string;
}

export class AttachmentDatabase {
	private app: App;
	private plugin: ResearchAttachmentHubPlugin;
	private records: Map<string, AttachmentRecord> = new Map();

	constructor(app: App, plugin: any) {
		this.app = app;
		this.plugin = plugin;
	}

	async initialize() {
		try {
			await this.loadData();
		} catch (error) {
			console.log('No existing data found, starting with empty database');
		}
	}

	// 添加新记录
	async addRecord(record: AttachmentRecord, skipMDUpdate: boolean = false): Promise<void> {
		// 保留导入记录的原始字段值，只在创建新记录时初始化
		if (record.hasMDFile === undefined) {
			record.hasMDFile = false;
		}
		if (record.mdFilePath === undefined) {
			record.mdFilePath = undefined;
		}
		
		console.log(`🔍 Adding record with hasMDFile: ${record.hasMDFile}, mdFilePath: ${record.mdFilePath}`);
		
		this.records.set(record.id, record);
		await this.save();
		
		// 只有在不跳过MD更新时才自动创建对应的MD文件
		if (!skipMDUpdate && this.plugin.attachmentTagManager) {
			try {
				await this.plugin.attachmentTagManager.createMDFile(record);
			} catch (error) {
				console.error('Error creating MD file for new record:', error);
			}
		}
	}

	// 根据DOI查找记录
	findByDOI(doi: string): AttachmentRecord | undefined {
		// 处理缺省状态：空字符串、undefined、null
		if (!doi || doi.trim() === '') {
			return undefined; // 没有DOI的记录不参与重复判断
		}
		
		return Array.from(this.records.values()).find(record => 
			record.doi && record.doi.trim() !== '' && 
			record.doi.toLowerCase() === doi.toLowerCase()
		);
	}

	// 根据文件路径查找记录
	findByPath(filePath: string): AttachmentRecord | undefined {
		return Array.from(this.records.values()).find(record => 
			record.filePath === filePath
		);
	}

	// 获取所有记录
	getAllRecords(): AttachmentRecord[] {
		return Array.from(this.records.values());
	}

	// 获取记录数量
	getRecordCount(): number {
		return this.records.size;
	}

	// 更新记录
	async updateRecord(record: AttachmentRecord, skipMDUpdate: boolean = false): Promise<void> {
		this.records.set(record.id, record);
		await this.save();
		
		// 只有在不跳过MD更新时才自动更新对应的MD文件
		if (!skipMDUpdate && this.plugin.attachmentTagManager) {
			try {
				await this.plugin.attachmentTagManager.updateMDFile(record);
			} catch (error) {
				console.error('Error updating MD file for record:', error);
			}
		}
	}

	// 批量添加记录（用于导入，避免频繁文件操作）
	async addRecordsBatch(records: AttachmentRecord[]): Promise<void> {
		console.log(`🔄 Adding ${records.length} records in batch...`);
		
		// 批量添加记录，跳过MD文件更新
		for (const record of records) {
			await this.addRecord(record, true); // skipMDUpdate = true
		}
		
		// 批量保存一次
		await this.save();
		
		console.log(`✅ Batch added ${records.length} records successfully`);
	}

	// 删除记录
	async deleteRecord(id: string): Promise<void> {
		const record = this.records.get(id);
		if (record) {
					// 删除对应的MD文件
		try {
			if (this.plugin.attachmentTagManager) {
				await this.plugin.attachmentTagManager.deleteMDFile(record);
			}
		} catch (error) {
			console.error('Error deleting MD file for record:', error);
		}
		}
		
		this.records.delete(id);
		await this.save();
	}

	// 搜索记录
	searchRecords(query: string): AttachmentRecord[] {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.records.values()).filter(record => 
			(record.title && record.title.toLowerCase().includes(lowerQuery)) ||
			(record.author && record.author.toLowerCase().includes(lowerQuery)) ||
			(record.doi && record.doi.toLowerCase().includes(lowerQuery)) ||
			record.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
		);
	}

	// 获取引用次数最多的记录
	getMostReferencedRecords(limit: number = 10): AttachmentRecord[] {
		return Array.from(this.records.values())
			.sort((a, b) => b.referenceCount - a.referenceCount)
			.slice(0, limit);
	}

	// 获取最近添加的记录
	getRecentlyAddedRecords(limit: number = 10): AttachmentRecord[] {
		return Array.from(this.records.values())
			.sort((a, b) => new Date(b.addedTime).getTime() - new Date(a.addedTime).getTime())
			.slice(0, limit);
	}

	// 根据标签筛选记录
	getRecordsByTag(tag: string): AttachmentRecord[] {
		return Array.from(this.records.values()).filter(record => 
			record.tags.includes(tag)
		);
	}

	// 获取所有标签
	getAllTags(): string[] {
		const tags = new Set<string>();
		this.records.forEach(record => {
			record.tags.forEach(tag => tags.add(tag));
		});
		return Array.from(tags).sort();
	}

	// 保存数据 - 使用Obsidian的Base功能
	async save(): Promise<void> {
		try {
			const data: AttachmentData = {
				records: Array.from(this.records.values()),
				lastUpdated: new Date().toISOString()
			};
			
			// 使用Obsidian插件数据存储API
			await this.plugin.saveData(data);
		} catch (error) {
			console.error('Failed to save database:', error);
			new Notice(this.plugin.languageManager.t('notices.databaseSaveFailed'));
		}
	}

	// 加载数据 - 使用Obsidian的Base功能
	async loadData(): Promise<void> {
		try {
			const data = await this.plugin.loadData();
			
			if (data && data.records) {
				this.records.clear();
				data.records.forEach((record: AttachmentRecord) => {
					this.records.set(record.id, record);
				});
			} else {
				// 如果没有数据，尝试从旧路径迁移
				await this.migrateFromOldPath();
			}
		} catch (error) {
			console.error('Failed to load database:', error);
			new Notice(this.plugin.languageManager.t('notices.databaseLoadFailed'));
			// 尝试从旧路径迁移
			await this.migrateFromOldPath();
		}
	}

	// 从旧路径迁移数据
	private async migrateFromOldPath(): Promise<void> {
		const oldDataPath = '.obsidian/plugins/research-attachment-hub/data.json';
		try {
			if (await this.app.vault.adapter.exists(oldDataPath)) {
				const data = await this.app.vault.adapter.read(oldDataPath);
				const parsed = JSON.parse(data);
				
				if (parsed.records) {
					this.records.clear();
					parsed.records.forEach((record: AttachmentRecord) => {
						this.records.set(record.id, record);
					});
					
					// 保存到新位置并删除旧文件
					await this.save();
					await this.app.vault.adapter.remove(oldDataPath);
					
					new Notice(this.plugin.languageManager.t('notices.dataMigrated'));
				}
			}
		} catch (error) {
			console.error('Failed to migrate data:', error);
			// 忽略迁移错误，继续使用空数据库
		}
	}

	// 确保目录存在
	private async ensureDirectoryExists(path: string): Promise<void> {
		const parts = path.split('/');
		let currentPath = '';
		
		for (const part of parts) {
			if (part) {
				currentPath += (currentPath ? '/' : '') + part;
				try {
					await this.app.vault.adapter.mkdir(currentPath);
				} catch (error) {
					// 目录可能已经存在
				}
			}
		}
	}

	// 备份数据
	async backup(): Promise<string> {
		const timestamp = Date.now();
		const backupPath = `.obsidian/plugins/research-attachment-hub/backups/data_${timestamp}.json`;
		
		// 确保备份目录存在
		await this.ensureDirectoryExists('.obsidian/plugins/research-attachment-hub/backups');
		
		await this.app.vault.adapter.write(backupPath, JSON.stringify({
			records: Array.from(this.records.values()),
			backupTime: new Date().toISOString()
		}, null, 2));
		return backupPath;
	}

	// 恢复数据
	async restore(backupPath: string): Promise<void> {
		try {
			const data = await this.app.vault.adapter.read(backupPath);
			const parsed = JSON.parse(data);
			
			if (parsed.records) {
				this.records.clear();
				parsed.records.forEach((record: AttachmentRecord) => {
					this.records.set(record.id, record);
				});
				await this.save();
				new Notice(this.plugin.languageManager.t('notices.databaseRestored'));
			}
		} catch (error) {
			console.error('Failed to restore database:', error);
			new Notice(this.plugin.languageManager.t('notices.databaseRestoreFailed'));
		}
	}

	// 清理无效记录
	async cleanup(): Promise<number> {
		let cleanedCount = 0;
		const recordsToRemove: string[] = [];
		
		for (const [id, record] of this.records) {
			try {
				const file = this.app.vault.getAbstractFileByPath(record.filePath);
				if (!file || !(file instanceof TFile)) {
					recordsToRemove.push(id);
					cleanedCount++;
				}
			} catch (error) {
				recordsToRemove.push(id);
				cleanedCount++;
			}
		}
		
		recordsToRemove.forEach(id => this.records.delete(id));
		
		if (cleanedCount > 0) {
			await this.save();
		}
		
		return cleanedCount;
	}
}
