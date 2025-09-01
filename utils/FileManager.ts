import { App, TFile, TFolder, Notice } from 'obsidian';
import type ResearchAttachmentHubPlugin from '../main';
import { AttachmentRecord } from '../main';

export class FileManager {
	private app: App;
	private plugin: ResearchAttachmentHubPlugin;

	constructor(app: App, plugin: ResearchAttachmentHubPlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	/**
	 * 处理文件导入，包括复制外部文件和重命名
	 */
	async processFileImport(
		sourcePath: string,
		record: Partial<AttachmentRecord>,
		enableRename: boolean = true
	): Promise<{ fileName: string; filePath: string; wasCopied: boolean }> {
		try {
			// 检查源文件是否存在
			const sourceFile = this.app.vault.getAbstractFileByPath(sourcePath);
			let finalFileName: string;
			let finalFilePath: string;
			let wasCopied = false;

			if (sourceFile instanceof TFile) {
				// 文件在vault内
				if (this.plugin.settings.autoCopyExternalFiles) {
					// 即使文件在vault内，也复制到附件目录
					const result = await this.copyFileToAttachmentDirectory(sourceFile, record, enableRename);
					finalFileName = result.fileName;
					finalFilePath = result.filePath;
					wasCopied = true;
				} else {
					// 不复制，直接使用原文件
					finalFileName = sourceFile.name;
					finalFilePath = sourceFile.path;
				}
			} else {
				// 文件在vault外，需要复制
				const result = await this.copyExternalFileToVault(sourcePath, record, enableRename);
				finalFileName = result.fileName;
				finalFilePath = result.filePath;
				wasCopied = true;
			}

			return { fileName: finalFileName, filePath: finalFilePath, wasCopied };
		} catch (error) {
			console.error('Error processing file import:', error);
			throw new Error(`Failed to process file import: ${error.message}`);
		}
	}

	/**
	 * 将文件复制到附件目录
	 */
	private async copyFileToAttachmentDirectory(
		sourceFile: TFile,
		record: Partial<AttachmentRecord>,
		enableRename: boolean
	): Promise<{ fileName: string; filePath: string }> {
		try {
			const attachmentDir = this.getAttachmentDirectory();
			await this.ensureDirectoryExists(attachmentDir);

			let fileName: string;
			if (enableRename && this.plugin.settings.fileNameTemplate) {
				fileName = this.generateFileName(record, sourceFile.extension);
			} else {
				fileName = sourceFile.name;
			}

			// 检查目标文件是否已存在，如果存在则生成唯一文件名
			let finalPath = `${attachmentDir}/${fileName}`;
			if (this.app.vault.getAbstractFileByPath(finalPath)) {
				fileName = this.generateUniqueFileName(fileName, attachmentDir);
				finalPath = `${attachmentDir}/${fileName}`;
			}

			// 复制文件内容
			const fileContent = await this.app.vault.readBinary(sourceFile);
			await this.app.vault.adapter.writeBinary(finalPath, fileContent);

			// console.log(`Successfully copied file to: ${finalPath}`);
			return { fileName, filePath: finalPath };
		} catch (error) {
			console.error('Error copying file to attachment directory:', error);
			throw new Error(`Failed to copy file to attachment directory: ${error.message}`);
		}
	}

	/**
	 * 将外部文件复制到vault
	 */
	private async copyExternalFileToVault(
		sourcePath: string,
		record: Partial<AttachmentRecord>,
		enableRename: boolean
	): Promise<{ fileName: string; filePath: string }> {
		try {
			const attachmentDir = this.getAttachmentDirectory();
			await this.ensureDirectoryExists(attachmentDir);

			// 从外部路径获取文件扩展名
			const extension = sourcePath.split('.').pop()?.toLowerCase() || 'pdf';
			
			let fileName: string;
			if (enableRename && this.plugin.settings.fileNameTemplate) {
				fileName = this.generateFileName(record, extension);
			} else {
				// 使用原文件名
				fileName = sourcePath.split(/[\\/]/).pop() || `imported_file.${extension}`;
			}

			// 检查文件名是否已存在，如果存在则生成唯一文件名
			let finalPath = `${attachmentDir}/${fileName}`;
			if (this.app.vault.getAbstractFileByPath(finalPath)) {
				fileName = this.generateUniqueFileName(fileName, attachmentDir);
				finalPath = `${attachmentDir}/${fileName}`;
			}

			try {
				// 使用Node.js的fs模块复制文件
				const fs = require('fs');
				const path = require('path');
				
				// 复制文件
				fs.copyFileSync(sourcePath, finalPath);
				
				console.log(`Successfully copied external file to: ${finalPath}`);
				return { fileName, filePath: finalPath };
			} catch (fsError) {
				console.error('Error copying external file:', fsError);
				throw new Error(`Failed to copy external file: ${fsError.message}`);
			}
		} catch (error) {
			console.error('Error in copyExternalFileToVault:', error);
			throw error;
		}
	}

	/**
	 * 生成文件名
	 */
	private generateFileName(record: Partial<AttachmentRecord>, extension: string): string {
		let fileName = this.plugin.settings.fileNameTemplate;
		
		// 替换模板变量
		fileName = fileName.replace(/\{\{title\}\}/g, record.title || 'untitled');
		fileName = fileName.replace(/\{\{author\}\}/g, record.author || 'unknown');
		fileName = fileName.replace(/\{\{year\}\}/g, record.year || 'unknown');
		fileName = fileName.replace(/\{\{doi\}\}/g, record.doi || 'no-doi');
		fileName = fileName.replace(/\{\{current_folder\}\}/g, this.getCurrentFolder());
		
		// 清理文件名中的非法字符
		fileName = fileName.replace(/[<>:"/\\|?*]/g, '_');
		fileName = fileName.replace(/\s+/g, '_');
		fileName = fileName.replace(/_+/g, '_');
		fileName = fileName.replace(/^_+|_+$/g, '');
		
		// 添加扩展名
		if (!fileName.endsWith(`.${extension}`)) {
			fileName += `.${extension}`;
		}
		
		return fileName;
	}

	/**
	 * 生成唯一文件名
	 */
	private generateUniqueFileName(fileName: string, directory: string): string {
		const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
		const extension = fileName.substring(fileName.lastIndexOf('.'));
		let counter = 1;
		let newFileName = fileName;

		while (this.app.vault.getAbstractFileByPath(`${directory}/${newFileName}`)) {
			newFileName = `${nameWithoutExt}_${counter}${extension}`;
			counter++;
		}

		return newFileName;
	}

	/**
	 * 获取附件目录
	 */
	private getAttachmentDirectory(): string {
		let dir = this.plugin.settings.attachmentDirectory;
		
		// 替换变量
		dir = dir.replace(/\{\{current_folder\}\}/g, this.getCurrentFolder());
		
		// 确保目录路径正确
		if (!dir.startsWith('/')) {
			dir = `/${dir}`;
		}
		
		return dir.replace(/^\/+|\/+$/g, '');
	}

	/**
	 * 获取当前文件夹
	 */
	private getCurrentFolder(): string {
		const activeFile = this.app.workspace.getActiveFile();
		if (activeFile) {
			const folder = this.app.vault.getAbstractFileByPath(activeFile.path);
			if (folder && folder.parent) {
				return folder.parent.path;
			}
		}
		return '';
	}

	/**
	 * 确保目录存在
	 */
	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			const pathParts = dirPath.split('/').filter(part => part.length > 0);
			let currentPath = '';

			for (const part of pathParts) {
				currentPath += `/${part}`;
				const folder = this.app.vault.getAbstractFileByPath(currentPath);
				
				if (!folder) {
					// 尝试创建目录，如果已存在则忽略错误
					try {
						await this.app.vault.createFolder(currentPath);
					} catch (error) {
						// 如果目录已存在，忽略错误
						if (!error.message.includes('already exists')) {
							console.warn(`Warning creating folder ${currentPath}:`, error);
						}
					}
				} else if (!(folder instanceof TFolder)) {
					// 如果路径存在但不是文件夹，这是真正的错误
					throw new Error(`Path ${currentPath} exists but is not a folder`);
				}
			}
		} catch (error) {
			console.error('Error ensuring directory exists:', error);
			throw error;
		}
	}

	/**
	 * 获取可用的模板变量说明
	 */
	getTemplateVariablesHelp(): string {
		return `可用的模板变量：
• {{title}} - 论文标题
• {{author}} - 作者姓名
• {{year}} - 发表年份
• {{doi}} - DOI标识符
• {{current_folder}} - 当前笔记所在文件夹

示例：{{title}}_{{author}}_{{year}} → "Machine_Learning_John_Smith_2024.pdf"`;
	}

	/**
	 * 在新窗口中安全地触发文件选择
	 * 这是为了解决新窗口中文件选择器无法正常工作的问题
	 */
	static async triggerFileSelection(
		accept: string = '*',
		multiple: boolean = false
	): Promise<File | File[] | null> {
		return new Promise((resolve) => {
			// 创建文件输入框
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = accept;
			input.multiple = multiple;
			
			// 设置样式确保在新窗口中也能正常工作
			input.style.cssText = `
				position: fixed !important;
				top: 0 !important;
				left: 0 !important;
				width: 100% !important;
				height: 100% !important;
				opacity: 0 !important;
				cursor: pointer !important;
				z-index: 999999 !important;
				pointer-events: auto !important;
			`;
			
			// 绑定事件处理器
			const handleFileSelect = (event: Event) => {
				const target = event.target as HTMLInputElement;
				const files = target.files;
				
				let result: File | File[] | null = null;
				if (files && files.length > 0) {
					result = multiple ? Array.from(files) : files[0];
				}
				
				// 清理事件监听器和DOM元素
				input.removeEventListener('change', handleFileSelect);
				input.removeEventListener('cancel', handleCancel);
				if (document.body.contains(input)) {
					document.body.removeChild(input);
				}
				
				resolve(result);
			};
			
			const handleCancel = () => {
				// 清理事件监听器和DOM元素
				input.removeEventListener('change', handleFileSelect);
				input.removeEventListener('cancel', handleCancel);
				if (document.body.contains(input)) {
					document.body.removeChild(input);
				}
				resolve(null);
			};
			
			input.addEventListener('change', handleFileSelect);
			input.addEventListener('cancel', handleCancel);
			
			// 将输入框添加到当前窗口的 body 中
			document.body.appendChild(input);
			
			// 使用多种方式尝试触发文件选择
			const triggerFileSelect = () => {
				try {
					// 方法1：直接点击
					input.focus();
					input.click();
				} catch (clickError) {
					console.error('Direct click failed:', clickError);
					
					try {
						// 方法2：使用 dispatchEvent
						const clickEvent = new MouseEvent('click', {
							bubbles: true,
							cancelable: true,
							view: window
						});
						input.dispatchEvent(clickEvent);
					} catch (dispatchError) {
						console.error('Dispatch event failed:', dispatchError);
						
						try {
							// 方法3：使用 mousedown + mouseup
							const mousedownEvent = new MouseEvent('mousedown', {
								bubbles: true,
								cancelable: true,
								view: window
							});
							const mouseupEvent = new MouseEvent('mouseup', {
								bubbles: true,
								cancelable: true,
								view: window
							});
							input.dispatchEvent(mousedownEvent);
							input.dispatchEvent(mouseupEvent);
						} catch (mouseError) {
							console.error('Mouse events failed:', mouseError);
							
							// 方法4：使用 touchstart + touchend（移动设备）
							try {
								const touchstartEvent = new TouchEvent('touchstart', {
									bubbles: true,
									cancelable: true
								});
								const touchendEvent = new TouchEvent('touchend', {
									bubbles: true,
									cancelable: true
								});
								input.dispatchEvent(touchstartEvent);
								input.dispatchEvent(touchendEvent);
							} catch (touchError) {
								console.error('Touch events failed:', touchError);
								
								// 最后的备用方案：显示错误信息
							new Notice('无法打开文件选择器，请重试');
							input.removeEventListener('change', handleFileSelect);
							input.removeEventListener('cancel', handleCancel);
							if (document.body.contains(input)) {
								document.body.removeChild(input);
							}
							resolve(null);
							}
						}
					}
				}
			};
			
			// 使用 setTimeout 确保 DOM 完全渲染后再触发
			setTimeout(triggerFileSelect, 100);
		});
	}
}
