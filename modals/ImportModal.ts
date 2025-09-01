import { App, Modal, Setting, Notice, TFile, TFolder, getAllTags } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';
import { DuplicateDOIModal } from './DuplicateDOIModal';

export class ImportModal extends Modal {
	app: App;
	plugin: ResearchAttachmentHubPlugin;
	selectedFile: TFile | null = null;
	targetFolder: string = '';
	title: string = '';
	author: string = '';
	year: string = '';
	publisher: string = '';
	journalLevel: 'CCF-A' | 'CCF-B' | 'CCF-C' | 'SCI-1' | 'SCI-2' | 'SCI-3' | 'SCI-4' | 'Other' = 'Other';
	doi: string = '';
	tags: string = '';
	extractMetadata: boolean = true;
	existingRecord: AttachmentRecord | null = null; // 用于重新导入时预填充信息

	// 临时文件目录（位于库内，便于Obsidian索引）
	private get tempDir(): string {
		// 允许用户通过设置自定义临时目录
		const dir = (this.plugin.settings as any).tempDir || 'research-attachment-hub/tmp';
		return dir.replace(/^\/+|\/+$/g, '');
	}
	
	// 存储设置引用以便控制显示/隐藏
	private titleSetting: any;
	private authorSetting: any;
	private yearSetting: any;
	private doiSetting: any;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin, existingRecord?: AttachmentRecord) {
		super(app);
		this.app = app;
		this.plugin = plugin;
		
		// 如果传入了现有记录，预填充信息
		if (existingRecord) {
			this.existingRecord = existingRecord;
			this.title = existingRecord.title || '';
			this.author = existingRecord.author || '';
			this.year = existingRecord.year || '';
			this.publisher = existingRecord.publisher || '';
			this.journalLevel = existingRecord.journalLevel || 'Other';
			this.doi = existingRecord.doi || '';
			this.tags = existingRecord.tags ? existingRecord.tags.join(', ') : '';
			
			// 确保publisher和journalLevel有值（即使是默认值）
			if (!this.publisher) {
				this.publisher = 'Unknown';
			}
			if (!this.journalLevel) {
				this.journalLevel = 'Other';
			}
			

			
			// 如果是重新导入，禁用自动元数据提取（因为我们已经有了信息）
			this.extractMetadata = false;
		} else {
			// 对于新的导入，设置默认标签
			this.tags = 'paper';
		}
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// 根据是否是重新导入显示不同的标题
		const title = this.existingRecord ? 
			this.plugin.languageManager.t('modals.importPDF.reimportTitle') : 
			this.plugin.languageManager.t('modals.importPDF.importTitle');
		const subtitle = this.existingRecord ? 
			`${this.plugin.languageManager.t('modals.importPDF.reimporting')}: ${this.existingRecord.title}` : 
			this.plugin.languageManager.t('modals.importPDF.chooseFile');
		
		contentEl.createEl('h2', { text: title });
		if (this.existingRecord) {
			contentEl.createEl('p', { 
				text: subtitle,
				cls: 'reimport-subtitle'
			}).style.color = 'var(--text-muted)';
		}

		// 文件选择
		const fileSettingName = this.existingRecord ? 
			this.plugin.languageManager.t('modals.importPDF.selectNewPDFFile') : 
			this.plugin.languageManager.t('modals.importPDF.selectPDFFile');
		const fileSettingDesc = this.existingRecord ? 
			this.plugin.languageManager.t('modals.importPDF.chooseNewFile') : 
			this.plugin.languageManager.t('modals.importPDF.chooseFile');
		
		new Setting(contentEl)
			.setName(fileSettingName)
			.setDesc(fileSettingDesc)
			.addButton(button => button
				.setButtonText(this.plugin.languageManager.t('modals.importPDF.browseFiles'))
				.onClick(() => this.selectFile()));

		// 如果是重新导入，显示当前文件信息
		if (this.existingRecord) {
			const currentFileInfo = contentEl.createEl('div', { cls: 'current-file-info' });
			currentFileInfo.style.marginTop = '10px';
			currentFileInfo.style.padding = '10px';
			currentFileInfo.style.backgroundColor = 'var(--background-secondary)';
			currentFileInfo.style.borderRadius = '5px';
			currentFileInfo.style.border = '1px solid var(--background-modifier-border)';
			
			const currentFile = this.app.vault.getAbstractFileByPath(this.existingRecord.filePath);
			if (currentFile instanceof TFile) {
				currentFileInfo.innerHTML = `
				<strong>${this.plugin.languageManager.t('modals.importPDF.currentFile')}:</strong> ${currentFile.name}<br>
				<strong>${this.plugin.languageManager.t('modals.importPDF.status')}:</strong> <span style="color: var(--text-success);">✓ ${this.plugin.languageManager.t('modals.importPDF.fileExists')}</span><br>
				<strong>${this.plugin.languageManager.t('modals.importPDF.path')}:</strong> ${currentFile.path}
			`;
		} else {
			currentFileInfo.innerHTML = `
				<strong>${this.plugin.languageManager.t('modals.importPDF.currentFile')}:</strong> ${this.existingRecord.fileName}<br>
				<strong>${this.plugin.languageManager.t('modals.importPDF.status')}:</strong> <span style="color: var(--text-error);">✗ ${this.plugin.languageManager.t('modals.importPDF.fileMissing')}</span><br>
				<strong>${this.plugin.languageManager.t('modals.importPDF.path')}:</strong> ${this.existingRecord.filePath}
			`;
			}
		}

		// 显示选中的文件
		const fileInfoEl = contentEl.createEl('div', { cls: 'selected-file-info' });
		fileInfoEl.style.marginTop = '10px';
		fileInfoEl.style.padding = '10px';
		fileInfoEl.style.backgroundColor = 'var(--background-secondary)';
		fileInfoEl.style.borderRadius = '5px';
		fileInfoEl.style.display = 'none';

			// 目标文件夹
	new Setting(contentEl)
		.setName(this.plugin.languageManager.t('modals.importPDF.targetFolder'))
		.setDesc(this.plugin.languageManager.t('modals.importPDF.targetFolderDesc'))
		.addText(text => text
			.setPlaceholder('Enter folder path')
			.setValue(this.targetFolder || this.plugin.settings.defaultFolder)
			.onChange((value) => {
				this.targetFolder = value;
			}));

	// 文件重命名开关
	new Setting(contentEl)
		.setName(this.plugin.languageManager.t('modals.importPDF.enableFileRenaming'))
		.setDesc(this.plugin.languageManager.t('modals.importPDF.enableFileRenamingDesc') + ': ' + this.plugin.settings.fileNameTemplate)
		.addToggle(toggle => toggle
			.setValue(this.plugin.settings.enableRename)
			.onChange((value) => {
				this.plugin.settings.enableRename = value;
				this.plugin.saveSettings();
			}));

	// 自动复制外部文件开关
	new Setting(contentEl)
		.setName(this.plugin.languageManager.t('modals.importPDF.autoCopyExternalFiles'))
		.setDesc(this.plugin.languageManager.t('modals.importPDF.autoCopyExternalFilesDesc'))
		.addToggle(toggle => toggle
			.setValue(this.plugin.settings.autoCopyExternalFiles)
			.onChange((value) => {
				this.plugin.settings.autoCopyExternalFiles = value;
				this.plugin.saveSettings();
			}));

	// 模板变量说明
	const templateHelp = contentEl.createEl('div', { cls: 'template-help' });
	templateHelp.style.marginTop = '10px';
	templateHelp.style.padding = '10px';
	templateHelp.style.backgroundColor = 'var(--background-secondary)';
	templateHelp.style.borderRadius = '5px';
	templateHelp.style.border = '1px solid var(--background-modifier-border)';
	templateHelp.style.fontSize = '12px';
	
	templateHelp.innerHTML = `
		<strong>${this.plugin.languageManager.t('modals.importPDF.templateHelp')}：</strong><br>
		${this.plugin.fileManager.getTemplateVariablesHelp()}
	`;

		// 自动提取元数据选项
		const metadataDesc = this.existingRecord ? 
			this.plugin.languageManager.t('modals.importPDF.autoExtractMetadataDescReimport') : 
			this.plugin.languageManager.t('modals.importPDF.autoExtractMetadataDesc');
		
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.importPDF.autoExtractMetadata'))
			.setDesc(metadataDesc)
			.addToggle(toggle => toggle
				.setValue(this.extractMetadata)
				.onChange((value) => {
					this.extractMetadata = value;
					this.toggleMetadataFields(value);
				}));

		// 标题输入
		const titleSetting = new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.importPDF.title'))
			.setDesc(this.plugin.languageManager.t('modals.importPDF.titleDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.importPDF.titlePlaceholder'))
				.setValue(this.title)
				.onChange((value) => {
					this.title = value;
				}));

		// 作者输入
		const authorSetting = new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.importPDF.author'))
			.setDesc(this.plugin.languageManager.t('modals.importPDF.authorDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.importPDF.authorPlaceholder'))
				.setValue(this.author)
				.onChange((value) => {
					this.author = value;
				}));

		// 年份输入
		const yearSetting = new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.importPDF.year'))
			.setDesc(this.plugin.languageManager.t('modals.importPDF.yearDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.importPDF.yearPlaceholder'))
				.setValue(this.year)
				.onChange((value) => {
					this.year = value;
				}));

		// 发表机构输入
		const publisherSetting = new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.importPDF.publisher'))
			.setDesc(this.plugin.languageManager.t('modals.importPDF.publisherDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.importPDF.publisherPlaceholder'))
				.setValue(this.publisher)
				.onChange((value) => {
					this.publisher = value;
					// 自动检测期刊等级（延迟执行，确保journalLevel字段已创建）
					setTimeout(() => this.autoDetectJournalLevel(), 100);
				}));
		

		// 期刊等级选择
		const journalLevelSetting = new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.importPDF.journalLevel'))
			.setDesc(this.plugin.languageManager.t('modals.importPDF.journalLevelDesc'))
			.addDropdown(dropdown => {
				// 导入期刊等级检测器
				const { JournalLevelDetector } = require('../utils/JournalLevelDetector');
				const levels = JournalLevelDetector.getAllJournalLevels();
				
				levels.forEach((level: any) => {
					dropdown.addOption(level.value, level.label);
				});
				
				// 确保设置正确的值
				const currentValue = this.journalLevel || 'Other';
				dropdown.setValue(currentValue);
				

				
				dropdown.onChange((value) => {
					this.journalLevel = value as 'CCF-A' | 'CCF-B' | 'CCF-C' | 'SCI-1' | 'SCI-2' | 'SCI-3' | 'SCI-4' | 'Other';
				});
			});

		// 显示自动检测的期刊等级描述
		if (this.journalLevel && this.journalLevel !== 'Other') {
			const { JournalLevelDetector } = require('../utils/JournalLevelDetector');
			const description = JournalLevelDetector.getJournalLevelDescription(this.journalLevel);
			const levelDescEl = contentEl.createEl('div', { 
				cls: 'journal-level-description',
				text: `📊 ${description}`
			});
			levelDescEl.style.marginTop = '5px';
			levelDescEl.style.padding = '8px';
			levelDescEl.style.backgroundColor = 'var(--background-secondary)';
			levelDescEl.style.borderRadius = '4px';
			levelDescEl.style.fontSize = '12px';
			levelDescEl.style.color = 'var(--text-muted)';
		}

		// DOI输入
		const doiSetting = new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.importPDF.doi'))
			.setDesc(this.plugin.languageManager.t('modals.importPDF.doiDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.importPDF.doiPlaceholder'))
				.setValue(this.doi)
				.onChange((value) => {
					this.doi = value;
				}));

		// 标签输入
		const tagsSetting = new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.importPDF.tags'))
			.setDesc(this.plugin.languageManager.t('modals.importPDF.tagsDesc'));
		const tagsInput = document.createElement('input');
		tagsInput.type = 'text';
		tagsInput.placeholder = this.plugin.languageManager.t('modals.importPDF.tagsPlaceholder');
		tagsInput.value = this.tags;
		tagsInput.addEventListener('input', () => {
			this.tags = tagsInput.value;
		});
		tagsSetting.controlEl.appendChild(tagsInput);
		await this.initTagPicker(tagsSetting);

		// 按钮区域
		const buttonContainer = contentEl.createEl('div', { cls: 'modal-button-container' });
		
		// 导入按钮
		const importBtnText = this.existingRecord ? 
			this.plugin.languageManager.t('modals.importPDF.reimport') : 
			this.plugin.languageManager.t('modals.importPDF.import');
		const importBtn = buttonContainer.createEl('button', { 
			text: importBtnText,
			cls: 'mod-cta'
		});
		importBtn.addEventListener('click', () => this.importPDF());

		// 取消按钮
		const cancelBtn = buttonContainer.createEl('button', { 
			text: this.plugin.languageManager.t('modals.importPDF.cancel'),
			cls: 'mod-warning'
		});
		cancelBtn.addEventListener('click', () => this.close());

		// 设置初始文件夹
		this.targetFolder = this.plugin.settings.defaultFolder;
		
		// 存储设置引用以便控制显示/隐藏
		this.titleSetting = titleSetting;
		this.authorSetting = authorSetting;
		this.yearSetting = yearSetting;
		this.doiSetting = doiSetting;
	}

	async selectFile() {
		// 检查是否在新窗口中
		if (window.opener || window.name.includes('obsidian')) {
			// 在新窗口中，显示限制提示
			new Notice(this.plugin.languageManager.t('notices.obsidianWindowLimit'));
			return;
		}
		
		try {
			// 创建文件输入框
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.pdf';
			input.multiple = false;
			
			// 绑定事件
			input.onchange = async (event) => {
				const target = event.target as HTMLInputElement;
				if (target.files && target.files.length > 0) {
					const file = target.files[0];
					
					// 检查是否是PDF文件
					if (!file.name.toLowerCase().endsWith('.pdf')) {
						new Notice(this.plugin.languageManager.t('notices.noFileSelected'));
						return;
					}

					// 将文件写入临时目录，转换为库内的 TFile 对象
					const arrayBuffer = await file.arrayBuffer();
					const fileName = file.name;

					// 确保临时目录存在
					await this.ensureDirectoryExists(this.tempDir);
					const tempPath = `${this.tempDir}/${fileName}`;
					await this.app.vault.adapter.writeBinary(tempPath, arrayBuffer);

					let tempFile = this.app.vault.getAbstractFileByPath(tempPath);
					// 写入后可能需要一点时间让Vault索引，重试一次
					if (!tempFile) {
						await new Promise(r => setTimeout(r, 50));
						tempFile = this.app.vault.getAbstractFileByPath(tempPath);
					}
					if (tempFile instanceof TFile) {
						this.selectedFile = tempFile;
						this.displayFileInfo(tempFile);
						new Notice(this.plugin.languageManager.t('modals.importPDF.selectedPDF') + ': ' + tempFile.name);
						
						// 如果启用了自动提取，则提取元数据
						if (this.extractMetadata) {
							await this.extractMetadataFromFile(tempFile);
							// 如果 DOI 被解析出来，则提示即将使用权威信息
							if (this.doi) {
								new Notice(this.plugin.languageManager.t('notices.doiDetected'));
							}
						}
					} else {
						new Notice(this.plugin.languageManager.t('notices.pdfRegisterFailed'));
					}
				}
				
				// 清理
				if (document.body.contains(input)) {
					document.body.removeChild(input);
				}
			};

			// 添加到 DOM 并触发点击
			document.body.appendChild(input);
			input.click();
		} catch (error) {
			console.error('Error selecting file:', error);
			new Notice(this.plugin.languageManager.t('notices.fileSelectError'));
		}
	}

	/**
	 * 自动检测期刊等级
	 */
	private autoDetectJournalLevel() {
		if (!this.publisher) {
			this.journalLevel = 'Other';
			return;
		}

		try {
			const { JournalLevelDetector } = require('../utils/JournalLevelDetector');
			const detectedLevel = JournalLevelDetector.detectJournalLevel(this.publisher, this.title);
			this.journalLevel = detectedLevel;
			
			// 更新表单控件中的值
			this.updateJournalLevelField(detectedLevel);
			
			// 显示检测结果提示
			if (detectedLevel !== 'Other') {
				const description = JournalLevelDetector.getJournalLevelDescription(detectedLevel);
				new Notice(`📊 ${this.plugin.languageManager.t('modals.importPDF.autoDetected')}: ${description}`);
			}
		} catch (error) {
			console.error('Error detecting journal level:', error);
			this.journalLevel = 'Other';
			this.updateJournalLevelField('Other');
		}
	}

	// 更新期刊等级字段的值
	private updateJournalLevelField(value: string) {
		// 查找期刊等级下拉框并更新其值
		const journalLevelDropdown = this.contentEl.querySelector('select');
		if (journalLevelDropdown) {
			(journalLevelDropdown as HTMLSelectElement).value = value;
		}
	}

	// 递归创建目录
	private async ensureDirectoryExists(dirPath: string) {
		const parts = dirPath.split('/');
		let current = '';
		for (const part of parts) {
			if (!part) continue;
			current = current ? `${current}/${part}` : part;
			try {
				await this.app.vault.adapter.mkdir(current);
			} catch (_) {
				// 已存在忽略
			}
		}
	}

	displayFileInfo(file: TFile) {
		const fileInfoEl = this.contentEl.querySelector('.selected-file-info');
		if (fileInfoEl) {
			(fileInfoEl as HTMLElement).style.display = 'block';
			fileInfoEl.innerHTML = `
				<strong>${this.plugin.languageManager.t('modals.importPDF.selectedFile')}:</strong> ${file.name}<br>
				<strong>${this.plugin.languageManager.t('modals.importPDF.fileSize')}:</strong> ${this.formatFileSize(file.stat.size)}<br>
				<strong>${this.plugin.languageManager.t('modals.importPDF.filePath')}:</strong> ${file.path}
			`;
		}
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	async extractMetadataFromFile(file: TFile) {
		try {
			new Notice(this.plugin.languageManager.t('notices.extractingMetadata'));
			
			const metadata = await this.plugin.pdfProcessor.processPDF(file);
			
			if (metadata.title && !this.title) this.title = metadata.title;
			if (metadata.author && !this.author) this.author = metadata.author;
			if (metadata.year && !this.year) this.year = metadata.year;
			if (metadata.doi && !this.doi) this.doi = metadata.doi;
			
			// 更新输入框的值
			this.updateInputValues();
			
			new Notice(this.plugin.languageManager.t('notices.metadataExtracted'));
		} catch (error) {
			console.error('Error extracting metadata:', error);
			new Notice(this.plugin.languageManager.t('notices.metadataExtractFailed'));
		}
	}

	updateInputValues() {
		// 更新输入框的值
		const titleInput = this.titleSetting.controlEl.querySelector('input');
		const authorInput = this.authorSetting.controlEl.querySelector('input');
		const yearInput = this.yearSetting.controlEl.querySelector('input');
		const doiInput = this.doiSetting.controlEl.querySelector('input');
		
		if (titleInput) titleInput.value = this.title;
		if (authorInput) authorInput.value = this.author;
		if (yearInput) yearInput.value = this.year;
		if (doiInput) doiInput.value = this.doi;
	}

	// 初始化标签选择器：读取库内所有标签，提供候选+多选
	private async initTagPicker(setting: Setting) {
		const wrapper = document.createElement('div');
		wrapper.style.marginTop = '8px';
		wrapper.style.display = 'flex';
		wrapper.style.flexDirection = 'column';
		wrapper.style.gap = '6px';

		const selectedWrap = document.createElement('div');
		selectedWrap.style.display = 'flex';
		selectedWrap.style.flexWrap = 'wrap';
		selectedWrap.style.gap = '6px';

		const searchRow = document.createElement('div');
		searchRow.style.display = 'flex';
		searchRow.style.gap = '6px';

		const searchInput = document.createElement('input');
		searchInput.type = 'text';
		searchInput.placeholder = 'Search tags...';
		searchInput.style.flex = '1';

		const pickBtn = document.createElement('button');
		pickBtn.textContent = 'Pick';
		pickBtn.className = 'mod-cta';

		const suggestBox = document.createElement('div');
		suggestBox.style.position = 'relative';

		const dropdown = document.createElement('div');
		dropdown.style.position = 'absolute';
		dropdown.style.top = '100%';
		dropdown.style.left = '0';
		dropdown.style.right = '0';
		dropdown.style.zIndex = '1000';
		dropdown.style.maxHeight = '200px';
		dropdown.style.overflowY = 'auto';
		dropdown.style.background = 'var(--background-primary)';
		dropdown.style.border = '1px solid var(--background-modifier-border)';
		dropdown.style.borderRadius = '6px';
		dropdown.style.display = 'none';

		suggestBox.appendChild(searchInput);
		suggestBox.appendChild(dropdown);

		searchRow.appendChild(suggestBox);
		searchRow.appendChild(pickBtn);

		wrapper.appendChild(selectedWrap);
		wrapper.appendChild(searchRow);
		setting.controlEl.appendChild(wrapper);

		const allTags = await this.collectVaultTags();
		const selected = new Set<string>((this.tags || '').split(',').map(t => t.trim()).filter(Boolean));

		const renderSelected = () => {
			selectedWrap.innerHTML = '';
			selected.forEach(tag => {
				const chip = document.createElement('span');
				chip.textContent = tag;
				chip.className = 'tag';
				chip.style.cursor = 'pointer';
				chip.title = 'Click to remove';
				chip.addEventListener('click', () => {
					selected.delete(tag);
					updateTagsField();
					renderSelected();
				});
				selectedWrap.appendChild(chip);
			});
		};

		const updateTagsField = () => {
			this.tags = Array.from(selected).join(', ');
			const input = setting.controlEl.querySelector('input[type="text"]') as HTMLInputElement;
			if (input) input.value = this.tags;
		};

		const openDropdown = () => { dropdown.style.display = 'block'; };
		const closeDropdown = () => { dropdown.style.display = 'none'; };

		const renderDropdown = (q: string) => {
			dropdown.innerHTML = '';
			const term = q.toLowerCase();
			allTags.filter(t => t.toLowerCase().includes(term) && !selected.has(t)).slice(0, 100).forEach(tag => {
				const item = document.createElement('div');
				item.textContent = tag;
				item.style.padding = '6px 8px';
				item.style.cursor = 'pointer';
				item.addEventListener('click', () => {
					selected.add(tag);
					updateTagsField();
					renderSelected();
					closeDropdown();
				});
				dropdown.appendChild(item);
			});
			if (dropdown.childElementCount === 0) {
				const empty = document.createElement('div');
				empty.textContent = 'No matches';
				empty.style.padding = '6px 8px';
				dropdown.appendChild(empty);
			}
		};

		searchInput.addEventListener('input', () => {
			if (searchInput.value.trim().length === 0) { closeDropdown(); return; }
			renderDropdown(searchInput.value);
			openDropdown();
		});
		pickBtn.addEventListener('click', () => {
			if (dropdown.style.display === 'none') {
				renderDropdown('');
				openDropdown();
			} else {
				closeDropdown();
			}
		});

		renderSelected();
	}

	private async collectVaultTags(): Promise<string[]> {
		const tags = new Set<string>();
		const files = this.app.vault.getMarkdownFiles();
		for (const f of files) {
			const cache = this.app.metadataCache.getFileCache(f);
			if (!cache) continue;
			const tlist = getAllTags(cache) || [];
			for (const t of tlist) {
				const clean = t.replace(/^#/, '').trim();
				if (clean) tags.add(clean);
			}
		}
		return Array.from(tags).sort((a, b) => a.localeCompare(b));
	}

	toggleMetadataFields(show: boolean) {
		// 控制元数据字段的显示/隐藏
		if (this.titleSetting) this.titleSetting.settingEl.style.display = show ? 'block' : 'none';
		if (this.authorSetting) this.authorSetting.settingEl.style.display = show ? 'block' : 'none';
		if (this.yearSetting) this.yearSetting.settingEl.style.display = show ? 'block' : 'none';
		if (this.doiSetting) this.doiSetting.settingEl.style.display = show ? 'block' : 'none';
	}

	async importPDF() {
		if (!this.selectedFile) {
			new Notice(this.plugin.languageManager.t('notices.noFileSelected'));
			return;
		}

		if (!this.title) {
			new Notice(this.plugin.languageManager.t('notices.providePaperTitle'));
			return;
		}

		try {
			const actionText = this.existingRecord ? 
				this.plugin.languageManager.t('modals.importPDF.reimporting') : 
				this.plugin.languageManager.t('modals.importPDF.importing');
			new Notice(`${actionText} PDF...`);

			// 检查是否有重复的DOI（仅在新导入时检查）
			if (!this.existingRecord && this.doi) {
				const existingRecord = this.plugin.database.findByDOI(this.doi);
				if (existingRecord) {
					// 显示重复DOI警告模态框
					const recordData = {
						title: this.title,
						author: this.author || '',
						year: this.year || '',
						doi: this.doi || ''
					};

					new DuplicateDOIModal(
						this.app,
						existingRecord,
						recordData,
						async (newRecordData) => {
							// 用户选择继续，执行导入流程
							await this.completeImport(newRecordData);
						},
						() => {
							// 用户选择取消
							new Notice(this.plugin.languageManager.t('notices.importCancelled'));
						}
					).open();
					return;
				}
			}

			// 使用FileManager处理文件导入
			const recordData = {
				title: this.title,
				author: this.author || '',
				year: this.year || '',
				doi: this.doi || ''
			};

			const result = await this.plugin.fileManager.processFileImport(
				this.selectedFile.path,
				recordData,
				this.plugin.settings.enableRename
			);

			if (this.existingRecord) {
				// 重新导入：更新现有记录
				this.existingRecord.fileName = result.fileName;
				this.existingRecord.filePath = result.filePath;
				this.existingRecord.title = this.title;
				this.existingRecord.author = this.author || '';
				this.existingRecord.year = this.year || '';
				this.existingRecord.publisher = this.publisher || '';
				this.existingRecord.journalLevel = this.journalLevel || 'Other';
				this.existingRecord.doi = this.doi || '';
				this.existingRecord.tags = this.tags ? this.tags.split(',').map(t => t.trim()) : [];
				this.existingRecord.bibText = this.generateBibTeX();
				
				// 更新数据库中的记录
				await this.plugin.database.updateRecord(this.existingRecord);
				
				// 自动同步标签到 Obsidian
				await this.plugin.tagSyncManager.autoSyncTags();
				
				const copyStatus = result.wasCopied ? ' (copied to attachment directory)' : '';
				new Notice(this.plugin.languageManager.t('notices.reimportCompleted') + copyStatus);
			} else {
				// 新导入：创建新记录
				const record: AttachmentRecord = {
					id: this.generateID(),
					doi: this.doi || '',
					title: this.title,
					author: this.author || '',
					year: this.year || '',
					publisher: this.publisher || '',
					journalLevel: this.journalLevel || 'Other',
					fileName: result.fileName,
					filePath: result.filePath,
					fileType: result.fileName.split('.').pop()?.toLowerCase() || 'pdf',
					fileSize: this.selectedFile.stat.size,
					tags: this.tags ? this.tags.split(',').map(t => t.trim()) : [],
					addedTime: new Date().toISOString(),
					referenceCount: 0,
					references: [],
					bibText: this.generateBibTeX(),
					metadata: {},
					hasMDFile: false,
					mdFilePath: undefined
				};

				// 保存到数据库
				await this.plugin.database.addRecord(record);
				
				// 自动创建MD文件（如果启用）
				if (this.plugin.settings.enableAutoMDCreation) {
					try {
						await this.plugin.attachmentTagManager.createMDFile(record);
					} catch (error) {
						console.error('Error creating MD file:', error);
						// 不阻止导入流程，只记录错误
					}
				}
				
							// 自动同步标签到 Obsidian
			await this.plugin.tagSyncManager.autoSyncTags();
			
			const copyStatus = result.wasCopied ? ' (copied to attachment directory)' : '';
			new Notice(this.plugin.languageManager.t('notices.importCompleted') + copyStatus);
		}

		// 如果是临时文件且已复制，则删除临时文件
		if (result.wasCopied && this.selectedFile.path.includes(this.plugin.settings.tempDir)) {
			try {
				await this.app.vault.delete(this.selectedFile);
			} catch (error) {
				console.log('Failed to delete temp file:', error);
			}
		}

		// 刷新Research Attachment Hub视图
		this.plugin.refreshResearchAttachmentHubView();

		this.close();

		} catch (error) {
			console.error('Error importing PDF:', error);
			new Notice(this.plugin.languageManager.t('notices.importFailed') + ': ' + error.message);
		}
	}

	// 完成导入流程的辅助方法
	private async completeImport(recordData: Partial<AttachmentRecord>) {
		try {
			const result = await this.plugin.fileManager.processFileImport(
				this.selectedFile!.path,
				recordData,
				this.plugin.settings.enableRename
			);

			if (this.existingRecord) {
				// 重新导入：更新现有记录
				this.existingRecord.fileName = result.fileName;
				this.existingRecord.filePath = result.filePath;
				this.existingRecord.title = this.title;
				this.existingRecord.author = this.author || '';
				this.existingRecord.year = this.year || '';
				this.existingRecord.publisher = this.publisher || '';
				this.existingRecord.journalLevel = this.journalLevel || 'Other';
				this.existingRecord.doi = this.doi || '';
				this.existingRecord.tags = this.tags ? this.tags.split(',').map(t => t.trim()) : [];
				this.existingRecord.bibText = this.generateBibTeX();
				
				// 更新数据库中的记录
				await this.plugin.database.updateRecord(this.existingRecord);
				
				const copyStatus = result.wasCopied ? ' (copied to attachment directory)' : '';
				new Notice(this.plugin.languageManager.t('modals.importPDF.reimportSuccess') + copyStatus);
			} else {
				// 新导入：创建新记录
				const record: AttachmentRecord = {
					id: this.generateID(),
					doi: recordData.doi || '',
					title: recordData.title || '',
					author: recordData.author || '',
					year: recordData.year || '',
					publisher: this.publisher || '',
					journalLevel: (this.journalLevel as any) || '',
					fileName: result.fileName,
					filePath: result.filePath,
					fileType: result.fileName.split('.').pop()?.toLowerCase() || 'pdf',
					fileSize: this.selectedFile!.stat.size,
					tags: this.tags ? this.tags.split(',').map(t => t.trim()) : [],
					addedTime: new Date().toISOString(),
					referenceCount: 0,
					references: [],
					bibText: this.generateBibTeX(),
					metadata: {},
					hasMDFile: false,
					mdFilePath: undefined
				};

				// 保存到数据库
				await this.plugin.database.addRecord(record);
				
				// 自动创建MD文件（如果启用）
				if (this.plugin.settings.enableAutoMDCreation) {
					try {
						await this.plugin.attachmentTagManager.createMDFile(record);
					} catch (error) {
						console.error('Error creating MD file:', error);
						// 不阻止导入流程，只记录错误
					}
				}
				
							// 自动同步标签到 Obsidian
			await this.plugin.tagSyncManager.autoSyncTags();
			
			const copyStatus = result.wasCopied ? ' (copied to attachment directory)' : '';
			new Notice(this.plugin.languageManager.t('modals.importPDF.importSuccess') + copyStatus);
		}

		// 如果是临时文件且已复制，则删除临时文件
		if (result.wasCopied && this.selectedFile!.path.includes(this.plugin.settings.tempDir)) {
			try {
				await this.app.vault.delete(this.selectedFile!);
			} catch (error) {
				console.log('Failed to delete temp file:', error);
			}
		}

		// 刷新Research Attachment Hub视图
		this.plugin.refreshResearchAttachmentHubView();

		this.close();
		} catch (error) {
			console.error('Error in completeImport:', error);
			new Notice(this.plugin.languageManager.t('modals.importPDF.importFailed') + ': ' + error.message);
		}
	}

	async resolveFolderPath(folderPath: string): Promise<TFolder | null> {
		try {
			// 替换变量
			let resolvedPath = folderPath;
			
			// 替换当前文件夹变量
			const activeFile = this.app.workspace.getActiveFile();
			if (activeFile) {
				const currentFolder = this.app.vault.getAbstractFileByPath(activeFile.path)?.parent;
				if (currentFolder) {
					resolvedPath = resolvedPath.replace(/\{\{current_folder\}\}/g, currentFolder.path);
				}
			}

			// 替换文件类型变量
			if (activeFile) {
				const fileType = activeFile.extension || 'unknown';
				resolvedPath = resolvedPath.replace(/\{\{file_type\}\}/g, fileType);
			}

			// 确保文件夹存在
			const folder = this.app.vault.getAbstractFileByPath(resolvedPath);
			if (folder instanceof TFolder) {
				return folder;
			}

			// 如果文件夹不存在，尝试创建
			try {
				await this.app.vault.createFolder(resolvedPath);
				return this.app.vault.getAbstractFileByPath(resolvedPath) as TFolder;
			} catch (error) {
				console.error('Failed to create folder:', error);
				return null;
			}
		} catch (error) {
			console.error('Error resolving folder path:', error);
			return null;
		}
	}

	generateID(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	generateBibTeX(): string {
		if (!this.doi) return '';
		
		const key = this.plugin.doiExtractor.generateBibTeXKey(this.doi);
		let bibtex = `@article{${key},
  doi = {${this.doi}},
  title = {${this.title}},
  author = {${this.author}},
  year = {${this.year}}`;
		
		if (this.publisher) {
			bibtex += `,\n  journal = {${this.publisher}}`;
		}
		
		bibtex += '\n}';
		return bibtex;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
