import { App, Modal, Notice } from 'obsidian';
import { AttachmentRecord } from '../main';

export class DuplicateDOIModal extends Modal {
	app: App;
	existingRecord: AttachmentRecord;
	newRecord: Partial<AttachmentRecord>;
	onContinue: (record: Partial<AttachmentRecord>) => void;
	onCancel: () => void;

	constructor(
		app: App, 
		existingRecord: AttachmentRecord, 
		newRecord: Partial<AttachmentRecord>,
		onContinue: (record: Partial<AttachmentRecord>) => void,
		onCancel: () => void
	) {
		super(app);
		this.app = app;
		this.existingRecord = existingRecord;
		this.newRecord = newRecord;
		this.onContinue = onContinue;
		this.onCancel = onCancel;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// 标题
		contentEl.createEl('h2', { 
			text: '⚠️ 发现重复的 DOI',
			cls: 'duplicate-doi-title'
		});

		// 警告信息
		const warningDiv = contentEl.createEl('div', { 
			cls: 'duplicate-doi-warning'
		});
		warningDiv.innerHTML = `
			<p><strong>您要添加的 DOI 已存在于数据库中：</strong></p>
			<p><code>${this.newRecord.doi}</code></p>
		`;

		// 现有记录信息
		const existingInfo = contentEl.createEl('div', { 
			cls: 'existing-record-info'
		});
		existingInfo.innerHTML = `
			<h3>现有记录：</h3>
			<div class="record-details">
				<p><strong>标题：</strong>${this.existingRecord.title}</p>
				<p><strong>作者：</strong>${this.existingRecord.author || '未知'}</p>
				<p><strong>年份：</strong>${this.existingRecord.year || '未知'}</p>
				<p><strong>文件：</strong>${this.existingRecord.fileName}</p>
				<p><strong>添加时间：</strong>${new Date(this.existingRecord.addedTime).toLocaleDateString()}</p>
			</div>
		`;

		// 新记录信息
		const newInfo = contentEl.createEl('div', { 
			cls: 'new-record-info'
		});
		newInfo.innerHTML = `
			<h3>新记录：</h3>
			<div class="record-details">
				<p><strong>标题：</strong>${this.newRecord.title || '未知'}</p>
				<p><strong>作者：</strong>${this.newRecord.author || '未知'}</p>
				<p><strong>年份：</strong>${this.newRecord.year || '未知'}</p>
			</div>
		`;

		// 操作按钮
		const buttonContainer = contentEl.createEl('div', { 
			cls: 'duplicate-doi-buttons'
		});

		// 查看现有记录按钮
		const viewExistingBtn = buttonContainer.createEl('button', {
			text: '👁️ 查看现有记录',
			cls: 'mod-cta'
		});
		viewExistingBtn.addEventListener('click', () => {
			this.viewExistingRecord();
		});

		// 继续添加按钮
		const continueBtn = buttonContainer.createEl('button', {
			text: '➕ 继续添加（可能重复）',
			cls: 'mod-warning'
		});
		continueBtn.addEventListener('click', () => {
			this.onContinue(this.newRecord);
			this.close();
		});

		// 取消按钮
		const cancelBtn = buttonContainer.createEl('button', {
			text: '❌ 取消',
			cls: 'mod-warning'
		});
		cancelBtn.addEventListener('click', () => {
			this.onCancel();
			this.close();
		});

		// 添加样式
		this.addStyles();
	}

	private addStyles() {
		const style = document.createElement('style');
		style.textContent = `
			.duplicate-doi-title {
				color: #d73a49;
				text-align: center;
				margin-bottom: 20px;
			}

			.duplicate-doi-warning {
				background-color: #fff3cd;
				border: 1px solid #ffeaa7;
				border-radius: 5px;
				padding: 15px;
				margin-bottom: 20px;
			}

			.duplicate-doi-warning p {
				margin: 5px 0;
			}

			.duplicate-doi-warning code {
				background-color: #f8f9fa;
				padding: 2px 6px;
				border-radius: 3px;
				font-family: monospace;
			}

			.existing-record-info,
			.new-record-info {
				background-color: #f8f9fa;
				border: 1px solid #e9ecef;
				border-radius: 5px;
				padding: 15px;
				margin-bottom: 20px;
			}

			.existing-record-info h3,
			.new-record-info h3 {
				margin-top: 0;
				color: #495057;
			}

			.record-details p {
				margin: 5px 0;
				font-size: 14px;
			}

			.duplicate-doi-buttons {
				display: flex;
				gap: 10px;
				justify-content: center;
				margin-top: 20px;
			}

			.duplicate-doi-buttons button {
				padding: 8px 16px;
				border-radius: 5px;
				border: none;
				cursor: pointer;
				font-size: 14px;
			}
		`;
		document.head.appendChild(style);
	}

	private async viewExistingRecord() {
		try {
			// 关闭当前模态框
			this.close();
			
			// 显示提示信息
			new Notice(`请手动打开附件管理器查看记录：${this.existingRecord.title}`);
			
		} catch (error) {
			console.error('Error in viewExistingRecord:', error);
			new Notice('无法显示文件，请手动打开');
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
