import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';

export class SearchModal extends Modal {
	app: App;
	plugin: ResearchAttachmentHubPlugin;
	doi: string = '';
	searchResults: AttachmentRecord[] = [];

	constructor(app: App, plugin: ResearchAttachmentHubPlugin) {
		super(app);
		this.app = app;
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Search Paper by DOI' });

		// DOI输入
		new Setting(contentEl)
			.setName('DOI')
			.setDesc('Enter the DOI of the paper to search for')
			.addText(text => text
				.setPlaceholder('10.1000/...')
				.setValue(this.doi)
				.onChange((value) => {
					this.doi = value;
				}));

		// 搜索按钮
		const searchBtn = contentEl.createEl('button', { 
			text: 'Search',
			cls: 'mod-cta'
		});
		searchBtn.addEventListener('click', () => this.searchPaper());

		// 结果显示区域
		this.createResultsContainer(contentEl);

		// 取消按钮
		const cancelBtn = contentEl.createEl('button', { 
			text: 'Cancel',
			cls: 'mod-warning'
		});
		cancelBtn.addEventListener('click', () => this.close());
	}

	createResultsContainer(container: HTMLElement) {
		const resultsContainer = container.createEl('div', { cls: 'search-results-container' });
		resultsContainer.style.display = 'none';
		resultsContainer.style.marginTop = '20px';
		resultsContainer.style.padding = '10px';
		resultsContainer.style.border = '1px solid var(--background-modifier-border)';
		resultsContainer.style.borderRadius = '5px';
	}

	async searchPaper() {
		if (!this.doi.trim()) {
			new Notice(this.plugin.languageManager.t('notices.pleaseEnterDOI'));
			return;
		}

		try {
			// 清理DOI
			const cleanDOI = this.plugin.doiExtractor.cleanDOI(this.doi);
			
			// 验证DOI格式
			if (!this.plugin.doiExtractor.validateDOI(cleanDOI)) {
				new Notice(this.plugin.languageManager.t('notices.invalidDOIFormat'));
				return;
			}

			// 在数据库中搜索
			const record = this.plugin.database.findByDOI(cleanDOI);
			
			if (record) {
				this.displayResult(record);
			} else {
				this.displayNoResult();
			}

		} catch (error) {
			console.error('Error searching paper:', error);
			new Notice(this.plugin.languageManager.t('notices.searchFailed') + ': ' + error.message);
		}
	}

	displayResult(record: AttachmentRecord) {
		const { contentEl } = this;
		
		// 清除之前的结果
		const existingResults = contentEl.querySelector('.search-results-container');
		if (existingResults) {
			existingResults.remove();
		}

		// 创建新的结果容器
		const resultsContainer = contentEl.createEl('div', { cls: 'search-results-container' });
		resultsContainer.style.marginTop = '20px';
		resultsContainer.style.padding = '15px';
		resultsContainer.style.border = '1px solid var(--background-modifier-border)';
		resultsContainer.style.borderRadius = '5px';
		resultsContainer.style.backgroundColor = 'var(--background-secondary)';

		// 显示找到的论文信息
		resultsContainer.createEl('h3', { text: 'Paper Found!', cls: 'search-result-title' });

		const infoContainer = resultsContainer.createEl('div', { cls: 'paper-info' });
		
		// 标题
		const titleEl = infoContainer.createEl('div', { cls: 'paper-field' });
		titleEl.createEl('strong', { text: 'Title: ' });
		titleEl.createEl('span', { text: record.title });

		// 作者
		if (record.author) {
			const authorEl = infoContainer.createEl('div', { cls: 'paper-field' });
			authorEl.createEl('strong', { text: 'Author: ' });
			authorEl.createEl('span', { text: record.author });
		}

		// 年份
		if (record.year) {
			const yearEl = infoContainer.createEl('div', { cls: 'paper-field' });
			yearEl.createEl('strong', { text: 'Year: ' });
			yearEl.createEl('span', { text: record.year });
		}

		// DOI
		const doiEl = infoContainer.createEl('div', { cls: 'paper-field' });
		doiEl.createEl('strong', { text: 'DOI: ' });
		doiEl.createEl('span', { text: record.doi });

		// 文件路径
		const pathEl = infoContainer.createEl('div', { cls: 'paper-field' });
		pathEl.createEl('strong', { text: 'File Path: ' });
		pathEl.createEl('span', { text: record.filePath });

		// 标签
		if (record.tags && record.tags.length > 0) {
			const tagsEl = infoContainer.createEl('div', { cls: 'paper-field' });
			tagsEl.createEl('strong', { text: 'Tags: ' });
			tagsEl.createEl('span', { text: record.tags.join(', ') });
		}

		// 引用次数
		const refEl = infoContainer.createEl('div', { cls: 'paper-field' });
		refEl.createEl('strong', { text: 'Reference Count: ' });
		refEl.createEl('span', { text: record.referenceCount.toString() });

		// 添加时间
		const timeEl = infoContainer.createEl('div', { cls: 'paper-field' });
		timeEl.createEl('strong', { text: 'Added: ' });
		timeEl.createEl('span', { text: new Date(record.addedTime).toLocaleDateString() });

		// 操作按钮
		const actionsContainer = resultsContainer.createEl('div', { cls: 'paper-actions' });
		actionsContainer.style.marginTop = '15px';
		actionsContainer.style.display = 'flex';
		actionsContainer.style.gap = '10px';

		// 打开文件按钮
		const openBtn = actionsContainer.createEl('button', { 
			text: 'Open PDF',
			cls: 'mod-cta'
		});
		openBtn.addEventListener('click', () => this.openPDF(record));

		// 复制路径按钮
		const copyPathBtn = actionsContainer.createEl('button', { 
			text: 'Copy Path',
			cls: 'mod-cta'
		});
		copyPathBtn.addEventListener('click', () => this.copyPath(record.filePath));

		// 生成引用按钮
		const citationBtn = actionsContainer.createEl('button', { 
			text: 'Generate Citation',
			cls: 'mod-cta'
		});
		citationBtn.addEventListener('click', () => this.generateCitation(record));

		// 复制BibTeX按钮
		const bibtexBtn = actionsContainer.createEl('button', { 
			text: 'Copy BibTeX',
			cls: 'mod-cta'
		});
		bibtexBtn.addEventListener('click', () => this.copyBibTeX(record));

		// 在文件管理器中显示按钮
		const showInFolderBtn = actionsContainer.createEl('button', { 
			text: 'Show in Folder',
			cls: 'mod-cta'
		});
		showInFolderBtn.addEventListener('click', () => this.showInFolder(record.filePath));
	}

	displayNoResult() {
		const { contentEl } = this;
		
		// 清除之前的结果
		const existingResults = contentEl.querySelector('.search-results-container');
		if (existingResults) {
			existingResults.remove();
		}

		// 创建新的结果容器
		const resultsContainer = contentEl.createEl('div', { cls: 'search-results-container' });
		resultsContainer.style.marginTop = '20px';
		resultsContainer.style.padding = '15px';
		resultsContainer.style.border = '1px solid var(--background-modifier-border)';
		resultsContainer.style.borderRadius = '5px';
		resultsContainer.style.backgroundColor = 'var(--background-secondary)';

		resultsContainer.createEl('h3', { text: 'Paper Not Found', cls: 'search-result-title' });
		resultsContainer.createEl('p', { text: `No paper found with DOI: ${this.doi}` });
		
		// 建议
		const suggestions = resultsContainer.createEl('div', { cls: 'suggestions' });
		suggestions.createEl('p', { text: 'Suggestions:' });
		
		const suggestionList = suggestions.createEl('ul');
		suggestionList.createEl('li', { text: 'Check if the DOI is correct' });
		suggestionList.createEl('li', { text: 'Try searching with a different DOI format' });
		suggestionList.createEl('li', { text: 'The paper might not be in your local database yet' });
		suggestionList.createEl('li', { text: 'Consider downloading the paper using the Download Paper command' });

		// 下载按钮
		const downloadBtn = resultsContainer.createEl('button', { 
			text: 'Download This Paper',
			cls: 'mod-cta'
		});
		downloadBtn.style.marginTop = '15px';
		downloadBtn.addEventListener('click', () => {
			this.close();
			// 打开下载模态框
			// 这里应该直接调用插件方法，而不是通过命令
			// this.plugin.app.commands.executeCommandById('research-attachment-hub:download-paper');
		});
	}

	async openPDF(record: AttachmentRecord) {
		try {
			const file = this.app.vault.getAbstractFileByPath(record.filePath);
			if (file instanceof TFile) {
				await this.app.workspace.getLeaf().openFile(file);
				new Notice(this.plugin.languageManager.t('notices.PDFOpened'));
			} else {
				new Notice(this.plugin.languageManager.t('notices.PDFFileNotFound'));
			}
		} catch (error) {
			console.error('Error opening PDF:', error);
			new Notice(this.plugin.languageManager.t('notices.failedToOpenPDF'));
		}
	}

	copyPath(filePath: string) {
		navigator.clipboard.writeText(filePath).then(() => {
			new Notice(this.plugin.languageManager.t('notices.pathCopied'));
		}).catch(() => {
			new Notice(this.plugin.languageManager.t('notices.failedToCopyPath'));
		});
	}

	generateCitation(record: AttachmentRecord) {
		const citation = this.plugin.pdfProcessor.generateCitation(record, 'apa');
		navigator.clipboard.writeText(citation).then(() => {
			new Notice(this.plugin.languageManager.t('notices.APACopied'));
		}).catch(() => {
			new Notice(this.plugin.languageManager.t('notices.failedToCopyAPA'));
		});
	}

	copyBibTeX(record: AttachmentRecord) {
		const bibtex = this.plugin.pdfProcessor.generateBibTeX(record);
		navigator.clipboard.writeText(bibtex).then(() => {
			new Notice(this.plugin.languageManager.t('notices.BibTeXCopied'));
		}).catch(() => {
			new Notice(this.plugin.languageManager.t('notices.failedToCopyBibTeX'));
		});
	}

	showInFolder(filePath: string) {
		try {
			// 在Obsidian中显示文件
			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file) {
				const leaf = this.app.workspace.getLeavesOfType('markdown').find(l => (l.view as any)?.file === file);
		if (leaf) {
			this.app.workspace.revealLeaf(leaf);
		}
				new Notice(this.plugin.languageManager.t('notices.fileRevealed'));
			}
		} catch (error) {
			console.error('Error showing file in folder:', error);
			new Notice(this.plugin.languageManager.t('notices.failedToShowFile'));
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
