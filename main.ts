import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder, WorkspaceLeaf, ItemView, ViewStateResult, MarkdownRenderer, MarkdownView as ObsidianMarkdownView } from 'obsidian';
import * as path from 'path';
import * as fs from 'fs';
import JSZip from 'jszip';
import { ResearchAttachmentHubView, RESEARCH_ATTACHMENT_HUB_VIEW_TYPE } from './views/ResearchAttachmentHubView';
import { DownloadModal } from './modals/DownloadModal';
import { SearchModal } from './modals/SearchModal';
import { ImportModal } from './modals/ImportModal';
import { ScanAttachmentsModal } from './modals/ScanAttachmentsModal';
import { AttachmentDatabase } from './database/AttachmentDatabase';
import { PDFProcessor } from './utils/PDFProcessor';
import { DOIExtractor } from './utils/DOIExtractor';
import { FileManager } from './utils/FileManager';
import { TagSyncManager } from './utils/TagSyncManager';
import { AttachmentTagManager } from './utils/AttachmentTagManager';
import { ObsidianTagIndexer } from './utils/ObsidianTagIndexer';
import { ImportPreviewModal } from './modals/ImportPreviewModal';
import { LanguageManager } from './utils/LanguageManager';
import { SupportedLanguage } from './locales/language-table';
import { SettingsManager } from './utils/SettingsManager';

// 插件设置接口
interface AttachmentManagerSettings {
	// 基础设置
	defaultFolder: string;
	fileNameTemplate: string;
	tempDir: string;
	
	// 文件管理设置
	autoCopyExternalFiles: boolean; // 自动复制外部文件到附件目录
	enableRename: boolean; // 是否启用文件重命名
	attachmentDirectory: string; // 附件存放目录
	
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
	
	// 标签同步设置（已移除，使用新的MD文件管理系统）
	
	// MD文件管理设置
	enableAutoMDCreation: boolean; // 是否自动创建MD文件
	autoMDFileTypes: string[]; // 自动创建MD的文件类型
	excludeMDFileTypes: string[]; // 排除创建MD的文件类型
	mdFileLocation: string; // MD文件存放位置
	mdFileNameTemplate: string; // MD文件名模板
	
	// 列显示设置
	columnVisibility: { [key: string]: boolean };
}

// 默认设置
const DEFAULT_SETTINGS: AttachmentManagerSettings = {
	defaultFolder: '{{current_folder}}/attachments',
	fileNameTemplate: '{{title}}_{{author}}_{{year}}',
	tempDir: 'research-attachment-hub/tmp',
	autoCopyExternalFiles: true, // 默认启用自动复制外部文件
	enableRename: true, // 默认启用文件重命名
	attachmentDirectory: 'attachments', // 默认附件目录
	autoExtractDOI: true,
	autoExtractMetadata: true,
	backupInterval: 7,
	defaultView: 'list',
	showPreview: true,
	openMode: 'new-window' as const, // 默认在新窗口中打开
	language: 'en-US' as const, // 默认使用英语
	exportFormat: 'csv',
	autoBackup: true,
	enableAutoMDCreation: false, // 默认不自动创建MD文件
	autoMDFileTypes: ['pdf', 'doc', 'docx', 'txt', 'md'], // 默认自动创建MD的文件类型
	excludeMDFileTypes: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'mp4', 'avi', 'mov'], // 默认排除的文件类型
	mdFileLocation: '{{current_folder}}/{{title}}-{{date:YYYYMMDD}}', // 默认MD文件存放位置
	mdFileNameTemplate: '{{title}}-{{date:YYYYMMDD}}_notes', // 默认MD文件名模板
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

// 附件记录接口
export interface AttachmentRecord {
	id: string;
	doi: string;
	title: string;
	author: string;
	year: string;
	publisher?: string; // 发表机构（期刊、会议或出版社）
	journalLevel?: 'CCF-A' | 'CCF-B' | 'CCF-C' | 'SCI-1' | 'SCI-2' | 'SCI-3' | 'SCI-4' | 'Other'; // 期刊等级
	fileName: string;
	filePath: string;
	fileType: string; // 文件类型（扩展名）
	fileSize?: number; // 文件大小（可选）
	tags: string[];
	addedTime: string;
	referenceCount: number;
	references: ReferenceInfo[]; // 新增：引用信息列表
	bibText: string;
	metadata: Record<string, any>;
	hasMDFile: boolean; // 是否有对应的MD文件
	mdFilePath?: string; // MD文件路径（如果有的话）
	mdLastSync?: number; // 最后同步时间
	mdUserNotes?: string; // 用户笔记
	mdFileLost?: boolean; // MD文件是否丢失
}

// 新增：引用信息接口
export interface ReferenceInfo {
	filePath: string;
	fileName: string;
	lineNumber?: number;
	context?: string; // 改为可选，暂时不实现异步上下文提取
	referenceType: 'doi' | 'filename' | 'title' | 'author' | 'link';
}

export default class ResearchAttachmentHubPlugin extends Plugin {
	settings: AttachmentManagerSettings;
	settingsManager: SettingsManager;
	database: AttachmentDatabase;
	pdfProcessor: PDFProcessor;
	doiExtractor: DOIExtractor;
	fileManager: FileManager;
	tagSyncManager: TagSyncManager;
	attachmentTagManager: AttachmentTagManager;
	obsidianTagIndexer: ObsidianTagIndexer;
	statusBarItemEl: HTMLElement;
	languageManager: LanguageManager;

	async onload() {
		// 初始化设置管理器
		this.settingsManager = new SettingsManager(this.app, this);
		
		// 初始化设置管理器（这会加载设置并创建hubsetting.json文件）
		await this.settingsManager.initialize();
		
		// 获取当前设置
		this.settings = this.settingsManager.getSettings();
		
		// 初始化组件
		this.languageManager = new LanguageManager();
		this.database = new AttachmentDatabase(this.app, this);
		this.pdfProcessor = new PDFProcessor(this.app);
		this.doiExtractor = new DOIExtractor();
		this.fileManager = new FileManager(this.app, this);
		this.tagSyncManager = new TagSyncManager(this.app, this);
		this.obsidianTagIndexer = new ObsidianTagIndexer(this.app, this);
		this.attachmentTagManager = new AttachmentTagManager(this.app, this);
		
		// 初始化语言管理器
		await this.languageManager.initialize();
		
		// 根据设置设置初始语言（不显示通知）
		this.languageManager.setInitialLanguage(this.settings.language);
		
		// 不要在这里立即保存设置，避免覆盖用户设置
		// 只有在用户主动修改设置时才会保存

		// 注册视图
		this.registerView(
			RESEARCH_ATTACHMENT_HUB_VIEW_TYPE,
			(leaf) => new ResearchAttachmentHubView(leaf, this)
		);

		// 添加命令1: 下载论文
		this.addCommand({
			id: 'download-paper',
			name: 'Download Paper by URL',
			callback: () => {
				new DownloadModal(this.app, this).open();
			}
		});

		// 添加命令2: 搜索论文
		this.addCommand({
			id: 'search-paper',
			name: 'Search Paper by DOI',
			callback: () => {
				new SearchModal(this.app, this).open();
			}
		});

		// 添加命令3: 导入本地PDF
		this.addCommand({
			id: 'import-pdf',
			name: 'Import Local PDF',
			callback: () => {
				new ImportModal(this.app, this).open();
			}
		});

		// 添加命令4: 打开附件管理器
		this.addCommand({
			id: 'open-research-attachment-hub',
			name: 'Open Research Attachment Hub',
			callback: () => {
				this.activateView();
			}
		});

		// 添加命令5: 导出数据
		this.addCommand({
			id: 'export-attachments',
			name: 'Export Attachments Data',
			callback: () => {
				this.exportData();
			}
		});

		// 添加命令6: 生成引用
		this.addCommand({
			id: 'generate-citation',
			name: 'Generate Citation',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.generateCitation(editor, view);
			}
		});

		// 添加命令7: 更新所有引用计数
		this.addCommand({
			id: 'update-all-references',
			name: 'Update All Reference Counts',
			callback: () => {
				this.updateAllReferenceCounts();
			}
		});

		// 添加命令8: 扫描库中所有附件
		this.addCommand({
			id: 'scan-all-attachments',
			name: 'Scan All Attachments in Vault',
			callback: () => {
				new ScanAttachmentsModal(this.app, this).open();
			}
		});

		// 添加命令9: 按标签搜索附件（高级功能）
		this.addCommand({
			id: 'search-attachments-by-tag',
			name: 'Search Attachments by Tag',
			callback: () => {
				this.showTagSearchModal();
			}
		});

		// 添加命令11: 导出完整包
		this.addCommand({
			id: 'export-complete-package',
			name: 'Export Complete Package',
			callback: () => {
				this.exportCompletePackage();
			}
		});

		// 添加命令12: 导入完整包
		this.addCommand({
			id: 'import-complete-package',
			name: 'Import Complete Package',
			callback: () => {
				this.showImportPackageModal();
			}
		});

		// 添加命令13: 为所有附件创建MD文件
		this.addCommand({
			id: 'create-all-attachment-mds',
			name: 'Create MD Files for All Attachments',
			callback: () => {
				this.attachmentTagManager.syncAllMDFiles();
			}
		});

		// 添加命令14: 同步附件MD文件标签
		this.addCommand({
			id: 'sync-attachment-md-tags',
			name: 'Sync Tags from Attachment MD Files',
			callback: () => {
				this.syncTagsFromAttachmentMDs();
			}
		});

		// 添加命令15: 批量创建MD文件（高级功能）
		this.addCommand({
			id: 'create-all-attachment-mds',
			name: 'Create MD Files for All Attachments',
			callback: () => {
				this.attachmentTagManager.syncAllMDFiles();
			}
		});

		// 添加命令16: 同步附件MD文件标签（高级功能）
		this.addCommand({
			id: 'sync-attachment-md-tags',
			name: 'Sync Tags from Attachment MD Files',
			callback: () => {
				this.syncTagsFromAttachmentMDs();
			}
		});

		// 添加命令17: 检查丢失的MD文件
		this.addCommand({
			id: 'check-lost-md-files',
			name: 'Check Lost MD Files',
			callback: async () => {
				try {
					const lostFiles = await this.attachmentTagManager.checkForLostMDFiles();
					if (lostFiles.length === 0) {
						new Notice(this.languageManager.t('notices.noLostMDFiles'));
					} else {
						new Notice(this.languageManager.t('notices.foundLostMDFiles', { count: lostFiles.length }));
						console.log('丢失的MD文件列表:', lostFiles);
					}
				} catch (error) {
					console.error('Error checking lost MD files:', error);
					new Notice(this.languageManager.t('notices.checkLostMDFilesFailed'));
				}
			}
		});

		// 添加设置标签页
		this.addSettingTab(new ResearchAttachmentHubSettingTab(this.app, this));

		// 添加左侧图标
		const ribbonIconEl = this.addRibbonIcon('file-text', 'Attachment Manager', (evt: MouseEvent) => {
			this.activateView();
		});

		// 添加状态栏
		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText(`📚 Research Attachment Hub: ${this.database.getRecordCount()} papers`);

		// 注册事件监听器
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => {
				if (file && file.extension === 'md') {
					this.updateReferenceCount(file);
				}
			})
		);

		// 监听文件修改事件，实时更新引用计数
		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (file instanceof TFile && file.extension === 'md') {
					this.updateReferenceCount(file);
				}
			})
		);

		// 监听文件创建事件
		this.registerEvent(
			this.app.vault.on('create', (file) => {
				if (file instanceof TFile && file.extension === 'md') {
					this.updateReferenceCount(file);
				}
			})
		);

		// 监听文件删除事件
		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFile && file.extension === 'md') {
					this.updateReferenceCount(file);
				}
			})
		);

		// 监听附件文件移动和重命名
		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile) {
					if (file.extension === 'md') {
						// MD文件重命名/移动
						this.handleMDFileRename(file, oldPath);
					} else {
						// 附件文件重命名/移动
						this.handleAttachmentRename(file, oldPath);
					}
				}
			})
		);

		// 监听文件删除事件
		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFile) {
					if (file.extension === 'md') {
						// MD文件删除
						this.handleMDFileDelete(file);
					} else {
						// 附件文件删除
						this.handleAttachmentDelete(file);
					}
				}
			})
		);

		// 初始化数据库
		await this.database.initialize();

		// 初始同步标签到 Obsidian
		await this.tagSyncManager.syncTagsToObsidian();

		new Notice(this.languageManager.t('plugin.loadSuccess'));
	}

	async onunload() {
		// 保存数据库
		await this.database.save();
		
		// 清理视图
		this.app.workspace.detachLeavesOfType(RESEARCH_ATTACHMENT_HUB_VIEW_TYPE);
	}

	// 激活附件管理器视图
	async activateView() {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType(RESEARCH_ATTACHMENT_HUB_VIEW_TYPE)[0];

		if (!leaf) {
					// 根据设置决定打开方式
		switch (this.settings.openMode) {
			case 'new-window':
				// 在新建独立窗口中打开
				leaf = workspace.getLeaf('window')!;
				break;
			case 'new-tab':
				// 在新tab中打开
				leaf = workspace.getLeaf('tab')!;
				break;
			case 'current-tab':
			default:
				// 在当前tab中打开
				leaf = workspace.activeLeaf!;
				break;
		}
			
			await leaf.setViewState({
				type: RESEARCH_ATTACHMENT_HUB_VIEW_TYPE,
				active: true,
			});
		}

		workspace.revealLeaf(leaf);
	}

	// 导出数据
	async exportData(selectedRecords?: AttachmentRecord[]) {
		try {
			const records = selectedRecords || this.database.getAllRecords();
			const format = this.settings.exportFormat;
			
			let content = '';
			let filename = selectedRecords 
				? `selected-attachments_${new Date().toISOString().split('T')[0]}`
				: `all-attachments_${new Date().toISOString().split('T')[0]}`;
			
			switch (format) {
				case 'csv':
					content = this.convertToCSV(records);
					filename += '.csv';
					break;
				case 'json':
					content = JSON.stringify(records, null, 2);
					filename += '.json';
					break;
				case 'bibtex':
					content = this.convertToBibTeX(records);
					filename += '.bib';
					break;
			}
			
			// 创建下载链接
			const blob = new Blob([content], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			
			const exportType = selectedRecords ? this.languageManager.t('views.mainView.selectedAttachments') : this.languageManager.t('views.mainView.allAttachments');
			new Notice(this.languageManager.t('notices.exportSuccess', { type: exportType, filename }));
			return { records, format, filename }; // 返回导出数据以便导入时使用
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			new Notice(this.languageManager.t('notices.exportFailed', { message: errorMessage }));
			return null;
		}
	}

	/**
	 * 导出完整包 - 简化版本
	 */
	async exportCompletePackage(selectedRecords?: AttachmentRecord[]): Promise<void> {
		try {
			new Notice(this.languageManager.t('notices.exportStart'));
			
			// 获取要导出的记录
			const records = selectedRecords || this.database.getAllRecords();
			
			// 1. 导出附件数据（JSON格式）
			const dataExport = {
				attachments: records,
				exportTime: new Date().toISOString(),
				exportType: selectedRecords ? 'selected' : 'all',
				totalCount: records.length
			};
			
			// 2. 直接使用JSZip创建ZIP文件，不创建临时目录
			const JSZip = await import('jszip');
			const zip = new JSZip.default();
			
			// 添加数据库文件
			zip.file('attachments-data.json', JSON.stringify(dataExport, null, 2));
			
			// 添加说明文件
			const readmeContent = this.generateExportReadme(records.length, 0, 0, 0);
			zip.file('README.md', readmeContent);
			
			// 添加所有附件文件，保持原始路径
			let copiedCount = 0;
			let missingCount = 0;
			let mdCopiedCount = 0;
			
			for (const record of records) {
				try {
					// 添加PDF附件
					const sourceFile = this.app.vault.getAbstractFileByPath(record.filePath);
					if (sourceFile instanceof TFile) {
						const fileData = await this.app.vault.readBinary(sourceFile);
						zip.file(record.filePath, fileData);
						copiedCount++;
						console.log(`Added to ZIP: ${record.filePath}`);
					} else {
						missingCount++;
						console.warn(`File not found: ${record.filePath}`);
					}
					
					// 添加MD文件
					if (record.hasMDFile && record.mdFilePath) {
						const mdFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
						if (mdFile instanceof TFile) {
							const mdData = await this.app.vault.read(mdFile);
							zip.file(record.mdFilePath, mdData);
							mdCopiedCount++;
							console.log(`Added to ZIP: ${record.mdFilePath}`);
						}
					}
				} catch (error) {
					console.error(`Error processing record ${record.fileName}:`, error);
				}
			}
			
			// 3. 生成ZIP文件
			console.log(`Generating ZIP with ${copiedCount} files...`);
			const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
			
			// 4. 直接下载ZIP文件
			const blob = new Blob([zipBuffer], { type: 'application/zip' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `research-attachment-hub-export-${Date.now()}.zip`;
			
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			
			const exportType = selectedRecords ? this.languageManager.t('views.mainView.selectedAttachments') : this.languageManager.t('views.mainView.allAttachments');
			new Notice(this.languageManager.t('notices.exportCompleted', { type: exportType, copiedCount, missingCount }));
			
		} catch (error) {
			console.error('Export complete package failed:', error);
			new Notice(this.languageManager.t('notices.exportFailed', { message: error.message }));
		}
	}

	/**
	 * 显示标签搜索模态框
	 */
	private showTagSearchModal(): void {
		// 获取所有可用标签
		const allTags = this.obsidianTagIndexer.getAllTags();
		
		if (allTags.length === 0) {
			new Notice(this.languageManager.t('notices.noAvailableTags'));
			return;
		}

		// 创建简单的标签选择界面
		const modal = new (require('obsidian').Modal)(this.app);
		modal.titleEl.setText('按标签搜索附件');
		
		const content = modal.contentEl;
		content.style.padding = '20px';
		
		// 创建标签选择器
		const tagSelect = content.createEl('select');
		tagSelect.style.width = '100%';
		tagSelect.style.marginBottom = '20px';
		tagSelect.style.padding = '8px';
		
		// 添加默认选项
		const defaultOption = tagSelect.createEl('option', { text: '选择标签...', value: '' });
		defaultOption.disabled = true;
		defaultOption.selected = true;
		
		// 添加所有标签选项
		allTags.forEach(tag => {
			tagSelect.createEl('option', { text: `#${tag}`, value: tag });
		});
		
		// 添加搜索按钮
		const searchBtn = content.createEl('button', { text: '搜索', cls: 'mod-cta' });
		searchBtn.style.marginRight = '10px';
		
		searchBtn.addEventListener('click', async () => {
			const selectedTag = tagSelect.value;
			if (!selectedTag) {
				new Notice(this.languageManager.t('notices.pleaseSelectTag'));
				return;
			}
			
			try {
				const records = await this.obsidianTagIndexer.searchByTag(selectedTag);
				if (records.length > 0) {
					// 显示搜索结果
					this.showTagSearchResults(selectedTag, records);
					modal.close();
				} else {
					new Notice(this.languageManager.t('notices.noAttachmentsWithTag', { tag: selectedTag }));
				}
			} catch (error) {
				new Notice(this.languageManager.t('notices.searchFailed', { message: error.message }));
			}
		});
		
		// 添加取消按钮
		const cancelBtn = content.createEl('button', { text: '取消' });
		cancelBtn.addEventListener('click', () => modal.close());
	}

	/**
	 * 显示标签搜索结果
	 */
	private showTagSearchResults(tag: string, records: AttachmentRecord[]): void {
		const modal = new (require('obsidian').Modal)(this.app);
		modal.titleEl.setText(`标签 #${tag} 的搜索结果 (${records.length} 个附件)`);
		
		const content = modal.contentEl;
		content.style.padding = '20px';
		content.style.maxHeight = '70vh';
		content.style.overflowY = 'auto';
		
		records.forEach(record => {
			const recordDiv = content.createEl('div', { cls: 'search-result-item' });
			recordDiv.style.marginBottom = '15px';
			recordDiv.style.padding = '15px';
			recordDiv.style.border = '1px solid var(--background-modifier-border)';
			recordDiv.style.borderRadius = '8px';
			recordDiv.style.backgroundColor = 'var(--background-secondary)';
			
			// 标题
			const title = recordDiv.createEl('h3', { text: record.title });
			title.style.margin = '0 0 10px 0';
			title.style.color = 'var(--text-accent)';
			
			// 作者和年份
			const meta = recordDiv.createEl('p', { text: `${record.author || '未知作者'} • ${record.year || '未知年份'}` });
			meta.style.margin = '5px 0';
			meta.style.color = 'var(--text-muted)';
			
			// DOI
			if (record.doi) {
				const doi = recordDiv.createEl('p', { text: `DOI: ${record.doi}` });
				doi.style.margin = '5px 0';
				doi.style.fontSize = '12px';
				doi.style.color = 'var(--text-muted)';
			}
			
			// 操作按钮
			const actions = recordDiv.createEl('div');
			actions.style.marginTop = '10px';
			
			// 打开文件按钮
			const openBtn = actions.createEl('button', { text: '打开文件', cls: 'mod-cta' });
			openBtn.style.marginRight = '10px';
			openBtn.addEventListener('click', () => {
				this.openAttachmentFile(record);
				modal.close();
			});
			
			// 打开MD文件按钮（如果有）
			if (record.hasMDFile && record.mdFilePath) {
				const mdBtn = actions.createEl('button', { text: '打开MD文件', cls: 'mod-cta' });
				mdBtn.style.marginRight = '10px';
				mdBtn.addEventListener('click', () => {
					this.openAttachmentMDFile(record);
					modal.close();
				});
			}
		});
		
		// 添加关闭按钮
		const closeBtn = content.createEl('button', { text: '关闭', cls: 'mod-cta' });
		closeBtn.style.marginTop = '20px';
		closeBtn.addEventListener('click', () => modal.close());
	}

	/**
	 * 打开附件文件
	 */
	private async openAttachmentFile(record: AttachmentRecord): Promise<void> {
		try {
			const file = this.app.vault.getAbstractFileByPath(record.filePath);
			if (file instanceof TFile) {
				await this.app.workspace.getLeaf().openFile(file);
			} else {
				new Notice(this.languageManager.t('notices.fileNotFound'));
			}
		} catch (error) {
			new Notice(this.languageManager.t('notices.openFileFailed', { message: error.message }));
		}
	}

	/**
	 * 打开附件的MD文件
	 */
	private async openAttachmentMDFile(record: AttachmentRecord): Promise<void> {
		try {
			if (record.hasMDFile && record.mdFilePath) {
				const mdFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
				if (mdFile instanceof TFile) {
					await this.app.workspace.getLeaf().openFile(mdFile);
				} else {
					new Notice(this.languageManager.t('notices.mdFileNotFound'));
				}
			} else {
				new Notice(this.languageManager.t('notices.noCorrespondingMDFile'));
			}
		} catch (error) {
			new Notice(this.languageManager.t('notices.openMDFileFailed', { message: error.message }));
		}
	}

	/**
	 * 为选中的附件创建MD文件
	 */
	async createMDFileForSelectedAttachment(): Promise<void> {
		try {
			// 获取当前激活的视图
			const activeView = this.app.workspace.getActiveViewOfType(ResearchAttachmentHubView);
			if (!activeView) {
				new Notice(this.languageManager.t('notices.pleaseOpenView'));
				return;
			}

			// 这里需要与视图交互来获取选中的附件
			// 暂时显示提示信息
			new Notice(this.languageManager.t('notices.pleaseSelectAttachment'));
			
		} catch (error) {
			console.error('Error creating MD file for selected attachment:', error);
			new Notice(this.languageManager.t('notices.createMDFileFailed', { message: error.message }));
		}
	}

	/**
	 * 删除选中附件的MD文件
	 */
	async deleteMDFileForSelectedAttachment(): Promise<void> {
		try {
			// 获取当前激活的视图
			const activeView = this.app.workspace.getActiveViewOfType(ResearchAttachmentHubView);
			if (!activeView) {
				new Notice(this.languageManager.t('notices.pleaseOpenView'));
				return;
			}

			// 这里需要与视图交互来获取选中的附件
			// 暂时显示提示信息
			new Notice(this.languageManager.t('notices.pleaseSelectAttachmentToDelete'));
			
		} catch (error) {
			console.error('Error deleting MD file for selected attachment:', error);
			new Notice(this.languageManager.t('notices.deleteMDFileFailed', { message: error.message }));
		}
	}

	/**
	 * 从附件MD文件同步标签
	 */
	async syncTagsFromAttachmentMDs(): Promise<void> {
		try {
			new Notice(this.languageManager.t('notices.syncingTags'));
			
			const records = this.database.getAllRecords();
			let updatedCount = 0;
			
			for (const record of records) {
				try {
					if (record.hasMDFile && record.mdFilePath) {
						const existingFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
						if (existingFile instanceof TFile) {
							const content = await this.app.vault.read(existingFile);
							const tags = this.parseTagsFromMDContent(content);
							
							if (tags.length > 0 && JSON.stringify(tags.sort()) !== JSON.stringify(record.tags.sort())) {
								// 更新记录的标签
								record.tags = tags;
								await this.database.updateRecord(record);
								updatedCount++;
								// console.log(`Updated tags for ${record.title}: ${tags.join(', ')}`);
							}
						}
					}
				} catch (error) {
					console.error(`Error syncing tags for ${record.title}:`, error);
				}
			}
			
			if (updatedCount > 0) {
				// new Notice(this.languageManager.t('notices.tagsSynced', { count: updatedCount }));
				// 刷新视图
				this.refreshResearchAttachmentHubView();
			} else {
				new Notice(this.languageManager.t('notices.noTagsToUpdate'));
			}
			
		} catch (error) {
			console.error('Error syncing tags from attachment MDs:', error);
			// new Notice(this.languageManager.t('notices.tagSyncFailed', { message: error.message }));
		}
	}

	/**
	 * 从MD文件内容中解析标签
	 */
	private parseTagsFromMDContent(content: string): string[] {
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
	 * 从完整包导入研究附件
	 */
	async importCompletePackage(importPath: string): Promise<void> {
		try {
			new Notice(this.languageManager.t('notices.importingPackage'));
			
			// 1. 直接解压到vault根目录，不创建额外的临时目录
			await this.extractImportZip(importPath, '');
			
			// 2. 读取数据库数据
			const dataPath = `attachments-data.json`;
			console.log(`Looking for data file at: ${dataPath}`);
			
			let importData: any;
			
			// 检查文件是否存在
			try {
				const dataContent = await this.app.vault.adapter.read(dataPath);
				importData = JSON.parse(dataContent);
				console.log(`Successfully read data file, found ${importData.attachments?.length || 0} attachments`);
			} catch (error) {
				console.error(`Failed to read data file: ${dataPath}`, error);
				
				// 尝试列出根目录中的文件
				try {
					const allFiles = await this.app.vault.adapter.list('');
					console.log(`Files in vault root:`, allFiles);
					
					// 查找可能的数据文件
					for (const file of allFiles.files) {
						if (file.endsWith('.json')) {
							console.log(`Found JSON file: ${file}`);
						}
					}
				} catch (listError) {
					console.error('Failed to list vault root:', listError);
				}
				
				throw new Error(`Data file not found: ${dataPath}`);
			}
			
			// 3. 读取设置（现在不再导出设置文件）
			let importSettings = null;
			console.log('Settings import disabled - using current plugin settings');
			
			// 4. 显示导入预览
			const shouldImport = await this.showImportPreview(importData, importSettings);
			if (!shouldImport) {
				// 清理导入的文件
				await this.cleanupImportedFiles(importData);
				return;
			}
			
			// 5. 执行导入
			await this.executeImport('', importData, importSettings);
			
			// 6. 清理导入的临时文件
			await this.cleanupImportedFiles(importData);
			
			// new Notice(this.languageManager.t('notices.importCompleted'));
			
			// 刷新视图
			this.refreshResearchAttachmentHubView();
			
		} catch (error) {
			console.error('Import complete package failed:', error);
			// new Notice(this.languageManager.t('notices.importFailed', { message: error.message }));
		}
	}

	/**
	 * 生成导入说明文档
	 */
	private generateExportReadme(totalRecords: number, copiedFiles: number, missingFiles: number, mdFiles: number): string {
		const timestamp = new Date().toLocaleString();
		
		return `# Research Attachment Hub 附件导出包

## 导出信息
- **导出时间**: ${timestamp}
- **总记录数**: ${totalRecords}
- **成功复制文件**: ${copiedFiles}
- **缺失文件**: ${missingFiles}
- **MD文件**: ${mdFiles}

## 文件说明
- \`attachments-data.json\` - 附件数据记录（包含所有附件信息）
- \`README.md\` - 本说明文件

## 包含内容
- **附件数据**: attachments-data.json (包含所有附件的元数据、标签、DOI等信息)
- **附件文件**: 按照原始路径组织的所有PDF等原始文件
- **MD文件**: 每个附件对应的Markdown文件，包含标签和用户笔记

## 使用说明
这个导出包包含了您选择的所有附件及其相关信息，可以用于：
- 备份重要的研究资料
- 在其他设备上查看附件信息
- 分享给其他研究者
- 迁移到其他Obsidian库

## 注意事项
- 附件数据以JSON格式保存，包含完整的元数据
- 所有文件路径都是相对路径，便于迁移
- MD文件包含完整的标签信息
`;
	}

	private generateImportReadme(totalRecords: number, copiedFiles: number, missingFiles: number, mdFiles: number): string {
		const timestamp = new Date().toLocaleString();
		
		return `# Research Attachment Hub 导出包

## 导出信息
- **导出时间**: ${timestamp}
- **总记录数**: ${totalRecords}
- **成功复制文件**: ${copiedFiles}
- **缺失文件**: ${missingFiles}
- **MD文件**: ${mdFiles}

## 文件说明
- \`database.json\` - 数据库记录（包含所有附件信息）
- \`settings.json\` - 插件设置
- \`attachments/\` - 附件文件目录
- \`import.js\` - 导入脚本
- \`README.md\` - 本说明文件

## 包含内容
- **数据库文件**: database.json (包含所有附件记录)
- **设置文件**: settings.json (插件配置)
- **附件文件**: attachments/ 目录下的所有PDF等文件
- **MD文件**: 每个附件对应的Markdown文件，包含标签和元数据

## 导入方法
1. 将整个文件夹复制到目标vault
2. 运行 \`import.js\` 脚本
3. 或在插件设置中使用"导入完整包"功能

## 注意事项
- 确保目标vault有足够的存储空间
- 导入后可能需要调整文件路径设置
- 建议在导入前备份现有数据
- MD文件包含完整的标签信息，导入后会自动同步到Obsidian标签系统
`;
	}

	/**
	 * 生成导入脚本
	 */
	private generateImportScript(): string {
		return `// Research Attachment Hub 导入脚本
// 在 Obsidian 中运行此脚本来导入附件包

async function importResearchAttachmentHub() {
    try {
        // 获取插件实例
        const plugin = app.plugins.plugins['research-attachment-hub'];
        if (!plugin) {
            		new Notice(this.languageManager.t('notices.pluginNotInstalled'));
            return;
        }
        
        // 选择导入包文件
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // 将文件复制到vault
                const fileName = file.name;
                const filePath = fileName;
                const arrayBuffer = await file.arrayBuffer();
                await app.vault.adapter.writeBinary(filePath, arrayBuffer);
                
                // 调用插件的导入方法
                await plugin.importCompletePackage(filePath);
                
                // 清理临时文件
                const tempFile = app.vault.getAbstractFileByPath(filePath);
                if (tempFile) {
                    await app.vault.delete(tempFile);
                }
            }
        };
        input.click();
        
    } catch (error) {
        console.error('Import script error:', error);
        		new Notice(this.languageManager.t('notices.importScriptFailed', { message: error.message }));
    }
}

// 执行导入
importResearchAttachmentHub();
`;
	}

	/**
	 * 在vault中重新创建ZIP文件
	 */
	private async recreateZipInVault(sourceDir: string, zipPath: string): Promise<void> {
		try {
			console.log('Recreating ZIP file in vault...');
			
			// 直接使用纯JavaScript创建ZIP文件
			await this.createExportZip(sourceDir, zipPath);
			
			console.log('ZIP file recreated successfully in vault');
		} catch (error) {
			console.error('Failed to recreate ZIP file in vault:', error);
			throw error;
		}
	}

	/**
	 * 创建导出压缩包
	 */
	private async createExportZip(sourceDir: string, zipPath: string): Promise<void> {
		try {
			console.log('Creating ZIP export package...');
			
			// 使用纯JavaScript创建ZIP文件
			// 首先收集所有需要打包的文件
			const filesToZip: Array<{path: string, content: string | ArrayBuffer}> = [];
			
			// 递归收集目录中的所有文件
			await this.collectFilesForZipping(sourceDir, filesToZip);
			
			// 创建ZIP文件内容
			const zipContent = await this.createZipContent(filesToZip);
			
			// 保存ZIP文件到临时位置
			await this.app.vault.adapter.writeBinary(zipPath, zipContent);
			
			console.log('ZIP package created successfully');
		} catch (error) {
			console.error('Error creating ZIP package:', error);
			throw error;
		}
	}

	/**
	 * 收集需要打包的文件
	 */
	private async collectFilesForZipping(dirPath: string, files: Array<{path: string, content: string | ArrayBuffer}>): Promise<void> {
		try {
			const dirContents = await this.app.vault.adapter.list(dirPath);
			
				for (const file of dirContents.files) {
				// 正确计算相对路径，保持目录结构
				const relativePath = this.getRelativePath(dirPath, file);
				const fileData = await this.app.vault.adapter.readBinary(file);
				files.push({
					path: relativePath,
					content: fileData
				});
			}
			
			for (const folder of dirContents.folders) {
				// 递归处理子目录
				await this.collectFilesForZipping(folder, files);
			}
		} catch (error) {
			console.error(`Error collecting files from ${dirPath}:`, error);
		}
	}

	/**
	 * 创建ZIP文件内容 - 使用JSZip库
	 */
	private async createZipContent(files: Array<{path: string, content: string | ArrayBuffer}>): Promise<ArrayBuffer> {
		try {
			console.log(`Creating ZIP content for ${files.length} files using JSZip`);
			
			// 使用JSZip库创建ZIP文件
			const zip = new JSZip();
			
			// 添加所有文件到ZIP，保持目录结构
			for (const file of files) {
				const data = file.content instanceof ArrayBuffer ? file.content : new TextEncoder().encode(file.content as string);
				zip.file(file.path, data);
				console.log(`Added file to ZIP: ${file.path} (${data.byteLength} bytes)`);
			}
			
			// 生成ZIP文件
			const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
			console.log(`ZIP file created successfully: ${zipBuffer.byteLength} bytes`);
			
			return zipBuffer;
		} catch (error) {
			console.error('Error creating ZIP content with JSZip:', error);
			throw error;
		}
	}

	/**
	 * 计算相对路径，保持目录结构
	 */
	private getRelativePath(baseDir: string, fullPath: string): string {
		// 确保路径分隔符一致
		const normalizedBase = baseDir.replace(/\\/g, '/');
		const normalizedPath = fullPath.replace(/\\/g, '/');
		
		// 如果路径相同，返回文件名
		if (normalizedBase === normalizedPath) {
			return fullPath.split('/').pop() || '';
		}
		
		// 计算相对路径
		if (normalizedPath.startsWith(normalizedBase + '/')) {
			return normalizedPath.substring(normalizedBase.length + 1);
		}
		
		// 如果不在基础目录下，返回完整路径
		return normalizedPath;
	}

	/**
	 * 生成CRC32查找表
	 */
	private generateCRC32Table(): number[] {
		const table = new Array(256);
		for (let i = 0; i < 256; i++) {
			let c = i;
			for (let j = 0; j < 8; j++) {
				c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
			}
			table[i] = c;
		}
		return table;
	}

	/**
	 * 计算CRC32校验和
	 */
	private calculateCRC32(data: ArrayBuffer, crc32Table: number[]): number {
		let crc = 0xFFFFFFFF;
		const view = new Uint8Array(data);
		
		for (let i = 0; i < view.length; i++) {
			crc = (crc >>> 8) ^ crc32Table[(crc ^ view[i]) & 0xFF];
		}
		
		return (crc ^ 0xFFFFFFFF) >>> 0;
	}

	/**
	 * 构建ZIP文件
	 */
	private buildZipFile(entries: Array<{name: string, data: ArrayBuffer, crc: number, size: number, compressedSize: number}>): ArrayBuffer {
		try {
			console.log('Building ZIP file structure...');
			
			const chunks: ArrayBuffer[] = [];
			let currentOffset = 0;
			const centralDirectoryEntries: Array<{entry: any, offset: number}> = [];
			
			// 第一步：创建所有本地文件头和数据
			for (const entry of entries) {
				const localHeader = this.createLocalFileHeader(entry);
				chunks.push(localHeader);
				chunks.push(entry.data);
				
				// 记录中央目录需要的信息
				centralDirectoryEntries.push({
					entry: entry,
					offset: currentOffset
				});
				
				currentOffset += localHeader.byteLength + entry.data.byteLength;
				console.log(`Local header + data for ${entry.name}: offset ${currentOffset}`);
			}
			
			// 第二步：创建中央目录
			const centralDirectoryStart = currentOffset;
			for (const {entry, offset} of centralDirectoryEntries) {
				const centralDirEntry = this.createCentralDirectoryEntry(entry, offset);
				chunks.push(centralDirEntry);
				currentOffset += centralDirEntry.byteLength;
				console.log(`Central directory entry for ${entry.name}: offset ${currentOffset}`);
			}
			
			const centralDirectorySize = currentOffset - centralDirectoryStart;
			
			// 第三步：创建中央目录结束标记
			const endOfCentralDir = this.createEndOfCentralDirectory(entries.length, centralDirectorySize, centralDirectoryStart);
			chunks.push(endOfCentralDir);
			
			// 合并所有块
			const totalSize = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
			const result = new Uint8Array(totalSize);
			let offset = 0;
			
			for (const chunk of chunks) {
				result.set(new Uint8Array(chunk), offset);
				offset += chunk.byteLength;
			}
			
			console.log(`ZIP file created successfully: ${totalSize} bytes, ${entries.length} files`);
			return result.buffer;
		} catch (error) {
			console.error('Error building ZIP file:', error);
			throw error;
		}
	}

	/**
	 * 创建本地文件头
	 */
	private createLocalFileHeader(entry: {name: string, data: ArrayBuffer, crc: number, size: number, compressedSize: number}): ArrayBuffer {
		const nameBytes = new TextEncoder().encode(entry.name);
		const header = new ArrayBuffer(30 + nameBytes.length);
		const view = new DataView(header);
		
		// ZIP文件头签名
		view.setUint32(0, 0x04034B50, true);
		// 版本
		view.setUint16(4, 20, true);
		// 通用位标志
		view.setUint16(6, 0, true);
		// 压缩方法（存储）
		view.setUint16(8, 0, true);
		// 文件最后修改时间
		view.setUint16(10, 0, true);
		// 文件最后修改日期
		view.setUint16(12, 0, true);
		// CRC32
		view.setUint32(14, entry.crc, true);
		// 压缩后大小
		view.setUint32(18, entry.compressedSize, true);
		// 原始大小
		view.setUint32(22, entry.size, true);
		// 文件名长度
		view.setUint16(26, nameBytes.length, true);
		// 扩展字段长度
		view.setUint16(28, 0, true);
		
		// 文件名
		const nameView = new Uint8Array(header, 30);
		nameView.set(nameBytes);
		
		return header;
	}

	/**
	 * 创建中央目录条目
	 */
	private createCentralDirectoryEntry(entry: {name: string, data: ArrayBuffer, crc: number, size: number, compressedSize: number}, offset: number): ArrayBuffer {
		const nameBytes = new TextEncoder().encode(entry.name);
		const header = new ArrayBuffer(46 + nameBytes.length);
		const view = new DataView(header);
		
		// 中央目录文件头签名
		view.setUint32(0, 0x02014B50, true);
		// 版本
		view.setUint16(4, 20, true);
		// 最低版本
		view.setUint16(6, 20, true);
		// 通用位标志
		view.setUint16(8, 0, true);
		// 压缩方法
		view.setUint16(10, 0, true);
		// 文件最后修改时间
		view.setUint16(12, 0, true);
		// 文件最后修改日期
		view.setUint16(14, 0, true);
		// CRC32
		view.setUint32(16, entry.crc, true);
		// 压缩后大小
		view.setUint32(20, entry.compressedSize, true);
		// 原始大小
		view.setUint32(24, entry.size, true);
		// 文件名长度
		view.setUint16(28, nameBytes.length, true);
		// 扩展字段长度
		view.setUint16(30, 0, true);
		// 文件注释长度
		view.setUint16(32, 0, true);
		// 磁盘开始号
		view.setUint16(34, 0, true);
		// 内部文件属性
		view.setUint16(36, 0, true);
		// 外部文件属性
		view.setUint32(38, 0, true);
		// 本地文件头的相对偏移量
		view.setUint32(42, offset, true);
		
		// 文件名
		const nameView = new Uint8Array(header, 46);
		nameView.set(nameBytes);
		
		return header;
	}

	/**
	 * 创建中央目录结束标记
	 */
	private createEndOfCentralDirectory(entryCount: number, centralDirSize: number, centralDirOffset: number): ArrayBuffer {
		const header = new ArrayBuffer(22);
		const view = new DataView(header);
		
		// 中央目录结束标记签名
		view.setUint32(0, 0x06054B50, true);
		// 当前磁盘编号
		view.setUint16(4, 0, true);
		// 中央目录开始磁盘编号
		view.setUint16(6, 0, true);
		// 本磁盘上的条目数
		view.setUint16(8, entryCount, true);
		// 中央目录中的条目总数
		view.setUint16(10, entryCount, true);
		// 中央目录的大小
		view.setUint32(12, centralDirSize, true);
		// 中央目录开始位置相对于文件开始的偏移量
		view.setUint32(16, centralDirOffset, true);
		// 注释长度
		view.setUint16(20, 0, true);
		
		return header;
	}

	/**
	 * 解压导入包
	 */
	private async extractImportZip(zipPath: string, extractDir: string): Promise<void> {
		try {
			console.log(`Extracting ZIP file: ${zipPath} to ${extractDir}`);
			
			// 使用纯JavaScript解压ZIP文件
			const zipData = await this.app.vault.adapter.readBinary(zipPath);
			await this.extractZipContent(zipData, extractDir);
			
			console.log('ZIP extraction completed successfully');
		} catch (error) {
			console.error('ZIP extraction failed:', error);
			throw new Error(`Failed to extract import package: ${error.message}`);
		}
	}

	/**
	 * 使用JSZip库解压ZIP内容
	 */
	private async extractZipContent(zipData: ArrayBuffer, extractDir: string): Promise<void> {
		try {
			console.log('Using JSZip to extract ZIP content');
			
			// 使用JSZip库解压ZIP文件
			const JSZip = await import('jszip');
			const zip = new JSZip.default();
			
			// 加载ZIP数据
			await zip.loadAsync(zipData);
			
			console.log(`Found ${Object.keys(zip.files).length} files in ZIP`);
			
			// 解压每个文件
			for (const [filename, file] of Object.entries(zip.files)) {
				if (!file.dir) { // 跳过目录
					try {
						// 创建目标路径
						const targetPath = `${extractDir}/${filename}`;
						
						// 处理目录创建
						if (filename.includes('/')) {
							const targetDir = targetPath.substring(0, targetPath.lastIndexOf('/'));
							await this.ensureDirectoryExists(targetDir);
						}
						
						// 解压文件
						const fileData = await file.async('arraybuffer');
						await this.app.vault.adapter.writeBinary(targetPath, fileData);
						
						console.log(`Successfully extracted: ${filename} to ${targetPath}`);
					} catch (error) {
						console.error(`Error extracting file ${filename}:`, error);
					}
				}
			}
			
		} catch (error) {
			console.error('Error extracting ZIP content with JSZip:', error);
			throw error;
		}
	}

	// 删除了复杂的ZIP解压方法，现在使用JSZip库

	/**
	 * 显示导入预览
	 */
	private async showImportPreview(importData: any, importSettings: any): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new ImportPreviewModal(this.app, importData, importSettings, resolve);
			modal.open();
		});
	}

	/**
	 * 显示导入包选择模态框
	 */
	private showImportPackageModal(): void {
		console.log('showImportPackageModal called from main.ts');
		
		try {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.zip';
			input.style.display = 'none';
			
			// 使用更可靠的事件绑定
			input.addEventListener('change', async (e) => {
				console.log('File input change event triggered');
				const target = e.target as HTMLInputElement;
				const file = target.files?.[0];
				
				if (file) {
					console.log('File selected:', file.name, file.size);
					try {
						new Notice(this.languageManager.t('notices.importingPackage'));
						
						// 创建安全的临时文件名
						const timestamp = Date.now();
						const safeFileName = `import-package-${timestamp}.zip`;
						const filePath = safeFileName;
						
						console.log(`Using safe file path: ${filePath}`);
						
						const arrayBuffer = await file.arrayBuffer();
						await this.app.vault.adapter.writeBinary(filePath, arrayBuffer);
						
						console.log('File copied to vault, starting import...');
						
						// 调用插件的导入方法
						await this.importCompletePackage(filePath);
						
						// 清理临时文件
						const tempFile = this.app.vault.getAbstractFileByPath(filePath);
						if (tempFile) {
							await this.app.vault.delete(tempFile);
							console.log('Temporary file cleaned up');
						}
						
						new Notice(this.languageManager.t('notices.importSuccess'));
						
					} catch (error) {
						console.error('Import package error:', error);
						const errorMessage = error instanceof Error ? error.message : String(error);
						new Notice(this.languageManager.t('notices.importPackageFailed', { message: errorMessage }));
					}
				} else {
					console.log('No file selected');
				}
			});
			
			// 确保input元素被添加到DOM中
			document.body.appendChild(input);
			
			// console.log('Triggering file input click...');
			input.click();
			
			// 延迟清理input元素
			setTimeout(() => {
				if (document.body.contains(input)) {
					document.body.removeChild(input);
					// console.log('File input element cleaned up');
				}
			}, 1000);
			
		} catch (error) {
			console.error('Error in showImportPackageModal:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			new Notice(`导入包失败: ${errorMessage}`);
		}
	}

	/**
	 * 执行导入
	 */
	private async executeImport(extractDir: string, importData: any, importSettings: any): Promise<void> {
		try {
			// 1. 导入设置（可选）
			if (importSettings && confirm('是否导入插件设置？')) {
				// 合并设置，保留用户自定义值
				this.settings = { ...this.settings, ...importSettings };
				await this.saveSettings();
			}
			
			// 2. 更新MD文件内容中的链接路径
			console.log('Updating MD file content links...');
			for (const record of importData.attachments || importData) {
				if (record.hasMDFile && record.mdFilePath) {
					try {
						const mdFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
						if (mdFile instanceof TFile) {
							// 读取MD文件内容
							let content = await this.app.vault.read(mdFile);
							
							// 更新PDF附件链接路径
							if (record.filePath) {
								// 计算相对于MD文件的PDF路径
								const mdDir = record.mdFilePath.substring(0, record.mdFilePath.lastIndexOf('/'));
								const pdfName = record.filePath.substring(record.filePath.lastIndexOf('/') + 1);
								const relativePdfPath = `${mdDir}/${pdfName}`;
								
								// 替换可能的旧路径引用
								content = content.replace(
									/\[([^\]]+)\]\([^)]*\.pdf\)/g, 
									`[$1](${relativePdfPath})`
								);
								
								// 如果没有找到链接，添加一个
								if (!content.includes(`[${pdfName}]`)) {
									content += `\n\n## 附件\n- [${pdfName}](${relativePdfPath})`;
								}
								
								console.log(`Updated MD file: ${record.mdFilePath}, PDF link: ${relativePdfPath}`);
							}
							
							// 写回更新后的内容
							await this.app.vault.modify(mdFile, content);
							
						}
					} catch (error) {
						console.error(`Error updating MD file ${record.mdFilePath}:`, error);
					}
				}
			}
			
			// 3. 导入数据库记录，更新文件路径
			console.log('Importing database records...');
			console.log('Import data structure:', JSON.stringify(importData, null, 2));
			
			let processedCount = 0;
			let successCount = 0;
			let errorCount = 0;
			const recordsToAdd: AttachmentRecord[] = []; // 收集要批量添加的记录
			
			for (const record of importData.attachments || importData) {
				try {
					processedCount++;
					console.log(`=== Processing record ${processedCount} ===`);
					console.log('Record:', JSON.stringify(record, null, 2));
					
					// 验证记录完整性 - 放宽验证条件
					if (!record.title) {
						console.error('Invalid record - missing title:', record);
						errorCount++;
						continue;
					}
					
					// 验证文件路径
					if (record.filePath) {
						const pdfFile = this.app.vault.getAbstractFileByPath(record.filePath);
						if (pdfFile instanceof TFile) {
							console.log(`✅ PDF file found: ${record.filePath}`);
						} else {
							console.error(`❌ PDF file NOT found: ${record.filePath}`);
						}
					}
					
					// 智能检测并修复hasMDFile字段
					let hasMDFile = record.hasMDFile;
					let mdFilePath = record.mdFilePath;
					
					// 如果JSON记录中有mdFilePath但hasMDFile为false，自动修复
					if (mdFilePath && !hasMDFile) {
						console.log(`🔧 Auto-fixing hasMDFile: ${mdFilePath} exists but hasMDFile is false`);
						hasMDFile = true;
					}
					
					// 如果hasMDFile为true但mdFilePath为空，尝试从文件名推断
					if (hasMDFile && !mdFilePath && record.filePath) {
						const pdfName = record.filePath.substring(record.filePath.lastIndexOf('/') + 1);
						const mdName = pdfName.replace(/\.pdf$/i, '.md');
						const mdDir = record.filePath.substring(0, record.filePath.lastIndexOf('/'));
						mdFilePath = `${mdDir}/${mdName}`;
						console.log(`🔧 Auto-inferred mdFilePath: ${mdFilePath}`);
					}
					
					// 验证MD文件
					if (hasMDFile && mdFilePath) {
						const mdFile = this.app.vault.getAbstractFileByPath(mdFilePath);
						if (mdFile instanceof TFile) {
							console.log(`✅ MD file found: ${mdFilePath}`);
						} else {
							console.error(`❌ MD file NOT found: ${mdFilePath}`);
							// 如果MD文件不存在，但hasMDFile为true，可能需要创建
							console.log(`💡 MD file not found, but hasMDFile is true - may need to create`);
						}
					}
					
					// 更新文件路径为导入后的实际路径，使用修复后的字段
					const updatedRecord = { 
						...record,
						hasMDFile: hasMDFile,
						mdFilePath: mdFilePath
					};
					
					// 简化重复判断逻辑 - 优先添加新记录
					let shouldAdd = true;
					let existingRecord = null;
					
					// 如果有DOI且不为空，检查DOI重复
					if (updatedRecord.doi && updatedRecord.doi.trim() !== '') {
						existingRecord = this.database.findByDOI(updatedRecord.doi);
						if (existingRecord) {
							console.log(`Found existing record for DOI: ${updatedRecord.doi}`);
							shouldAdd = confirm(`发现重复记录: ${updatedRecord.title}\n是否覆盖现有记录？`);
						}
					} else {
						// 没有DOI的情况：检查文件路径重复
						existingRecord = this.database.findByPath(updatedRecord.filePath);
						if (existingRecord) {
							console.log(`Found existing record for file path: ${updatedRecord.filePath}`);
							shouldAdd = confirm(`发现重复文件: ${updatedRecord.title}\n是否覆盖现有记录？`);
						}
					}
					
					if (shouldAdd) {
						if (existingRecord) {
							// 更新现有记录
							const finalRecord = { ...existingRecord, ...updatedRecord };
							await this.database.updateRecord(finalRecord, true); // skipMDUpdate = true
							console.log(`✅ Updated existing record: ${updatedRecord.title}`);
						} else {
							// 收集要添加的记录，稍后批量处理
							recordsToAdd.push(updatedRecord);
							console.log(`🔄 Queued record for batch add: ${updatedRecord.title}`);
						}
						successCount++;
					} else {
						console.log(`⏭️ Skipped record: ${updatedRecord.title}`);
					}
					
				} catch (error) {
					console.error(`Error importing record ${record.title}:`, error);
					errorCount++;
				}
			}
			
			console.log(`=== Import Summary ===`);
			console.log(`Total processed: ${processedCount}`);
			console.log(`Success: ${successCount}`);
			console.log(`Errors: ${errorCount}`);
			console.log(`Database total records: ${this.database.getRecordCount()}`);
			
			// 批量添加新记录
			if (recordsToAdd.length > 0) {
				console.log(`🔄 Batch adding ${recordsToAdd.length} new records...`);
				await this.database.addRecordsBatch(recordsToAdd);
				console.log(`✅ Batch added ${recordsToAdd.length} records successfully`);
			}
			
			// 详细检查数据库状态
			console.log(`=== Database Status Check ===`);
			const allRecords = this.database.getAllRecords();
			console.log(`All records in database:`, allRecords);
			
			// 检查最近添加的记录
			if (allRecords.length > 0) {
				const recentRecords = allRecords.slice(-5); // 最近5条记录
				console.log(`Recent records:`, recentRecords);
				
				for (const record of recentRecords) {
					console.log(`Record: ${record.title}, ID: ${record.id}, hasMDFile: ${record.hasMDFile}, mdFilePath: ${record.mdFilePath}`);
				}
			}
			
			// 4. 同步标签
			await this.tagSyncManager.autoSyncTags();
			
		} catch (error) {
			throw new Error(`Import execution failed: ${error.message}`);
		}
	}

	/**
	 * 手动复制目录（备用方案）
	 */
	private async manualCopyDirectory(sourceDir: string, targetDir: string): Promise<void> {
		// 实现手动复制逻辑
		console.log('Manual copy not implemented, using PowerShell fallback');
	}

	/**
	 * 清理导出目录
	 */
	private async cleanupExportDirectory(dirPath: string): Promise<void> {
		try {
			const dir = this.app.vault.getAbstractFileByPath(dirPath);
			if (dir) {
				await this.app.vault.delete(dir);
			}
		} catch (error) {
			console.error('Error cleaning up export directory:', error);
		}
	}

	/**
	 * 清理导入的临时文件
	 */
	private async cleanupImportedFiles(importData: any): Promise<void> {
		try {
			// 清理attachments-data.json文件
			const dataFile = this.app.vault.getAbstractFileByPath('attachments-data.json');
			if (dataFile) {
				await this.app.vault.delete(dataFile);
				console.log('Cleaned up attachments-data.json');
			}
			
			// 清理README.md文件
			const readmeFile = this.app.vault.getAbstractFileByPath('README.md');
			if (readmeFile) {
				await this.app.vault.delete(readmeFile);
				console.log('Cleaned up README.md');
			}
			
			// 清理导入的ZIP文件
			const zipFiles = this.app.vault.getAbstractFileByPath('import-package-*.zip');
			if (zipFiles) {
				await this.app.vault.delete(zipFiles);
				console.log('Cleaned up import ZIP file');
			}
			
		} catch (error) {
			console.error('Error cleaning up imported files:', error);
		}
	}

	// 转换为CSV格式
	private convertToCSV(records: AttachmentRecord[]): string {
		const headers = ['DOI', 'Title', 'Author', 'Year', 'FileName', 'FilePath', 'Tags', 'AddedTime', 'ReferenceCount', 'BibText'];
		const rows = records.map(record => [
			record.doi,
			record.title,
			record.author,
			record.year,
			record.fileName,
			record.filePath,
			record.tags.join(';'),
			record.addedTime,
			record.referenceCount.toString(),
			record.bibText
		]);
		
		return [headers, ...rows].map(row => 
			row.map(field => `"${field?.toString().replace(/"/g, '""')}"`).join(',')
		).join('\n');
	}

	// 转换为BibTeX格式
	private convertToBibTeX(records: AttachmentRecord[]): string {
		return records.map(record => {
			const key = record.doi.replace(/[^a-zA-Z0-9]/g, '') || record.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
			return `@article{${key},
  doi = {${record.doi}},
  title = {${record.title}},
  author = {${record.author}},
  year = {${record.year}},
  file = {${record.filePath}},
  tags = {${record.tags.join(', ')}}
}`;
		}).join('\n\n');
	}

	// 生成引用
	private async generateCitation(editor: Editor, view: MarkdownView) {
		const selection = editor.getSelection();
		if (!selection) {
			new Notice(this.languageManager.t('notices.pleaseSelectText'));
			return;
		}

		// 这里可以实现引用选择逻辑
		// 暂时使用简单的占位符
		const citation = `[${selection}](attachment://paper.pdf)`;
		editor.replaceSelection(citation);
	}

	// 更新引用计数
	private async updateReferenceCount(file: TFile): Promise<number> {
		try {
			// 读取文件内容
			const content = await this.app.vault.read(file);
			const records = this.database.getAllRecords();
			let hasChanges = false;
			let updateCount = 0;

			// 为每个记录计算引用次数
			for (const record of records) {
				let newReferenceCount = 0;
				let newReferences: ReferenceInfo[] = [];
				let foundAnyReference = false;

				// 方法1: 通过Obsidian原生API查找文件引用（最精确）
				const fileReferences = await this.findFileReferences(record);
				if (fileReferences.length > 0) {
					newReferenceCount = fileReferences.length;
					newReferences = fileReferences;
					foundAnyReference = true;
					console.log(`Found ${fileReferences.length} file references for "${record.title}"`);
				}

				// 方法2: 通过DOI引用
				if (!foundAnyReference && record.doi) {
					const doiReferences = this.findDOIReferences(file, content, record);
					if (doiReferences.length > 0) {
						newReferenceCount = doiReferences.length;
						newReferences = doiReferences;
						foundAnyReference = true;
						console.log(`Found ${doiReferences.length} DOI references for "${record.title}" in ${file.name}`);
					}
				}

				// 方法3: 通过文件名引用
				if (!foundAnyReference && record.fileName) {
					const fileNameReferences = this.findFileNameReferences(file, content, record);
					if (fileNameReferences.length > 0) {
						newReferenceCount = fileNameReferences.length;
						newReferences = fileNameReferences;
						foundAnyReference = true;
						console.log(`Found ${fileNameReferences.length} filename references for "${record.title}" in ${file.name}`);
					}
				}

				// 方法4: 通过标题引用（部分匹配，仅在未找到其他引用时使用）
				if (!foundAnyReference && record.title) {
					const titleReferences = this.findTitleReferences(file, content, record);
					if (titleReferences.length > 0) {
						newReferenceCount = titleReferences.length;
						newReferences = titleReferences;
						foundAnyReference = true;
						console.log(`Found ${titleReferences.length} title keyword references for "${record.title}" in ${file.name}`);
					}
				}

				// 方法5: 通过作者引用（仅在未找到其他引用时使用）
				if (!foundAnyReference && record.author) {
					const authorReferences = this.findAuthorReferences(file, content, record);
					if (authorReferences.length > 0) {
						newReferenceCount = authorReferences.length;
						newReferences = authorReferences;
						foundAnyReference = true;
						console.log(`Found ${authorReferences.length} author references for "${record.title}" in ${file.name}`);
					}
				}

				// 如果引用次数或引用列表发生变化，更新记录
				if (newReferenceCount !== record.referenceCount || 
					JSON.stringify(newReferences) !== JSON.stringify(record.references || [])) {
					const oldCount = record.referenceCount;
					record.referenceCount = newReferenceCount;
					record.references = newReferences;
					hasChanges = true;
					updateCount++;
					
					// 记录日志
					// console.log(`Updated reference count for "${record.title}": ${oldCount} -> ${newReferenceCount} (in ${file.name})`);
				}
			}

			// 如果有变化，保存数据库
			if (hasChanges) {
				await this.database.save();
				
				// 在引用统计更新期间，禁用标签同步以避免死循环
				// await this.tagSyncManager.autoSyncTags();
				
				// 更新状态栏
				this.updateStatusBar();
			}

			return updateCount;
		} catch (error) {
			console.error('Error updating reference count:', error);
			return 0;
		}
	}

	// 使用Obsidian原生API查找文件引用
	private async findFileReferences(record: AttachmentRecord): Promise<ReferenceInfo[]> {
		const references: ReferenceInfo[] = [];
		
		try {
			// 获取附件文件对象
			const attachmentFile = this.app.vault.getAbstractFileByPath(record.filePath);
			if (!(attachmentFile instanceof TFile)) {
				console.log(`Attachment file not found: ${record.filePath}`);
				return references;
			}

			// 获取所有Markdown文件
			const markdownFiles = this.app.vault.getMarkdownFiles();
			
			// 遍历所有Markdown文件，查找对附件文件的引用
			for (const file of markdownFiles) {
				try {
					const cache = this.app.metadataCache.getFileCache(file);
					if (!cache) continue;

					// 检查内部链接
					if (cache.links) {
						for (const link of cache.links) {
							// 检查链接是否指向附件文件
							if (link.link === record.fileName || 
								link.link === record.filePath ||
								link.link === `[[${record.fileName}]]` ||
								link.link === `[[${record.filePath}]]`) {
								
								const lineNumber = link.position?.start?.line;
								if (lineNumber !== undefined) {
									// 获取引用行的上下文
									const content = await this.app.vault.read(file);
									const lines = content.split('\n');
									const context = this.extractLineContext(lines, lineNumber);
									
									references.push({
										filePath: file.path,
										fileName: file.name,
										lineNumber: lineNumber + 1, // 转换为1-based行号
										context: context,
										referenceType: 'link'
									});
								}
							}
						}
					}

					// 检查嵌入文件
					if (cache.embeds) {
						for (const embed of cache.embeds) {
							if (embed.link === record.fileName || 
								embed.link === record.filePath ||
								embed.link === `![[${record.fileName}]]` ||
								embed.link === `![[${record.filePath}]]`) {
								
								const lineNumber = embed.position?.start?.line;
								if (lineNumber !== undefined) {
									// 获取引用行的上下文
									const content = await this.app.vault.read(file);
									const lines = content.split('\n');
									const context = this.extractLineContext(lines, lineNumber);
									
									references.push({
										filePath: file.path,
										fileName: file.name,
										lineNumber: lineNumber + 1, // 转换为1-based行号
										context: context,
										referenceType: 'link'
									});
								}
							}
						}
					}
				} catch (error) {
					console.error(`Error processing file ${file.path}:`, error);
				}
			}
			
			console.log(`Found ${references.length} file references for ${record.fileName}`);
		} catch (error) {
			console.error('Error finding file references:', error);
		}

		return references;
	}

	// 提取行上下文
	private extractLineContext(lines: string[], lineNumber: number, contextLines: number = 2): string {
		const start = Math.max(0, lineNumber - contextLines);
		const end = Math.min(lines.length, lineNumber + contextLines + 1);
		return lines.slice(start, end).join('\n').trim();
	}

	// 查找DOI引用
	private findDOIReferences(file: TFile, content: string, record: AttachmentRecord): ReferenceInfo[] {
		const references: ReferenceInfo[] = [];
		
		if (!record.doi) return references;

		try {
			const doiPattern = new RegExp(record.doi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
			let match;
			
			while ((match = doiPattern.exec(content)) !== null) {
				const lineNumber = content.substring(0, match.index).split('\n').length;
				
				// 避免重复添加相同的引用
				const existingRef = references.find(ref => ref.lineNumber === lineNumber);
				if (!existingRef) {
					references.push({
						filePath: file.path,
						fileName: file.name,
						lineNumber: lineNumber,
						context: this.extractContextFromString(content, match.index, 100), // 提取上下文
						referenceType: 'doi'
					});
				}
			}
		} catch (error) {
			console.error('Error finding DOI references:', error);
		}

		return references;
	}

	// 查找文件名引用
	private findFileNameReferences(file: TFile, content: string, record: AttachmentRecord): ReferenceInfo[] {
		const references: ReferenceInfo[] = [];
		
		if (!record.fileName) return references;

		try {
			// 清理文件名，移除扩展名和路径
			const cleanFileName = record.fileName.replace(/\.[^.]*$/, ''); // 移除扩展名
			
			// 创建更智能的文件名匹配模式
			const fileNamePattern = new RegExp(`\\b${cleanFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
			let match;
			
			while ((match = fileNamePattern.exec(content)) !== null) {
				const lineNumber = content.substring(0, match.index).split('\n').length;
				
				// 避免重复添加相同的引用
				const existingRef = references.find(ref => ref.lineNumber === lineNumber);
				if (!existingRef) {
					references.push({
						filePath: file.path,
						fileName: file.name,
						lineNumber: lineNumber,
						context: this.extractContextFromString(content, match.index, 100), // 提取上下文
						referenceType: 'filename'
					});
				}
			}
		} catch (error) {
			console.error('Error finding filename references:', error);
		}

		return references;
	}

	// 查找标题引用
	private findTitleReferences(file: TFile, content: string, record: AttachmentRecord): ReferenceInfo[] {
		const references: ReferenceInfo[] = [];
		
		if (!record.title) return references;

		try {
			// 提取标题中的关键词进行匹配
			const titleWords = record.title
				.toLowerCase()
				.split(/\s+/)
				.filter(word => word.length > 3 && !['the', 'and', 'for', 'with', 'from', 'into', 'during', 'including', 'until', 'against', 'among', 'throughout', 'despite', 'towards', 'upon'].includes(word));
			
			for (const word of titleWords) {
				const titlePattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
				let match;
				
				while ((match = titlePattern.exec(content)) !== null) {
					const lineNumber = content.substring(0, match.index).split('\n').length;
					
					// 避免重复添加相同的引用
					const existingRef = references.find(ref => ref.lineNumber === lineNumber);
					if (!existingRef) {
											references.push({
						filePath: file.path,
						fileName: file.name,
						lineNumber: lineNumber,
						context: this.extractContextFromString(content, match.index, 100), // 提取上下文
						referenceType: 'title'
					});
					}
				}
			}
		} catch (error) {
			console.error('Error finding title references:', error);
		}

		return references;
	}

	// 查找作者引用
	private findAuthorReferences(file: TFile, content: string, record: AttachmentRecord): ReferenceInfo[] {
		const references: ReferenceInfo[] = [];
		
		if (!record.author) return references;

		try {
			// 清理作者名字，移除常见的分隔符
			const cleanAuthor = record.author.replace(/[,;&|]/g, ' ').trim();
			const authorPattern = new RegExp(`\\b${cleanAuthor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
			let match;
			
			while ((match = authorPattern.exec(content)) !== null) {
				const lineNumber = content.substring(0, match.index).split('\n').length;
				
				// 避免重复添加相同的引用
				const existingRef = references.find(ref => ref.lineNumber === lineNumber);
				if (!existingRef) {
					references.push({
						filePath: file.path,
						fileName: file.name,
						lineNumber: lineNumber,
						context: this.extractContextFromString(content, match.index, 100), // 提取上下文
						referenceType: 'author'
					});
				}
			}
		} catch (error) {
			console.error('Error finding author references:', error);
		}

		return references;
	}

	// 提取上下文内容（重载方法）
	private async extractContext(file: TFile, lineNumber?: number): Promise<string> {
		if (!lineNumber) return '';
		
		try {
			const content = await this.app.vault.read(file);
			const lines = content.split('\n');
			const start = Math.max(0, lineNumber - 1);
			const end = Math.min(lines.length, lineNumber + 2);
			return lines.slice(start, end).join('\n').trim();
		} catch (error) {
			console.error('Error extracting context:', error);
		}
		
		return '';
	}

	// 从字符串内容中提取上下文
	private extractContextFromString(content: string, matchIndex: number, contextLength: number): string {
		try {
			const start = Math.max(0, matchIndex - contextLength / 2);
			const end = Math.min(content.length, matchIndex + contextLength / 2);
			let context = content.substring(start, end).trim();
			
			// 清理上下文，移除多余的换行符
			context = context.replace(/\n+/g, ' ');
			context = context.replace(/\s+/g, ' ');
			
			return context;
		} catch (error) {
			console.error('Error extracting context from string:', error);
			return '';
		}
	}

	// 更新状态栏显示
	private updateStatusBar(customMessage?: string) {
		const statusBarItem = this.statusBarItemEl;
		if (statusBarItem) {
			if (customMessage) {
				// 显示自定义消息
				statusBarItem.setText(`📚 ${customMessage}`);
			} else {
				// 显示默认状态信息
				const totalReferences = this.database.getAllRecords()
					.reduce((sum, record) => sum + record.referenceCount, 0);
				statusBarItem.setText(`📚 ${this.database.getRecordCount()} papers | ${totalReferences} references`);
			}
		}
	}

	// 处理附件文件重命名/移动
	private async handleAttachmentRename(file: TFile, oldPath: string) {
		try {
			console.log(`Attachment file renamed/moved: ${oldPath} -> ${file.path}`);
			
			// 查找数据库中是否有匹配旧路径的记录
			const records = this.database.getAllRecords();
			const affectedRecords: AttachmentRecord[] = [];
			
			// 检查是否有记录使用旧路径
			for (const record of records) {
				if (record.filePath === oldPath) {
					affectedRecords.push(record);
				}
			}
			
			if (affectedRecords.length > 0) {
				console.log(`Found ${affectedRecords.length} records affected by file rename/move`);
				
				// 更新所有受影响的记录
				for (const record of affectedRecords) {
					const oldPath = record.filePath;
					const oldFileName = record.fileName;
					
					// 更新路径和文件名
					record.filePath = file.path;
					record.fileName = file.name;
					
					// 如果文件大小信息缺失，尝试获取
					if (!record.fileSize) {
						try {
							const stat = await this.app.vault.adapter.stat(file.path);
							if (stat) {
								record.fileSize = stat.size;
							}
						} catch (error) {
							console.warn(`Could not get file size for ${file.path}:`, error);
						}
					}
					
					// 记录变更日志
					console.log(`Updated record "${record.title}": ${oldPath} -> ${record.filePath}`);
					console.log(`Updated filename: ${oldFileName} -> ${record.fileName}`);
				}
				
				// 保存数据库
				await this.database.save();
				
				// 文件重命名后同步标签（这是安全的，不会产生死循环）
				await this.tagSyncManager.autoSyncTags();
				
				// 显示通知
				new Notice(this.languageManager.t('notices.updatedAfterFileMove', { count: affectedRecords.length }));
				
				// 更新状态栏
				this.updateStatusBar();
				
				// 如果研究附件中心视图是打开的，刷新显示
				this.refreshResearchAttachmentHubView();
			}
		} catch (error) {
			console.error('Error handling attachment rename/move:', error);
			new Notice(this.languageManager.t('notices.errorUpdatingAfterFileMove'));
		}
	}

	// 处理MD文件重命名/移动
	private async handleMDFileRename(file: TFile, oldPath: string) {
		try {
			console.log(`MD file renamed/moved: ${oldPath} -> ${file.path}`);
			
			// 查找数据库中是否有匹配旧MD路径的记录
			const records = this.database.getAllRecords();
			const affectedRecords: AttachmentRecord[] = [];
			
			// 检查是否有记录使用旧MD路径
			for (const record of records) {
				if (record.hasMDFile && record.mdFilePath === oldPath) {
					affectedRecords.push(record);
				}
			}
			
			if (affectedRecords.length > 0) {
				console.log(`Found ${affectedRecords.length} records affected by MD file rename/move`);
				
				// 更新所有受影响的记录
				for (const record of affectedRecords) {
					const oldMdPath = record.mdFilePath;
					
					// 更新MD文件路径
					record.mdFilePath = file.path;
					
					// 智能更新附件路径：保持MD文件和附件的相对位置关系
					if (record.filePath) {
						const oldAttachmentPath = record.filePath;
						const newAttachmentPath = this.updateAttachmentPathForMDFileMove(
							oldAttachmentPath, 
							oldPath, 
							file.path
						);
						
						if (newAttachmentPath && newAttachmentPath !== oldAttachmentPath) {
							// 检查新路径的附件文件是否存在
							const newAttachmentFile = this.app.vault.getAbstractFileByPath(newAttachmentPath);
							if (newAttachmentFile instanceof TFile) {
								record.filePath = newAttachmentPath;
								record.fileName = newAttachmentFile.name;
								console.log(`✅ Updated attachment path: ${oldAttachmentPath} -> ${newAttachmentPath}`);
								
								// 更新文件大小信息
								try {
									const stat = await this.app.vault.adapter.stat(newAttachmentPath);
									if (stat) {
										record.fileSize = stat.size;
									}
								} catch (error) {
									console.warn(`Could not get file size for ${newAttachmentPath}:`, error);
								}
							} else {
								console.warn(`⚠️ New attachment path not found: ${newAttachmentPath}, keeping old path: ${oldAttachmentPath}`);
								
								// 提供搜索功能让用户重新指认附件
								await this.offerAttachmentReassignment(record, oldAttachmentPath);
							}
						}
					}
					
					// 记录变更日志
					console.log(`Updated record "${record.title}" MD path: ${oldMdPath} -> ${record.mdFilePath}`);
				}
				
				// 保存数据库
				await this.database.save();
				
				// 显示通知
				new Notice(this.languageManager.t('notices.updatedAfterMDFileMove', { count: affectedRecords.length }));
				
				// 更新状态栏
				this.updateStatusBar();
				
				// 如果研究附件中心视图是打开的，刷新显示
				this.refreshResearchAttachmentHubView();
			}
		} catch (error) {
			console.error('Error handling MD file rename/move:', error);
			new Notice(this.languageManager.t('notices.errorUpdatingAfterMDFileMove'));
		}
	}

	// 处理附件文件删除
	private async handleAttachmentDelete(file: TFile) {
		try {
			console.log(`Attachment file deleted: ${file.path}`);
			
			// 查找数据库中是否有匹配路径的记录
			const records = this.database.getAllRecords();
			const affectedRecords: AttachmentRecord[] = [];
			
			// 检查是否有记录使用该路径
			for (const record of records) {
				if (record.filePath === file.path) {
					affectedRecords.push(record);
				}
			}
			
			if (affectedRecords.length > 0) {
				console.log(`Found ${affectedRecords.length} records affected by file deletion`);
				
				// 显示警告通知
				new Notice(this.languageManager.t('notices.attachmentsWithMissingFiles', { count: affectedRecords.length }));
				
				// 更新状态栏
				this.updateStatusBar();
				
				// 如果研究附件中心视图是打开的，刷新显示
				this.refreshResearchAttachmentHubView();
			}
		} catch (error) {
			console.error('Error handling attachment deletion:', error);
		}
	}

	// 处理MD文件删除
	private async handleMDFileDelete(file: TFile) {
		try {
			console.log(`MD file deleted: ${file.path}`);
			
			// 查找数据库中是否有匹配路径的记录
			const records = this.database.getAllRecords();
			const affectedRecords: AttachmentRecord[] = [];
			
			// 检查是否有记录使用该路径
			for (const record of records) {
				if (record.hasMDFile && record.mdFilePath === file.path) {
					affectedRecords.push(record);
				}
			}
			
			if (affectedRecords.length > 0) {
				console.log(`Found ${affectedRecords.length} records affected by MD file deletion`);
				
				// 显示警告通知
				new Notice(this.languageManager.t('notices.recordsWithMissingMDFiles', { count: affectedRecords.length }));
				
				// 更新状态栏
				this.updateStatusBar();
				
				// 如果研究附件中心视图是打开的，刷新显示
				this.refreshResearchAttachmentHubView();
			}
		} catch (error) {
			console.error('Error handling MD file deletion:', error);
		}
	}

	// 刷新研究附件中心视图（如果打开）
	public refreshResearchAttachmentHubView() {
		try {
			const leaves = this.app.workspace.getLeavesOfType(RESEARCH_ATTACHMENT_HUB_VIEW_TYPE);
			for (const leaf of leaves) {
				if (leaf.view instanceof ResearchAttachmentHubView) {
					// 异步刷新视图
					setTimeout(async () => {
						try {
							const view = leaf.view as ResearchAttachmentHubView;
							await view.loadRecords();
							view.refreshToolbarText();
							view.refreshContent();
						} catch (error) {
							console.error('Error refreshing research attachment hub view:', error);
						}
					}, 100);
				}
			}
		} catch (error) {
			console.error('Error refreshing research attachment hub view:', error);
		}
	}

	/**
	 * 智能更新附件路径：当MD文件移动时，保持附件和MD文件的相对位置关系
	 */
	private updateAttachmentPathForMDFileMove(
		oldAttachmentPath: string, 
		oldMdPath: string, 
		newMdPath: string
	): string | null {
		try {
			// 计算MD文件的移动路径差异
			const oldMdDir = oldMdPath.substring(0, oldMdPath.lastIndexOf('/'));
			const newMdDir = newMdPath.substring(0, newMdPath.lastIndexOf('/'));
			
			// 如果目录没有变化，附件路径也不需要变化
			if (oldMdDir === newMdDir) {
				return oldAttachmentPath;
			}
			
			// 计算附件相对于旧MD文件的路径
			const attachmentRelativeToOldMd = oldAttachmentPath.substring(oldMdDir.length + 1);
			
			// 构建新的附件路径
			const newAttachmentPath = `${newMdDir}/${attachmentRelativeToOldMd}`;
			
			console.log(`📁 MD file moved: ${oldMdDir} -> ${newMdDir}`);
			console.log(`📎 Attachment relative path: ${attachmentRelativeToOldMd}`);
			console.log(`🔄 New attachment path: ${newAttachmentPath}`);
			
			return newAttachmentPath;
			
		} catch (error) {
			console.error('Error updating attachment path for MD file move:', error);
			return null;
		}
	}

	/**
	 * 提供附件重新指认功能（支持搜索）
	 */
	private async offerAttachmentReassignment(record: AttachmentRecord, oldAttachmentPath: string): Promise<void> {
		try {
			const fileName = record.fileName || oldAttachmentPath.substring(oldAttachmentPath.lastIndexOf('/') + 1);
			const searchQuery = fileName.replace(/\.pdf$/i, ''); // 去掉.pdf后缀作为搜索关键词
			
			// 搜索vault中可能的附件文件
			const searchResults = await this.searchAttachmentFiles(searchQuery);
			
			if (searchResults.length > 0) {
				// 显示搜索结果让用户选择
				const selectedPath = await this.showAttachmentSelectionModal(
					record.title,
					oldAttachmentPath,
					searchResults
				);
				
				if (selectedPath) {
					// 用户选择了新的附件路径
					const newAttachmentFile = this.app.vault.getAbstractFileByPath(selectedPath);
					if (newAttachmentFile instanceof TFile) {
						record.filePath = selectedPath;
						record.fileName = newAttachmentFile.name;
						
						// 更新文件大小信息
						try {
							const stat = await this.app.vault.adapter.stat(selectedPath);
							if (stat) {
								record.fileSize = stat.size;
							}
						} catch (error) {
							console.warn(`Could not get file size for ${selectedPath}:`, error);
						}
						
						console.log(`✅ User reassigned attachment: ${oldAttachmentPath} -> ${selectedPath}`);
						new Notice(this.languageManager.t('notices.attachmentReassigned', { title: record.title }));
					}
				}
			} else {
				// 没有找到搜索结果，提供手动输入路径的选项
				const manualPath = await this.showManualPathInputModal(record.title, oldAttachmentPath);
				if (manualPath) {
					record.filePath = manualPath;
					record.fileName = manualPath.substring(manualPath.lastIndexOf('/') + 1);
					console.log(`✅ User manually set attachment path: ${oldAttachmentPath} -> ${manualPath}`);
					new Notice(this.languageManager.t('notices.attachmentPathSet', { title: record.title }));
				}
			}
		} catch (error) {
			console.error('Error offering attachment reassignment:', error);
		}
	}

	/**
	 * 搜索附件文件
	 */
	private async searchAttachmentFiles(query: string): Promise<string[]> {
		try {
			const results: string[] = [];
			const allFiles = await this.app.vault.adapter.list('');
			
			// 搜索所有PDF文件
			for (const file of allFiles.files) {
				if (file.toLowerCase().includes(query.toLowerCase()) && file.toLowerCase().endsWith('.pdf')) {
					results.push(file);
				}
			}
			
			// 按相关性排序（文件名匹配度高的排在前面）
			results.sort((a, b) => {
				const aScore = this.calculateRelevanceScore(a, query);
				const bScore = this.calculateRelevanceScore(b, query);
				return bScore - aScore;
			});
			
			// 限制结果数量
			return results.slice(0, 10);
			
		} catch (error) {
			console.error('Error searching attachment files:', error);
			return [];
		}
	}

	/**
	 * 计算文件路径与搜索查询的相关性分数
	 */
	private calculateRelevanceScore(filePath: string, query: string): number {
		const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
		const lowerFileName = fileName.toLowerCase();
		const lowerQuery = query.toLowerCase();
		
		let score = 0;
		
		// 完全匹配文件名开头
		if (lowerFileName.startsWith(lowerQuery)) {
			score += 100;
		}
		
		// 文件名包含查询词
		if (lowerFileName.includes(lowerQuery)) {
			score += 50;
		}
		
		// 路径包含查询词
		if (filePath.toLowerCase().includes(lowerQuery)) {
			score += 25;
		}
		
		// 文件扩展名匹配
		if (lowerFileName.endsWith('.pdf')) {
			score += 10;
		}
		
		return score;
	}

	/**
	 * 显示附件选择模态框
	 */
	private async showAttachmentSelectionModal(
		title: string, 
		oldPath: string, 
		searchResults: string[]
	): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new Modal(this.app);
			modal.titleEl.setText(`重新指认附件: ${title}`);
			
			const container = modal.contentEl.createDiv();
			container.innerHTML = `
				<div style="margin-bottom: 15px;">
					<p><strong>原附件路径:</strong> ${oldPath}</p>
					<p><strong>找到 ${searchResults.length} 个可能的附件文件:</strong></p>
				</div>
			`;
			
			// 创建搜索结果列表
			const resultsList = container.createDiv();
			resultsList.style.maxHeight = '300px';
			resultsList.style.overflowY = 'auto';
			resultsList.style.border = '1px solid var(--background-modifier-border)';
			resultsList.style.borderRadius = '4px';
			resultsList.style.padding = '10px';
			
			searchResults.forEach((filePath, index) => {
				const item = resultsList.createDiv();
				item.style.padding = '8px';
				item.style.margin = '4px 0';
				item.style.borderRadius = '4px';
				item.style.cursor = 'pointer';
				item.style.backgroundColor = 'var(--background-secondary)';
				item.style.border = '1px solid var(--background-modifier-border)';
				
				item.innerHTML = `
					<div><strong>${filePath.substring(filePath.lastIndexOf('/') + 1)}</strong></div>
					<div style="font-size: 0.9em; color: var(--text-muted);">${filePath}</div>
				`;
				
				item.addEventListener('click', () => {
					modal.close();
					resolve(filePath);
				});
				
				item.addEventListener('mouseenter', () => {
					item.style.backgroundColor = 'var(--background-modifier-hover)';
				});
				
				item.addEventListener('mouseleave', () => {
					item.style.backgroundColor = 'var(--background-secondary)';
				});
			});
			
			// 添加取消按钮
			const cancelButton = container.createEl('button', {
				text: '取消',
				cls: 'mod-warning'
			});
			cancelButton.style.marginTop = '15px';
			cancelButton.addEventListener('click', () => {
				modal.close();
				resolve(null);
			});
			
			modal.open();
		});
	}

	/**
	 * 显示手动路径输入模态框
	 */
	private async showManualPathInputModal(title: string, oldPath: string): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new Modal(this.app);
			modal.titleEl.setText(`手动设置附件路径: ${title}`);
			
			const container = modal.contentEl.createDiv();
			container.innerHTML = `
				<div style="margin-bottom: 15px;">
					<p><strong>原附件路径:</strong> ${oldPath}</p>
					<p>请输入新的附件文件路径:</p>
				</div>
			`;
			
			const input = container.createEl('input', {
				type: 'text',
				value: oldPath,
				placeholder: '输入完整的文件路径，如: research/papers/paper1.pdf'
			});
			input.style.width = '100%';
			input.style.padding = '8px';
			input.style.marginBottom = '15px';
			input.style.border = '1px solid var(--background-modifier-border)';
			input.style.borderRadius = '4px';
			
			const buttonContainer = container.createDiv();
			buttonContainer.style.display = 'flex';
			buttonContainer.style.gap = '10px';
			
			const confirmButton = buttonContainer.createEl('button', {
				text: '确认',
				cls: 'mod-cta'
			});
			
			const cancelButton = buttonContainer.createEl('button', {
				text: '取消',
				cls: 'mod-warning'
			});
			
			confirmButton.addEventListener('click', () => {
				const newPath = input.value.trim();
				if (newPath) {
					modal.close();
					resolve(newPath);
				}
			});
			
			cancelButton.addEventListener('click', () => {
				modal.close();
				resolve(null);
			});
			
			// 回车键确认
			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					confirmButton.click();
				}
			});
			
			modal.open();
			input.focus();
		});
	}

	// 更新所有笔记的引用计数
	public async updateAllReferenceCounts() {
		try {
			// 使用状态栏显示进度，而不是持久通知
			this.updateStatusBar('正在更新引用计数...');
			
			// 首先重置所有记录的引用计数和引用列表
			const records = this.database.getAllRecords();
			let hasChanges = false;
			
			for (const record of records) {
				if (record.referenceCount !== 0 || (record.references && record.references.length > 0)) {
					record.referenceCount = 0;
					record.references = [];
					hasChanges = true;
				}
			}
			
			// 如果有变化，先保存重置后的状态
			if (hasChanges) {
				await this.database.save();
				
				// 在引用统计更新期间，禁用标签同步以避免死循环
				// await this.tagSyncManager.autoSyncTags();
				
				// console.log('Reset all reference counts to 0');
			}
			
			// 获取所有Markdown文件
			const markdownFiles = this.app.vault.getMarkdownFiles();
			let totalUpdates = 0;
			
			// 为每个文件更新引用计数
			for (const file of markdownFiles) {
				const updates = await this.updateReferenceCount(file);
				if (updates) totalUpdates += updates;
			}
			
			// 更新状态栏显示完成信息
			this.updateStatusBar(`引用计数更新完成: ${totalUpdates} 个附件`);
			
			// 使用临时通知，3秒后自动消失
			if (totalUpdates > 0) {
				// const notice = new Notice(this.languageManager.t('notices.referenceCountUpdated', { count: totalUpdates }), 3000);
			}
		} catch (error) {
			console.error('Error updating all reference counts:', error);
			// 错误通知也使用临时显示
			// const errorNotice = new Notice(this.languageManager.t('notices.referenceCountUpdateFailed'), 3000);
			this.updateStatusBar('引用计数更新失败');
		}
	}

	async loadSettings() {
		if (this.settingsManager) {
			this.settings = await this.settingsManager.loadSettings();
		}
	}

	async saveSettings() {
		if (this.settingsManager) {
			// 确保设置同步
			this.settingsManager.syncExternalSettings(this.settings);
			await this.settingsManager.saveSettings();
		}
	}

	/**
	 * 确保目录存在
	 */
	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			const dir = this.app.vault.getAbstractFileByPath(dirPath);
			if (!dir) {
				await this.app.vault.createFolder(dirPath);
				console.log(`Created directory: ${dirPath}`);
			}
		} catch (error) {
			console.error(`Error ensuring directory exists: ${dirPath}`, error);
			throw new Error(`Failed to create directory: ${dirPath}`);
		}
	}
}

// 设置标签页
class ResearchAttachmentHubSettingTab extends PluginSettingTab {
	plugin: ResearchAttachmentHubPlugin;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		// 使用语言管理器获取翻译文本
		const t = (key: string, params?: Record<string, any>) => this.plugin.languageManager.t(key, params);

		containerEl.createEl('h2', {text: t('settings.title')});

		// 基础设置
		containerEl.createEl('h3', {text: t('settings.basic')});
		
		// 语言设置
		new Setting(containerEl)
			.setName(t('settings.language'))
			.setDesc(t('settings.languageDesc'))
			.addDropdown(dropdown => {
				// 从语言表格动态获取所有支持的语言
				const languages = this.plugin.languageManager.getSupportedLanguages();
				const t = (key: string, params?: Record<string, any>) => this.plugin.languageManager.t(key, params);
				
				languages.forEach(lang => {
					const displayName = this.plugin.languageManager.getLanguageDisplayName(lang);
					dropdown.addOption(lang, displayName);
				});
				
				dropdown.setValue(this.plugin.settings.language)
					.onChange(async (value: 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'de-DE' | 'fr-FR' | 'ru-RU' | 'es-ES') => {
						this.plugin.settings.language = value;
						// 立即切换语言
						this.plugin.languageManager.setLanguage(value);
						await this.plugin.saveSettings();
						// 刷新设置界面以显示新语言
						this.display();
						// 刷新主界面以显示新语言
						this.plugin.refreshResearchAttachmentHubView();
					});
			});

		new Setting(containerEl)
			.setName(t('settings.defaultFolder'))
			.setDesc(t('settings.defaultFolderDesc'))
			.addText(text => text
				.setPlaceholder(t('settings.defaultFolderPlaceholder'))
				.setValue(this.plugin.settings.defaultFolder)
				.onChange(async (value) => {
					this.plugin.settings.defaultFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.fileNameTemplate'))
			.setDesc(t('settings.fileNameTemplateDesc'))
			.addText(text => text
				.setPlaceholder(t('settings.fileNameTemplatePlaceholder'))
				.setValue(this.plugin.settings.fileNameTemplate)
				.onChange(async (value) => {
					this.plugin.settings.fileNameTemplate = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.tempDir'))
			.setDesc(t('settings.tempDirDesc'))
			.addText(text => text
				.setPlaceholder(t('settings.tempDirPlaceholder'))
				.setValue(this.plugin.settings.tempDir)
				.onChange(async (value) => {
					this.plugin.settings.tempDir = value || 'research-attachment-hub/tmp';
					await this.plugin.saveSettings();
				}));

		// 视图设置
		// 注意：打开模式设置在下方的"视图和导出设置"部分，这里不再重复

		// 文件管理设置
		containerEl.createEl('h3', {text: t('settings.fileManagement')});
		
		new Setting(containerEl)
			.setName(t('settings.researchFilesDirectory'))
			.setDesc(t('settings.researchFilesDirectoryDesc'))
			.addText(text => text
				.setPlaceholder(t('settings.attachmentsPlaceholder'))
				.setValue(this.plugin.settings.attachmentDirectory)
				.onChange(async (value) => {
					this.plugin.settings.attachmentDirectory = value || 'attachments';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.autoCopyExternalFiles'))
			.setDesc(t('settings.autoCopyExternalFilesDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoCopyExternalFiles)
				.onChange(async (value) => {
					this.plugin.settings.autoCopyExternalFiles = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.enableFileRenaming'))
			.setDesc(t('settings.enableFileRenamingDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableRename)
				.onChange(async (value) => {
					this.plugin.settings.enableRename = value;
					await this.plugin.saveSettings();
				}));

		// 模板变量说明
		const templateHelp = containerEl.createEl('div', { cls: 'template-help' });
		templateHelp.style.marginTop = '20px';
		templateHelp.style.padding = '15px';
		templateHelp.style.backgroundColor = 'var(--background-secondary)';
		templateHelp.style.borderRadius = '8px';
		templateHelp.style.border = '1px solid var(--background-modifier-border)';
		templateHelp.style.fontSize = '14px';
		
		templateHelp.innerHTML = `
			<strong>📝 ${t('settings.templateVariables')}：</strong><br><br>
			${this.plugin.fileManager.getTemplateVariablesHelp()}
		`;


		// 高级设置
		new Setting(containerEl)
			.setName(t('settings.autoExtractDOI'))
			.setDesc(t('settings.autoExtractDOIDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoExtractDOI)
				.onChange(async (value) => {
					this.plugin.settings.autoExtractDOI = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.autoExtractMetadata'))
			.setDesc(t('settings.autoExtractMetadataDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoExtractMetadata)
				.onChange(async (value) => {
					this.plugin.settings.autoExtractMetadata = value;
					await this.plugin.saveSettings();
				}));

			// 标签同步设置
		// 注意：现在每个附件都有独立的MD文件，不再需要单独的标签索引文件

		// Obsidian标签索引管理
		containerEl.createEl('h3', {text: t('settings.tagManagement')});

		new Setting(containerEl)
			.setName(t('settings.createTagFiles'))
			.setDesc(t('settings.createTagFilesDesc'))
			.addButton(button => button
				.setButtonText(t('settings.createTagFiles'))
				.setClass('mod-cta')
				.onClick(async () => {
					try {
						await this.plugin.obsidianTagIndexer.createTagFiles();
					} catch (error) {
						console.error('Error creating tag files:', error);
						new Notice(t('notices.tagSyncError'));
					}
				}));

		new Setting(containerEl)
			.setName(t('settings.syncTagsToObsidian'))
			.setDesc(t('settings.syncTagsToObsidianDesc'))
			.addButton(button => button
				.setButtonText(t('settings.syncTagsToObsidian'))
				.setClass('mod-cta')
				.onClick(async () => {
					try {
						await this.plugin.obsidianTagIndexer.syncTagsToObsidian();
					} catch (error) {
						console.error('Error syncing tags to Obsidian:', error);
						new Notice(t('notices.tagSyncError'));
					}
				}));

		new Setting(containerEl)
			.setName(t('settings.cleanupOrphanedTagFiles'))
			.setDesc(t('settings.cleanupOrphanedTagFilesDesc'))
			.addButton(button => button
				.setButtonText(t('settings.cleanupOrphanedTagFiles'))
				.setClass('mod-warning')
				.onClick(async () => {
					try {
						await this.plugin.obsidianTagIndexer.cleanupOrphanedTagFiles();
					} catch (error) {
						console.error('Error cleaning up tag files:', error);
						new Notice(t('notices.tagSyncError'));
					}
				}));

		new Setting(containerEl)
			.setName(t('settings.createTagSearchIndex'))
			.setDesc(t('settings.createTagSearchIndexDesc'))
			.addButton(button => button
				.setButtonText(t('settings.createTagSearchIndex'))
				.setClass('mod-cta')
				.onClick(async () => {
					try {
						await this.plugin.obsidianTagIndexer.createTagSearchIndex();
					} catch (error) {
						console.error('Error creating tag search index:', error);
						new Notice(t('notices.tagSyncError'));
					}
				}));

		// 高级设置
		containerEl.createEl('h3', {text: t('settings.advanced')});

		new Setting(containerEl)
			.setName(t('settings.debugTagSync'))
			.setDesc(t('settings.debugTagSyncDesc'))
			.addButton(button => button
				.setButtonText(t('settings.debugTagSync'))
				.setClass('mod-warning')
				.onClick(async () => {
					try {
						await this.plugin.tagSyncManager.debugTagSync();
						new Notice(t('notices.debugInfoLogged'));
					} catch (error) {
						console.error('Error debugging tags:', error);
						new Notice(t('notices.debugFailed'));
					}
				}));

		// MD文件管理设置
		containerEl.createEl('h3', {text: t('settings.mdFileManagement')});

		new Setting(containerEl)
			.setName(t('settings.autoCreateMD'))
			.setDesc(t('settings.autoCreateMDDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAutoMDCreation)
				.onChange(async (value) => {
					this.plugin.settings.enableAutoMDCreation = value;
					await this.plugin.saveSettings();
				}));

		if (this.plugin.settings.enableAutoMDCreation) {
			new Setting(containerEl)
				.setName(t('settings.mdFileLocation'))
				.setDesc(t('settings.mdFileLocationDesc'))
				.addText(text => text
					.setPlaceholder(t('settings.mdFileLocationPlaceholder'))
					.setValue(this.plugin.settings.mdFileLocation)
					.onChange(async (value) => {
						this.plugin.settings.mdFileLocation = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName(t('settings.mdFileNameTemplate'))
				.setDesc(t('settings.mdFileNameTemplateDesc'))
				.addText(text => text
					.setPlaceholder(t('settings.mdFileNameTemplatePlaceholder'))
					.setValue(this.plugin.settings.mdFileNameTemplate)
					.onChange(async (value) => {
						this.plugin.settings.mdFileNameTemplate = value;
						await this.plugin.saveSettings();
					}));

			// 变量说明
			const variableHelpContainer = containerEl.createEl('div', { cls: 'variable-help-container' });
			variableHelpContainer.style.marginTop = '10px';
			variableHelpContainer.style.padding = '10px';
			variableHelpContainer.style.backgroundColor = 'var(--background-secondary-alt)';
			variableHelpContainer.style.borderRadius = '6px';
			variableHelpContainer.style.fontSize = '12px';
			variableHelpContainer.style.lineHeight = '1.4';
			
			variableHelpContainer.innerHTML = `
				<strong>📝 ${t('settings.templateVariables')}：</strong><br><br>
				<strong>${t('settings.basicPathVariables')}：</strong><br>
				• <code>{{current_folder}}</code> - ${t('settings.currentFolder')}<br>
				• <code>{{note_folder_path}}</code> - ${t('settings.noteFolderPath')}<br>
				• <code>{{note_file_name}}</code> - ${t('settings.noteFileName')}<br><br>
				<strong>${t('settings.attachmentVariables')}：</strong><br>
				• <code>{{attachment_name}}</code> - ${t('settings.attachmentName')}<br>
				• <code>{{original_attachment_file_extension}}</code> - ${t('settings.originalExtension')}<br>
				• <code>{{attachment_file_name}}</code> - ${t('settings.attachmentFileName')}<br><br>
				<strong>${t('settings.metadataVariables')}：</strong><br>
				• <code>{{title}}</code> - ${t('views.attachmentForm.titleField')}<br>
				• <code>{{author}}</code> - ${t('views.attachmentForm.author')}<br>
				• <code>{{year}}</code> - ${t('views.attachmentForm.year')}<br>
				• <code>{{file_type}}</code> - ${t('settings.fileType')}<br>
				• <code>{{doi}}</code> - ${t('views.attachmentForm.doi')}<br>
				• <code>{{publisher}}</code> - ${t('settings.publisher')}<br>
				• <code>{{journal_level}}</code> - ${t('settings.journalLevel')}<br><br>
				<strong>${t('settings.timeVariables')}：</strong><br>
				• <code>{{date:YYYY}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:MM}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:DD}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:HH}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:mm}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:ss}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:SSS}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:YYYYMMDD}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:YYYYMMDDHHmm}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:YYYYMMDDHHmmss}}</code> - ${t('settings.dateFormat')}<br>
				• <code>{{date:YYYYMMDDHHmmssSSS}}</code> - ${t('settings.dateFormat')}<br><br>
				<strong>${t('settings.combinedVariables')}：</strong><br>
				• <code>{{note_file_name}}-{{date:YYYYMMDDHHmmssSSS}}</code> - ${t('settings.noteNameTimestamp')}<br>
				• <code>{{title}}-{{date:YYYYMMDD}}</code> - ${t('settings.titleDate')}<br>
				• <code>{{author}}-{{year}}-{{title}}</code> - ${t('settings.authorYearTitle')}<br><br>
				<em>💡 ${t('settings.templateTip')}</em>
			`;

		new Setting(containerEl)
			.setName(t('settings.autoMDFileTypes'))
			.setDesc(t('settings.autoMDFileTypesDesc'))
			.addText(text => text
				.setPlaceholder(t('settings.autoMDFileTypesPlaceholder'))
				.setValue(this.plugin.settings.autoMDFileTypes.join(','))
				.onChange(async (value) => {
					this.plugin.settings.autoMDFileTypes = value.split(',').map(t => t.trim()).filter(t => t);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.excludeMDFileTypes'))
			.setDesc(t('settings.excludeMDFileTypesDesc'))
			.addText(text => text
				.setPlaceholder(t('settings.excludeMDFileTypesPlaceholder'))
				.setValue(this.plugin.settings.excludeMDFileTypes.join(','))
				.onChange(async (value) => {
					this.plugin.settings.excludeMDFileTypes = value.split(',').map(t => t.trim()).filter(t => t);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.createAllMDFiles'))
			.setDesc(t('settings.createAllMDFilesDesc'))
			.addButton(button => button
				.setButtonText(t('settings.createAllMDFiles'))
				.setClass('mod-cta')
				.onClick(async () => {
					try {
						await this.plugin.attachmentTagManager.syncAllMDFiles();
					} catch (error) {
						console.error('Error creating MD files:', error);
						new Notice(t('notices.mdFileCreationFailed'));
					}
				}));

		}

		// 系统状态信息
		const systemStatusContainer = containerEl.createEl('div', { cls: 'system-status-container' });
		systemStatusContainer.style.marginTop = '20px';
		systemStatusContainer.style.padding = '15px';
		systemStatusContainer.style.backgroundColor = 'var(--background-secondary)';
		systemStatusContainer.style.borderRadius = '8px';
		systemStatusContainer.style.border = '1px solid var(--background-modifier-border)';
		
		const tagStats = this.plugin.tagSyncManager.getTagUsageStats();
		const databaseTags = this.plugin.database.getAllTags();
		const allRecords = this.plugin.database.getAllRecords();
		const recordsWithMD = allRecords.filter(r => r.hasMDFile).length;
		
		systemStatusContainer.innerHTML = `
			<strong>📊 ${t('settings.systemStatus')}：</strong><br><br>
			<strong>${t('settings.totalAttachments')}：</strong> ${allRecords.length} 个<br>
			<strong>${t('settings.mdFilesCreated')}：</strong> ${recordsWithMD} 个<br>
			<strong>${t('settings.databaseTags')}：</strong> ${databaseTags.length} 个<br>
			<strong>${t('settings.obsidianTags')}：</strong> ${Object.keys(tagStats).length} 个<br>
			<strong>${t('settings.lastUpdate')}：</strong> ${new Date().toLocaleString()}<br><br>
			<em>${t('settings.systemStatusDesc')}</em>
		`;

		// 视图和导出设置
		containerEl.createEl('h3', {text: t('settings.viewAndExport')});

		new Setting(containerEl)
			.setName(t('settings.defaultView'))
			.setDesc(t('settings.defaultViewDesc'))
			.addDropdown(dropdown => dropdown
				.addOption('list', t('views.mainView.listView'))
				.addOption('preview', t('views.mainView.previewView'))
				.addOption('card', t('views.mainView.cardView'))
				.setValue(this.plugin.settings.defaultView)
				.onChange(async (value: 'list' | 'preview' | 'card') => {
					this.plugin.settings.defaultView = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t('settings.openMode'))
			.setDesc(t('settings.openModeDesc'))
			.addDropdown(dropdown => dropdown
				.addOption('new-tab', t('settings.openModeNewTab'))
				.addOption('current-tab', t('settings.openModeCurrentTab'))
				.addOption('new-window', t('settings.openModeNewWindow'))
				.setValue(this.getOpenModeValue())
				.onChange(async (value: string) => {
					await this.updateOpenModeSettings(value);
				}));

		new Setting(containerEl)
			.setName(t('settings.exportFormat'))
			.setDesc(t('settings.exportFormatDesc'))
			.addDropdown(dropdown => dropdown
				.addOption('csv', 'CSV')
				.addOption('json', 'JSON')
				.addOption('bibtex', 'BibTeX')
				.setValue(this.plugin.settings.exportFormat)
				.onChange(async (value: 'csv' | 'json' | 'bibtex') => {
					this.plugin.settings.exportFormat = value;
					await this.plugin.saveSettings();
				}));
	}

	/**
	 * 获取当前打开模式的设置值
	 */
	private getOpenModeValue(): string {
		return this.plugin.settings.openMode;
	}

	/**
	 * 更新打开模式设置
	 */
	private async updateOpenModeSettings(value: string): Promise<void> {
		this.plugin.settings.openMode = value as 'new-tab' | 'current-tab' | 'new-window';
		await this.plugin.saveSettings();
	}

	/**
	 * 智能更新附件路径：当MD文件移动时，保持附件和MD文件的相对位置关系
	 */
	private updateAttachmentPathForMDFileMove(
		oldAttachmentPath: string, 
		oldMdPath: string, 
		newMdPath: string
	): string | null {
		try {
			// 计算MD文件的移动路径差异
			const oldMdDir = oldMdPath.substring(0, oldMdPath.lastIndexOf('/'));
			const newMdDir = newMdPath.substring(0, newMdPath.lastIndexOf('/'));
			
			// 如果目录没有变化，附件路径也不需要变化
			if (oldMdDir === newMdDir) {
				return oldAttachmentPath;
			}
			
			// 计算附件相对于旧MD文件的路径
			const attachmentRelativeToOldMd = oldAttachmentPath.substring(oldMdDir.length + 1);
			
			// 构建新的附件路径
			const newAttachmentPath = `${newMdDir}/${attachmentRelativeToOldMd}`;
			
			console.log(`📁 MD file moved: ${oldMdDir} -> ${newMdDir}`);
			console.log(`📎 Attachment relative path: ${attachmentRelativeToOldMd}`);
			console.log(`🔄 New attachment path: ${newAttachmentPath}`);
			
			return newAttachmentPath;
			
		} catch (error) {
			console.error('Error updating attachment path for MD file move:', error);
			return null;
		}
	}
}
