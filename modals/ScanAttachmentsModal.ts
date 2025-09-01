import { Modal, App, Setting, Notice, TFile } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';

export class ScanAttachmentsModal extends Modal {
	plugin: ResearchAttachmentHubPlugin;
	excludeExtensions: string[] = ['md', 'txt', 'json', 'yaml', 'yml', 'toml'];
	excludeFolders: string[] = ['.obsidian', '.git', 'node_modules'];
	includeExtensions: string[] = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'mp4', 'mp3', 'zip', 'rar'];
	scanResults: TFile[] = [];
	selectedFiles: Set<string> = new Set();
	processing: boolean = false;
	resultsContent: HTMLElement | null = null;
	addToManagerBtn: HTMLButtonElement | null = null;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Scan All Attachments in Vault' });
		contentEl.createEl('p', { 
			text: 'This tool will scan your entire vault for attachment files and allow you to add them to the Attachment Manager.',
			cls: 'description'
		});

		// 排除扩展名设置
		new Setting(contentEl)
			.setName('Exclude File Extensions')
			.setDesc('File extensions to exclude from scanning (comma-separated)')
			.addText(text => text
				.setPlaceholder('md, txt, json, yaml')
				.setValue(this.excludeExtensions.join(', '))
				.onChange(async (value) => {
					this.excludeExtensions = value.split(',').map(ext => ext.trim().toLowerCase()).filter(ext => ext);
				}));

		// 排除文件夹设置
		new Setting(contentEl)
			.setName('Exclude Folders')
			.setDesc('Folder names to exclude from scanning (comma-separated)')
			.addText(text => text
				.setPlaceholder('.obsidian, .git, node_modules')
				.setValue(this.excludeFolders.join(', '))
				.onChange(async (value) => {
					this.excludeFolders = value.split(',').map(folder => folder.trim()).filter(folder => folder);
				}));

		// 包含扩展名设置
		new Setting(contentEl)
			.setName('Include File Extensions')
			.setDesc('File extensions to include in scanning (comma-separated, leave empty for all)')
			.addText(text => text
				.setPlaceholder('pdf, doc, docx, jpg, png, mp4 (leave empty for all)')
				.setValue(this.includeExtensions.join(', '))
				.onChange(async (value) => {
					this.includeExtensions = value.split(',').map(ext => ext.trim().toLowerCase()).filter(ext => ext);
				}));

		// 扫描按钮
		const scanButton = contentEl.createEl('button', {
			text: 'Start Scanning',
			cls: 'mod-cta'
		});
		scanButton.addEventListener('click', () => this.scanVault());

		// 扫描结果显示区域
		this.createResultsContainer(contentEl);

		// 操作按钮
		this.createActionButtons(contentEl);
	}

	createResultsContainer(container: HTMLElement) {
		const resultsContainer = container.createEl('div', { cls: 'scan-results' });
		resultsContainer.style.marginTop = '20px';
		resultsContainer.style.maxHeight = '400px';
		resultsContainer.style.overflow = 'auto';
		resultsContainer.style.border = '1px solid var(--background-modifier-border)';
		resultsContainer.style.borderRadius = '5px';
		resultsContainer.style.padding = '10px';

		// 结果标题
		const resultsTitle = resultsContainer.createEl('h3', { text: 'Scan Results' });
		resultsTitle.style.margin = '0 0 15px 0';

		// 结果内容区域
		this.resultsContent = resultsContainer.createEl('div', { cls: 'results-content' });
	}

	createActionButtons(container: HTMLElement) {
		const actionContainer = container.createEl('div', { cls: 'action-buttons' });
		actionContainer.style.marginTop = '20px';
		actionContainer.style.display = 'flex';
		actionContainer.style.gap = '10px';
		actionContainer.style.justifyContent = 'center';

		// 全选按钮
		const selectAllBtn = actionContainer.createEl('button', {
			text: 'Select All',
			cls: 'mod-cta'
		});
		selectAllBtn.addEventListener('click', () => this.selectAllFiles());

		// 全不选按钮
		const selectNoneBtn = actionContainer.createEl('button', {
			text: 'Select None',
			cls: 'mod-cta'
		});
		selectNoneBtn.addEventListener('click', () => this.selectNoFiles());

		// 添加到管理器按钮
		this.addToManagerBtn = actionContainer.createEl('button', {
			text: 'Add Selected to Attachment Manager',
			cls: 'mod-cta'
		});
		this.addToManagerBtn.addEventListener('click', () => this.addSelectedToManager());
		this.addToManagerBtn.disabled = true;

		// 关闭按钮
		const closeBtn = actionContainer.createEl('button', {
			text: 'Close',
			cls: 'mod-warning'
		});
		closeBtn.addEventListener('click', () => this.close());
	}

	async scanVault() {
		try {
			this.processing = true;
			this.scanResults = [];
			this.selectedFiles.clear();
			this.updateResultsDisplay();

			new Notice(this.plugin.languageManager.t('notices.scanningVault'));

			// 获取所有文件
			const allFiles = this.app.vault.getFiles();
			const attachmentFiles: TFile[] = [];

			for (const file of allFiles) {
				// 检查是否应该排除
				if (this.shouldExcludeFile(file)) {
					continue;
				}

				// 检查是否应该包含
				if (this.shouldIncludeFile(file)) {
					attachmentFiles.push(file);
				}
			}

			this.scanResults = attachmentFiles;
			this.selectedFiles.clear();

			// 自动选择所有文件
			this.selectAllFiles();

			this.updateResultsDisplay();

			new Notice(`Found ${attachmentFiles.length} attachment files`);
		} catch (error) {
			console.error('Error scanning vault:', error);
			new Notice(this.plugin.languageManager.t('notices.scanVaultError'));
		} finally {
			this.processing = false;
		}
	}

	shouldExcludeFile(file: TFile): boolean {
		// 检查扩展名
		if (this.excludeExtensions.includes(file.extension.toLowerCase())) {
			return true;
		}

		// 检查文件夹
		const pathParts = file.path.split('/');
		for (const folder of this.excludeFolders) {
			if (pathParts.includes(folder)) {
				return true;
			}
		}

		return false;
	}

	shouldIncludeFile(file: TFile): boolean {
		// 如果没有指定包含扩展名，则包含所有非排除的文件
		if (this.includeExtensions.length === 0) {
			return true;
		}

		// 检查是否在包含列表中
		return this.includeExtensions.includes(file.extension.toLowerCase());
	}

	updateResultsDisplay() {
		if (!this.resultsContent) return;

		this.resultsContent.empty();

		if (this.scanResults.length === 0) {
			this.resultsContent.createEl('p', { 
				text: this.processing ? 'Scanning...' : 'No attachment files found. Try adjusting your settings.',
				cls: 'no-results'
			});
			return;
		}

		// 创建文件列表
		const fileList = this.resultsContent.createEl('div', { cls: 'file-list' });

		this.scanResults.forEach(file => {
			const fileItem = fileList.createEl('div', { cls: 'file-item' });
			fileItem.style.display = 'flex';
			fileItem.style.alignItems = 'center';
			fileItem.style.padding = '8px';
			fileItem.style.borderBottom = '1px solid var(--background-modifier-border)';
			fileItem.style.gap = '10px';

			// 复选框
			const checkbox = fileItem.createEl('input', {
				type: 'checkbox'
			}) as HTMLInputElement;
			checkbox.checked = this.selectedFiles.has(file.path);
			checkbox.addEventListener('change', (e) => {
				const target = e.target as HTMLInputElement;
				if (target.checked) {
					this.selectedFiles.add(file.path);
				} else {
					this.selectedFiles.delete(file.path);
				}
				this.updateAddButtonState();
			});

			// 文件图标
			const icon = fileItem.createEl('span', { 
				text: this.getFileIcon(file.extension),
				cls: 'file-icon'
			});
			icon.style.fontSize = '16px';
			icon.style.marginRight = '8px';

			// 文件信息
			const fileInfo = fileItem.createEl('div', { cls: 'file-info' });
			fileInfo.style.flex = '1';

			const fileName = fileInfo.createEl('div', { 
				text: file.name,
				cls: 'file-name'
			});
			fileName.style.fontWeight = 'bold';

			const filePath = fileInfo.createEl('div', { 
				text: file.path,
				cls: 'file-path'
			});
			filePath.style.fontSize = '12px';
			filePath.style.color = 'var(--text-muted)';

			// 文件大小
			const fileSize = fileItem.createEl('div', { 
				text: this.formatFileSize(file.stat.size),
				cls: 'file-size'
			});
			fileSize.style.fontSize = '12px';
			fileSize.style.color = 'var(--text-muted)';
			fileSize.style.minWidth = '80px';
			fileSize.style.textAlign = 'right';
		});

		this.updateAddButtonState();
	}

	getFileIcon(extension: string): string {
		const iconMap: Record<string, string> = {
			'pdf': '📄',
			'doc': '📝',
			'docx': '📝',
			'ppt': '📊',
			'pptx': '📊',
			'xls': '📊',
			'xlsx': '📊',
			'jpg': '🖼️',
			'jpeg': '🖼️',
			'png': '🖼️',
			'gif': '🖼️',
			'svg': '🖼️',
			'mp4': '🎥',
			'mp3': '🎵',
			'zip': '📦',
			'rar': '📦'
		};

		return iconMap[extension.toLowerCase()] || '📎';
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	selectAllFiles() {
		this.scanResults.forEach(file => {
			this.selectedFiles.add(file.path);
		});
		this.updateResultsDisplay();
	}

	selectNoFiles() {
		this.selectedFiles.clear();
		this.updateResultsDisplay();
	}

	updateAddButtonState() {
		if (this.addToManagerBtn) {
			this.addToManagerBtn.disabled = this.selectedFiles.size === 0;
		}
	}

	async addSelectedToManager() {
		if (this.selectedFiles.size === 0) {
			new Notice(this.plugin.languageManager.t('notices.noFilesSelected'));
			return;
		}

		try {
			new Notice(`Adding ${this.selectedFiles.size} files to Attachment Manager...`);

			let addedCount = 0;
			let skippedCount = 0;

			for (const filePath of this.selectedFiles) {
				const file = this.app.vault.getAbstractFileByPath(filePath);
				if (file instanceof TFile) {
					try {
						// 检查是否已经存在
						const existingRecords = this.plugin.database.getAllRecords();
						const alreadyExists = existingRecords.some(record => record.filePath === filePath);

						if (alreadyExists) {
							skippedCount++;
							continue;
						}

						// 创建新记录
						const newRecord: AttachmentRecord = {
							id: this.generateId(),
							doi: '',
							title: file.basename,
							author: '',
							year: new Date().getFullYear().toString(),
							publisher: '',
							journalLevel: 'Other',
							fileName: file.name,
							filePath: file.path,
							tags: ['scanned'],
							addedTime: new Date().toISOString(),
							referenceCount: 0,
							references: [],
							bibText: '',
							metadata: {},
							fileType: file.extension,
							fileSize: file.stat.size,
							hasMDFile: false,
							mdFilePath: undefined
						};

						// 添加到数据库
						this.plugin.database.addRecord(newRecord);
						
						// 自动创建MD文件（如果启用）
						if (this.plugin.settings.enableAutoMDCreation) {
							try {
								await this.plugin.attachmentTagManager.createMDFile(newRecord);
							} catch (error) {
								console.error('Error creating MD file:', error);
								// 不阻止扫描流程，只记录错误
							}
						}
						
						addedCount++;

					} catch (error) {
						console.error(`Error adding file ${filePath}:`, error);
						skippedCount++;
					}
			 }
			}

			// 保存数据库
			await this.plugin.database.save();
			
			// 自动同步标签到 Obsidian
			await this.plugin.tagSyncManager.autoSyncTags();

			// 显示结果
			new Notice(`Successfully added ${addedCount} files to Attachment Manager${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}`);

			// 更新状态栏（通过公共方法）
			// this.plugin.updateStatusBar();

			// 刷新 Research Attachment Hub 视图
			this.plugin.refreshResearchAttachmentHubView();

			// 关闭模态框
			this.close();

		} catch (error) {
			console.error('Error adding files to Attachment Manager:', error);
			new Notice(this.plugin.languageManager.t('notices.addFilesError'));
		}
	}

	generateId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
