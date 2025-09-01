import { App, Modal, Setting, Notice, TFile, TFolder, getAllTags } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';
import { DuplicateDOIModal } from './DuplicateDOIModal';

export class DownloadModal extends Modal {
	app: App;
	plugin: ResearchAttachmentHubPlugin;
	url: string = '';
	doi: string = '';
	title: string = '';
	author: string = '';
	year: string = '';
	publisher: string = '';
	journalLevel: 'CCF-A' | 'CCF-B' | 'CCF-C' | 'SCI-1' | 'SCI-2' | 'SCI-3' | 'SCI-4' | 'Other' = 'Other';
	tags: string = '';
	folder: string = '';

	constructor(app: App, plugin: ResearchAttachmentHubPlugin) {
		super(app);
		this.app = app;
		this.plugin = plugin;
		
		// 设置默认标签
		this.tags = 'paper';
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.plugin.languageManager.t('modals.downloadPaper.title') });

		// URL输入
		// URL输入区域 - 添加自动识别按钮
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.paperURL'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.paperURLDesc'))
			.addText(text => text
				.setPlaceholder('https://doi.org/... or https://arxiv.org/...')
				.setValue(this.url)
				.onChange((value) => {
					this.url = value;
				}))
			.addButton(button => button
				.setButtonText(this.plugin.languageManager.t('modals.downloadPaper.autoIdentify'))
				.setTooltip(this.plugin.languageManager.t('modals.downloadPaper.autoIdentifyTooltip'))
				.onClick(async () => {
					if (!this.url.trim()) {
						new Notice(this.plugin.languageManager.t('notices.pleaseEnterURL'));
						return;
					}
					
					const buttonEl = button.buttonEl;
					const originalText = buttonEl.textContent;
					buttonEl.textContent = this.plugin.languageManager.t('modals.downloadPaper.identifying');
					buttonEl.disabled = true;
					
					try {
						await this.extractInfoFromURL(this.url);
						new Notice(this.plugin.languageManager.t('notices.metadataExtracted'));
					} catch (error) {
						console.error('Error identifying metadata:', error);
						new Notice(this.plugin.languageManager.t('notices.metadataExtractFailed'));
					} finally {
						buttonEl.textContent = originalText;
						buttonEl.disabled = false;
					}
				}));

		// DOI输入
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.doi'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.doiDesc'))
			.addText(text => text
				.setPlaceholder('10.1000/...')
				.setValue(this.doi)
				.onChange((value) => {
					this.doi = value;
				}));

		// 标题输入
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.title'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.titleDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.downloadPaper.titlePlaceholder'))
				.setValue(this.title)
				.onChange((value) => {
					this.title = value;
				}));

		// 作者输入
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.author'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.authorDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.downloadPaper.authorPlaceholder'))
				.setValue(this.author)
				.onChange((value) => {
					this.author = value;
				}));

		// 年份输入
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.year'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.yearDesc'))
			.addText(text => text
				.setPlaceholder('2024')
				.setValue(this.year)
				.onChange((value) => {
					this.year = value;
				}));

		// 发表机构输入
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.publisher'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.publisherDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.downloadPaper.publisherPlaceholder'))
				.setValue(this.publisher)
				.onChange((value) => {
					this.publisher = value;
					// 自动检测期刊等级
					this.autoDetectJournalLevel();
				}));

		// 期刊等级选择
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.journalLevel'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.journalLevelDesc'))
			.addDropdown(dropdown => {
				// 导入期刊等级检测器
				const { JournalLevelDetector } = require('../utils/JournalLevelDetector');
				const levels = JournalLevelDetector.getAllJournalLevels();
				
				levels.forEach((level: any) => {
					dropdown.addOption(level.value, level.label);
				});
				
				dropdown.setValue(this.journalLevel || 'Other');
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

		// 标签输入 + 选择器
		const tagsSetting = new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.tags'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.tagsDesc'));
		const tagsInput = document.createElement('input');
			tagsInput.type = 'text';
			tagsInput.placeholder = this.plugin.languageManager.t('modals.downloadPaper.tagsPlaceholder');
			tagsInput.value = this.tags;
			tagsInput.addEventListener('input', () => { this.tags = tagsInput.value; });
			tagsSetting.controlEl.appendChild(tagsInput);
		await this.initTagPicker(tagsSetting);

		// 文件夹选择
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.targetFolder'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.targetFolderDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.languageManager.t('modals.downloadPaper.targetFolderPlaceholder'))
				.setValue(this.folder || this.plugin.settings.defaultFolder)
				.onChange((value) => {
					this.folder = value;
				}));

		// 文件重命名开关
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.enableRename'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.enableRenameDesc') + this.plugin.settings.fileNameTemplate)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableRename)
				.onChange((value) => {
					this.plugin.settings.enableRename = value;
					this.plugin.saveSettings();
				}));

		// 自动复制外部文件开关
		new Setting(contentEl)
			.setName(this.plugin.languageManager.t('modals.downloadPaper.autoCopyExternal'))
			.setDesc(this.plugin.languageManager.t('modals.downloadPaper.autoCopyExternalDesc'))
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
				<strong>${this.plugin.languageManager.t('modals.downloadPaper.templateHelpTitle')}</strong><br>
				${this.plugin.fileManager.getTemplateVariablesHelp()}
			`;

		// 按钮区域
		const buttonContainer = contentEl.createEl('div', { cls: 'modal-button-container' });
		
		// 下载按钮
		const downloadBtn = buttonContainer.createEl('button', { 
			text: this.plugin.languageManager.t('modals.downloadPaper.downloadButton'),
			cls: 'mod-cta'
		});
		downloadBtn.addEventListener('click', () => this.downloadPaper());

		// 取消按钮
		const cancelBtn = buttonContainer.createEl('button', { 
			text: this.plugin.languageManager.t('common.cancel'),
			cls: 'mod-warning'
		});
		cancelBtn.addEventListener('click', () => this.close());

		// 设置初始文件夹
		this.folder = this.plugin.settings.defaultFolder;
	}

	async extractInfoFromURL(url: string) {
		try {
			// 首先检查输入的是否直接就是DOI
			let doi = this.plugin.doiExtractor.extractDOIFromText(url);
			
			// 如果不是直接的DOI，尝试从URL中提取
			if (!doi) {
				doi = this.plugin.doiExtractor.extractDOIFromURL(url);
			}
			
			if (doi) {
				this.doi = doi;
				console.log('识别到DOI:', doi);
				
				// 尝试从DOI获取元数据
				const metadata = await this.plugin.doiExtractor.getMetadataFromDOI(doi);
				if (metadata) {
					console.log('获取到元数据:', metadata);
					
					if (metadata.title && !this.title) {
						this.title = metadata.title[0];
					}
					if (metadata.author && !this.author) {
						this.author = metadata.author.map((a: any) => a.given + ' ' + a.family).join(', ');
					}
					if (metadata.published && !this.year) {
						this.year = metadata.published['date-parts'][0][0].toString();
					}
					
					this.updateFormFields(); // 更新表单字段
					return;
				} else {
					console.log('无法从DOI获取元数据，尝试从网页获取');
				}
			}

			// 如果输入的是URL，尝试从网页直接提取信息
			if (url.startsWith('http')) {
				await this.extractInfoFromWebPage(url);
			} else if (doi) {
				// 如果识别到DOI但无法获取元数据，尝试从DOI.org网页获取
				const doiUrl = `https://doi.org/${doi}`;
				await this.extractInfoFromWebPage(doiUrl);
			}
			
		} catch (error) {
			console.error('Error extracting info from URL:', error);
			new Notice(`Failed to extract metadata: ${error.message}`);
		}
	}

	// 改进方法：更新表单字段，确保正确填充所有输入框
	// 重新设计：更准确的表单字段更新方法
	private updateFormFields() {
		const contentEl = this.contentEl;
		let updatedFields: string[] = [];

		// 使用更精确的选择器直接定位输入框
		const settings = contentEl.querySelectorAll('.setting-item');
		
		settings.forEach((setting) => {
			const nameEl = setting.querySelector('.setting-item-name');
			const input = setting.querySelector('input[type="text"]') as HTMLInputElement;
			
			if (!nameEl || !input) return;

			const name = nameEl.textContent?.trim().toLowerCase() || '';
			
			// 更精确的匹配逻辑
			if (name.includes('doi') && this.doi) {
				input.value = this.doi;
				input.dispatchEvent(new Event('input', { bubbles: true }));
				updatedFields.push(`DOI: ${this.doi}`);
			} else if ((name.includes('title') || name.includes('标题')) && this.title) {
				input.value = this.title;
				input.dispatchEvent(new Event('input', { bubbles: true }));
				updatedFields.push(`Title: ${this.title}`);
			} else if ((name.includes('author') || name.includes('作者')) && this.author) {
				input.value = this.author;
				input.dispatchEvent(new Event('input', { bubbles: true }));
				updatedFields.push(`Author: ${this.author}`);
			} else if ((name.includes('year') || name.includes('年份')) && this.year) {
				input.value = this.year;
				input.dispatchEvent(new Event('input', { bubbles: true }));
				updatedFields.push(`Year: ${this.year}`);
			}
		});

		// 给用户明确的反馈
		if (updatedFields.length > 0) {
			new Notice(`已自动填充: ${updatedFields.join(', ')}`);
		} else {
			new Notice(this.plugin.languageManager.t('notices.autoIdentifyFailed'));
		}
	}

	// 改进的网页信息提取方法
	private async extractInfoFromWebPage(url: string) {
		try {
			new Notice(this.plugin.languageManager.t('notices.extractingInfo'));
			console.log('开始从网页提取信息，URL:', url);
			
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				}
			});
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			
			console.log('网页解析成功，开始提取信息...');
			
			// 特殊处理DOI.org页面
			if (url.includes('doi.org')) {
				await this.extractFromDOIPage(doc, url);
			} else {
				// 通用网页提取
				await this.extractFromGenericPage(doc);
			}
			
			// 更新表单
			this.updateFormFields();
			
		} catch (error) {
			console.error('网页提取失败:', error);
			new Notice(`网页提取失败: ${error.message}`);
		}
	}

	// 从DOI.org页面提取信息
	private async extractFromDOIPage(doc: Document, url: string) {
		console.log('从DOI.org页面提取信息...');
		
		// 从URL中提取DOI
		const doiMatch = url.match(/doi\.org\/(.+)/);
		if (doiMatch) {
			this.doi = decodeURIComponent(doiMatch[1]);
			console.log('从URL提取到DOI:', this.doi);
		}
		
		// 尝试从页面内容提取标题
		if (!this.title) {
			const titleSelectors = [
				'meta[property="og:title"]',
				'meta[name="citation_title"]',
				'h1',
				'title'
			];
			
			for (const selector of titleSelectors) {
				const element = doc.querySelector(selector);
				if (element) {
					let titleText = element.getAttribute('content') || element.textContent || '';
					titleText = titleText.replace(/\s*-\s*.*$/, '').trim();
					if (titleText.length > 10 && !titleText.includes('DOI')) {
						this.title = titleText;
						console.log('找到标题:', this.title);
						break;
					}
				}
			}
		}
		
		// 尝试从页面内容提取作者
		if (!this.author) {
			const authorSelectors = [
				'meta[name="citation_author"]',
				'.author',
				'.authors'
			];
			
			const authors: string[] = [];
			for (const selector of authorSelectors) {
				const elements = doc.querySelectorAll(selector);
				elements.forEach(el => {
					const author = el.textContent || '';
					if (author && author.length > 2 && !authors.includes(author)) {
						authors.push(author.trim());
					}
				});
			}
			if (authors.length > 0) {
				this.author = authors.slice(0, 3).join(', ');
				console.log('找到作者:', this.author);
			}
		}
		
		// 尝试从页面内容提取年份
		if (!this.year) {
			const pageText = doc.documentElement.textContent || '';
			const yearMatch = pageText.match(/(19|20)\d{2}/);
			if (yearMatch) {
				this.year = yearMatch[0];
				console.log('找到年份:', this.year);
			}
		}
	}

	// 从通用网页提取信息
	private async extractFromGenericPage(doc: Document) {
		console.log('从通用网页提取信息...');
		
		// 提取标题
		if (!this.title) {
			const titleSelectors = [
				'meta[property="og:title"]',
				'meta[name="citation_title"]',
				'meta[name="DC.title"]',
				'h1',
				'.paper-title',
				'#paper-title',
				'title'
			];
			
			for (const selector of titleSelectors) {
				const element = doc.querySelector(selector);
				if (element) {
					let titleText = element.getAttribute('content') || element.textContent || '';
					titleText = titleText.replace(/\s*-\s*.*$/, '').trim();
					if (titleText.length > 10) {
						this.title = titleText;
						console.log('找到标题:', this.title);
						break;
					}
				}
			}
		}
		
		// 提取作者
		if (!this.author) {
			const authorSelectors = [
				'meta[name="citation_author"]',
				'meta[name="DC.creator"]',
				'meta[name="author"]',
				'.author',
				'.authors',
				'[rel="author"]'
			];
			
			const authors: string[] = [];
			for (const selector of authorSelectors) {
				const elements = doc.querySelectorAll(selector);
				elements.forEach(el => {
					const author = el.getAttribute('content') || el.textContent || '';
					if (author && author.length > 2 && !authors.includes(author)) {
						authors.push(author.trim());
					}
				});
			}
			if (authors.length > 0) {
				this.author = authors.slice(0, 3).join(', ');
				console.log('找到作者:', this.author);
			}
		}
		
		// 提取年份
		if (!this.year) {
			const pageText = doc.documentElement.textContent || '';
			const yearMatch = pageText.match(/(19|20)\d{2}/);
			if (yearMatch) {
				this.year = yearMatch[0];
				console.log('找到年份:', this.year);
			}
		}
		
		// 提取DOI
		if (!this.doi) {
			const doiSelectors = [
				'meta[name="citation_doi"]',
				'meta[name="DC.identifier"][scheme="DOI"]',
				'a[href*="doi.org"]'
			];
			
			for (const selector of doiSelectors) {
				const element = doc.querySelector(selector);
				if (element) {
					let doi = element.getAttribute('content') || element.getAttribute('href') || '';
					if (doi.includes('10.')) {
						doi = doi.replace(/^.*doi\.org\//, '').replace(/^doi:/, '');
						this.doi = doi;
						console.log('找到DOI:', this.doi);
						break;
					}
				}
			}
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
			
			// 显示检测结果提示
			if (detectedLevel !== 'Other') {
				const description = JournalLevelDetector.getJournalLevelDescription(detectedLevel);
				new Notice(`📊 Auto-detected: ${description}`);
			}
		} catch (error) {
			console.error('Error detecting journal level:', error);
			this.journalLevel = 'Other';
		}
	}

	async downloadPaper() {
		if (!this.title) {
			new Notice(this.plugin.languageManager.t('notices.providePaperTitle'));
			return;
		}

		try {
			// 显示下载进度
			new Notice(this.plugin.languageManager.t('notices.startingDownload'));

			// 下载PDF文件
			const pdfBuffer = await this.downloadPDFFromURL(this.url);
			
			let filePath: string;
			let isLocalFile = false;
			let sourcePath: string;
			let selectedFile: File | null = null;

			if (!pdfBuffer) {
				// 下载失败，让用户选择本地文件
				const shouldSelectFile = await this.showDownloadFailedModal();
				if (!shouldSelectFile) {
					return;
				}

				selectedFile = await this.selectLocalFile();
				if (!selectedFile) {
					new Notice(this.plugin.languageManager.t('notices.noFileSelected'));
					return;
				}

				// 对于本地文件，我们需要先复制到vault中
				const tempFileName = `local_${Date.now()}.pdf`;
				const tempPath = `${this.plugin.settings.tempDir}/${tempFileName}`;
				
				// 确保临时目录存在
				await this.ensureTempDirectoryExists();
				
				// 将File对象转换为ArrayBuffer并保存
				const arrayBuffer = await selectedFile.arrayBuffer();
				await this.app.vault.adapter.writeBinary(tempPath, arrayBuffer);
				
				sourcePath = tempPath;
				isLocalFile = true;
			} else {
				// 下载成功，先保存到临时位置
				const tempFileName = `temp_${Date.now()}.pdf`;
				const tempPath = `${this.plugin.settings.tempDir}/${tempFileName}`;
				
				// 确保临时目录存在
				await this.ensureTempDirectoryExists();
				
				await this.app.vault.adapter.writeBinary(tempPath, pdfBuffer);
				sourcePath = tempPath;
			}

			// 检查是否有重复的DOI
			if (this.doi) {
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
							// 用户选择继续，执行下载流程
							await this.completeDownload(
								sourcePath,
								isLocalFile,
								pdfBuffer,
								newRecordData
							);
						},
						() => {
							// 用户选择取消
							new Notice(this.plugin.languageManager.t('notices.downloadCancelled'));
						}
					).open();
					return;
				}
			}

			// 没有重复DOI，直接执行下载流程
			const recordData = {
				title: this.title,
				author: this.author || '',
				year: this.year || '',
				doi: this.doi || ''
			};

			await this.completeDownload(sourcePath, isLocalFile, pdfBuffer, recordData);
		} catch (error) {
			console.error('Error during download:', error);
			new Notice(`Download failed: ${error.message}`);
		}
	}

	// 完成下载流程的辅助方法
	private async completeDownload(
		sourcePath: string,
		isLocalFile: boolean,
		pdfBuffer: ArrayBuffer | null,
		recordData: Partial<AttachmentRecord>
	) {
		try {
			// 使用FileManager处理文件导入
			const result = await this.plugin.fileManager.processFileImport(
				sourcePath,
				recordData,
				this.plugin.settings.enableRename
			);

			// 创建附件记录
			const record: AttachmentRecord = {
				id: this.generateID(),
				doi: recordData.doi || '',
				title: recordData.title || '',
				author: recordData.author || '',
				year: recordData.year || '',
				publisher: this.publisher || '',
				journalLevel: this.journalLevel || 'Other',
				fileName: result.fileName,
				filePath: result.filePath,
				fileType: result.fileName.split('.').pop()?.toLowerCase() || 'pdf',
				fileSize: pdfBuffer ? pdfBuffer.byteLength : undefined,
				tags: this.tags ? this.tags.split(',').map(t => t.trim()) : [],
				addedTime: new Date().toISOString(),
				referenceCount: 0,
				references: [],
				bibText: this.generateBibTeX(),
				metadata: {
					isLocalFile: isLocalFile,
					sourceUrl: this.url,
					wasCopied: result.wasCopied
				},
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
					// 不阻止下载流程，只记录错误
				}
			}

			// 自动同步标签到 Obsidian
			await this.plugin.tagSyncManager.autoSyncTags();

			// 清理临时文件
			if (!isLocalFile && sourcePath.includes(this.plugin.settings.tempDir)) {
				try {
					const tempFile = this.app.vault.getAbstractFileByPath(sourcePath);
					if (tempFile) {
						await this.app.vault.delete(tempFile);
					}
				} catch (error) {
					console.log('Failed to delete temp file:', error);
				}
			}

			// 刷新Research Attachment Hub视图
			this.plugin.refreshResearchAttachmentHubView();

			const copyStatus = result.wasCopied ? ' (copied to attachment directory)' : '';
			if (isLocalFile) {
				new Notice(`Paper linked from local file${copyStatus}`);
			} else {
				new Notice(`Paper downloaded successfully${copyStatus}`);
			}
			this.close();
		} catch (error) {
			console.error('Error in completeDownload:', error);
			new Notice(`Failed to complete download: ${error.message}`);
		}
	}

	private async showDownloadFailedModal(): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new Modal(this.app);
			modal.titleEl.setText('Download Failed');
			
			const { contentEl } = modal;
			contentEl.createEl('p', { text: 'Failed to download PDF from the provided URL.' });
			contentEl.createEl('p', { text: 'Would you like to select a local PDF file instead?' });

			const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
			
			const selectButton = buttonContainer.createEl('button', { 
				text: 'Select Local File', 
				cls: 'mod-cta' 
			});
			
			const cancelButton = buttonContainer.createEl('button', { 
				text: 'Cancel', 
				cls: 'mod-muted' 
			});

			selectButton.addEventListener('click', () => {
				modal.close();
				resolve(true);
			});

			cancelButton.addEventListener('click', () => {
				modal.close();
				resolve(false);
			});

			modal.open();
		});
	}

	private async selectLocalFile(): Promise<File | null> {
		// 检查是否在新窗口中
		if (window.opener || window.name.includes('obsidian')) {
			// 在新窗口中，显示限制提示
			new Notice(this.plugin.languageManager.t('notices.obsidianWindowLimit'));
			return null;
		}
		
		return new Promise((resolve) => {
			// 创建文件输入框
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.pdf';
			
			// 绑定事件
			input.onchange = (event) => {
				const file = (event.target as HTMLInputElement).files?.[0];
				// 清理
				if (document.body.contains(input)) {
					document.body.removeChild(input);
				}
				resolve(file || null);
			};

			// 添加到 DOM 并触发点击
			document.body.appendChild(input);
			input.click();
		});
	}

	private async copyLocalFile(sourceFile: File, targetPath: string): Promise<string> {
		try {
			const arrayBuffer = await sourceFile.arrayBuffer();
			await this.app.vault.adapter.writeBinary(targetPath, arrayBuffer);
			return targetPath;
		} catch (error) {
			console.error('Error copying local file:', error);
			throw new Error('Failed to copy local file: ' + error.message);
		}
	}

	async downloadPDFFromURL(url: string): Promise<ArrayBuffer | null> {
		try {
			// 如果是DOI，转换为DOI链接
			if (this.doi && !url.startsWith('http')) {
				url = this.plugin.doiExtractor.generateDOILink(this.doi);
			}

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const buffer = await response.arrayBuffer();
			return buffer;
		} catch (error) {
			console.error('Error downloading PDF:', error);
			return null;
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

	private async ensureTempDirectoryExists(): Promise<void> {
		try {
			const tempDir = this.plugin.settings.tempDir;
			const folder = this.app.vault.getAbstractFileByPath(tempDir);
			
			if (!folder) {
				await this.app.vault.createFolder(tempDir);
			} else if (!(folder instanceof TFolder)) {
				throw new Error(`Path ${tempDir} exists but is not a folder`);
			}
		} catch (error) {
			console.error('Error creating temp directory:', error);
			throw new Error(`Failed to create temp directory: ${error.message}`);
		}
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
}
