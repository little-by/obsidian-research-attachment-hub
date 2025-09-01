import { Modal, Notice } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';

export class ImportPackageModal extends Modal {
	private plugin: ResearchAttachmentHubPlugin;
	private fileSelector: HTMLElement | null = null;

	constructor(app: any, plugin: ResearchAttachmentHubPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.plugin.languageManager.t('modals.importPackage.title') });
		contentEl.createEl('p', { 
			text: this.plugin.languageManager.t('modals.importPackage.description'),
			cls: 'setting-item-description'
		});

		// 创建文件选择区域
		this.createFileSelector(contentEl);

		// 创建说明信息
		this.createImportInfo(contentEl);

		// 创建操作按钮
		this.createActionButtons(contentEl);

		// 创建隐藏的文件输入框，直接添加到模态框内容中
		this.createHiddenFileInput(contentEl);

		// 延迟绑定事件，确保DOM完全渲染
		setTimeout(() => {
			this.bindEvents();
		}, 100);

		// 额外延迟绑定，确保在独立窗口中也能正常工作
		setTimeout(() => {
			this.bindEvents();
			// console.log('Secondary event binding completed');
		}, 500);

		// console.log('ImportPackageModal opened successfully');
	}

	private createHiddenFileInput(container: HTMLElement) {
		// 创建隐藏的文件输入框
		const hiddenInput = container.createEl('input', {
			attr: {
				type: 'file',
				accept: '.zip',
				id: 'hidden-file-input'
			}
		});
		hiddenInput.style.cssText = `
			position: absolute;
			left: -9999px;
			top: -9999px;
			opacity: 0;
			pointer-events: none;
		`;

		// 绑定change事件
		hiddenInput.addEventListener('change', (e) => {
			// console.log('Hidden file input change event triggered');
			const target = e.target as HTMLInputElement;
			const file = target.files?.[0];
			if (file) {
				// console.log('File selected via hidden input:', file.name, file.size);
				this.handleFileSelection(file);
			} else {
				// console.log('No file selected in hidden input');
			}
		});

		// console.log('Hidden file input created and bound');
	}

	private createFileSelector(container: HTMLElement) {
		this.fileSelector = container.createEl('div', { cls: 'file-selector' });
		this.fileSelector.style.cssText = `
			margin-top: 20px;
			padding: 20px;
			border: 2px dashed var(--background-modifier-border);
			border-radius: 8px;
			text-align: center;
			cursor: pointer;
			background-color: var(--background-secondary);
			transition: all 0.2s ease;
			user-select: none;
			position: relative;
			z-index: 1000;
		`;

		this.fileSelector.innerHTML = `
			<div style="font-size: 48px; margin-bottom: 10px;">📦</div>
			<div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${this.plugin.languageManager.t('modals.importPackage.selectFile')}</div>
			<div style="font-size: 12px; color: var(--text-muted);">${this.plugin.languageManager.t('modals.importPackage.zipFormat')}</div>
			<div style="font-size: 12px; color: var(--text-muted); margin-top: 10px;">${this.plugin.languageManager.t('modals.importPackage.dragDropHint')}</div>
			<div style="font-size: 12px; color: var(--text-error); margin-top: 10px; font-weight: bold;">${this.plugin.languageManager.t('modals.importPackage.obWindowLimit')}</div>
		`;

		console.log('File selector created');
	}

	private bindEvents() {
		if (!this.fileSelector) {
			console.error('File selector not found');
			return;
		}

		console.log('Binding events to file selector');

		// 直接绑定点击事件，使用最简单的方法
		this.fileSelector.onclick = (e: MouseEvent) => {
			console.log('File selector clicked!');
			e.preventDefault();
			e.stopPropagation();
			this.selectImportFile();
		};

		// 触摸事件
		this.fileSelector.ontouchstart = (e: TouchEvent) => {
			console.log('File selector touched!');
			e.preventDefault();
			this.selectImportFile();
		};

		console.log('Click events bound to file selector');

		// 拖拽事件
		this.fileSelector.ondragover = (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.fileSelector!.style.borderColor = 'var(--text-accent)';
			this.fileSelector!.style.backgroundColor = 'var(--background-primary)';
			console.log('File dragged over');
		};

		this.fileSelector.ondragleave = (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.fileSelector!.style.borderColor = 'var(--background-modifier-border)';
			this.fileSelector!.style.backgroundColor = 'var(--background-secondary)';
			console.log('File dragged leave');
		};

		this.fileSelector.ondrop = (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.fileSelector!.style.borderColor = 'var(--background-modifier-border)';
			this.fileSelector!.style.backgroundColor = 'var(--background-secondary)';
			
			const files = e.dataTransfer?.files;
			console.log('File dropped, files:', files);
			if (files && files.length > 0) {
				this.handleFileSelection(files[0]);
			}
		};

		console.log('All events bound successfully');
	}

	private createImportInfo(container: HTMLElement) {
		const info = container.createEl('div', { cls: 'import-info' });
		info.style.cssText = `
			margin-top: 20px;
			padding: 15px;
			background-color: var(--background-secondary);
			border-radius: 8px;
			font-size: 14px;
		`;

		info.innerHTML = `
			<h3>${this.plugin.languageManager.t('modals.importPackage.importInfo')}</h3>
			<p>${this.plugin.languageManager.t('modals.importPackage.importInfoDesc')}</p>
			<pre style="margin: 10px 0; padding-left: 20px; font-size: 12px; line-height: 1.5;">${this.plugin.languageManager.t('modals.importPackage.importSteps')}</pre>
		`;
	}

	private createActionButtons(container: HTMLElement) {
		const buttonContainer = container.createEl('div', { cls: 'modal-button-container' });
		buttonContainer.style.cssText = `
			margin-top: 20px;
			display: flex;
			justify-content: flex-end;
			gap: 10px;
		`;

		// 取消按钮
		const cancelBtn = buttonContainer.createEl('button', { 
			text: '取消',
			cls: 'mod-warning'
		});
		cancelBtn.onclick = () => {
			console.log('Cancel button clicked');
			this.close();
		};

		// 选择文件按钮
		const selectBtn = buttonContainer.createEl('button', { 
			text: '选择文件',
			cls: 'mod-cta'
		});
		selectBtn.onclick = () => {
			console.log('Select file button clicked');
			this.selectImportFile();
		};

		console.log('Action buttons created');
	}

	private selectImportFile() {
		console.log('selectImportFile called');
		
		// 检查是否在新窗口中
		if (window.opener || window.name.includes('obsidian')) {
			// 在新窗口中，显示限制提示
			// new Notice(this.plugin.languageManager.t('notices.obsidianWindowLimit'));
			return;
		}
		
		try {
			// 创建文件输入框
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.zip';
			input.multiple = false;
			
			// 绑定事件
			input.onchange = (event) => {
				const target = event.target as HTMLInputElement;
				const file = target.files?.[0];
				if (file) {
					this.handleFileSelection(file);
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
			console.error('Error in selectImportFile:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			new Notice(this.plugin.languageManager.t('notices.fileSelectFailed') + ': ' + errorMessage);
		}
	}
	
	// 使用 Obsidian 原生 API 的方法
	private selectFileWithObsidianAPI() {
		// console.log('Using Obsidian native API method');
		try {
			// 创建一个临时的可见按钮
			const button = document.createElement('button');
			button.textContent = this.plugin.languageManager.t('modals.importPackage.clickToSelect');
			button.style.cssText = `
				position: fixed !important;
				top: 50% !important;
				left: 50% !important;
				transform: translate(-50%, -50%) !important;
				z-index: 999999 !important;
				padding: 20px 40px !important;
				font-size: 18px !important;
				background: var(--interactive-accent) !important;
				color: white !important;
				border: none !important;
				border-radius: 8px !important;
				cursor: pointer !important;
				box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
			`;
			
			// 创建文件输入框
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.zip';
			input.multiple = false;
			input.style.display = 'none';
			
			// 绑定事件
			input.onchange = (event) => {
				const target = event.target as HTMLInputElement;
				const file = target.files?.[0];
				if (file) {
					this.handleFileSelection(file);
				}
				// 清理
				if (document.body.contains(button)) {
					document.body.removeChild(button);
				}
				if (document.body.contains(input)) {
					document.body.removeChild(input);
				}
			};
			
			// 按钮点击事件
			button.onclick = () => {
				input.click();
			};
			
			// 添加到 DOM
			document.body.appendChild(input);
			document.body.appendChild(button);
			
			// 自动点击按钮
			setTimeout(() => {
				button.click();
			}, 100);
			
		} catch (error) {
			console.error('Error with Obsidian API method:', error);
			// 回退到可见按钮方法
			this.selectFileWithVisibleButton();
		}
	}
	
	// 使用可见按钮的方法
	private selectFileWithVisibleButton() {
		// console.log('Using visible button method');
		try {
			// 创建一个可见的按钮
			const button = document.createElement('button');
			button.textContent = this.plugin.languageManager.t('modals.importPackage.selectZIPFile');
			button.style.cssText = `
				position: fixed !important;
				top: 50% !important;
				left: 50% !important;
				transform: translate(-50%, -50%) !important;
				z-index: 999999 !important;
				padding: 20px 40px !important;
				font-size: 18px !important;
				background: var(--interactive-accent) !important;
				color: white !important;
				border: none !important;
				border-radius: 8px !important;
				cursor: pointer !important;
				box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
			`;
			
			// 创建文件输入框
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.zip';
			input.multiple = false;
			input.style.display = 'none';
			
			// 绑定事件
			input.onchange = (event) => {
				const target = event.target as HTMLInputElement;
				const file = target.files?.[0];
				if (file) {
					this.handleFileSelection(file);
				}
				// 清理
				if (document.body.contains(button)) {
					document.body.removeChild(button);
				}
				if (document.body.contains(input)) {
					document.body.removeChild(input);
				}
			};
			
			// 按钮点击事件
			button.onclick = () => {
				input.click();
			};
			
			// 添加到 DOM
			document.body.appendChild(input);
			document.body.appendChild(button);
			
			// 显示提示
			// new Notice(this.plugin.languageManager.t('notices.clickToSelectFile'));
			
		} catch (error) {
			console.error('Error with visible button method:', error);
			new Notice(this.plugin.languageManager.t('notices.fileSelectorCreationFailed'));
		}
	}

	private async handleFileSelection(file: File) {
		try {
			console.log('Handling file selection:', file.name, file.size);
			new Notice(this.plugin.languageManager.t('notices.processingPackage'));
			
			// 创建唯一的临时文件名，避免路径问题
			const timestamp = Date.now();
			const safeFileName = `import-package-${timestamp}.zip`;
			const filePath = safeFileName;
			
			console.log(`Using safe file path: ${filePath}`);
			
			const arrayBuffer = await file.arrayBuffer();
			await this.app.vault.adapter.writeBinary(filePath, arrayBuffer);
			
			console.log('File copied to vault:', filePath);
			
			// 调用插件的导入方法
			await this.plugin.importCompletePackage(filePath);
			
			// 清理临时文件
			const tempFile = this.app.vault.getAbstractFileByPath(filePath);
			if (tempFile) {
				await this.app.vault.delete(tempFile);
				console.log('Temporary file cleaned up');
			}
			
			new Notice(this.plugin.languageManager.t('notices.packageImported'));
			// 关闭模态框
			this.close();
			
		} catch (error) {
			console.error('Import package error:', error);
			new Notice(this.plugin.languageManager.t('notices.importPackageFailed', { error: error.message }));
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		console.log('ImportPackageModal closed');
	}
}

