import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';

export class LostMDFileModal extends Modal {
	plugin: ResearchAttachmentHubPlugin;
	record: AttachmentRecord;
	onResolve: (record: AttachmentRecord, action: 'reassign' | 'recreate') => void;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin, record: AttachmentRecord, onResolve: (record: AttachmentRecord, action: 'reassign' | 'recreate') => void) {
		super(app);
		this.plugin = plugin;
		this.record = record;
		this.onResolve = onResolve;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'MD文件丢失处理' });

		// 显示丢失文件的信息
		const infoContainer = contentEl.createEl('div', { cls: 'lost-md-info' });
		infoContainer.style.cssText = `
			margin: 15px 0;
			padding: 15px;
			background-color: var(--background-secondary);
			border-radius: 8px;
			border: 1px solid var(--background-modifier-border);
		`;

		infoContainer.innerHTML = `
			<strong>📄 附件信息：</strong><br>
			<strong>标题：</strong>${this.record.title || 'Unknown'}<br>
			<strong>作者：</strong>${this.record.author || 'Unknown'}<br>
			<strong>年份：</strong>${this.record.year || 'Unknown'}<br>
			<strong>原路径：</strong><code>${this.record.mdFilePath || 'Unknown'}</code><br><br>
			<em>⚠️ 系统检测到MD文件丢失，请选择处理方式</em>
		`;

		// 选项1：重新指认路径
		const reassignContainer = contentEl.createEl('div', { cls: 'reassign-option' });
		reassignContainer.style.cssText = `
			margin: 15px 0;
			padding: 15px;
			background-color: var(--background-secondary-alt);
			border-radius: 8px;
			border: 1px solid var(--background-modifier-border);
		`;

		reassignContainer.createEl('h3', { text: '🔄 重新指认路径' });
		reassignContainer.createEl('p', { text: '如果MD文件被移动到了其他位置，请指定新的路径。' });

		let newPath = '';
		new Setting(reassignContainer)
			.setName('新MD文件路径')
			.setDesc('输入MD文件的完整路径（例如：Research/paper_notes.md）')
			.addText(text => text
				.setPlaceholder('Research/paper_notes.md')
				.onChange(value => {
					newPath = value;
				})
			);

		new Setting(reassignContainer)
			.addButton(btn => btn
				.setButtonText('重新指认')
				.setClass('mod-cta')
				.onClick(async () => {
					if (!newPath.trim()) {
						new Notice(this.plugin.languageManager.t('notices.pleaseEnterValidPath'));
						return;
					}

					const success = await this.plugin.attachmentTagManager.reassignMDFilePath(this.record, newPath.trim());
					if (success) {
						this.onResolve(this.record, 'reassign');
						this.close();
					} else {
						new Notice(this.plugin.languageManager.t('notices.invalidPathOrFileNotExist'));
					}
				})
			);

		// 选项2：新建MD文件
		const recreateContainer = contentEl.createEl('div', { cls: 'recreate-option' });
		recreateContainer.style.cssText = `
			margin: 15px 0;
			padding: 15px;
			background-color: var(--background-secondary-alt);
			border-radius: 8px;
			border: 1px solid var(--background-modifier-border);
		`;

		recreateContainer.createEl('h3', { text: '🆕 新建MD文件' });
		recreateContainer.createEl('p', { text: '如果原文件无法找回，可以创建一个新的MD文件。' });

		new Setting(recreateContainer)
			.addButton(btn => btn
				.setButtonText('新建MD文件')
				.setClass('mod-cta')
				.onClick(async () => {
					try {
						// 强制创建MD文件，忽略设置限制
						await this.plugin.attachmentTagManager.createMDFile(this.record, true);
						this.onResolve(this.record, 'recreate');
						this.close();
					} catch (error) {
						new Notice(this.plugin.languageManager.t('notices.createMDFileFailed') + ': ' + error.message);
					}
				})
			);

		// 取消按钮
		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.style.cssText = `
			margin-top: 20px;
			text-align: center;
		`;

		new Setting(buttonContainer)
			.addButton(btn => btn
				.setButtonText('稍后处理')
				.onClick(() => {
					this.close();
				})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
