import { Modal, Setting, Notice } from 'obsidian';

export class ImportPreviewModal extends Modal {
	private importData: any;
	private importSettings: any;
	private onConfirm: (shouldImport: boolean) => void;
	private selectedRecords: Set<string> = new Set();
	private importSettingsEnabled: boolean = false;
	private recordsContainer: HTMLElement;

	constructor(app: any, importData: any, importSettings: any, onConfirm: (shouldImport: boolean) => void) {
		super(app);
		this.importData = importData;
		this.importSettings = importSettings;
		this.onConfirm = onConfirm;
		
		// 获取实际的附件数组
		const attachments = importData.attachments || importData;
		
		// 默认选择所有记录
		if (Array.isArray(attachments)) {
			attachments.forEach((record: any) => {
				this.selectedRecords.add(record.id || record.title);
			});
		} else {
			console.warn('Import data is not in expected format:', importData);
		}
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: '导入预览' });
		contentEl.createEl('p', { 
			text: '请检查将要导入的内容，可以选择性地导入记录和设置。',
			cls: 'setting-item-description'
		});

		// 导入统计信息
		this.createImportSummary(contentEl);

		// 设置导入选项
		this.createImportOptions(contentEl);

		// 记录列表
		this.createRecordsList(contentEl);

		// 操作按钮
		this.createActionButtons(contentEl);
	}

	private createImportSummary(container: HTMLElement) {
		const summary = container.createEl('div', { cls: 'import-summary' });
		summary.style.padding = '15px';
		summary.style.backgroundColor = 'var(--background-secondary)';
		summary.style.borderRadius = '8px';
		summary.style.marginBottom = '20px';

		// 获取实际的附件数组
		const attachments = this.importData.attachments || this.importData;
		const totalRecords = Array.isArray(attachments) ? attachments.length : 0;
		const selectedRecords = this.selectedRecords.size;

		summary.innerHTML = `
			<h3>导入概览</h3>
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
				<div>
					<strong>总记录数:</strong> ${totalRecords}
				</div>
				<div>
					<strong>已选择:</strong> ${selectedRecords}
				</div>
				<div>
					<strong>设置文件:</strong> ${this.importSettings ? '可用' : '无'}
				</div>
				<div>
					<strong>附件文件:</strong> 包含
				</div>
			</div>
		`;
	}

	private createImportOptions(container: HTMLElement) {
		// 设置导入选项
		if (this.importSettings) {
			new Setting(container)
				.setName('导入插件设置')
				.setDesc('是否导入插件的配置设置？这将覆盖当前设置。')
				.addToggle(toggle => toggle
					.setValue(this.importSettingsEnabled)
					.onChange(value => {
						this.importSettingsEnabled = value;
					}));
		}

		// 记录选择选项
		new Setting(container)
			.setName('选择所有记录')
			.setDesc('快速选择或取消选择所有记录')
			.addButton(button => button
				.setButtonText('全选')
				.setClass('mod-cta')
				.onClick(() => {
					this.selectAllRecords();
					this.renderRecordsList(this.recordsContainer);
				}))
			.addButton(button => button
				.setButtonText('取消全选')
				.setClass('mod-warning')
				.onClick(() => {
					this.deselectAllRecords();
					this.renderRecordsList(this.recordsContainer);
				}));
	}

	private createRecordsList(container: HTMLElement) {
		this.recordsContainer = container.createEl('div', { cls: 'records-list' });
		this.recordsContainer.style.marginTop = '20px';
		this.recordsContainer.style.maxHeight = '400px';
		this.recordsContainer.style.overflowY = 'auto';
		this.recordsContainer.style.border = '1px solid var(--background-modifier-border)';
		this.recordsContainer.style.borderRadius = '8px';
		this.recordsContainer.style.padding = '10px';

		this.renderRecordsList(this.recordsContainer);
	}

	private renderRecordsList(container: HTMLElement) {
		container.empty();

		// 获取实际的附件数组
		const attachments = this.importData.attachments || this.importData;
		
		if (!Array.isArray(attachments) || attachments.length === 0) {
			container.createEl('p', { 
				text: '没有可导入的记录',
				cls: 'no-records'
			});
			return;
		}

		// 创建记录列表
		attachments.forEach((record: any) => {
			const recordItem = container.createEl('div', { cls: 'record-item' });
			recordItem.style.padding = '10px';
			recordItem.style.borderBottom = '1px solid var(--background-modifier-border)';
			recordItem.style.display = 'flex';
			recordItem.style.alignItems = 'center';
			recordItem.style.gap = '10px';

			// 选择框
			const checkbox = recordItem.createEl('input', { type: 'checkbox' });
			checkbox.checked = this.selectedRecords.has(record.id || record.title);
			checkbox.addEventListener('change', (e) => {
				const target = e.target as HTMLInputElement;
				if (target.checked) {
					this.selectedRecords.add(record.id || record.title);
				} else {
					this.selectedRecords.delete(record.id || record.title);
				}
			});

			// 记录信息
			const recordInfo = recordItem.createEl('div', { cls: 'record-info' });
			recordInfo.style.flex = '1';

			const title = recordInfo.createEl('div', { 
				text: record.title || '无标题',
				cls: 'record-title'
			});
			title.style.fontWeight = 'bold';
			title.style.marginBottom = '5px';

			const details = recordInfo.createEl('div', { cls: 'record-details' });
			details.style.fontSize = '12px';
			details.style.color = 'var(--text-muted)';

			if (record.author) {
				details.createEl('span', { text: `作者: ${record.author} | ` });
			}
			if (record.year) {
				details.createEl('span', { text: `年份: ${record.year} | ` });
			}
			if (record.doi) {
				details.createEl('span', { text: `DOI: ${record.doi} | ` });
			}
			if (record.publisher) {
				details.createEl('span', { text: `发表机构: ${record.publisher}` });
			}

			// 文件状态指示
			const fileStatus = recordItem.createEl('div', { cls: 'file-status' });
			fileStatus.style.fontSize = '11px';
			fileStatus.style.padding = '4px 8px';
			fileStatus.style.borderRadius = '4px';
			fileStatus.style.backgroundColor = 'var(--background-modifier-border)';
			fileStatus.style.color = 'var(--text-muted)';
			fileStatus.textContent = record.fileName || '未知文件';
		});
	}

	private selectAllRecords() {
		// 获取实际的附件数组
		const attachments = this.importData.attachments || this.importData;
		
		if (Array.isArray(attachments)) {
			attachments.forEach((record: any) => {
				this.selectedRecords.add(record.id || record.title);
			});
		}
	}

	private deselectAllRecords() {
		this.selectedRecords.clear();
	}

	private createActionButtons(container: HTMLElement) {
		const buttonContainer = container.createEl('div', { cls: 'modal-button-container' });
		buttonContainer.style.marginTop = '20px';
		buttonContainer.style.display = 'flex';
		buttonContainer.style.justifyContent = 'flex-end';
		buttonContainer.style.gap = '10px';

		// 取消按钮
		const cancelBtn = buttonContainer.createEl('button', { 
			text: '取消',
			cls: 'mod-warning'
		});
		cancelBtn.addEventListener('click', () => {
			this.onConfirm(false);
			this.close();
		});

		// 确认导入按钮
		const confirmBtn = buttonContainer.createEl('button', { 
			text: `导入 ${this.selectedRecords.size} 个记录`,
			cls: 'mod-cta'
		});
		confirmBtn.addEventListener('click', () => {
			if (this.selectedRecords.size === 0) {
				new Notice('请先选择要导入的记录');
				return;
			}
			
			// 获取实际的附件数组
			const attachments = this.importData.attachments || this.importData;
			
			if (!Array.isArray(attachments)) {
				new Notice('导入数据格式错误，请检查文件格式');
				return;
			}
			
			// 过滤选中的记录
			const filteredAttachments = attachments.filter((record: any) => 
				this.selectedRecords.has(record.id || record.title)
			);
			
			// 创建新的导入数据结构
			const filteredData = {
				...this.importData,
				attachments: filteredAttachments,
				totalCount: filteredAttachments.length
			};
			
			// 更新导入数据
			this.importData = filteredData;
			
			console.log(`Importing ${filteredAttachments.length} selected records`);
			this.onConfirm(true);
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	// 获取过滤后的导入数据
	getFilteredImportData() {
		const attachments = this.importData.attachments || this.importData;
		
		if (!Array.isArray(attachments)) {
			return [];
		}
		
		return attachments.filter((record: any) => 
			this.selectedRecords.has(record.id || record.title)
		);
	}

	// 获取设置导入状态
	getSettingsImportEnabled() {
		return this.importSettingsEnabled;
	}
}
