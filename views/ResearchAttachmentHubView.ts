import { ItemView, WorkspaceLeaf, TFile, Notice, Menu, ButtonComponent, Modal, Setting } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';
import { EditModal } from '../modals/EditModal';
import { LostMDFileModal } from '../modals/LostMDFileModal';
import { ImportModal } from '../modals/ImportModal';
import { DownloadModal } from '../modals/DownloadModal';
import { SearchModal } from '../modals/SearchModal';
import { ScanAttachmentsModal } from '../modals/ScanAttachmentsModal';
import { ImportPackageModal } from '../modals/ImportPackageModal';

export const RESEARCH_ATTACHMENT_HUB_VIEW_TYPE = 'research-attachment-hub-view';

export class ResearchAttachmentHubView extends ItemView {
	plugin: ResearchAttachmentHubPlugin;
	records: AttachmentRecord[] = [];
	filteredRecords: AttachmentRecord[] = [];
	currentView: 'table' | 'cards' | 'preview' = 'table';
	searchQuery: string = '';
	filterTags: string[] = [];
	filterFileTypes: string[] = []; // 文件类型筛选
	sortBy: 'title' | 'author' | 'year' | 'addedTime' | 'referenceCount' | 'fileType' | 'fileSize' = 'addedTime';
	sortOrder: 'asc' | 'desc' = 'desc';
	columnVisibility: { [key: string]: boolean } = {
		title: true,
		author: true,
		year: true,
		doi: true,
		tags: true,
		fileType: true,
		fileSize: true,
		publisher: true,
		journalLevel: true,
		mdFile: true, // 新增：MD文件状态列
		addedTime: true,
		referenceCount: true,
		actions: true
	};
	
	// 标签页激活监听器
	private tabActivationListener: (() => void) | null = null;
	
	// 预览视图相关属性
	private selectedPreviewRecord: AttachmentRecord | null = null;
	private selectedPreviewIndex: number = -1;
	
	// 选择功能相关属性
	private selectedRecords: Set<string> = new Set(); // 选中的附件记录ID
	private isSelectMode: boolean = false; // 是否处于选择模式
	
	// 分页相关属性
	private currentPage: number = 1;
	private pageSize: number = 15; // 每页显示15个附件，提高加载速度
	private totalPages: number = 1;
	
	// 虚拟滚动相关属性
	private virtualScrollEnabled: boolean = true;
	private visibleStartIndex: number = 0;
	private visibleEndIndex: number = 0;
	private itemHeight: number = 40; // 每行高度
	private containerHeight: number = 0;
	
	// 防抖相关属性
	private refreshTimeout: NodeJS.Timeout | null = null;
	private isRefreshing: boolean = false;
	
	// 列宽度配置
	private minColumnWidths: { [key: string]: number } = {
		title: 200,
		author: 120,
		year: 60,
		publisher: 150,
		level: 80,
		doi: 120,
		type: 60,
		mdFile: 80,
		size: 60,
		location: 120,
		tags: 100,
		refs: 60,
		added: 80,
		actions: 180
	};

	constructor(leaf: WorkspaceLeaf, plugin: ResearchAttachmentHubPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return RESEARCH_ATTACHMENT_HUB_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Research Attachment Hub';
	}

	getIcon(): string {
		return 'file-text';
	}

	async onOpen() {
		// 先渲染UI，让用户看到界面
		this.render();
		
		// 异步加载记录，不阻塞UI
		this.loadRecordsAsync();
		
		// 监听标签页激活事件
		this.registerTabActivationListener();
	}
	
	// 异步加载记录，避免阻塞UI
	private async loadRecordsAsync() {
		try {
			await this.loadRecords();
			// 不再自动更新引用计数，改为手动刷新
		} catch (error) {
			console.error('Error loading records:', error);
		}
	}
	
	// 刷新当前页的引用计数
	private async refreshCurrentPageReferences() {
		if (this.isRefreshing) {
			return; // 防止重复执行
		}
		
		this.isRefreshing = true;
		
		try {
			// 获取当前页的记录
			const startIndex = (this.currentPage - 1) * this.pageSize;
			const endIndex = Math.min(startIndex + this.pageSize, this.filteredRecords.length);
			const currentPageRecords = this.filteredRecords.slice(startIndex, endIndex);
			
			if (currentPageRecords.length === 0) {
				return;
			}
			
			// 更新状态栏
			this.plugin.updateStatusBar(`正在刷新当前页引用计数... (${currentPageRecords.length} 个记录)`);
			
			// 使用高效的批量更新方法
			const updatedCount = await this.plugin.updateBatchRecordReferenceCounts(currentPageRecords);
			
			// 保存更改
			if (updatedCount > 0) {
				await this.plugin.database.save();
			}
			
			// 使用防抖机制刷新视图
			this.debouncedRefreshView();
			
			this.plugin.updateStatusBar(`当前页引用计数刷新完成: ${updatedCount} 个记录已更新`);
			
		} catch (error) {
			console.error('Error refreshing current page references:', error);
			this.plugin.updateStatusBar('刷新引用计数失败');
		} finally {
			this.isRefreshing = false;
		}
	}
	
	// 防抖刷新视图
	private debouncedRefreshView() {
		if (this.refreshTimeout) {
			clearTimeout(this.refreshTimeout);
		}
		
		this.refreshTimeout = setTimeout(() => {
			this.refreshContent();
		}, 300); // 300ms防抖
	}

	async onClose() {
		// 清理资源
		// 移除事件监听器
		if (this.tabActivationListener) {
			this.app.workspace.off('layout-change', this.tabActivationListener);
			this.tabActivationListener = null;
		}
	}

	async loadRecords() {
		try {
			// console.log('Loading records...');
			const allRecords = this.plugin.database.getAllRecords();
			// console.log('Found records:', allRecords.length);
			// console.log('Records:', allRecords);
			
			// 直接加载数据库中的记录，不自动生成示例数据
			this.records = allRecords;
			
					this.applyFiltersAndSort();
		this.updatePagination();
		
		if (this.filteredRecords.length === 0) {
			console.log('No records found in database');
		}
	} catch (error) {
		console.error('Error loading records:', error);
		this.records = [];
		this.filteredRecords = [];
	}
}

// 更新分页信息
private updatePagination() {
	this.totalPages = Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize));
	if (this.currentPage > this.totalPages) {
		this.currentPage = this.totalPages;
	}
}

// 获取当前页的记录
private getCurrentPageRecords(): AttachmentRecord[] {
	const startIndex = (this.currentPage - 1) * this.pageSize;
	const endIndex = startIndex + this.pageSize;
	return this.filteredRecords.slice(startIndex, endIndex);
}

// 切换到指定页面
private goToPage(page: number) {
	if (page >= 1 && page <= this.totalPages) {
		this.currentPage = page;
		this.render();
	}
}

// 创建分页控件
private createPagination(container: HTMLElement) {
	if (this.totalPages <= 1) return;
	
	const paginationContainer = container.createEl('div', { cls: 'pagination-container' });
	paginationContainer.style.cssText = `
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		margin: 20px 0;
		padding: 10px;
		background: var(--background-secondary);
		border-radius: 8px;
		border: 1px solid var(--background-modifier-border);
	`;
	
	// 首页按钮
	const firstBtn = paginationContainer.createEl('button', { text: '«' });
	firstBtn.style.cssText = `
		padding: 8px 12px;
		border: 1px solid var(--background-modifier-border);
		background: var(--background-primary);
		color: var(--text-normal);
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
	`;
	firstBtn.addEventListener('click', () => this.goToPage(1));
	
	// 上一页按钮
	const prevBtn = paginationContainer.createEl('button', { text: '‹' });
	prevBtn.style.cssText = firstBtn.style.cssText;
	prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
	
	// 页码显示
	const pageInfo = paginationContainer.createEl('span', { 
		text: `${this.currentPage} / ${this.totalPages}` 
	});
	pageInfo.style.cssText = `
		padding: 8px 16px;
		font-size: 14px;
		color: var(--text-normal);
	`;
	
	// 下一页按钮
	const nextBtn = paginationContainer.createEl('button', { text: '›' });
	nextBtn.style.cssText = firstBtn.style.cssText;
	nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
	
	// 末页按钮
	const lastBtn = paginationContainer.createEl('button', { text: '»' });
	lastBtn.style.cssText = firstBtn.style.cssText;
	lastBtn.addEventListener('click', () => this.goToPage(this.totalPages));
	
	// 页面大小选择器
	const pageSizeContainer = paginationContainer.createEl('div', { cls: 'page-size-container' });
	pageSizeContainer.style.cssText = `
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: 20px;
	`;
	
	const pageSizeLabel = pageSizeContainer.createEl('span', { text: '每页:' });
	pageSizeLabel.style.cssText = `
		font-size: 12px;
		color: var(--text-muted);
	`;
	
	const pageSizeSelect = pageSizeContainer.createEl('select');
	pageSizeSelect.style.cssText = `
		padding: 4px 8px;
		border: 1px solid var(--background-modifier-border);
		background: var(--background-primary);
		color: var(--text-normal);
		border-radius: 4px;
		font-size: 12px;
	`;
	
	const pageSizes = [25, 50, 100, 200];
	pageSizes.forEach(size => {
		const option = pageSizeSelect.createEl('option', { text: size.toString(), value: size.toString() });
		if (size === this.pageSize) option.selected = true;
	});
	
	pageSizeSelect.addEventListener('change', (e) => {
		const newPageSize = parseInt((e.target as HTMLSelectElement).value);
		this.pageSize = newPageSize;
		this.currentPage = 1;
		this.updatePagination();
		this.render();
	});
}



	render() {
		const { contentEl } = this;
		contentEl.empty();

		// 创建头部工具栏
		this.createToolbar();

		// 创建搜索和过滤区域
		this.createSearchAndFilter(contentEl);

		// 创建统计信息
		this.createStatistics(contentEl);

		// 创建主要内容区域
		this.createMainContent(contentEl);
	}

	/**
	 * 刷新视图内容，不重新创建工具栏
	 */
	refreshContent(): void {
		// 只刷新主要内容，保持工具栏不变
		const mainContent = this.contentEl.querySelector('.main-content');
		if (mainContent) {
			this.renderMainContent(mainContent as HTMLElement);
		}
		
		// 刷新统计信息
		const statistics = this.contentEl.querySelector('.statistics-container');
		if (statistics && statistics.parentElement) {
			this.createStatistics(statistics.parentElement as HTMLElement);
		}
	}

	/**
	 * 刷新工具栏文本（用于语言切换）
	 */
	refreshToolbarText(): void {
		const toolbar = this.containerEl.querySelector('.research-attachment-hub-toolbar');
		if (toolbar) {
			toolbar.remove();
		}
		this.createToolbar();
	}

	private createToolbar(): void {
		// 防止重复创建工具栏
		if (this.containerEl.querySelector('.research-attachment-hub-toolbar')) {
			// console.log('Toolbar already exists, skipping creation');
			return;
		}
		
		const toolbar = this.containerEl.createEl('div', { cls: 'research-attachment-hub-toolbar' });
		toolbar.style.cssText = `
			display: flex;
			flex-direction: row;
			gap: 15px;
			padding: 15px 20px;
			background: var(--background-secondary);
			border-radius: 12px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			margin-bottom: 20px;
			align-items: center;
			flex-wrap: wrap;
		`;
		
		// 第一组：视图切换菜单
		const viewGroup = toolbar.createEl('div', { cls: 'button-group' });
		viewGroup.style.cssText = `
			display: flex;
			gap: 8px;
			align-items: center;
		`;

		// 视图切换菜单按钮
		const viewBtn = viewGroup.createEl('button', { text: this.plugin.languageManager.t('views.mainView.view') });
		viewBtn.style.cssText = `
			padding: 8px 16px;
			border-radius: 6px;
			border: 1px solid var(--background-modifier-border);
			background: var(--background-primary);
			color: var(--text-normal);
			font-size: 13px;
			cursor: pointer;
			transition: all 0.2s ease;
			min-width: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
		`;

		// 添加下拉箭头
		const viewArrow = viewBtn.createEl('span', { text: '▼' });
		viewArrow.style.cssText = `
			font-size: 10px;
			margin-left: 6px;
			color: var(--text-muted);
		`;

		// 视图切换菜单
		viewBtn.addEventListener('click', (e) => {
			const menu = new Menu();
			
			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.tableView'));
				item.setIcon('table');
				item.onClick(() => this.switchView('table'));
			});

			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.cardViewMode'));
				item.setIcon('layout-grid');
				item.onClick(() => this.switchView('cards'));
			});

			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.previewViewMode'));
				item.setIcon('eye');
				item.onClick(() => this.switchView('preview'));
			});

			menu.showAtPosition({ x: e.clientX, y: e.clientY + 30 });
		});

		// 选择信息显示
		const selectionInfo = toolbar.createEl('div', { cls: 'selection-info' });
		selectionInfo.style.cssText = `
			margin-left: 15px;
			padding: 8px 12px;
			background: var(--background-secondary);
			border-radius: 6px;
			font-size: 12px;
			color: var(--text-muted);
			border: 1px solid var(--background-modifier-border);
		`;
		selectionInfo.setText(`已选择 0 / ${this.filteredRecords.length} 个附件`);

		// 分隔线
		this.createSeparator(toolbar);

		// 第二组：主要操作菜单
		const mainActionsGroup = toolbar.createEl('div', { cls: 'button-group' });
		mainActionsGroup.style.cssText = `
			display: flex;
			gap: 8px;
			align-items: center;
		`;

		// 主要操作菜单按钮
		const mainActionsBtn = mainActionsGroup.createEl('button', { text: this.plugin.languageManager.t('views.mainView.operations') });
		mainActionsBtn.style.cssText = `
			padding: 8px 16px;
			border-radius: 6px;
			border: 1px solid var(--background-modifier-border);
			background: var(--background-primary);
			color: var(--text-normal);
			font-size: 13px;
			cursor: pointer;
			transition: all 0.2s ease;
			min-width: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
		`;

		// 添加下拉箭头
		const arrow = mainActionsBtn.createEl('span', { text: '▼' });
		arrow.style.cssText = `
			font-size: 10px;
			margin-left: 6px;
			color: var(--text-muted);
		`;

		// 主要操作菜单
		mainActionsBtn.addEventListener('click', (e) => {
			const menu = new Menu();
			
			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.importPDF'));
				item.setIcon('import');
				item.onClick(() => {
					new ImportModal(this.app, this.plugin).open();
				});
			});

			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.downloadPaper'));
				item.setIcon('download');
				item.onClick(() => {
					new DownloadModal(this.app, this.plugin).open();
				});
			});

			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.searchDOI'));
				item.setIcon('search');
				item.onClick(() => {
					new SearchModal(this.app, this.plugin).open();
				});
			});

			menu.showAtPosition({ x: e.clientX, y: e.clientY + 30 });
		});

		// 分隔线
		this.createSeparator(toolbar);

		// 第三组：管理功能菜单
		const managementGroup = toolbar.createEl('div', { cls: 'button-group' });
		managementGroup.style.cssText = `
			display: flex;
			gap: 8px;
			align-items: center;
		`;

		// 管理功能菜单按钮
		const managementBtn = managementGroup.createEl('button', { text: this.plugin.languageManager.t('views.mainView.management') });
		managementBtn.style.cssText = `
			padding: 8px 16px;
			border-radius: 6px;
			border: 1px solid var(--background-modifier-border);
			background: var(--background-primary);
			color: var(--text-normal);
			font-size: 13px;
			cursor: pointer;
			transition: all 0.2s ease;
			min-width: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
		`;

		// 添加下拉箭头
		const managementArrow = managementBtn.createEl('span', { text: '▼' });
		managementArrow.style.cssText = `
			font-size: 10px;
			margin-left: 6px;
			color: var(--text-muted);
		`;

		// 管理功能菜单
		managementBtn.addEventListener('click', async (e) => {
			const menu = new Menu();
			
			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.scanAllAttachments'));
				item.setIcon('search');
				item.onClick(() => {
					new ScanAttachmentsModal(this.app, this.plugin).open();
				});
			});

			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.refreshView'));
				item.setIcon('refresh-cw');
				item.onClick(async () => {
					await this.refreshView();
				});
			});

			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.syncTags'));
				item.setIcon('tag');
				item.onClick(async () => {
					await this.plugin.tagSyncManager.autoSyncTags();
					new Notice(this.plugin.languageManager.t('views.mainView.tagsSyncCompleted'));
				});
			});

			menu.addItem((item) => {
				item.setTitle('刷新当前页引用计数');
				item.setIcon('link');
				item.onClick(async () => {
					await this.refreshCurrentPageReferences();
				});
			});

			// MD文件管理选项
			if (this.plugin.settings.enableAutoMDCreation) {
				menu.addSeparator();
				
				menu.addItem((item) => {
					item.setTitle(this.plugin.languageManager.t('views.mainView.createAllMDFiles'));
					item.setIcon('file-text');
					item.onClick(async () => {
						try {
							await this.plugin.attachmentTagManager.syncAllMDFiles();
							// new Notice(this.plugin.languageManager.t('views.mainView.mdFileSyncCompleted'));
							await this.loadRecords();
							this.refreshContent();
						} catch (error) {
							new Notice(this.plugin.languageManager.t('views.mainView.createMDFileFailed', { message: error.message }));
						}
					});
				});

				menu.addItem((item) => {
					item.setTitle(this.plugin.languageManager.t('views.mainView.syncMDFileTags'));
					item.setIcon('tag');
					item.onClick(async () => {
						try {
							await this.plugin.syncTagsFromAttachmentMDs();
							new Notice(this.plugin.languageManager.t('views.mainView.mdFileSyncCompleted'));
							await this.loadRecords();
							this.refreshContent();
						} catch (error) {
							// new Notice(this.plugin.languageManager.t('views.mainView.mdFileSyncFailed', { message: error.message }));
						}
					});
				});
			}

			// 高级管理选项
			menu.addSeparator();
			
			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.checkLostMDFiles'));
				item.setIcon('alert-triangle');
				item.onClick(async () => {
					try {
						const lostFiles = await this.plugin.attachmentTagManager.checkForLostMDFiles();
						if (lostFiles.length === 0) {
							new Notice(this.plugin.languageManager.t('views.mainView.noLostMDFiles'));
						} else {
							new Notice(`发现 ${lostFiles.length} 个丢失的MD文件，请查看控制台`);
							console.log('丢失的MD文件列表:', lostFiles);
						}
					} catch (error) {
						console.error('Error checking lost MD files:', error);
						new Notice(this.plugin.languageManager.t('views.mainView.checkLostMDFilesFailed'));
					}
				});
			});

			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.searchByTag'));
				item.setIcon('search');
				item.onClick(() => {
					// 使用命令面板搜索标签
					new Notice(this.plugin.languageManager.t('views.mainView.useCommandPanel'));
				});
			});

			menu.showAtPosition({ x: e.clientX, y: e.clientY + 30 });
		});

		// 分隔线
		this.createSeparator(toolbar);

		// 第四组：导入导出菜单
		const importExportGroup = toolbar.createEl('div', { cls: 'button-group' });
		importExportGroup.style.cssText = `
			display: flex;
			gap: 8px;
			align-items: center;
		`;

		// 导入导出菜单按钮
		const importExportBtn = importExportGroup.createEl('button', { text: this.plugin.languageManager.t('views.mainView.data') });
		importExportBtn.style.cssText = `
			padding: 8px 16px;
			border-radius: 6px;
			border: 1px solid var(--background-modifier-border);
			background: var(--background-primary);
			color: var(--text-normal);
			font-size: 13px;
			cursor: pointer;
			transition: all 0.2s ease;
			min-width: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
		`;

		// 添加下拉箭头
		const importExportArrow = importExportBtn.createEl('span', { text: '▼' });
		importExportArrow.style.cssText = `
			font-size: 10px;
			margin-left: 6px;
			color: var(--text-muted);
		`;

		// 导入导出菜单
		importExportBtn.addEventListener('click', (e) => {
			const menu = new Menu();
			
			// 导出数据（CSV格式）
			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.exportAllData'));
				item.setIcon('download');
				item.onClick(() => {
					this.exportAllDataAsCSV();
				});
			});

			// 导出完整包（数据+附件+MD文件）
			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.exportCompletePackage'));
				item.setIcon('package');
				item.onClick(() => {
					this.plugin.exportCompletePackage();
				});
			});

			// 如果有选中的附件，提供选择性导出
			if (this.selectedRecords.size > 0) {
				menu.addSeparator();
				
				menu.addItem((item) => {
					item.setTitle(`导出选中数据(CSV) (${this.selectedRecords.size})`);
					item.setIcon('download');
					item.onClick(() => {
						this.exportSelectedDataAsCSV();
					});
				});

				menu.addItem((item) => {
					item.setTitle(`导出选中完整包 (${this.selectedRecords.size})`);
					item.setIcon('package');
					item.onClick(() => {
						this.exportSelectedCompletePackage();
					});
				});
			}

			menu.addSeparator();

			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.importCompletePackage'));
				item.setIcon('upload');
				item.onClick(() => {
					new ImportPackageModal(this.app, this.plugin).open();
				});
			});

			menu.showAtPosition({ x: e.clientX, y: e.clientY + 30 });
		});

		// 分隔线
		this.createSeparator(toolbar);

		// 添加独立窗口模式提示
		if (window.opener || window.name.includes('obsidian')) {
			const windowModeNotice = toolbar.createEl('div', { cls: 'window-mode-notice' });
			windowModeNotice.style.cssText = `
				padding: 8px 12px;
				margin: 0 10px;
				border-radius: 6px;
				background: var(--background-modifier-error);
				color: var(--text-error);
				font-size: 12px;
				border: 1px solid var(--background-modifier-error-hover);
				display: flex;
				align-items: center;
				gap: 6px;
			`;
			
			// 添加警告图标
			const warningIcon = windowModeNotice.createEl('span', { text: '⚠️' });
			warningIcon.style.fontSize = '14px';
			
			// 添加提示文本
			const noticeText = windowModeNotice.createEl('span');
			noticeText.textContent = '独立窗口模式：文件选择功能受限，建议在新标签页中打开';
			
			// 添加关闭按钮
			const closeBtn = windowModeNotice.createEl('button', { text: '×' });
			closeBtn.style.cssText = `
				margin-left: auto;
				background: none;
				border: none;
				color: var(--text-error);
				font-size: 16px;
				cursor: pointer;
				padding: 0;
				width: 20px;
				height: 20px;
				display: flex;
				align-items: center;
				justify-content: center;
			`;
			closeBtn.onclick = () => {
				windowModeNotice.remove();
			};
		}

		// 第五组：设置按钮
		const settingsGroup = toolbar.createEl('div', { cls: 'button-group' });
		settingsGroup.style.cssText = `
			display: flex;
			gap: 8px;
			align-items: center;
		`;

		// 列显示控制按钮
		const columnControlBtn = settingsGroup.createEl('button', { text: '⚙️' });
		columnControlBtn.style.cssText = `
			padding: 8px 12px;
			border-radius: 6px;
			border: 1px solid var(--background-modifier-border);
			background: var(--background-primary);
			color: var(--text-normal);
			font-size: 16px;
			cursor: pointer;
			transition: all 0.2s ease;
			min-width: 40px;
		`;
		columnControlBtn.title = '列显示控制';
		columnControlBtn.addEventListener('click', () => {
			new ColumnControlModal(this.app, this.plugin).open();
		});



		// 添加按钮悬停效果
		const allButtons = toolbar.querySelectorAll('button');
		allButtons.forEach(btn => {
			btn.addEventListener('mouseenter', () => {
				btn.style.transform = 'translateY(-1px)';
				btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
			});
			btn.addEventListener('mouseleave', () => {
				btn.style.transform = 'translateY(0)';
				btn.style.boxShadow = 'none';
			});
		});

		// 添加下拉菜单悬停效果
		const allSelects = toolbar.querySelectorAll('select');
		allSelects.forEach(select => {
			select.addEventListener('mouseenter', () => {
				select.style.borderColor = 'var(--text-accent)';
				select.style.boxShadow = '0 0 0 2px rgba(var(--text-accent-rgb), 0.1)';
			});
			select.addEventListener('mouseleave', () => {
				select.style.borderColor = 'var(--background-modifier-border)';
				select.style.boxShadow = 'none';
			});
		});


	}

	/**
	 * 更新选择UI状态
	 */
	private updateSelectionUI(): void {
		// 更新工具栏中的选择状态显示
		const selectionInfo = this.containerEl.querySelector('.selection-info');
		if (selectionInfo) {
			const selectedCount = this.selectedRecords.size;
			const totalCount = this.filteredRecords.length;
			selectionInfo.setText(`已选择 ${selectedCount} / ${totalCount} 个附件`);
		}
		
		// 更新全选按钮状态
		const selectAllCheckbox = this.containerEl.querySelector('.select-all-checkbox') as HTMLInputElement;
		if (selectAllCheckbox) {
			selectAllCheckbox.checked = this.selectedRecords.size === this.filteredRecords.length;
			selectAllCheckbox.indeterminate = this.selectedRecords.size > 0 && this.selectedRecords.size < this.filteredRecords.length;
		}
	}

	/**
	 * 导出所有数据为CSV格式
	 */
	private exportAllDataAsCSV(): void {
		// 调用插件的导出数据方法，不传参数表示导出所有
		this.plugin.exportData();
	}

	/**
	 * 导出选中的附件数据为CSV格式
	 */
	private exportSelectedDataAsCSV(): void {
		const selectedRecords = this.filteredRecords.filter(record => 
			this.selectedRecords.has(record.id)
		);
		
		if (selectedRecords.length === 0) {
			new Notice(this.plugin.languageManager.t('views.mainView.pleaseSelectAttachments'));
			return;
		}
		
		// 调用插件的导出数据方法
		this.plugin.exportData(selectedRecords);
	}

	/**
	 * 导出选中的附件
	 */
	private async exportSelectedAttachments(): Promise<void> {
		try {
			if (this.selectedRecords.size === 0) {
				new Notice(this.plugin.languageManager.t('views.mainView.pleaseSelectAttachments'));
				return;
			}

			// 获取选中的附件记录
			const selectedRecords = this.filteredRecords.filter(record => 
				this.selectedRecords.has(record.id)
			);

			// 创建导出数据
			const exportData = {
				attachments: selectedRecords,
				exportTime: new Date().toISOString(),
				exportType: 'selected',
				totalCount: selectedRecords.length
			};

			// 生成文件名
			const fileName = `selected-attachments-${new Date().toISOString().slice(0, 10)}.json`;

			// 创建并下载文件
			const dataStr = JSON.stringify(exportData, null, 2);
			const dataBlob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(dataBlob);
			
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			new Notice(`已导出 ${selectedRecords.length} 个选中附件的数据`);
		} catch (error) {
			console.error('Error exporting selected attachments:', error);
			new Notice(this.plugin.languageManager.t('views.mainView.exportSelectedFailed', { message: error.message }));
		}
	}

	/**
	 * 导出选中附件的完整包
	 */
	private async exportSelectedCompletePackage(): Promise<void> {
		try {
			if (this.selectedRecords.size === 0) {
				new Notice(this.plugin.languageManager.t('views.mainView.pleaseSelectAttachments'));
				return;
			}

			// 获取选中的附件记录
			const selectedRecords = this.filteredRecords.filter(record => 
				this.selectedRecords.has(record.id)
			);

			// 调用插件的导出完整包功能，但只处理选中的附件
			await this.plugin.exportCompletePackage(selectedRecords);

			new Notice(`已导出 ${selectedRecords.length} 个选中附件的完整包`);
		} catch (error) {
			console.error('Error exporting selected complete package:', error);
			new Notice(this.plugin.languageManager.t('views.mainView.exportSelectedPackageFailed', { message: error.message }));
		}
	}

	/**
	 * 创建分隔线
	 */
	private createSeparator(container: HTMLElement): void {
		const separator = container.createEl('div', { cls: 'toolbar-separator' });
		separator.style.cssText = `
			width: 1px;
			height: 30px;
			background: var(--background-modifier-border);
			margin: 0 5px;
		`;
	}

	/**
	 * 渲染预览视图
	 */
	private renderPreviewView(container: HTMLElement): void {
		container.empty();
		
		const previewContainer = container.createEl('div', { cls: 'preview-container' });
		previewContainer.style.display = 'grid';
		previewContainer.style.gridTemplateColumns = '1fr 320px';
		previewContainer.style.gap = '25px';
		
		// 左侧：记录列表
		const listPanel = previewContainer.createEl('div', { cls: 'list-panel' });
		listPanel.style.backgroundColor = 'var(--background-secondary)';
		listPanel.style.padding = '20px';
		listPanel.style.borderRadius = '12px';
		listPanel.style.border = '1px solid var(--background-modifier-border)';
		listPanel.style.overflowY = 'auto';
		listPanel.style.maxHeight = 'calc(100vh - 200px)';
		
		const listTitle = listPanel.createEl('h3', { text: this.plugin.languageManager.t('views.mainView.recordList'), cls: 'panel-title' });
		listTitle.style.margin = '0 0 20px 0';
		listTitle.style.color = 'var(--text-accent)';
		listTitle.style.fontSize = '18px';
		
		// 渲染记录列表
		this.renderPreviewRecordsList(listPanel);
		
		// 右侧：预览面板
		const previewPanel = previewContainer.createEl('div', { cls: 'preview-panel' });
		previewPanel.style.backgroundColor = 'var(--background-secondary)';
		previewPanel.style.padding = '20px';
		previewPanel.style.borderRadius = '12px';
		previewPanel.style.position = 'sticky';
		previewPanel.style.top = '20px';
		previewPanel.style.maxHeight = 'calc(100vh - 100px)';
		previewPanel.style.overflowY = 'auto';
		previewPanel.style.border = '1px solid var(--background-modifier-border)';
		
		const previewTitle = previewPanel.createEl('h3', { text: this.plugin.languageManager.t('views.mainView.previewPanel'), cls: 'panel-title' });
		previewTitle.style.margin = '0 0 20px 0';
		previewTitle.style.color = 'var(--text-accent)';
		previewTitle.style.fontSize = '18px';
		
		previewPanel.createEl('p', { 
			text: this.plugin.languageManager.t('views.mainView.previewDescription'),
			cls: 'panel-description'
		});
	}

	/**
	 * 渲染预览视图的记录列表
	 */
	private renderPreviewRecordsList(container: HTMLElement): void {
		if (this.filteredRecords.length === 0) {
			const noRecords = container.createEl('p', { 
				text: this.plugin.languageManager.t('views.mainView.noRecordsFound'),
				cls: 'no-records'
			});
			noRecords.style.textAlign = 'center';
			noRecords.style.color = 'var(--text-muted)';
			noRecords.style.padding = '40px 20px';
			noRecords.style.fontStyle = 'italic';
			return;
		}

		// 创建记录列表容器
		const recordsList = container.createEl('div', { cls: 'preview-records-list' });
		recordsList.style.display = 'flex';
		recordsList.style.flexDirection = 'column';
		recordsList.style.gap = '12px';

		this.filteredRecords.forEach((record, index) => {
			const recordItem = recordsList.createEl('div', { cls: 'preview-record-item' });
			recordItem.style.backgroundColor = 'var(--background-primary)';
			recordItem.style.padding = '16px';
			recordItem.style.borderRadius = '8px';
			recordItem.style.border = '1px solid var(--background-modifier-border)';
			recordItem.style.cursor = 'pointer';
			recordItem.style.transition = 'all 0.2s ease';
			recordItem.style.position = 'relative';

			// 添加选中状态样式
			recordItem.addEventListener('mouseenter', () => {
				recordItem.style.backgroundColor = 'var(--background-modifier-hover)';
				recordItem.style.borderColor = 'var(--text-accent)';
				recordItem.style.transform = 'translateX(4px)';
			});

			recordItem.addEventListener('mouseleave', () => {
				recordItem.style.backgroundColor = 'var(--background-primary)';
				recordItem.style.borderColor = 'var(--background-modifier-border)';
				recordItem.style.transform = 'translateX(0)';
			});

			// 点击选中记录
			recordItem.addEventListener('click', () => {
				this.selectPreviewRecord(record, index);
			});

			// 记录标题
			const title = recordItem.createEl('h4', { text: record.title });
			title.style.margin = '0 0 8px 0';
			title.style.fontSize = '14px';
			title.style.fontWeight = '600';
			title.style.color = 'var(--text-normal)';
			title.style.lineHeight = '1.3';
			title.style.wordWrap = 'break-word';
			title.style.overflowWrap = 'break-word';
			title.style.maxWidth = '100%';
			title.style.overflow = 'hidden';
			title.style.textOverflow = 'ellipsis';
			title.style.display = '-webkit-box';
			title.style.webkitLineClamp = '2';
			title.style.webkitBoxOrient = 'vertical';

			// 记录元信息
			const metaInfo = recordItem.createEl('div', { cls: 'record-meta' });
			metaInfo.style.display = 'flex';
			metaInfo.style.flexWrap = 'wrap';
			metaInfo.style.gap = '8px';
			metaInfo.style.fontSize = '12px';
			metaInfo.style.color = 'var(--text-muted)';

			// 年份
			if (record.year) {
				const year = metaInfo.createEl('span', { text: record.year.toString() });
				year.style.backgroundColor = 'var(--background-modifier-border)';
				year.style.padding = '2px 6px';
				year.style.borderRadius = '3px';
			}

			// 作者
			if (record.author) {
				const author = metaInfo.createEl('span', { text: record.author });
				author.style.maxWidth = '120px';
				author.style.overflow = 'hidden';
				author.style.textOverflow = 'ellipsis';
				author.style.whiteSpace = 'nowrap';
			}

			// 文件类型
			if (record.fileType) {
				const fileType = metaInfo.createEl('span', { text: record.fileType.toUpperCase() });
				fileType.style.backgroundColor = 'var(--background-modifier-border)';
				fileType.style.padding = '2px 6px';
				fileType.style.borderRadius = '3px';
				fileType.style.fontWeight = '500';
			}

			// 选中指示器
			const indicator = recordItem.createEl('div', { cls: 'selection-indicator' });
			indicator.style.position = 'absolute';
			indicator.style.right = '12px';
			indicator.style.top = '50%';
			indicator.style.transform = 'translateY(-50%)';
			indicator.style.width = '8px';
			indicator.style.height = '8px';
			indicator.style.borderRadius = '50%';
			indicator.style.backgroundColor = 'var(--text-muted)';
			indicator.style.transition = 'all 0.2s ease';
			indicator.style.opacity = '0';

			// 如果是当前选中的记录，显示选中状态
			if (this.selectedPreviewRecord === record) {
				recordItem.style.backgroundColor = 'var(--background-modifier-hover)';
				recordItem.style.borderColor = 'var(--text-accent)';
				indicator.style.backgroundColor = 'var(--text-accent)';
				indicator.style.opacity = '1';
			}
		});
	}

	/**
	 * 选择预览记录
	 */
	private selectPreviewRecord(record: AttachmentRecord, index: number): void {
		this.selectedPreviewRecord = record;
		this.selectedPreviewIndex = index;
		
		// 更新右侧预览面板
		this.updatePreviewPanel(record);
		
		// 重新渲染记录列表以更新选中状态
		const listPanel = this.contentEl.querySelector('.list-panel') as HTMLElement;
		if (listPanel) {
			listPanel.empty();
			const listTitle = listPanel.createEl('h3', { text: '记录列表', cls: 'panel-title' });
			listTitle.style.margin = '0 0 20px 0';
			listTitle.style.color = 'var(--text-accent)';
			listTitle.style.fontSize = '18px';
			this.renderPreviewRecordsList(listPanel);
		}
	}

	/**
	 * 更新预览面板
	 */
	private updatePreviewPanel(record: AttachmentRecord): void {
		const previewPanel = this.contentEl.querySelector('.preview-panel') as HTMLElement;
		if (!previewPanel) return;

		previewPanel.empty();

		// 重新创建标题
		const previewTitle = previewPanel.createEl('h3', { text: '预览面板', cls: 'panel-title' });
		previewTitle.style.margin = '0 0 20px 0';
		previewTitle.style.color = 'var(--text-accent)';
		previewTitle.style.fontSize = '18px';

		// 记录详细信息
		this.renderRecordDetails(previewPanel, record);
	}

	/**
	 * 渲染记录详细信息
	 */
	private renderRecordDetails(container: HTMLElement, record: AttachmentRecord): void {
		// 标题
		const title = container.createEl('h2', { text: record.title });
		title.style.margin = '0 0 20px 0';
		title.style.color = 'var(--text-normal)';
		title.style.fontSize = '20px';
		title.style.lineHeight = '1.4';
		title.style.wordWrap = 'break-word';
		title.style.overflowWrap = 'break-word';

		// 基本信息网格
		const infoGrid = container.createEl('div', { cls: 'info-grid' });
		infoGrid.style.display = 'grid';
		infoGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
		infoGrid.style.gap = '16px';
		infoGrid.style.marginBottom = '24px';

		// 作者
		if (record.author) {
			const authorItem = infoGrid.createEl('div', { cls: 'info-item' });
			authorItem.createEl('strong', { text: this.plugin.languageManager.t('views.mainView.authorLabel') });
			authorItem.createEl('span', { text: record.author });
			authorItem.style.padding = '12px';
			authorItem.style.backgroundColor = 'var(--background-primary)';
			authorItem.style.borderRadius = '6px';
			authorItem.style.border = '1px solid var(--background-modifier-border)';
		}

					// 年份
			if (record.year) {
				const yearItem = infoGrid.createEl('div', { cls: 'info-item' });
				yearItem.createEl('strong', { text: this.plugin.languageManager.t('views.mainView.yearLabel') });
				yearItem.createEl('span', { text: record.year.toString() });
				yearItem.style.padding = '12px';
				yearItem.style.backgroundColor = 'var(--background-primary)';
				yearItem.style.borderRadius = '6px';
				yearItem.style.border = '1px solid var(--background-modifier-border)';
			}

					// 发表机构
			if (record.publisher) {
				const publisherItem = infoGrid.createEl('div', { cls: 'info-item' });
				publisherItem.createEl('strong', { text: this.plugin.languageManager.t('views.mainView.publisherLabel') });
				publisherItem.createEl('span', { text: record.publisher });
				publisherItem.style.padding = '12px';
				publisherItem.style.backgroundColor = 'var(--background-primary)';
				publisherItem.style.borderRadius = '6px';
				publisherItem.style.border = '1px solid var(--background-modifier-border)';
			}

							// 期刊等级
		if (record.journalLevel) {
			const levelItem = infoGrid.createEl('div', { cls: 'info-item' });
			levelItem.createEl('strong', { text: this.plugin.languageManager.t('views.mainView.journalLevelLabel') });
			levelItem.createEl('span', { text: record.journalLevel });
			levelItem.style.padding = '12px';
			levelItem.style.backgroundColor = 'var(--background-primary)';
			levelItem.style.borderRadius = '6px';
			levelItem.style.border = '1px solid var(--background-modifier-border)';
		}

		// MD文件状态
		const mdFileItem = infoGrid.createEl('div', { cls: 'info-item' });
					mdFileItem.createEl('strong', { text: this.plugin.languageManager.t('views.mainView.mdFileLabel') });
		if (record.hasMDFile && !record.mdFileLost) {
			// MD文件存在且未丢失
			const mdStatus = mdFileItem.createEl('span', { text: this.plugin.languageManager.t('views.mainView.mdFileCreated') });
			mdStatus.style.color = 'var(--text-success)';
			mdStatus.style.fontWeight = 'bold';
			
			// 添加点击事件，可以打开MD文件
			mdFileItem.style.cursor = 'pointer';
			mdFileItem.title = `点击打开MD文件: ${record.mdFilePath}`;
			mdFileItem.addEventListener('click', () => {
				if (record.mdFilePath) {
					const mdFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
					if (mdFile instanceof TFile) {
						this.app.workspace.openLinkText('', record.mdFilePath, true);
					} else {
						// 文件不存在，触发丢失处理逻辑
						this.handleLostMDFile(record);
					}
				}
			});
		} else if (record.mdFileLost) {
			// MD文件丢失状态
			const mdStatus = mdFileItem.createEl('span', { text: this.plugin.languageManager.t('views.mainView.mdFileLost') });
			mdStatus.style.color = 'var(--background-modifier-error)';
			mdStatus.style.fontWeight = 'bold';
			
			// 添加点击事件，触发丢失处理逻辑
			mdFileItem.style.cursor = 'pointer';
			mdFileItem.title = this.plugin.languageManager.t('views.mainView.mdFileLostClickToHandle');
			mdFileItem.addEventListener('click', () => {
				this.handleLostMDFile(record);
			});
		} else {
			// 无MD文件
			const mdStatus = mdFileItem.createEl('span', { text: this.plugin.languageManager.t('views.mainView.mdFileNotCreated') });
			mdStatus.style.color = 'var(--text-muted)';
		}
		mdFileItem.style.padding = '12px';
		mdFileItem.style.backgroundColor = 'var(--background-primary)';
		mdFileItem.style.borderRadius = '6px';
		mdFileItem.style.border = '1px solid var(--background-modifier-border)';

		// DOI
		if (record.doi) {
			const doiContainer = container.createEl('div', { cls: 'doi-container' });
			doiContainer.style.marginBottom = '20px';
			doiContainer.createEl('strong', { text: 'DOI: ' });
			const doiLink = doiContainer.createEl('a', { 
				text: record.doi,
				href: `https://doi.org/${record.doi}`
			});
			doiLink.setAttribute('target', '_blank');
			doiLink.style.color = 'var(--text-accent)';
			doiLink.style.textDecoration = 'none';
		}

		// 文件信息
		const fileInfo = container.createEl('div', { cls: 'file-info' });
		fileInfo.style.marginBottom = '20px';
		fileInfo.style.padding = '16px';
		fileInfo.style.backgroundColor = 'var(--background-primary)';
		fileInfo.style.borderRadius = '8px';
		fileInfo.style.border = '1px solid var(--background-modifier-border)';

		const fileInfoTitle = fileInfo.createEl('strong', { text: this.plugin.languageManager.t('views.mainView.fileInfo') });
		fileInfoTitle.style.display = 'block';
		fileInfoTitle.style.marginBottom = '12px';
		
		if (record.fileType) {
			fileInfo.createEl('div', { text: `类型: ${record.fileType.toUpperCase()}` });
		}
		if (record.fileSize) {
			fileInfo.createEl('div', { text: `大小: ${this.formatFileSize(record.fileSize)}` });
		}
		if (record.filePath) {
			fileInfo.createEl('div', { text: `位置: ${record.filePath}` });
		}

		// 标签
		if (record.tags && record.tags.length > 0) {
			const tagsContainer = container.createEl('div', { cls: 'tags-container' });
			tagsContainer.style.marginBottom = '20px';
			const tagsTitle = tagsContainer.createEl('strong', { text: this.plugin.languageManager.t('views.mainView.tags') });
		tagsTitle.style.display = 'block';
		tagsTitle.style.marginBottom = '12px';
			
			const tagsList = tagsContainer.createEl('div', { cls: 'tags-list' });
			tagsList.style.display = 'flex';
			tagsList.style.flexWrap = 'wrap';
			tagsList.style.gap = '8px';
			
			record.tags.forEach(tag => {
				const tagSpan = tagsList.createEl('span', { text: tag });
				tagSpan.style.padding = '4px 8px';
				tagSpan.style.backgroundColor = 'var(--background-modifier-border)';
				tagSpan.style.borderRadius = '4px';
				tagSpan.style.fontSize = '12px';
			});
		}

		// 操作按钮
		const actionsContainer = container.createEl('div', { cls: 'preview-actions' });
		actionsContainer.style.display = 'flex';
		actionsContainer.style.gap = '12px';
		actionsContainer.style.marginTop = '24px';

		// 打开按钮
		const openBtn = actionsContainer.createEl('button', { text: this.plugin.languageManager.t('views.mainView.openFile') });
		openBtn.style.padding = '8px 16px';
		openBtn.style.backgroundColor = 'var(--text-accent)';
		openBtn.style.color = 'white';
		openBtn.style.border = 'none';
		openBtn.style.borderRadius = '6px';
		openBtn.style.cursor = 'pointer';
		openBtn.addEventListener('click', () => this.openPDF(record));

		// 编辑按钮
		const editBtn = actionsContainer.createEl('button', { text: this.plugin.languageManager.t('views.mainView.edit') });
		editBtn.style.padding = '8px 16px';
		editBtn.style.backgroundColor = 'var(--background-modifier-border)';
		editBtn.style.color = 'var(--text-normal)';
		editBtn.style.border = 'none';
		editBtn.style.borderRadius = '6px';
		editBtn.style.cursor = 'pointer';
		editBtn.addEventListener('click', () => this.editRecord(record));

		// 引用按钮
		const citeBtn = actionsContainer.createEl('button', { text: this.plugin.languageManager.t('views.mainView.cite') });
		citeBtn.style.padding = '8px 16px';
		citeBtn.style.backgroundColor = 'var(--background-modifier-border)';
		citeBtn.style.color = 'var(--text-normal)';
		citeBtn.style.border = 'none';
		citeBtn.style.borderRadius = '6px';
		citeBtn.style.cursor = 'pointer';
		citeBtn.addEventListener('click', () => {
			const bibtex = this.plugin.pdfProcessor.generateBibTeX(record);
			navigator.clipboard.writeText(bibtex).then(() => {
				new Notice(this.plugin.languageManager.t('views.mainView.bibtexCopied'));
			}).catch(() => {
				new Notice(this.plugin.languageManager.t('views.mainView.bibtexCopyFailed'));
			});
		});

		// 处理丢失MD文件的按钮
		if (record.mdFileLost) {
			const lostMDBtn = actionsContainer.createEl('button', { text: this.plugin.languageManager.t('views.mainView.handleLostMDFile') });
			lostMDBtn.style.padding = '8px 16px';
			lostMDBtn.style.backgroundColor = 'var(--background-modifier-error)';
			lostMDBtn.style.color = 'white';
			lostMDBtn.style.border = 'none';
			lostMDBtn.style.borderRadius = '6px';
			lostMDBtn.style.cursor = 'pointer';
			lostMDBtn.addEventListener('click', () => this.handleLostMDFile(record));
		}
	}

	/**
	 * 刷新视图
	 */
	async refreshView(): Promise<void> {
		try {
			// 显示刷新状态
			new Notice(this.plugin.languageManager.t('views.mainView.refreshing'));
			
			// 重新加载记录
			await this.loadRecords();
			
			// 重新渲染视图
			this.render();
			
			// 显示成功消息
			new Notice(this.plugin.languageManager.t('views.mainView.refreshSuccess'));
		} catch (error) {
			console.error('Error refreshing:', error);
			new Notice(this.plugin.languageManager.t('views.mainView.refreshFailed', { message: error.message }));
		}
	}

	createSearchAndFilter(container: HTMLElement) {
		const searchContainer = container.createEl('div', { cls: 'search-filter-container' });
		searchContainer.style.marginBottom = '20px';
		searchContainer.style.display = 'flex';
		searchContainer.style.gap = '15px';
		searchContainer.style.alignItems = 'flex-start'; // 改为flex-start，确保顶部对齐
		searchContainer.style.flexWrap = 'wrap'; // 允许换行
		searchContainer.style.minHeight = '60px'; // 设置最小高度，确保有足够空间

		// 搜索框
		const searchBox = searchContainer.createEl('input', {
			type: 'text',
			placeholder: 'Search papers...',
			value: this.searchQuery
		});
		searchBox.style.flex = '1';
		searchBox.style.minWidth = '200px'; // 设置最小宽度
		searchBox.style.padding = '8px';
		searchBox.style.border = '1px solid var(--background-modifier-border)';
		searchBox.style.borderRadius = '4px';
		searchBox.addEventListener('input', (e) => {
			this.searchQuery = (e.target as HTMLInputElement).value;
			this.applyFiltersAndSort(); // 防抖机制会自动刷新视图
		});

		// 标签过滤
		const tags = this.plugin.database.getAllTags();
		if (tags.length > 0) {
			const tagFilter = searchContainer.createEl('select');
			tagFilter.style.padding = '8px';
			tagFilter.style.border = '1px solid var(--background-modifier-border)';
			tagFilter.style.borderRadius = '4px';
			tagFilter.style.minWidth = '120px'; // 设置最小宽度
			tagFilter.style.maxWidth = '150px'; // 设置最大宽度
			tagFilter.style.height = '36px'; // 设置固定高度，确保完全显示
			tagFilter.style.boxSizing = 'border-box'; // 确保padding不会影响总高度
			
			const defaultOption = tagFilter.createEl('option', { text: 'All Tags', value: '' });
			tags.forEach((tag: string) => {
				const option = tagFilter.createEl('option', { text: tag, value: tag });
				if (this.filterTags.includes(tag)) {
					option.selected = true;
				}
			});
			
			tagFilter.addEventListener('change', (e) => {
				const selectedTag = (e.target as HTMLSelectElement).value;
				if (selectedTag) {
					this.filterTags = [selectedTag];
				} else {
					this.filterTags = [];
				}
				this.applyFiltersAndSort(); // 防抖机制会自动刷新视图
			});
		}

		// 文件类型过滤
		const fileTypes = this.getUniqueFileTypes();
		if (fileTypes.length > 0) {
			const fileTypeFilter = searchContainer.createEl('select');
			fileTypeFilter.style.padding = '8px';
			fileTypeFilter.style.border = '1px solid var(--background-modifier-border)';
			fileTypeFilter.style.borderRadius = '4px';
			fileTypeFilter.style.minWidth = '140px'; // 设置最小宽度
			fileTypeFilter.style.maxWidth = '170px'; // 设置最大宽度
			fileTypeFilter.style.height = '36px'; // 设置固定高度，确保完全显示
			fileTypeFilter.style.boxSizing = 'border-box'; // 确保padding不会影响总高度
			
			const defaultFileTypeOption = fileTypeFilter.createEl('option', { text: 'All File Types', value: '' });
			fileTypes.forEach((fileType: string) => {
				const option = fileTypeFilter.createEl('option', { text: fileType.toUpperCase(), value: fileType });
				if (this.filterFileTypes.includes(fileType)) {
					option.selected = true;
				}
			});
			
			fileTypeFilter.addEventListener('change', (e) => {
				const selectedFileType = (e.target as HTMLSelectElement).value;
				if (selectedFileType) {
					this.filterFileTypes = [selectedFileType];
				} else {
					this.filterFileTypes = [];
				}
				this.applyFiltersAndSort(); // 防抖机制会自动刷新视图
			});
		}

		// 排序选项
		const sortSelect = searchContainer.createEl('select');
		sortSelect.style.padding = '8px';
		sortSelect.style.border = '1px solid var(--background-modifier-border)';
		sortSelect.style.borderRadius = '4px';
		sortSelect.style.minWidth = '140px'; // 设置最小宽度
		sortSelect.style.maxWidth = '170px'; // 设置最大宽度
		sortSelect.style.height = '36px'; // 设置固定高度，确保完全显示
		sortSelect.style.boxSizing = 'border-box'; // 确保padding不会影响总高度
		
		const sortOptions = [
			{ value: 'title', text: 'Title' },
			{ value: 'author', text: 'Author' },
			{ value: 'year', text: 'Year' },
			{ value: 'addedTime', text: 'Added Date' },
			{ value: 'referenceCount', text: 'Reference Count' },
			{ value: 'fileType', text: 'File Type' },
			{ value: 'fileSize', text: 'File Size' }
		];
		
		sortOptions.forEach(option => {
			const optionEl = sortSelect.createEl('option', { 
				text: option.text, 
				value: option.value 
			});
			if (option.value === this.sortBy) {
				optionEl.selected = true;
			}
		});
		
		sortSelect.addEventListener('change', (e) => {
			this.sortBy = (e.target as HTMLSelectElement).value as any;
			this.applyFiltersAndSort(); // 防抖机制会自动刷新视图
		});

		// 排序顺序
		const orderBtn = searchContainer.createEl('button', { 
			text: this.sortOrder === 'asc' ? '↑' : '↓',
			cls: 'mod-cta'
		});
		orderBtn.style.padding = '8px 12px';
		orderBtn.style.minWidth = '40px'; // 设置最小宽度
		orderBtn.style.height = '36px'; // 设置固定高度，确保完全显示
		orderBtn.style.boxSizing = 'border-box'; // 确保padding不会影响总高度
		orderBtn.addEventListener('click', () => {
			this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
			this.applyFiltersAndSort(); // 防抖机制会自动刷新视图
			orderBtn.setText(this.sortOrder === 'asc' ? '↑' : '↓');
		});
	}

	createStatistics(container: HTMLElement) {
		const stats = container.createEl('div', { cls: 'statistics' });
		stats.style.marginBottom = '20px';
		stats.style.display = 'flex';
		stats.style.gap = '20px';
		stats.style.padding = '15px';
		stats.style.backgroundColor = 'var(--background-secondary)';
		stats.style.borderRadius = '5px';

		const totalPapers = this.filteredRecords.length;
		const totalReferences = this.filteredRecords.reduce((sum, record) => sum + record.referenceCount, 0);
		const recentPapers = this.filteredRecords.filter(record => {
			const addedDate = new Date(record.addedTime);
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			return addedDate > thirtyDaysAgo;
		}).length;

		// 文件类型统计
		const fileTypeStats = this.getFileTypeStats();

		stats.innerHTML = `
			<div class="stat-item">
				<strong>Total Papers:</strong> ${totalPapers}
			</div>
			<div class="stat-item">
				<strong>Total References:</strong> ${totalReferences}
			</div>
			<div class="stat-item">
				<strong>Recent (30 days):</strong> ${recentPapers}
			</div>
			<div class="stat-item">
				<strong>File Types:</strong> ${fileTypeStats}
			</div>
		`;
	}

	createMainContent(container: HTMLElement) {
		const mainContent = container.createEl('div', { cls: 'main-content' });
		mainContent.style.minHeight = 'calc(100vh - 300px)'; // 改为最小高度，避免内容被截断
		mainContent.style.overflow = 'visible'; // 改为visible，允许内容完全显示
		
		console.log('Rendering main content with', this.filteredRecords.length, 'records');
		
		// 调用正确的渲染方法
		this.renderMainContent(mainContent);
	}

	renderMainContent(container: HTMLElement) {
		container.empty();

		if (this.filteredRecords.length === 0) {
			const noRecordsDiv = container.createEl('div', { 
				cls: 'no-records',
				attr: { style: 'text-align: center; padding: 50px; color: var(--text-muted);' }
			});
			
			noRecordsDiv.createEl('h3', { text: 'No papers found' });
			noRecordsDiv.createEl('p', { text: 'Start by downloading or importing your first PDF paper.' });
			
			const downloadBtn = noRecordsDiv.createEl('button', { 
				text: 'Download Paper',
				cls: 'mod-cta'
			});
			downloadBtn.addEventListener('click', () => {
				new (require('../modals/DownloadModal').DownloadModal)(this.plugin.app, this.plugin).open();
			});
			
			return;
		}

		console.log('Rendering view:', this.currentView, 'with', this.filteredRecords.length, 'records');

		// 添加当前视图的调试信息和操作按钮
		const debugInfo = container.createEl('div', { 
			cls: 'view-debug-info',
		});
		debugInfo.style.padding = '10px';
		debugInfo.style.backgroundColor = 'var(--background-secondary)';
		debugInfo.style.marginBottom = '10px';
		debugInfo.style.borderRadius = '5px';
		debugInfo.style.fontSize = '12px';
		debugInfo.style.color = 'var(--text-muted)';
		debugInfo.style.display = 'flex';
		debugInfo.style.justifyContent = 'space-between';
		debugInfo.style.alignItems = 'center';
		
		// 左侧信息
		const infoText = debugInfo.createEl('span', {
			text: `当前视图: ${this.currentView} | 记录数: ${this.filteredRecords.length}`
		});
		
		// 右侧操作按钮
		const actionButtons = debugInfo.createEl('div', { cls: 'action-buttons' });
		actionButtons.style.display = 'flex';
		actionButtons.style.gap = '8px';
		
		// 手动刷新当前页引用计数按钮
		const refreshRefsBtn = actionButtons.createEl('button', {
			text: '刷新引用计数',
			cls: 'mod-cta'
		});
		refreshRefsBtn.style.fontSize = '11px';
		refreshRefsBtn.style.padding = '4px 8px';
		refreshRefsBtn.addEventListener('click', async () => {
			await this.refreshCurrentPageReferences();
		});

		switch (this.currentView) {
			case 'table':
				this.renderListView(container);
				break;
			case 'cards':
				this.renderCardView(container);
				break;
			case 'preview':
				this.renderPreviewView(container);
				break;
			default:
				this.renderListView(container);
		}
		
		// 添加分页控件（除了预览视图）
		if (this.currentView !== 'preview') {
			this.createPagination(container);
		}
	}





		renderListView(container: HTMLElement) {
		// 防止重复渲染的保护机制
		if (container.querySelector('.table-container')) {
			console.log('Table already exists, skipping duplicate render');
			return;
		}
		
		// 创建响应式表格容器
		const tableContainer = container.createEl('div', { cls: 'table-container' });
		tableContainer.style.width = '100%';
		tableContainer.style.overflowX = 'auto';
		tableContainer.style.overflowY = 'auto';
		tableContainer.style.borderRadius = '5px';
		tableContainer.style.border = '1px solid var(--background-modifier-border)';
		tableContainer.style.maxHeight = 'calc(100vh - 400px)';
		
		// 设置容器高度用于虚拟滚动
		this.containerHeight = tableContainer.offsetHeight || 600;
		
		// 创建响应式表格
		const table = tableContainer.createEl('table', { cls: 'papers-table' });
		table.style.width = '100%';
		table.style.borderCollapse = 'collapse';
		table.style.backgroundColor = 'var(--background-primary)';
		table.style.tableLayout = 'fixed'; // 使用固定布局，确保列宽度稳定
		
		// 计算动态列宽度
		const containerWidth = tableContainer.offsetWidth || 1200; // 默认宽度
		const minColumnWidths = {
			title: 200,
			author: 120,
			year: 60,
			publisher: 150,
			level: 80,
			doi: 120,
			type: 60,
			mdFile: 80, // MD文件状态列
			size: 60,
			location: 120,
			tags: 100,
			refs: 60,
			added: 80,
			actions: 180 // 增加操作列宽度，确保按钮有足够空间
		};
		
		// 计算总的最小宽度
		const totalMinWidth = Object.values(minColumnWidths).reduce((sum, width) => sum + width, 0);
		
		// 如果容器宽度足够，使用百分比；否则使用最小宽度
		const usePercentage = containerWidth >= totalMinWidth;
		
		// 添加表格自适应提示
		const adaptiveHint = tableContainer.createEl('div', { 
			cls: 'adaptive-hint',
			text: usePercentage ? this.plugin.languageManager.t('views.mainView.tableAutoFitTip') : this.plugin.languageManager.t('views.mainView.tableScrollTip')
		});
		adaptiveHint.style.padding = '8px';
		adaptiveHint.style.fontSize = '12px';
		adaptiveHint.style.color = 'var(--text-muted)';
		adaptiveHint.style.textAlign = 'center';
		adaptiveHint.style.borderBottom = '1px solid var(--background-modifier-border)';
		adaptiveHint.style.backgroundColor = 'var(--background-secondary)';
		
		// 添加窗口大小变化监听器，动态调整表格
		let resizeTimeout: NodeJS.Timeout | null = null;
		const resizeObserver = new ResizeObserver(() => {
			// 使用防抖，避免频繁触发重新渲染
			if (resizeTimeout) {
				clearTimeout(resizeTimeout);
			}
			
			resizeTimeout = setTimeout(() => {
				const newContainerWidth = tableContainer.offsetWidth;
				const newUsePercentage = newContainerWidth >= totalMinWidth;
				
				// 只有在宽度变化足够大时才重新渲染
				const widthDifference = Math.abs(newContainerWidth - containerWidth);
				if (newUsePercentage !== usePercentage && widthDifference > 50) {
					console.log('Width changed significantly, re-rendering table');
					// 清理现有表格
					container.querySelectorAll('.table-container').forEach(el => el.remove());
					// 重新渲染表格以适应新的宽度
					this.renderListView(container);
				}
			}, 500); // 增加到500ms防抖延迟
		});
		resizeObserver.observe(tableContainer);
		
		// 注意：ResizeObserver会在DOM元素被移除时自动清理
		
		// 表头
		const thead = table.createEl('thead');
		const headerRow = thead.createEl('tr');
		
		// 动态设置列宽度
		const columns = [
			{ key: 'select', text: '☐', minWidth: 40 }, // 选择列
			{ key: 'title', text: 'Title', minWidth: minColumnWidths.title },
			{ key: 'author', text: 'Author', minWidth: minColumnWidths.author },
			{ key: 'year', text: 'Year', minWidth: minColumnWidths.year },
			{ key: 'publisher', text: 'Publisher', minWidth: minColumnWidths.publisher },
			{ key: 'level', text: 'Level', minWidth: minColumnWidths.level },
			{ key: 'doi', text: 'DOI', minWidth: minColumnWidths.doi },
			{ key: 'type', text: 'Type', minWidth: minColumnWidths.type },
			{ key: 'mdFile', text: 'MD File', minWidth: minColumnWidths.mdFile },
			{ key: 'size', text: 'Size', minWidth: minColumnWidths.size },
			{ key: 'location', text: 'Location', minWidth: minColumnWidths.location },
			{ key: 'tags', text: 'Tags', minWidth: minColumnWidths.tags },
			{ key: 'refs', text: 'Refs', minWidth: minColumnWidths.refs },
			{ key: 'added', text: 'Added', minWidth: minColumnWidths.added },
			{ key: 'actions', text: 'Actions', minWidth: minColumnWidths.actions }
		];
		
		columns.forEach((column, index) => {
			const th = headerRow.createEl('th', { text: column.text });
			th.style.padding = '8px 6px';
			th.style.borderBottom = '2px solid var(--background-modifier-border)';
			th.style.textAlign = 'left';
			th.style.fontSize = '12px';
			th.style.fontWeight = 'bold';
			th.style.position = 'relative'; // 为拖拽调节器定位
			
			// 为选择列添加全选功能
			if (index === 0) { // 第一列是选择列
				th.style.textAlign = 'center';
				th.innerHTML = ''; // 清空文本
				
				const selectAllCheckbox = th.createEl('input', { 
					type: 'checkbox',
					cls: 'select-all-checkbox'
				});
				selectAllCheckbox.style.cursor = 'pointer';
				selectAllCheckbox.checked = this.selectedRecords.size === this.filteredRecords.length;
				selectAllCheckbox.indeterminate = this.selectedRecords.size > 0 && this.selectedRecords.size < this.filteredRecords.length;
				
				selectAllCheckbox.addEventListener('change', (e) => {
					const target = e.target as HTMLInputElement;
					if (target.checked) {
						// 全选
						this.filteredRecords.forEach(record => {
							this.selectedRecords.add(record.id);
						});
					} else {
						// 取消全选
						this.selectedRecords.clear();
					}
					this.updateSelectionUI();
					this.refreshContent(); // 刷新内容以更新选择框状态
				});
			}
			
			if (usePercentage) {
				// 使用百分比宽度
				const percentage = (column.minWidth / totalMinWidth) * 100;
				th.style.width = `${percentage}%`;
			} else {
				// 使用最小宽度
				th.style.width = `${column.minWidth}px`;
			}

			// 添加列宽拖拽调节器
			const resizer = th.createEl('div', { cls: 'column-resizer' });
			resizer.style.cssText = `
				position: absolute;
				right: 0;
				top: 0;
				bottom: 0;
				width: 4px;
				background: transparent;
				cursor: col-resize;
				z-index: 10;
			`;
			
			// 拖拽调节列宽
			let isResizing = false;
			let startX = 0;
			let startWidth = 0;
			
			resizer.addEventListener('mousedown', (e) => {
				isResizing = true;
				startX = e.clientX;
				startWidth = th.offsetWidth;
				
				// 添加拖拽时的视觉反馈
				document.body.style.cursor = 'col-resize';
				document.body.style.userSelect = 'none';
				
				e.preventDefault();
			});
			
			document.addEventListener('mousemove', (e) => {
				if (!isResizing) return;
				
				const deltaX = e.clientX - startX;
				const newWidth = Math.max(50, startWidth + deltaX); // 最小宽度50px
				
				if (usePercentage) {
					// 计算新的百分比宽度
					const newPercentage = (newWidth / tableContainer.offsetWidth) * 100;
					th.style.width = `${newPercentage}%`;
				} else {
					th.style.width = `${newWidth}px`;
				}
				
				// 更新对应列的宽度
				this.updateColumnWidths(column.key, newWidth);
			});
			
			document.addEventListener('mouseup', () => {
				if (isResizing) {
					isResizing = false;
					document.body.style.cursor = '';
					document.body.style.userSelect = '';
				}
			});
		});

		// 表体
		const tbody = table.createEl('tbody');
		const currentPageRecords = this.getCurrentPageRecords();
		currentPageRecords.forEach(record => {
			const row = tbody.createEl('tr');
			row.style.borderBottom = '1px solid var(--background-modifier-border)';
			row.style.minHeight = '60px';
			row.style.verticalAlign = 'top';
			
			// 选择框列
			const selectCell = row.createEl('td');
			selectCell.style.padding = '8px 6px';
			selectCell.style.textAlign = 'center';
			selectCell.style.width = '40px';
			
			const selectCheckbox = selectCell.createEl('input', { type: 'checkbox' });
			selectCheckbox.style.cursor = 'pointer';
			selectCheckbox.checked = this.selectedRecords.has(record.id);
			selectCheckbox.addEventListener('change', (e) => {
				const target = e.target as HTMLInputElement;
				if (target.checked) {
					this.selectedRecords.add(record.id);
				} else {
					this.selectedRecords.delete(record.id);
				}
				this.updateSelectionUI();
			});
			
			// 标题
			const titleCell = row.createEl('td');
			titleCell.style.padding = '8px 6px';
			titleCell.style.wordWrap = 'break-word';
			titleCell.style.whiteSpace = 'normal';
			titleCell.style.lineHeight = '1.4';
			titleCell.style.maxHeight = '80px';
			titleCell.style.overflow = 'auto';
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.title / totalMinWidth) * 100;
				titleCell.style.width = `${percentage}%`;
			} else {
				titleCell.style.width = `${minColumnWidths.title}px`;
			}
			
			const titleLink = titleCell.createEl('a', { 
				text: record.title,
				href: '#',
				cls: 'paper-title-link'
			});
			titleLink.style.textDecoration = 'none';
			titleLink.style.color = 'var(--text-normal)';
			titleLink.style.cursor = 'pointer';
			titleLink.addEventListener('click', () => this.openPDF(record));
			
			// 添加右键菜单
			titleLink.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				this.showContextMenu(e, record.title, this.plugin.languageManager.t('views.mainView.titleColumn'));
			});

			// 作者
			const authorCell = row.createEl('td', { text: record.author || '-' });
			authorCell.style.padding = '8px 6px';
			authorCell.style.wordWrap = 'break-word';
			authorCell.style.whiteSpace = 'normal';
			authorCell.style.lineHeight = '1.4';
			authorCell.style.maxHeight = '60px';
			authorCell.style.overflow = 'auto';
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.author / totalMinWidth) * 100;
				authorCell.style.width = `${percentage}%`;
			} else {
				authorCell.style.width = `${minColumnWidths.author}px`;
			}
			
			// 添加右键菜单
			authorCell.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				this.showContextMenu(e, record.author || '-', this.plugin.languageManager.t('views.mainView.authorColumn'));
			});

			// 年份
			const yearCell = row.createEl('td', { text: record.year || '-' });
			yearCell.style.padding = '8px 6px';
			yearCell.style.textAlign = 'center';
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.year / totalMinWidth) * 100;
				yearCell.style.width = `${percentage}%`;
			} else {
				yearCell.style.width = `${minColumnWidths.year}px`;
			}

			// 发表机构
			const publisherCell = row.createEl('td');
			publisherCell.style.padding = '8px 6px';
			publisherCell.style.wordWrap = 'break-word';
			publisherCell.style.whiteSpace = 'normal';
			publisherCell.style.lineHeight = '1.4';
			publisherCell.style.maxHeight = '60px';
			publisherCell.style.overflow = 'auto';
			publisherCell.style.fontSize = '11px';
			publisherCell.style.color = 'var(--text-muted)';
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.publisher / totalMinWidth) * 100;
				publisherCell.style.width = `${percentage}%`;
			} else {
				publisherCell.style.width = `${minColumnWidths.publisher}px`;
			}
			
			if (record.publisher) {
				publisherCell.setText(record.publisher);
				publisherCell.title = record.publisher; // 完整信息提示
			} else {
				publisherCell.setText('-');
			}
			
			// 添加右键菜单
			publisherCell.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				this.showContextMenu(e, record.publisher || '-', this.plugin.languageManager.t('views.mainView.publisher'));
			});

			// 期刊等级
			const journalLevelCell = row.createEl('td');
			journalLevelCell.style.padding = '8px 6px';
			journalLevelCell.style.textAlign = 'center';
			journalLevelCell.style.fontSize = '11px';
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.level / totalMinWidth) * 100;
				journalLevelCell.style.width = `${percentage}%`;
			} else {
				journalLevelCell.style.width = `${minColumnWidths.level}px`;
			}
			
			if (record.journalLevel && record.journalLevel !== 'Other') {
				const levelSpan = journalLevelCell.createEl('span', { 
					text: record.journalLevel,
					cls: 'journal-level-badge'
				});
				levelSpan.style.padding = '2px 6px';
				levelSpan.style.backgroundColor = this.getJournalLevelColor(record.journalLevel);
				levelSpan.style.color = 'white';
				levelSpan.style.borderRadius = '3px';
				levelSpan.style.fontSize = '10px';
				levelSpan.style.fontWeight = 'bold';
				levelSpan.title = this.getJournalLevelDescription(record.journalLevel);
			} else {
				journalLevelCell.setText('-');
			}

			// DOI
			const doiCell = row.createEl('td');
			doiCell.style.padding = '8px 6px';
			doiCell.style.wordWrap = 'break-word';
			doiCell.style.whiteSpace = 'normal';
			doiCell.style.lineHeight = '1.4';
			doiCell.style.maxHeight = '60px';
			doiCell.style.overflow = 'auto';
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.doi / totalMinWidth) * 100;
				doiCell.style.width = `${percentage}%`;
			} else {
				doiCell.style.width = `${minColumnWidths.doi}px`;
			}
			
			if (record.doi) {
				const doiLink = doiCell.createEl('a', { 
					text: record.doi,
					href: `https://doi.org/${record.doi}`
				});
				doiLink.setAttribute('target', '_blank');
				doiLink.style.textDecoration = 'none';
				doiLink.style.color = 'var(--text-accent)';
				doiLink.style.cursor = 'pointer';
				
				// 添加右键菜单
				doiLink.addEventListener('contextmenu', (e) => {
					e.preventDefault();
					this.showContextMenu(e, record.doi, 'DOI');
				});
			} else {
				doiCell.setText('-');
			}

			// 文件类型
			const fileTypeCell = row.createEl('td');
			fileTypeCell.style.padding = '8px 6px';
			fileTypeCell.style.textAlign = 'center';
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.type / totalMinWidth) * 100;
				fileTypeCell.style.width = `${percentage}%`;
			} else {
				fileTypeCell.style.width = `${minColumnWidths.type}px`;
			}
			
			if (record.fileType) {
				const fileTypeSpan = fileTypeCell.createEl('span', { 
					text: record.fileType.toUpperCase(),
					cls: 'file-type-badge'
				});
				fileTypeSpan.style.padding = '2px 4px';
				fileTypeSpan.style.backgroundColor = 'var(--background-modifier-border)';
				fileTypeSpan.style.borderRadius = '3px';
				fileTypeSpan.style.fontSize = '10px';
				fileTypeSpan.style.fontWeight = 'bold';
			} else {
				fileTypeCell.setText('-');
			}

			// MD文件状态列
			const mdFileCell = row.createEl('td');
			mdFileCell.style.padding = '8px 6px';
			mdFileCell.style.textAlign = 'center';
			mdFileCell.style.fontSize = '11px';
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.mdFile / totalMinWidth) * 100;
				mdFileCell.style.width = `${percentage}%`;
			} else {
				mdFileCell.style.width = `${minColumnWidths.mdFile}px`;
			}
			
			if (record.hasMDFile && !record.mdFileLost) {
				// MD文件存在且未丢失
				const mdStatusSpan = mdFileCell.createEl('span', { 
					text: '✓',
					cls: 'md-file-status'
				});
				mdStatusSpan.style.padding = '2px 6px';
				mdStatusSpan.style.backgroundColor = 'var(--text-success)';
				mdStatusSpan.style.color = 'white';
				mdStatusSpan.style.borderRadius = '3px';
				mdStatusSpan.style.fontSize = '10px';
				mdStatusSpan.style.fontWeight = 'bold';
				mdStatusSpan.title = `MD文件: ${record.mdFilePath}`;
				
				// 添加点击事件，可以打开MD文件
				mdStatusSpan.style.cursor = 'pointer';
				mdStatusSpan.addEventListener('click', () => {
					if (record.mdFilePath) {
						const mdFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
						if (mdFile instanceof TFile) {
							this.app.workspace.openLinkText('', record.mdFilePath, true);
						} else {
							// 文件不存在，触发丢失处理逻辑
							this.handleLostMDFile(record);
						}
					}
				});
			} else if (record.mdFileLost) {
				// MD文件丢失状态
				const lostMdSpan = mdFileCell.createEl('span', { 
					text: '⚠️',
					cls: 'md-file-lost'
				});
				lostMdSpan.style.padding = '2px 6px';
				lostMdSpan.style.backgroundColor = 'var(--background-modifier-error)';
				lostMdSpan.style.color = 'white';
				lostMdSpan.style.borderRadius = '3px';
				lostMdSpan.style.fontSize = '10px';
				lostMdSpan.style.fontWeight = 'bold';
				lostMdSpan.title = this.plugin.languageManager.t('views.mainView.mdFileLostClickToHandle');
				
				// 添加点击事件，触发丢失处理逻辑
				lostMdSpan.style.cursor = 'pointer';
				lostMdSpan.addEventListener('click', () => {
					this.handleLostMDFile(record);
				});
			} else {
				// 无MD文件
				const noMdSpan = mdFileCell.createEl('span', { 
					text: '✗',
					cls: 'md-file-status'
				});
				noMdSpan.style.padding = '2px 6px';
				noMdSpan.style.backgroundColor = 'var(--text-muted)';
				noMdSpan.style.color = 'white';
				noMdSpan.style.borderRadius = '3px';
				noMdSpan.style.fontSize = '10px';
				noMdSpan.style.fontWeight = 'bold';
				noMdSpan.title = this.plugin.languageManager.t('views.mainView.noMDFile');
			}

			// 文件大小
			const fileSizeCell = row.createEl('td');
			fileSizeCell.style.padding = '8px 6px';
			fileSizeCell.style.width = '4%';
			fileSizeCell.style.textAlign = 'center';
			fileSizeCell.style.fontSize = '11px';
			if (record.fileSize) {
				fileSizeCell.setText(this.formatFileSize(record.fileSize));
			} else {
				fileSizeCell.setText('-');
			}

			// 存储位置
			const locationCell = row.createEl('td');
			locationCell.style.padding = '8px 6px';
			locationCell.style.width = '9%';
			locationCell.style.fontSize = '11px';
			locationCell.style.color = 'var(--text-muted)';
			locationCell.style.wordWrap = 'break-word'; // 允许长单词换行
			locationCell.style.whiteSpace = 'normal'; // 允许换行
			locationCell.style.lineHeight = '1.4'; // 设置行高
			locationCell.style.maxHeight = '60px'; // 设置最大高度
			locationCell.style.overflow = 'auto'; // 内容过多时显示滚动条
			
			if (record.filePath) {
				// 显示相对路径，去掉文件名
				const pathParts = record.filePath.split('/');
				if (pathParts.length > 1) {
					pathParts.pop(); // 移除文件名
					const directory = pathParts.join('/');
					locationCell.setText(directory || this.plugin.languageManager.t('views.mainView.rootDirectory'));
				} else {
					locationCell.setText(this.plugin.languageManager.t('views.mainView.rootDirectory'));
				}
				
				// 添加完整路径提示
				locationCell.title = record.filePath;
			} else {
				locationCell.setText('-');
			}
			
			// 添加右键菜单
			locationCell.addEventListener('contextmenu', (e) => {
				e.preventDefault();
						const displayText = record.filePath ? (record.filePath.split('/').slice(0, -1).join('/') || this.plugin.languageManager.t('views.mainView.rootDirectory')) : '-';
		this.showContextMenu(e, displayText, this.plugin.languageManager.t('views.mainView.location'));
			});

			// 标签
			const tagsCell = row.createEl('td');
			tagsCell.style.padding = '8px 6px';
			tagsCell.style.width = '7%';
			tagsCell.style.wordWrap = 'break-word'; // 允许长单词换行
			tagsCell.style.whiteSpace = 'normal'; // 允许换行
			tagsCell.style.lineHeight = '1.4'; // 设置行高
			tagsCell.style.maxHeight = '60px'; // 设置最大高度
			tagsCell.style.overflow = 'auto'; // 内容过多时显示滚动条
			
			if (record.tags && record.tags.length > 0) {
				record.tags.forEach(tag => {
					const tagSpan = tagsCell.createEl('span', { 
						text: tag,
						cls: 'tag'
					});
					tagSpan.style.marginRight = '3px';
					tagSpan.style.padding = '1px 4px';
					tagSpan.style.backgroundColor = 'var(--background-modifier-border)';
					tagSpan.style.borderRadius = '3px';
					tagSpan.style.fontSize = '10px';
					tagSpan.style.cursor = 'pointer';
					
					// 为每个标签添加右键菜单
					tagSpan.addEventListener('contextmenu', (e) => {
						e.preventDefault();
						this.showContextMenu(e, tag, this.plugin.languageManager.t('views.mainView.tags'));
					});
				});
			} else {
				tagsCell.setText('-');
			}

			// 引用次数
			const refCell = row.createEl('td');
			refCell.style.padding = '8px 6px';
			refCell.style.width = '4%';
			refCell.style.textAlign = 'center';
			
			if (record.referenceCount > 0) {
				// 创建可点击的引用计数
				const refLink = refCell.createEl('a', { 
					text: record.referenceCount.toString(),
					href: '#',
					cls: 'reference-count-link'
				});
				refLink.style.cursor = 'pointer';
				refLink.style.textDecoration = 'underline';
				refLink.style.color = 'var(--text-accent)';
				
				refLink.addEventListener('click', () => {
					this.showReferenceList(record);
				});
			} else {
				refCell.setText('0');
			}

			// 添加时间
			const timeCell = row.createEl('td', { 
				text: new Date(record.addedTime).toLocaleDateString() 
			});
			timeCell.style.padding = '8px 6px';
			timeCell.style.width = '5%';
			timeCell.style.fontSize = '11px';

			// 操作按钮
			const actionsCell = row.createEl('td');
			actionsCell.style.padding = '8px 4px'; // 减少padding，为按钮留出更多空间
			actionsCell.style.textAlign = 'center';
			actionsCell.style.verticalAlign = 'middle'; // 垂直居中对齐
			actionsCell.style.overflow = 'visible'; // 允许内容溢出，避免被截断
			
			// 设置列宽度
			if (usePercentage) {
				const percentage = (minColumnWidths.actions / totalMinWidth) * 100;
				actionsCell.style.width = `${percentage}%`;
			} else {
				actionsCell.style.width = `${minColumnWidths.actions}px`;
			}

			const actionsContainer = actionsCell.createEl('div', { cls: 'row-actions' });
			actionsContainer.style.display = 'flex';
			actionsContainer.style.gap = '4px'; // 减少按钮间距
			actionsContainer.style.justifyContent = 'center';
			actionsContainer.style.flexWrap = 'wrap'; // 允许按钮换行
			actionsContainer.style.alignItems = 'center';

			// 打开按钮
			const openBtn = actionsContainer.createEl('button', { 
				text: 'Open',
				cls: 'mod-cta'
			});
			openBtn.style.fontSize = '11px'; // 减小字体
			openBtn.style.padding = '3px 6px'; // 减少padding
			openBtn.style.minWidth = '40px'; // 设置最小宽度
			openBtn.style.maxWidth = '50px'; // 设置最大宽度
			openBtn.style.overflow = 'hidden'; // 隐藏溢出内容
			openBtn.style.textOverflow = 'ellipsis'; // 文本溢出时显示省略号
			openBtn.style.whiteSpace = 'nowrap'; // 文本不换行
			openBtn.addEventListener('click', () => this.openPDF(record));

			// 引用按钮
			const citeBtn = actionsContainer.createEl('button', { 
				text: 'Cite',
				cls: 'mod-cta'
			});
			citeBtn.style.fontSize = '11px';
			citeBtn.style.padding = '3px 6px';
			citeBtn.style.minWidth = '40px';
			citeBtn.style.maxWidth = '50px';
			citeBtn.style.overflow = 'hidden';
			citeBtn.style.textOverflow = 'ellipsis';
			citeBtn.style.whiteSpace = 'nowrap';
			citeBtn.addEventListener('click', () => this.showCitationMenu(record, citeBtn));

			// 编辑按钮
			const editBtn = actionsContainer.createEl('button', { 
				text: 'Edit',
				cls: 'mod-cta'
			});
			editBtn.style.fontSize = '11px';
			editBtn.style.padding = '3px 6px';
			editBtn.style.minWidth = '40px';
			editBtn.style.maxWidth = '50px';
			editBtn.style.overflow = 'hidden';
			editBtn.style.textOverflow = 'ellipsis';
			editBtn.style.whiteSpace = 'nowrap';
			editBtn.addEventListener('click', () => this.editRecord(record));

			// MD文件管理按钮
			if (this.plugin.settings.enableAutoMDCreation) {
				if (record.hasMDFile) {
					// 如果已有MD文件，显示删除按钮
					const deleteMdBtn = actionsContainer.createEl('button', { 
						text: 'Del MD',
						cls: 'mod-warning'
					});
					deleteMdBtn.style.fontSize = '11px';
					deleteMdBtn.style.padding = '3px 6px';
					deleteMdBtn.style.minWidth = '40px';
					deleteMdBtn.style.maxWidth = '50px';
					deleteMdBtn.style.overflow = 'hidden';
					deleteMdBtn.style.textOverflow = 'ellipsis';
					deleteMdBtn.style.whiteSpace = 'nowrap';
					deleteMdBtn.title = this.plugin.languageManager.t('views.mainView.deleteMDFile');
					deleteMdBtn.addEventListener('click', () => this.deleteMDFile(record));
				} else {
					// 如果没有MD文件，显示创建按钮
					const createMdBtn = actionsContainer.createEl('button', { 
						text: 'Add MD',
						cls: 'mod-cta'
					});
					createMdBtn.style.fontSize = '11px';
					createMdBtn.style.padding = '3px 6px';
					createMdBtn.style.minWidth = '40px';
					createMdBtn.style.maxWidth = '50px';
					createMdBtn.style.overflow = 'hidden';
					createMdBtn.style.textOverflow = 'ellipsis';
					createMdBtn.style.whiteSpace = 'nowrap';
					createMdBtn.title = this.plugin.languageManager.t('views.mainView.createMDFile');
					createMdBtn.addEventListener('click', () => this.createMDFile(record));
				}
			}

			// 重新导入按钮（如果PDF文件不存在）
			const file = this.plugin.app.vault.getAbstractFileByPath(record.filePath);
			if (!(file instanceof TFile)) {
				const reimportBtn = actionsContainer.createEl('button', { 
					text: 'Re-import',
					cls: 'mod-warning'
				});
				reimportBtn.style.fontSize = '11px';
				reimportBtn.style.padding = '3px 6px';
				reimportBtn.style.minWidth = '40px';
				reimportBtn.style.maxWidth = '50px';
				reimportBtn.style.overflow = 'hidden';
				reimportBtn.style.textOverflow = 'ellipsis';
				reimportBtn.style.whiteSpace = 'nowrap';
				reimportBtn.addEventListener('click', () => this.reimportPDF(record));
			}

			// 删除按钮
			const deleteBtn = actionsContainer.createEl('button', { 
				text: 'Delete',
				cls: 'mod-warning'
			});
			deleteBtn.style.fontSize = '11px';
			deleteBtn.style.padding = '3px 6px';
			deleteBtn.style.minWidth = '40px';
			deleteBtn.style.maxWidth = '50px';
			deleteBtn.style.overflow = 'hidden';
			deleteBtn.style.textOverflow = 'ellipsis';
			deleteBtn.style.whiteSpace = 'nowrap';
			deleteBtn.addEventListener('click', () => this.deleteRecord(record));
		});
	}



	renderCardView(container: HTMLElement) {
		const cardsContainer = container.createEl('div', { cls: 'cards-container' });
		cardsContainer.style.display = 'grid';
		cardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))'; // 增加最小宽度
		cardsContainer.style.gap = '20px';
		cardsContainer.style.padding = '20px';
		cardsContainer.style.boxSizing = 'border-box';

		const currentPageRecords = this.getCurrentPageRecords();
		currentPageRecords.forEach(record => {
			const card = cardsContainer.createEl('div', { cls: 'paper-card' });
			card.style.backgroundColor = 'var(--background-secondary)';
			card.style.borderRadius = '8px';
			card.style.padding = '20px';
			card.style.border = '1px solid var(--background-modifier-border)';
			card.style.transition = 'transform 0.2s, box-shadow 0.2s';
			card.style.boxSizing = 'border-box'; // 确保padding和border包含在宽度内
			card.style.overflow = 'hidden'; // 隐藏溢出内容
			card.style.minHeight = '200px'; // 设置最小高度
			card.style.maxHeight = '400px'; // 设置最大高度

			card.addEventListener('mouseenter', () => {
				card.style.transform = 'translateY(-2px)';
				card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
			});

			card.addEventListener('mouseleave', () => {
				card.style.transform = 'translateY(0)';
				card.style.boxShadow = 'none';
			});

			// 标题
			const title = card.createEl('h3', { text: record.title });
			title.style.margin = '0 0 10px 0';
			title.style.color = 'var(--text-accent)';
			title.style.cursor = 'pointer';
			title.style.wordWrap = 'break-word'; // 允许长单词换行
			title.style.overflowWrap = 'break-word'; // 现代浏览器的换行属性
			title.style.maxWidth = '100%'; // 确保不超出容器宽度
			title.style.fontSize = '16px'; // 设置合适的字体大小
			title.style.lineHeight = '1.3'; // 设置合适的行高
			title.style.overflow = 'hidden'; // 隐藏溢出内容
			title.style.textOverflow = 'ellipsis'; // 文本溢出时显示省略号
			title.style.display = '-webkit-box'; // 使用webkit box布局
			title.style.webkitLineClamp = '3'; // 最多显示3行
			title.style.webkitBoxOrient = 'vertical'; // 垂直方向排列
			title.addEventListener('click', () => this.openPDF(record));

			// 作者
			if (record.author) {
				const author = card.createEl('p', { text: `By: ${record.author}` });
				author.style.margin = '5px 0';
				author.style.color = 'var(--text-muted)';
				author.style.wordWrap = 'break-word';
				author.style.overflowWrap = 'break-word';
				author.style.maxWidth = '100%';
				author.style.overflow = 'hidden';
				author.style.textOverflow = 'ellipsis';
				author.style.whiteSpace = 'nowrap';
			}

			// 年份
			if (record.year) {
				const year = card.createEl('p', { text: `Year: ${record.year}` });
				year.style.margin = '5px 0';
				year.style.color = 'var(--text-muted)';
			}

			// 发表机构
			if (record.publisher) {
				const publisher = card.createEl('p', { text: `Publisher: ${record.publisher}` });
				publisher.style.margin = '5px 0';
				publisher.style.color = 'var(--text-muted)';
				publisher.style.fontSize = '12px';
				publisher.style.wordWrap = 'break-word';
				publisher.style.overflowWrap = 'break-word';
				publisher.style.maxWidth = '100%';
				publisher.style.overflow = 'hidden';
				publisher.style.textOverflow = 'ellipsis';
				publisher.style.whiteSpace = 'nowrap';
			}

			// DOI
			if (record.doi) {
				const doi = card.createEl('p');
				doi.style.margin = '5px 0';
				doi.style.wordWrap = 'break-word';
				doi.style.overflowWrap = 'break-word';
				doi.style.maxWidth = '100%';
				doi.style.overflow = 'hidden';
				doi.style.textOverflow = 'ellipsis';
				doi.style.whiteSpace = 'nowrap';
				
				const doiLink = doi.createEl('a', { 
					text: `DOI: ${record.doi}`,
					href: `https://doi.org/${record.doi}`
				});
				doiLink.setAttribute('target', '_blank');
				doiLink.style.color = 'var(--text-accent)';
				doiLink.style.wordBreak = 'break-all'; // 允许在任意字符处换行
			}

			// MD文件状态
			const mdFileStatus = card.createEl('div', { cls: 'md-file-status' });
			mdFileStatus.style.margin = '10px 0';
			mdFileStatus.style.display = 'flex';
			mdFileStatus.style.alignItems = 'center';
			mdFileStatus.style.gap = '8px';
			
			if (record.hasMDFile && !record.mdFileLost) {
				// MD文件存在且未丢失
				const mdIcon = mdFileStatus.createEl('span', { text: '✓' });
				mdIcon.style.color = 'var(--text-success)';
				mdIcon.style.fontWeight = 'bold';
				mdIcon.style.fontSize = '14px';
				
				const mdText = mdFileStatus.createEl('span', { text: this.plugin.languageManager.t('views.mainView.mdFileCreated') });
				mdText.style.color = 'var(--text-success)';
				mdText.style.fontSize = '12px';
				
				// 添加点击事件，可以打开MD文件
				mdFileStatus.style.cursor = 'pointer';
				mdFileStatus.title = `点击打开MD文件: ${record.mdFilePath}`;
				mdFileStatus.addEventListener('click', () => {
					if (record.mdFilePath) {
						const mdFile = this.app.vault.getAbstractFileByPath(record.mdFilePath);
						if (mdFile instanceof TFile) {
							this.app.workspace.openLinkText('', record.mdFilePath, true);
						} else {
							// 文件不存在，触发丢失处理逻辑
							this.handleLostMDFile(record);
						}
					}
				});
			} else if (record.mdFileLost) {
				// MD文件丢失状态
				const mdIcon = mdFileStatus.createEl('span', { text: '⚠️' });
				mdIcon.style.color = 'var(--background-modifier-error)';
				mdIcon.style.fontWeight = 'bold';
				mdIcon.style.fontSize = '14px';
				
				const mdText = mdFileStatus.createEl('span', { text: this.plugin.languageManager.t('views.mainView.mdFileLostClickToHandle') });
				mdText.style.color = 'var(--background-modifier-error)';
				mdText.style.fontSize = '12px';
				
				// 添加点击事件，触发丢失处理逻辑
				mdFileStatus.style.cursor = 'pointer';
				mdFileStatus.title = this.plugin.languageManager.t('views.mainView.mdFileLostClickToHandle');
				mdFileStatus.addEventListener('click', () => {
					this.handleLostMDFile(record);
				});
			} else {
				// 无MD文件
				const mdIcon = mdFileStatus.createEl('span', { text: '✗' });
				mdIcon.style.color = 'var(--text-muted)';
				mdIcon.style.fontWeight = 'bold';
				mdIcon.style.fontSize = '14px';
				
				const mdText = mdFileStatus.createEl('span', { text: this.plugin.languageManager.t('views.mainView.noMDFile') });
				mdText.style.color = 'var(--text-muted)';
				mdText.style.fontSize = '12px';
			}

			// 文件类型和大小
			const fileInfo = card.createEl('p');
			fileInfo.style.margin = '5px 0';
			fileInfo.style.color = 'var(--text-muted)';
			fileInfo.style.fontSize = '12px';
			
			if (record.fileType) {
				const fileTypeSpan = fileInfo.createEl('span', { 
					text: record.fileType.toUpperCase(),
					cls: 'file-type-badge'
				});
				fileTypeSpan.style.padding = '2px 6px';
				fileTypeSpan.style.backgroundColor = 'var(--background-modifier-border)';
				fileTypeSpan.style.borderRadius = '3px';
				fileTypeSpan.style.marginRight = '8px';
			}
			
			if (record.fileSize) {
				fileInfo.createEl('span', { text: `Size: ${this.formatFileSize(record.fileSize)}` });
			}

			// 存储位置
			if (record.filePath) {
				const locationInfo = card.createEl('p');
				locationInfo.style.margin = '5px 0';
				locationInfo.style.color = 'var(--text-muted)';
				locationInfo.style.fontSize = '12px';
				locationInfo.style.wordWrap = 'break-word';
				locationInfo.style.overflowWrap = 'break-word';
				locationInfo.style.maxWidth = '100%';
				locationInfo.style.overflow = 'hidden';
				locationInfo.style.textOverflow = 'ellipsis';
				locationInfo.style.whiteSpace = 'nowrap';
				
				// 显示相对路径，去掉文件名
				const pathParts = record.filePath.split('/');
				if (pathParts.length > 1) {
					pathParts.pop(); // 移除文件名
					const directory = pathParts.join('/');
					locationInfo.setText(`${this.plugin.languageManager.t('views.mainView.location')}: ${directory || this.plugin.languageManager.t('views.mainView.rootDirectory')}`);
				} else {
					locationInfo.setText(`${this.plugin.languageManager.t('views.mainView.location')}: ${this.plugin.languageManager.t('views.mainView.rootDirectory')}`);
				}
				
				// 添加完整路径提示
				locationInfo.title = record.filePath;
			}

			// 标签
			if (record.tags && record.tags.length > 0) {
				const tagsContainer = card.createEl('div', { cls: 'card-tags' });
				tagsContainer.style.margin = '10px 0';
				record.tags.forEach(tag => {
					const tagSpan = tagsContainer.createEl('span', { text: tag });
					tagSpan.style.display = 'inline-block';
					tagSpan.style.margin = '2px 4px';
					tagSpan.style.padding = '4px 8px';
					tagSpan.style.backgroundColor = 'var(--background-modifier-border)';
					tagSpan.style.borderRadius = '4px';
					tagSpan.style.fontSize = '12px';
				});
			}

			// 统计信息
			const stats = card.createEl('div', { cls: 'card-stats' });
			stats.style.margin = '15px 0';
			stats.style.padding = '10px';
			stats.style.backgroundColor = 'var(--background-primary)';
			stats.style.borderRadius = '4px';
			stats.style.fontSize = '12px';
			stats.style.color = 'var(--text-muted)';

			stats.innerHTML = `
				<div>References: ${record.referenceCount}</div>
				<div>Added: ${new Date(record.addedTime).toLocaleDateString()}</div>
			`;
			
			// 如果有关引用，添加点击展开功能
			if (record.referenceCount > 0) {
				const refDiv = stats.querySelector('div');
				if (refDiv) {
					refDiv.style.cursor = 'pointer';
					refDiv.style.textDecoration = 'underline';
					refDiv.style.color = 'var(--text-accent)';
					refDiv.addEventListener('click', () => {
						this.showReferenceList(record);
					});
				}
			}

					// 操作按钮
		const actions = card.createEl('div', { cls: 'card-actions' });
		actions.style.display = 'flex';
		actions.style.gap = '8px';
		actions.style.marginTop = '15px';

		new ButtonComponent(actions)
			.setButtonText('Open')
			.setClass('mod-cta')
			.onClick(() => this.openPDF(record));

		new ButtonComponent(actions)
			.setButtonText('Cite')
			.setClass('mod-cta')
			.onClick(() => this.showCitationMenu(record, actions));

		new ButtonComponent(actions)
			.setButtonText('Edit')
			.setClass('mod-cta')
			.onClick(() => this.editRecord(record));

		// MD文件管理按钮
		if (this.plugin.settings.enableAutoMDCreation) {
			if (record.hasMDFile) {
				// 如果已有MD文件，显示删除按钮
				new ButtonComponent(actions)
					.setButtonText('Del MD')
					.setClass('mod-warning')
					.onClick(() => this.deleteMDFile(record));
			} else {
				// 如果没有MD文件，显示创建按钮
				new ButtonComponent(actions)
					.setButtonText('Add MD')
					.setClass('mod-cta')
					.onClick(() => this.createMDFile(record));
			}
		}

		// 重新导入按钮（如果PDF文件不存在）
		const file = this.plugin.app.vault.getAbstractFileByPath(record.filePath);
		if (!(file instanceof TFile)) {
			new ButtonComponent(actions)
				.setButtonText('Re-import')
				.setClass('mod-warning')
				.onClick(() => this.reimportPDF(record));
		}
		});
	}

	switchView(view: 'table' | 'cards' | 'preview') {
		console.log('Switching to view:', view);
		this.currentView = view;
		// 只重新渲染主要内容，而不是整个界面
		const mainContent = this.contentEl.querySelector('.main-content') as HTMLElement;
		if (mainContent) {
			this.renderMainContent(mainContent);
		} else {
			// 如果找不到主内容区域，则重新渲染整个界面
			this.render();
		}
	}

	applyFiltersAndSort() {
		// 清除之前的防抖定时器
		if (this.refreshTimeout) {
			clearTimeout(this.refreshTimeout);
		}
		
		// 立即应用过滤和排序
		this.doApplyFiltersAndSort();
		
		// 延迟刷新视图，避免频繁更新
		this.refreshTimeout = setTimeout(() => {
			this.refreshContent();
		}, 300); // 300ms防抖
	}
	
	// 实际执行过滤和排序的方法
	private doApplyFiltersAndSort() {
		let filteredRecords = [...this.records];

		// 应用搜索过滤
		if (this.searchQuery) {
			const query = this.searchQuery.toLowerCase();
			filteredRecords = filteredRecords.filter(record =>
				record.title.toLowerCase().includes(query) ||
				record.author.toLowerCase().includes(query) ||
				record.doi.toLowerCase().includes(query) ||
				record.tags.some(tag => tag.toLowerCase().includes(query)) ||
				(record.fileType && record.fileType.toLowerCase().includes(query))
			);
		}

		// 应用标签过滤
		if (this.filterTags.length > 0) {
			filteredRecords = filteredRecords.filter(record =>
				this.filterTags.some(tag => record.tags.includes(tag))
			);
		}

		// 应用文件类型过滤
		if (this.filterFileTypes.length > 0) {
			filteredRecords = filteredRecords.filter(record =>
				this.filterFileTypes.some(fileType => record.fileType === fileType)
			);
		}

		// 应用排序
		filteredRecords.sort((a, b) => {
			let aValue: any, bValue: any;

			switch (this.sortBy) {
				case 'title':
					aValue = a.title.toLowerCase();
					bValue = b.title.toLowerCase();
					break;
				case 'author':
					aValue = a.author.toLowerCase();
					bValue = b.author.toLowerCase();
					break;
				case 'year':
					aValue = parseInt(a.year) || 0;
					bValue = parseInt(b.year) || 0;
					break;
				case 'addedTime':
					aValue = new Date(a.addedTime).getTime();
					bValue = new Date(b.addedTime).getTime();
					break;
				case 'referenceCount':
					aValue = a.referenceCount;
					bValue = b.referenceCount;
					break;
				case 'fileType':
					aValue = a.fileType?.toLowerCase() || '';
					bValue = b.fileType?.toLowerCase() || '';
					break;
				case 'fileSize':
					aValue = a.fileSize || 0;
					bValue = b.fileSize || 0;
					break;
				default:
					return 0;
			}

			if (this.sortOrder === 'asc') {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		this.filteredRecords = filteredRecords;
		
		// 更新分页信息
		this.updatePagination();
	}

	async openPDF(record: AttachmentRecord) {
		try {
			const file = this.plugin.app.vault.getAbstractFileByPath(record.filePath);
			if (file instanceof TFile) {
				await this.plugin.app.workspace.getLeaf().openFile(file);
			} else {
				// 显示更友好的提示，并提供重新导入选项
				const notice = new Notice(this.plugin.languageManager.t('notices.PDFNotFound'), 5000);
				notice.noticeEl.addEventListener('click', () => {
					this.reimportPDF(record);
				});
				notice.noticeEl.style.cursor = 'pointer';
				notice.noticeEl.style.textDecoration = 'underline';
			}
		} catch (error) {
			console.error('Error opening PDF:', error);
			new Notice(this.plugin.languageManager.t('notices.failedToOpenPDF'));
		}
	}

	showCitationMenu(record: AttachmentRecord, target: HTMLElement) {
		const menu = new Menu();
		
		menu.addItem((item: any) => {
			item.setTitle('Copy APA Citation')
				.setIcon('copy')
				.onClick(() => {
					const citation = this.plugin.pdfProcessor.generateCitation(record, 'apa');
					navigator.clipboard.writeText(citation);
					new Notice(this.plugin.languageManager.t('notices.APACopied'));
				});
		});

		menu.addItem((item: any) => {
			item.setTitle('Copy MLA Citation')
				.setIcon('copy')
				.onClick(() => {
					const citation = this.plugin.pdfProcessor.generateCitation(record, 'mla');
					new Notice(this.plugin.languageManager.t('notices.MLACopied'));
				});
		});

		menu.addItem((item: any) => {
			item.setTitle('Copy BibTeX')
				.setIcon('copy')
				.onClick(() => {
					const bibtex = this.plugin.pdfProcessor.generateBibTeX(record);
					navigator.clipboard.writeText(bibtex);
					new Notice(this.plugin.languageManager.t('notices.BibTeXCopied'));
				});
		});

		menu.addItem((item: any) => {
			item.setTitle('Copy DOI Link')
				.setIcon('link')
				.onClick(() => {
					const doiLink = this.plugin.doiExtractor.generateDOILink(record.doi);
					navigator.clipboard.writeText(doiLink);
					new Notice(this.plugin.languageManager.t('notices.DOILinkCopied'));
				});
		});

		menu.showAtPosition({ x: target.getBoundingClientRect().left, y: target.getBoundingClientRect().bottom });
	}

	editRecord(record: AttachmentRecord) {
		new EditModal(this.app, this.plugin, record, async (updatedRecord) => {
			// 更新记录后重新加载和渲染
			await this.loadRecords();
			this.refreshContent();
		}).open();
	}

	async deleteRecord(record: AttachmentRecord) {
		if (confirm(`Are you sure you want to delete "${record.title}"?`)) {
			try {
				await this.plugin.database.deleteRecord(record.id);
				await this.loadRecords();
				this.refreshContent();
				new Notice(this.plugin.languageManager.t('notices.recordDeleted'));
			} catch (error) {
				console.error('Error deleting record:', error);
				new Notice(this.plugin.languageManager.t('notices.recordDeleteFailed'));
			}
		}
	}

	// 重新导入PDF文件
	async reimportPDF(record: AttachmentRecord) {
		try {
			// 打开导入模态框，预填充现有记录信息
			new (require('../modals/ImportModal').ImportModal)(this.plugin.app, this.plugin, record).open();
		} catch (error) {
			console.error('Error opening reimport modal:', error);
			new Notice(this.plugin.languageManager.t('notices.reimportModalFailed'));
		}
	}

	// 获取唯一的文件类型列表
	private getUniqueFileTypes(): string[] {
		const fileTypes = new Set<string>();
		this.records.forEach(record => {
			if (record.fileType) {
				fileTypes.add(record.fileType);
			}
		});
		return Array.from(fileTypes).sort();
	}

	// 格式化文件大小
	private formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	// 获取文件类型统计
	private getFileTypeStats(): string {
		const fileTypeCounts: Record<string, number> = {};
		this.filteredRecords.forEach(record => {
			if (record.fileType) {
				fileTypeCounts[record.fileType] = (fileTypeCounts[record.fileType] || 0) + 1;
			}
		});
		
		return Object.entries(fileTypeCounts)
			.map(([type, count]) => `${type.toUpperCase()}: ${count}`)
			.join(', ');
	}

	/**
	 * 创建MD文件
	 */
	private async createMDFile(record: AttachmentRecord): Promise<void> {
		try {
			await this.plugin.attachmentTagManager.createMDFile(record);
			new Notice(`已为 ${record.title} 创建MD文件`);
			// 刷新视图以显示更新后的状态
			this.render();
		} catch (error) {
			console.error('Error creating MD file:', error);
			new Notice(this.plugin.languageManager.t('views.mainView.createMDFileFailed', { message: error.message }));
		}
	}

	/**
	 * 处理丢失的MD文件
	 */
	private async handleLostMDFile(record: AttachmentRecord): Promise<void> {
		new LostMDFileModal(this.app, this.plugin, record, async (resolvedRecord, action) => {
			// 处理完成后刷新界面
			await this.loadRecords();
			this.refreshContent();
			
			if (action === 'reassign') {
				new Notice(`已重新指认 ${resolvedRecord.title} 的MD文件路径`);
			} else if (action === 'recreate') {
				new Notice(`已为 ${resolvedRecord.title} 创建新的MD文件`);
			}
		}).open();
	}

	/**
	 * 删除MD文件
	 */
	private async deleteMDFile(record: AttachmentRecord): Promise<void> {
		try {
			await this.plugin.attachmentTagManager.deleteMDFile(record);
			// 更新记录状态
			record.hasMDFile = false;
			record.mdFilePath = undefined;
			await this.plugin.database.updateRecord(record);
			new Notice(`已删除 ${record.title} 的MD文件`);
			// 刷新视图以显示更新后的状态
			this.render();
		} catch (error) {
			console.error('Error deleting MD file:', error);
			new Notice(this.plugin.languageManager.t('views.mainView.deleteMDFileFailed', { message: error.message }));
		}
	}

	// 显示引用列表
	private showReferenceList(record: AttachmentRecord) {
		if (!record.references || record.references.length === 0) {
			new Notice(this.plugin.languageManager.t('notices.noReferencesFound'));
			return;
		}

		// 创建引用列表模态框
		const modal = new (require('obsidian').Modal)(this.app);
		modal.titleEl.setText(`References for: ${record.title}`);
		
		const content = modal.contentEl;
		content.style.padding = '20px';
		
		// 创建引用列表
		const referencesList = content.createEl('div', { cls: 'references-list' });
		
		record.references.forEach((ref, index) => {
			const refItem = referencesList.createEl('div', { cls: 'reference-item' });
			refItem.style.marginBottom = '15px';
			refItem.style.padding = '10px';
			refItem.style.border = '1px solid var(--background-modifier-border)';
			refItem.style.borderRadius = '5px';
			refItem.style.backgroundColor = 'var(--background-secondary)';
			
			// 引用类型标签
			const typeBadge = refItem.createEl('span', { 
				text: ref.referenceType.toUpperCase(),
				cls: 'reference-type-badge'
			});
			typeBadge.style.display = 'inline-block';
			typeBadge.style.padding = '2px 6px';
			typeBadge.style.backgroundColor = 'var(--text-accent)';
			typeBadge.style.color = 'white';
			typeBadge.style.borderRadius = '3px';
			typeBadge.style.fontSize = '11px';
			typeBadge.style.fontWeight = 'bold';
			typeBadge.style.marginRight = '10px';
			
			// 文件信息
			const fileInfo = refItem.createEl('div', { 
				text: `File: ${ref.fileName}`,
				cls: 'reference-file-info'
			});
			fileInfo.style.marginBottom = '5px';
			fileInfo.style.fontWeight = 'bold';
			fileInfo.style.color = 'var(--text-accent)';
			
			// 行号信息
			if (ref.lineNumber) {
				const lineInfo = refItem.createEl('div', { 
					text: `Line: ${ref.lineNumber}`,
					cls: 'reference-line-info'
				});
				lineInfo.style.fontSize = '12px';
				lineInfo.style.color = 'var(--text-muted)';
				lineInfo.style.marginBottom = '5px';
			}
			
			// 上下文内容
			if (ref.context) {
				const contextDiv = refItem.createEl('div', { cls: 'reference-context' });
				contextDiv.style.fontSize = '12px';
				contextDiv.style.fontFamily = 'monospace';
				contextDiv.style.backgroundColor = 'var(--background-primary)';
				contextDiv.style.padding = '8px';
				contextDiv.style.borderRadius = '3px';
				contextDiv.style.border = '1px solid var(--background-modifier-border)';
				contextDiv.style.whiteSpace = 'pre-wrap';
				contextDiv.style.maxHeight = '100px';
				contextDiv.style.overflow = 'auto';
				
				contextDiv.createEl('strong', { text: 'Context: ' });
				contextDiv.createEl('span', { text: ref.context });
			}
			
			// 打开文件按钮
			const openFileBtn = refItem.createEl('button', { 
				text: 'Open File',
				cls: 'mod-cta'
			});
			openFileBtn.style.marginTop = '8px';
			openFileBtn.style.fontSize = '12px';
			openFileBtn.style.padding = '4px 8px';
			
			openFileBtn.addEventListener('click', async () => {
				const targetFile = this.app.vault.getAbstractFileByPath(ref.filePath);
				if (targetFile instanceof TFile) {
					await this.app.workspace.getLeaf().openFile(targetFile);
					modal.close();
				} else {
					new Notice(this.plugin.languageManager.t('notices.fileNotFound'));
				}
			});
		});
		
		// 添加关闭按钮
		const closeBtn = content.createEl('button', { 
			text: 'Close',
			cls: 'mod-warning'
		});
		closeBtn.style.marginTop = '20px';
		closeBtn.addEventListener('click', () => modal.close());
		
		modal.open();
	}

	// 注册标签页激活监听器
	private registerTabActivationListener() {
		// 移除之前的监听器（如果存在）
		if (this.tabActivationListener) {
			this.app.workspace.off('layout-change', this.tabActivationListener);
		}

		// 创建新的监听器
		this.tabActivationListener = () => {
			// 检查当前激活的标签页是否是 Research Attachment Hub
			const activeLeaf = this.app.workspace.activeLeaf;
			if (activeLeaf && activeLeaf.view instanceof ResearchAttachmentHubView) {
				console.log('Research Attachment Hub tab activated');
				// 不再自动更新引用计数，改为手动刷新
			}
		};

		// 注册监听器
		this.app.workspace.on('layout-change', this.tabActivationListener);
		console.log('Tab activation listener registered');
	}

	/**
	 * 显示列显示控制模态框
	 */
	showColumnControlModal() {
		// 创建列显示控制模态框
		const modal = new ColumnControlModal(this.app, this.plugin);
		modal.open();
	}

	/**
	 * 获取期刊等级的颜色
	 */
	private getJournalLevelColor(level: string): string {
		const colors: { [key: string]: string } = {
			'CCF-A': '#e74c3c', // 红色
			'CCF-B': '#f39c12', // 橙色
			'CCF-C': '#f1c40f', // 黄色
			'SCI-1': '#e74c3c', // 红色
			'SCI-2': '#f39c12', // 橙色
			'SCI-3': '#f1c40f', // 黄色
			'SCI-4': '#95a5a6', // 灰色
			'Other': '#7f8c8d'  // 深灰色
		};
		return colors[level] || '#7f8c8d';
	}

	/**
	 * 获取期刊等级的描述
	 */
	private getJournalLevelDescription(level: string): string {
		const descriptions: { [key: string]: string } = {
					'CCF-A': this.plugin.languageManager.t('views.mainView.ccfA'),
		'CCF-B': this.plugin.languageManager.t('views.mainView.ccfB'),
		'CCF-C': this.plugin.languageManager.t('views.mainView.ccfC'),
		'SCI-1': this.plugin.languageManager.t('views.mainView.sci1'),
		'SCI-2': this.plugin.languageManager.t('views.mainView.sci2'),
		'SCI-3': this.plugin.languageManager.t('views.mainView.sci3'),
		'SCI-4': this.plugin.languageManager.t('views.mainView.sci4'),
		'Other': this.plugin.languageManager.t('views.mainView.other')
		};
		return descriptions[level] || this.plugin.languageManager.t('views.mainView.unknown');
	}

	/**
	 * 显示右键菜单
	 */
	private showContextMenu(e: MouseEvent, text: string, fieldName: string): void {
		const menu = new Menu();
		
		// 复制文本
		menu.addItem((item) => {
			item.setTitle(this.plugin.languageManager.t('views.mainView.copy') + fieldName);
			item.setIcon('copy');
			item.onClick(() => {
				navigator.clipboard.writeText(text);
				new Notice(`${fieldName}已复制到剪贴板`);
			});
		});
		
		// 复制完整文本（如果有省略）
		if (text.length > 50) {
			menu.addItem((item) => {
				item.setTitle(this.plugin.languageManager.t('views.mainView.copyComplete') + fieldName);
				item.setIcon('copy');
				item.onClick(() => {
					navigator.clipboard.writeText(text);
					new Notice(`完整${fieldName}已复制到剪贴板`);
				});
			});
		}
		
		// 在新标签页中搜索
		menu.addItem((item) => {
			item.setTitle(this.plugin.languageManager.t('views.mainView.search') + fieldName);
			item.setIcon('search');
			item.onClick(() => {
				const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
				window.open(searchUrl, '_blank');
			});
		});
		
		menu.showAtPosition({ x: e.clientX, y: e.clientY });
	}

	/**
	 * 更新列宽度
	 */
	private updateColumnWidths(columnKey: string, newWidth: number): void {
		// 更新最小列宽度配置
		if (this.minColumnWidths && this.minColumnWidths[columnKey]) {
			this.minColumnWidths[columnKey] = newWidth;
		}
		
		// 更新表格中对应列的宽度
		const table = this.containerEl.querySelector('.papers-table');
		if (table) {
			const headerRow = table.querySelector('thead tr');
			if (headerRow) {
				const headers = headerRow.querySelectorAll('th');
				const columnIndex = this.getColumnIndex(columnKey);
				if (columnIndex >= 0 && headers[columnIndex]) {
					const header = headers[columnIndex] as HTMLElement;
					const cells = table.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
					
					// 更新所有对应列的宽度
					cells.forEach((cell: Element) => {
						(cell as HTMLElement).style.width = header.style.width;
					});
				}
			}
		}
	}

	/**
	 * 获取列索引
	 */
	private getColumnIndex(columnKey: string): number {
		const columns = [
			'title', 'author', 'year', 'publisher', 'journalLevel', 'doi', 'fileType', 
			'mdFile', 'fileSize', 'location', 'tags', 'references', 'added', 'actions'
		];
		return columns.indexOf(columnKey);
	}
}

/**
 * 列显示控制模态框
 */
class ColumnControlModal extends Modal {
	private plugin: ResearchAttachmentHubPlugin;
	private columnSettings: { [key: string]: boolean } = {
		title: true,
		author: true,
		year: true,
		publisher: true,
		journalLevel: true,
		doi: true,
		fileType: true,
		mdFile: true,
		fileSize: true,
		location: true,
		tags: true,
		references: true,
		added: true,
		actions: true
	};

	constructor(app: any, plugin: ResearchAttachmentHubPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.plugin.languageManager.t('views.mainView.columnDisplayControl') });
		contentEl.createEl('p', { 
			text: this.plugin.languageManager.t('views.mainView.columnControlDescription'),
			cls: 'setting-item-description'
		});

		// 创建列设置
		const columns = [
			{ key: 'title', name: this.plugin.languageManager.t('views.mainView.titleColumn'), description: this.plugin.languageManager.t('views.mainView.titleDescription') },
			{ key: 'author', name: this.plugin.languageManager.t('views.mainView.authorColumn'), description: this.plugin.languageManager.t('views.mainView.authorDescription') },
			{ key: 'year', name: this.plugin.languageManager.t('views.mainView.yearColumn'), description: this.plugin.languageManager.t('views.mainView.yearDescription') },
			{ key: 'publisher', name: this.plugin.languageManager.t('views.mainView.publisher'), description: this.plugin.languageManager.t('views.mainView.publisherDescription') },
			{ key: 'journalLevel', name: this.plugin.languageManager.t('views.mainView.journalLevel'), description: this.plugin.languageManager.t('views.mainView.journalLevelDescription') },
			{ key: 'doi', name: this.plugin.languageManager.t('views.mainView.doi'), description: this.plugin.languageManager.t('views.mainView.doiDescription') },
			{ key: 'fileType', name: this.plugin.languageManager.t('views.mainView.fileType'), description: this.plugin.languageManager.t('views.mainView.fileTypeDescription') },
			{ key: 'mdFile', name: this.plugin.languageManager.t('views.mainView.mdFile'), description: this.plugin.languageManager.t('views.mainView.mdFileDescription') },
			{ key: 'fileSize', name: this.plugin.languageManager.t('views.mainView.fileSize'), description: this.plugin.languageManager.t('views.mainView.fileSizeDescription') },
			{ key: 'location', name: this.plugin.languageManager.t('views.mainView.location'), description: this.plugin.languageManager.t('views.mainView.locationDescription') },
			{ key: 'tags', name: this.plugin.languageManager.t('views.mainView.tags'), description: this.plugin.languageManager.t('views.mainView.tagsDescription') },
			{ key: 'references', name: this.plugin.languageManager.t('views.mainView.referenceCount'), description: this.plugin.languageManager.t('views.mainView.referenceCountDescription') },
			{ key: 'added', name: this.plugin.languageManager.t('views.mainView.addedTime'), description: this.plugin.languageManager.t('views.mainView.addedTimeDescription') },
			{ key: 'actions', name: this.plugin.languageManager.t('views.mainView.actions'), description: this.plugin.languageManager.t('views.mainView.actionsDescription') }
		];

		columns.forEach(column => {
			new Setting(contentEl)
				.setName(column.name)
				.setDesc(column.description)
				.addToggle(toggle => toggle
					.setValue(this.columnSettings[column.key])
					.onChange(value => {
						this.columnSettings[column.key] = value;
					}));
		});

		// 添加应用按钮
		const applyBtn = contentEl.createEl('button', { 
			text: '应用设置',
			cls: 'mod-cta'
		});
		applyBtn.style.marginTop = '20px';
		applyBtn.addEventListener('click', () => {
			// 保存列设置到插件设置中
			this.plugin.settings.columnVisibility = this.columnSettings;
			this.plugin.saveSettings();
			
			// 刷新视图
			this.plugin.refreshResearchAttachmentHubView();
			
			new Notice(this.plugin.languageManager.t('notices.columnSettingsApplied'));
			this.close();
		});

		// 添加重置按钮
		const resetBtn = contentEl.createEl('button', { 
			text: '重置为默认',
			cls: 'mod-warning'
		});
		resetBtn.style.marginLeft = '10px';
		resetBtn.addEventListener('click', () => {
			// 重置为默认设置
			this.columnSettings = {
				title: true,
				author: true,
				year: true,
				publisher: true,
				journalLevel: true,
				doi: true,
				fileType: true,
				mdFile: true,
				fileSize: true,
				location: true,
				tags: true,
				references: true,
				added: true,
				actions: true
			};
			
			// 更新UI
			this.onOpen();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
