import { App, Modal, Setting, Notice } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';

export class CreateMDFileModal extends Modal {
	plugin: ResearchAttachmentHubPlugin;
	record: AttachmentRecord;
	onConfirm: (record: AttachmentRecord) => void;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin, record: AttachmentRecord, onConfirm: (record: AttachmentRecord) => void) {
		super(app);
		this.plugin = plugin;
		this.record = record;
		this.onConfirm = onConfirm;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// 计算MD文件路径
		const mdFilePath = this.plugin.attachmentTagManager.getMDFilePath(this.record);
		
		// 检查文件是否已存在
		const fileExists = await this.plugin.attachmentTagManager.checkMDFileExists({
			...this.record,
			mdFilePath: mdFilePath
		});

		// 标题
		contentEl.createEl('h2', { text: fileExists ? '更新MD文件' : '创建MD文件' });

		// 附件信息
		const infoContainer = contentEl.createEl('div', { cls: 'md-file-info' });
		infoContainer.style.marginBottom = '20px';
		infoContainer.style.padding = '15px';
		infoContainer.style.backgroundColor = 'var(--background-secondary)';
		infoContainer.style.borderRadius = '8px';
		infoContainer.style.border = '1px solid var(--background-modifier-border)';

		infoContainer.createEl('h3', { text: this.record.title });
		
		if (this.record.author) {
			infoContainer.createEl('p', { text: `作者: ${this.record.author}` });
		}
		if (this.record.year) {
			infoContainer.createEl('p', { text: `年份: ${this.record.year}` });
		}
		if (this.record.doi) {
			infoContainer.createEl('p', { text: `DOI: ${this.record.doi}` });
		}

		// MD文件路径信息
		const pathContainer = contentEl.createEl('div', { cls: 'md-file-path' });
		pathContainer.style.marginBottom = '20px';
		pathContainer.style.padding = '15px';
		pathContainer.style.backgroundColor = 'var(--background-primary)';
		pathContainer.style.borderRadius = '8px';
		pathContainer.style.border = '1px solid var(--background-modifier-border)';

		pathContainer.createEl('h4', { text: 'MD文件将创建在:' });
		const pathElement = pathContainer.createEl('code', { text: mdFilePath });
		pathElement.style.display = 'block';
		pathElement.style.marginTop = '8px';
		pathElement.style.padding = '8px';
		pathElement.style.backgroundColor = 'var(--background-secondary)';
		pathElement.style.borderRadius = '4px';
		pathElement.style.wordBreak = 'break-all';

		// 警告信息
		const warningContainer = contentEl.createEl('div', { cls: 'md-file-warning' });
		warningContainer.style.marginBottom = '20px';
		warningContainer.style.padding = '15px';
		
		if (fileExists) {
			warningContainer.style.backgroundColor = 'var(--background-modifier-error-hover)';
			warningContainer.style.borderRadius = '8px';
			warningContainer.style.border = '1px solid var(--background-modifier-error)';

			const warningIcon = warningContainer.createEl('span', { text: '⚠️ ' });
			warningIcon.style.marginRight = '8px';
			warningContainer.createEl('span', { 
				text: 'MD文件已存在，此操作将覆盖现有文件。' 
			});
		} else {
			warningContainer.style.backgroundColor = 'var(--background-modifier-accent)';
			warningContainer.style.borderRadius = '8px';
			warningContainer.style.border = '1px solid var(--text-accent)';

			const infoIcon = warningContainer.createEl('span', { text: 'ℹ️ ' });
			infoIcon.style.marginRight = '8px';
			warningContainer.createEl('span', { 
				text: '此操作将创建一个新的MD文件。' 
			});
		}

		// 按钮区域
		const buttonContainer = contentEl.createEl('div', { cls: 'md-file-buttons' });
		buttonContainer.style.display = 'flex';
		buttonContainer.style.gap = '10px';
		buttonContainer.style.justifyContent = 'flex-end';

		// 取消按钮
		const cancelBtn = buttonContainer.createEl('button', { text: '取消' });
		cancelBtn.style.padding = '8px 16px';
		cancelBtn.style.backgroundColor = 'var(--background-modifier-border)';
		cancelBtn.style.color = 'var(--text-normal)';
		cancelBtn.style.border = 'none';
		cancelBtn.style.borderRadius = '6px';
		cancelBtn.style.cursor = 'pointer';
		cancelBtn.addEventListener('click', () => {
			this.close();
		});

		// 确认按钮
		const confirmBtn = buttonContainer.createEl('button', { text: fileExists ? '更新MD文件' : '创建MD文件' });
		confirmBtn.style.padding = '8px 16px';
		confirmBtn.style.backgroundColor = 'var(--text-accent)';
		confirmBtn.style.color = 'white';
		confirmBtn.style.border = 'none';
		confirmBtn.style.borderRadius = '6px';
		confirmBtn.style.cursor = 'pointer';
		confirmBtn.addEventListener('click', async () => {
			try {
				// 强制创建MD文件
				await this.plugin.attachmentTagManager.createMDFile(this.record, true);
				// 更新数据库记录
				await this.plugin.database.updateRecord(this.record);
				// 调用回调函数
				this.onConfirm(this.record);
				// 关闭模态框
				this.close();
				// 显示成功消息
				new Notice(`已为 ${this.record.title} ${fileExists ? '更新' : '创建'}MD文件`);
			} catch (error) {
				console.error('Error creating MD file:', error);
				new Notice(`${fileExists ? '更新' : '创建'}MD文件失败: ${error.message}`);
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
