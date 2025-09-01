import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';

export class EditModal extends Modal {
	plugin: ResearchAttachmentHubPlugin;
	record: AttachmentRecord;
	onSave: (record: AttachmentRecord) => void;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin, record: AttachmentRecord, onSave: (record: AttachmentRecord) => void) {
		super(app);
		this.plugin = plugin;
		this.record = { ...record }; // 创建副本以避免直接修改
		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Edit Attachment' });

		// 标题
		new Setting(contentEl)
			.setName('Title')
			.setDesc('The title of the paper')
			.addText(text => text
				.setValue(this.record.title)
				.onChange(value => {
					this.record.title = value;
				})
			);

		// 作者
		new Setting(contentEl)
			.setName('Author')
			.setDesc('The author(s) of the paper')
			.addText(text => text
				.setValue(this.record.author)
				.onChange(value => {
					this.record.author = value;
				})
			);

		// 年份
		new Setting(contentEl)
			.setName('Year')
			.setDesc('The publication year')
			.addText(text => text
				.setValue(this.record.year)
				.onChange(value => {
					this.record.year = value;
				})
			);

		// 发表机构/期刊/会议
		new Setting(contentEl)
			.setName('Publisher/Journal/Conference')
			.setDesc('Journal name, conference name, or publisher')
			.addText(text => text
				.setValue(this.record.publisher || '')
				.onChange(value => {
					this.record.publisher = value;
					// 自动检测期刊等级
					this.autoDetectJournalLevel();
				})
			);

		// 期刊等级
		new Setting(contentEl)
			.setName('Journal Level')
			.setDesc('CCF level or SCI zone (auto-detected, can be manually adjusted)')
			.addDropdown(dropdown => {
				// 导入期刊等级检测器
				const { JournalLevelDetector } = require('../utils/JournalLevelDetector');
				const levels = JournalLevelDetector.getAllJournalLevels();
				
				levels.forEach((level: any) => {
					dropdown.addOption(level.value, level.label);
				});
				
				dropdown.setValue(this.record.journalLevel || 'Other');
				dropdown.onChange((value) => {
					this.record.journalLevel = value as 'CCF-A' | 'CCF-B' | 'CCF-C' | 'SCI-1' | 'SCI-2' | 'SCI-3' | 'SCI-4' | 'Other';
				});
			});

		// DOI
		new Setting(contentEl)
			.setName('DOI')
			.setDesc('The DOI of the paper')
			.addText(text => text
				.setValue(this.record.doi)
				.onChange(value => {
					this.record.doi = value;
				})
			);

		// 标签
		new Setting(contentEl)
			.setName('Tags')
			.setDesc('Comma-separated tags')
			.addText(text => text
				.setValue(this.record.tags.join(', '))
				.onChange(value => {
					this.record.tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
				})
			);

		// MD文件状态
		const mdFileSetting = new Setting(contentEl)
			.setName('MD File Status')
			.setDesc(this.record.hasMDFile ? 
				`MD file exists: ${this.record.mdFilePath}` : 
				'No MD file created for this attachment'
			);

		if (this.record.hasMDFile) {
			mdFileSetting.addButton(btn => btn
				.setButtonText('Open MD File')
				.setClass('mod-cta')
				.onClick(() => {
					if (this.record.mdFilePath) {
						const mdFile = this.app.vault.getAbstractFileByPath(this.record.mdFilePath);
						if (mdFile instanceof TFile) {
							this.app.workspace.openLinkText('', this.record.mdFilePath, true);
						}
					}
				})
			);
		} else {
			mdFileSetting.addButton(btn => btn
				.setButtonText('Create MD File')
				.setClass('mod-cta')
				.onClick(async () => {
					try {
						// 强制创建MD文件，忽略设置限制
						await this.plugin.attachmentTagManager.createMDFile(this.record, true);
						
						// 更新数据库记录
						await this.plugin.database.updateRecord(this.record);
						
						new Notice(this.plugin.languageManager.t('notices.MDFileCreated'));
						
						// 刷新描述
						mdFileSetting.setDesc(`MD file created: ${this.record.mdFilePath}`);
						
						// 更新按钮
						mdFileSetting.controlEl.empty();
						mdFileSetting.addButton(btn => btn
							.setButtonText('Open MD File')
							.setClass('mod-cta')
							.onClick(() => {
								if (this.record.mdFilePath) {
									const mdFile = this.app.vault.getAbstractFileByPath(this.record.mdFilePath);
									if (mdFile instanceof TFile) {
										this.app.workspace.openLinkText('', this.record.mdFilePath, true);
									}
								}
							})
						);
						
						// 通知主界面刷新
						if (this.onSave) {
							this.onSave(this.record);
						}
					} catch (error) {
						console.error('Error creating MD file:', error);
						new Notice(this.plugin.languageManager.t('notices.MDFileCreateFailed') + ': ' + error.message);
					}
				})
			);
		}

		// BibTeX
		new Setting(contentEl)
			.setName('BibTeX')
			.setDesc('BibTeX citation')
			.addTextArea(text => text
				.setValue(this.record.bibText)
				.onChange(value => {
					this.record.bibText = value;
				})
			);

		// 按钮区域
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		
		new Setting(buttonContainer)
			.addButton(btn => btn
				.setButtonText('Save')
				.setClass('mod-cta')
				.onClick(async () => {
					await this.saveRecord();
				})
			)
			.addButton(btn => btn
				.setButtonText('Cancel')
				.onClick(() => {
					this.close();
				})
			);
	}

	// 自动检测期刊等级
	private autoDetectJournalLevel() {
		if (!this.record.publisher) {
			this.record.journalLevel = 'Other';
			return;
		}

		try {
			const { JournalLevelDetector } = require('../utils/JournalLevelDetector');
			const detectedLevel = JournalLevelDetector.detectJournalLevel(this.record.publisher, this.record.title);
			this.record.journalLevel = detectedLevel;
			
			// 更新下拉框的值
			this.updateJournalLevelField(detectedLevel);
			
			// 显示检测结果提示
			if (detectedLevel !== 'Other') {
				const description = JournalLevelDetector.getJournalLevelDescription(detectedLevel);
				new Notice(`📊 Auto-detected: ${description}`);
			}
		} catch (error) {
			console.error('Error detecting journal level:', error);
			this.record.journalLevel = 'Other';
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

	async saveRecord() {
		try {
			// 首先验证MD文件状态
			await this.plugin.attachmentTagManager.validateMDFileStatus(this.record);
			
			// 同步更新对应的MD文件
			if (this.record.hasMDFile && this.record.mdFilePath) {
				try {
					await this.plugin.attachmentTagManager.updateMDFile(this.record);
					new Notice(this.plugin.languageManager.t('notices.recordUpdated'));
				} catch (mdError) {
					console.error('Error updating MD file:', mdError);
					new Notice(this.plugin.languageManager.t('notices.recordUpdatedMDFailed'));
				}
			} else {
				// 如果没有MD文件，尝试创建一个
				try {
					await this.plugin.attachmentTagManager.createMDFile(this.record, true);
					// 创建成功后，更新记录状态
					this.record.hasMDFile = true;
					this.record.mdFilePath = this.plugin.attachmentTagManager.getMDFilePath(this.record);
					new Notice(this.plugin.languageManager.t('notices.recordCreatedMDSuccess'));
				} catch (mdError) {
					console.error('Error creating MD file:', mdError);
					new Notice(this.plugin.languageManager.t('notices.recordCreatedMDFailed'));
				}
			}
			
			// 确保记录状态正确
			if (this.record.hasMDFile && !this.record.mdFilePath) {
				this.record.mdFilePath = this.plugin.attachmentTagManager.getMDFilePath(this.record);
			}
			
			// 更新记录到数据库（包含最新的MD文件状态）
			await this.plugin.database.updateRecord(this.record);
			
			// 调用回调
			this.onSave(this.record);
			
			this.close();
		} catch (error) {
			console.error('Error saving record:', error);
			new Notice(this.plugin.languageManager.t('notices.recordSaveFailed'));
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}