import { App, TFile, TAbstractFile, Notice } from 'obsidian';

export interface AttachmentManagerSettings {
	// 基础设置
	defaultFolder: string;
	fileNameTemplate: string;
	tempDir: string;
	
	// 文件管理设置
	autoCopyExternalFiles: boolean;
	enableRename: boolean;
	attachmentDirectory: string;
	
	// 高级设置
	autoExtractDOI: boolean;
	autoExtractMetadata: boolean;
	backupInterval: number;
	
	// 视图设置
	defaultView: 'list' | 'preview' | 'card';
	showPreview: boolean;
	openMode: 'new-tab' | 'current-tab' | 'new-window'; // 打开模式
	
	// 语言设置
	language: 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'de-DE' | 'fr-FR' | 'ru-RU' | 'es-ES';
	
	// 导出设置
	exportFormat: 'csv' | 'json' | 'bibtex';
	autoBackup: boolean;
	
	// MD文件管理设置
	enableAutoMDCreation: boolean;
	autoMDFileTypes: string[];
	excludeMDFileTypes: string[];
	mdFileLocation: string;
	mdFileNameTemplate: string;
	
	// 列显示设置
	columnVisibility: { [key: string]: boolean };
}

export const DEFAULT_SETTINGS: AttachmentManagerSettings = {
	defaultFolder: '{{current_folder}}/attachments',
	fileNameTemplate: '{{title}}_{{author}}_{{year}}',
	tempDir: 'research-attachment-hub/tmp',
	autoCopyExternalFiles: true,
	enableRename: true,
	attachmentDirectory: 'attachments',
	autoExtractDOI: true,
	autoExtractMetadata: true,
	backupInterval: 7,
	defaultView: 'list',
	showPreview: true,
	openMode: 'new-window' as const, // 默认在新窗口中打开
	language: 'en-US' as const,
	exportFormat: 'csv',
	autoBackup: true,
	enableAutoMDCreation: false,
	autoMDFileTypes: ['pdf', 'doc', 'docx', 'txt', 'md'],
	excludeMDFileTypes: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'mp4', 'avi', 'mov'],
	mdFileLocation: '{{current_folder}}/{{title}}-{{date:YYYYMMDD}}',
	mdFileNameTemplate: '{{title}}-{{date:YYYYMMDD}}_notes',
	columnVisibility: {
		title: true,
		author: true,
		year: true,
		publisher: true,
		journalLevel: true,
		doi: true,
		fileType: true,
		fileSize: true,
		location: true,
		tags: true,
		references: true,
		added: true,
		actions: true
	}
};

export class SettingsManager {
	private app: App;
	private plugin: any; // 插件实例
	private settings: AttachmentManagerSettings;
	private settingsFilePath: string = '';
	private saveTimeout: NodeJS.Timeout | null = null;

	constructor(app: App, plugin: any) {
		this.app = app;
		this.plugin = plugin;
		this.settings = { ...DEFAULT_SETTINGS };
		
		// 设置文件路径：使用.obsidian/plugins目录下的hubsetting.json
		this.settingsFilePath = '.obsidian/plugins/obsidian-research-attachment-hub/hubsetting.json';
	}

	/**
	 * 初始化设置管理器
	 */
	async initialize(): Promise<void> {
		try {
			await this.loadSettings();
		} catch (error) {
			console.log('No existing settings found, starting with default settings');
		}
	}

	/**
	 * 加载设置
	 */
	async loadSettings(): Promise<AttachmentManagerSettings> {
		try {
			console.log('=== SettingsManager.loadSettings() called ===');
			console.log('Loading settings from hubsetting.json...');
			
			// 使用vault.adapter直接读取文件
			if (await this.app.vault.adapter.exists(this.settingsFilePath)) {
				const data = await this.app.vault.adapter.read(this.settingsFilePath);
				const parsed = JSON.parse(data);
				
				if (parsed && Object.keys(parsed).length > 0) {
					// 清理旧的设置字段，确保只保留新的设置结构
					const cleanedData = { ...parsed };
					
					// 移除旧的设置字段
					if ('openInNewTab' in cleanedData) {
						console.log('🧹 Cleaning up old setting: openInNewTab');
						delete cleanedData.openInNewTab;
					}
					if ('openInNewWindow' in cleanedData) {
						console.log('🧹 Cleaning up old setting: openInNewWindow');
						delete cleanedData.openInNewWindow;
					}
					
					// 合并默认设置
					this.settings = { ...DEFAULT_SETTINGS, ...cleanedData };
					console.log('Settings loaded successfully from hubsetting.json');
					console.log('Loaded settings:', this.settings);
				} else {
					console.log('Settings file is empty, using default settings');
					this.settings = { ...DEFAULT_SETTINGS };
				}
			} else {
				console.log('Settings file not found, using default settings');
				this.settings = { ...DEFAULT_SETTINGS };
				// 创建默认设置文件
				await this.saveSettings();
			}
			
			console.log('Final settings after load:', this.settings);
			console.log('=== SettingsManager.loadSettings() completed ===');
		} catch (error) {
			console.error('Error loading settings:', error);
			this.settings = { ...DEFAULT_SETTINGS };
			// 尝试从旧路径迁移
			await this.migrateFromOldPath();
		}
		
		return this.settings;
	}

	/**
	 * 从旧路径迁移设置
	 */
	private async migrateFromOldPath(): Promise<void> {
		const oldSettingsPath = '.obsidian/plugins/obsidian-research-attachment-hub/data.json';
		try {
			if (await this.app.vault.adapter.exists(oldSettingsPath)) {
				const data = await this.app.vault.adapter.read(oldSettingsPath);
				const parsed = JSON.parse(data);
				
				// 检查是否包含设置数据
				if (parsed.settings) {
					const oldSettings = parsed.settings;
					
					// 清理旧的设置字段
					if ('openInNewTab' in oldSettings) {
						delete oldSettings.openInNewTab;
					}
					if ('openInNewWindow' in oldSettings) {
						delete oldSettings.openInNewWindow;
					}
					
					// 合并设置
					this.settings = { ...DEFAULT_SETTINGS, ...oldSettings };
					
					// 保存到新位置
					await this.saveSettings();
					
					new Notice(this.plugin.languageManager.t('notices.settingsMigrated'));
				}
			}
		} catch (error) {
			console.error('Failed to migrate settings:', error);
			// 忽略迁移错误，继续使用默认设置
		}
	}

	/**
	 * 确保目录存在
	 */
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

	/**
	 * 保存设置
	 */
	async saveSettings(): Promise<void> {
		try {
			console.log('=== Saving settings to hubsetting.json ===');
			console.log('Settings content:', this.settings);
			console.log('Settings file path:', this.settingsFilePath);
			console.log('Settings object keys:', Object.keys(this.settings));
			console.log('Language setting value:', this.settings.language);
			
			// 确保目录存在
			await this.ensureDirectoryExists('.obsidian/plugins/obsidian-research-attachment-hub');
			
			const jsonContent = JSON.stringify(this.settings, null, 2);
			console.log('JSON content length:', jsonContent.length);
			console.log('JSON content preview:', jsonContent.substring(0, 200));
			
			// 直接使用相对路径保存，因为绝对路径有重复问题
			await this.app.vault.adapter.write(this.settingsFilePath, jsonContent);
			console.log('✅ Settings saved successfully using relative path');
			
			// 验证文件是否真的被保存了
			try {
				const savedData = await this.app.vault.adapter.read(this.settingsFilePath);
				console.log('✅ File verification successful, content length:', savedData.length);
				
				// 检查文件修改时间
				const fileStats = await this.app.vault.adapter.stat(this.settingsFilePath);
				if (fileStats) {
					console.log('✅ File stats - Size:', fileStats.size, 'Modified:', new Date(fileStats.mtime).toLocaleString());
				} else {
					console.log('⚠️ File stats not available');
				}
				
			} catch (verifyError) {
				console.log('⚠️ File verification failed:', verifyError);
			}
			
		} catch (error) {
			console.error('❌ Failed to save settings:', error);
			console.error('Error details:', error);
			new Notice(this.plugin.languageManager.t('notices.settingsSaveFailed'));
		}
	}

	/**
	 * 保存设置（带防抖）
	 */
	async saveSettingsDebounced(): Promise<void> {
		// 清除之前的超时
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}

		// 设置新的超时，500ms后保存
		this.saveTimeout = setTimeout(async () => {
			await this.saveSettings();
		}, 500);
	}

	/**
	 * 获取当前设置
	 */
	getSettings(): AttachmentManagerSettings {
		return { ...this.settings };
	}

	/**
	 * 同步外部设置到内部设置
	 */
	syncExternalSettings(externalSettings: AttachmentManagerSettings): void {
		this.settings = { ...externalSettings };
		console.log('External settings synced to SettingsManager');
		console.log('Synced settings keys:', Object.keys(this.settings));
		console.log('Synced language value:', this.settings.language);
	}

	/**
	 * 更新设置
	 */
	async updateSettings(newSettings: Partial<AttachmentManagerSettings>): Promise<void> {
		this.settings = { ...this.settings, ...newSettings };
		await this.saveSettings();
	}

	/**
	 * 重置为默认设置
	 */
	async resetToDefaults(): Promise<void> {
		this.settings = { ...DEFAULT_SETTINGS };
		await this.saveSettings();
		new Notice(this.plugin.languageManager.t('notices.settingsReset'));
	}

	/**
	 * 备份设置
	 */
	async backup(): Promise<string> {
		const timestamp = Date.now();
		const backupPath = `.obsidian/plugins/obsidian-research-attachment-hub/backups/settings_${timestamp}.json`;
		
		// 确保备份目录存在
		await this.ensureDirectoryExists('.obsidian/plugins/obsidian-research-attachment-hub/backups');
		
		await this.app.vault.adapter.write(backupPath, JSON.stringify({
			settings: this.settings,
			backupTime: new Date().toISOString()
		}, null, 2));
		
		return backupPath;
	}

	/**
	 * 恢复设置
	 */
	async restore(backupPath: string): Promise<void> {
		try {
			const data = await this.app.vault.adapter.read(backupPath);
			const parsed = JSON.parse(data);
			
			if (parsed.settings) {
				this.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
				await this.saveSettings();
				new Notice(this.plugin.languageManager.t('notices.settingsRestored'));
			}
		} catch (error) {
			console.error('Failed to restore settings:', error);
			new Notice(this.plugin.languageManager.t('notices.settingsRestoreFailed'));
		}
	}
}

