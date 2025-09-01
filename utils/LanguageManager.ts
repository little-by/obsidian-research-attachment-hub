import { Notice } from 'obsidian';
import { getTranslation, getSupportedLanguages, getLanguageDisplayName, SupportedLanguage } from '../locales/language-table';

// 语言管理器类 - 使用新的语言表格系统
export class LanguageManager {
	private currentLanguage: SupportedLanguage = 'en-US';
	private fallbackLanguage: SupportedLanguage = 'en-US';

	constructor() {
		// 构造函数中不需要初始化，语言表格已经预先加载
	}

	/**
	 * 初始化语言管理器（兼容旧接口，现在不需要异步操作）
	 */
	public async initialize(): Promise<void> {
		// 语言表格已经同步加载，不需要异步初始化
		console.log('Language manager initialized with table-based system');
	}

	/**
	 * 设置当前语言
	 */
	public setLanguage(language: SupportedLanguage): void {
		const supportedLanguages = getSupportedLanguages();
		if (supportedLanguages.includes(language)) {
			this.currentLanguage = language;
			console.log(`Language changed to: ${language}`);
			new Notice(`Language changed to: ${this.getLanguageDisplayName(language)}`);
		} else {
			console.warn(`Language ${language} not supported, falling back to ${this.fallbackLanguage}`);
			this.currentLanguage = this.fallbackLanguage;
		}
	}

	/**
	 * 设置初始语言（不显示通知）
	 */
	public setInitialLanguage(language: SupportedLanguage): void {
		const supportedLanguages = getSupportedLanguages();
		if (supportedLanguages.includes(language)) {
			this.currentLanguage = language;
			console.log(`Initial language set to: ${language}`);
		} else {
			console.warn(`Language ${language} not supported, falling back to ${this.fallbackLanguage}`);
			this.currentLanguage = this.fallbackLanguage;
		}
	}

	/**
	 * 获取当前语言
	 */
	public getCurrentLanguage(): SupportedLanguage {
		return this.currentLanguage;
	}

	/**
	 * 获取支持的语言列表
	 */
	public getSupportedLanguages(): SupportedLanguage[] {
		return getSupportedLanguages();
	}

	/**
	 * 获取语言显示名称
	 */
	public getLanguageDisplayName(language: SupportedLanguage): string {
		return getLanguageDisplayName(language);
	}

	/**
	 * 获取翻译文本
	 * @param key 翻译键，支持点号分隔的嵌套路径，如 'common.confirm'
	 * @param params 参数对象，用于替换文本中的占位符
	 * @returns 翻译后的文本
	 */
	public t(key: string, params?: Record<string, any>): string {
		try {
			return getTranslation(key, this.currentLanguage, params);
		} catch (error) {
			console.error(`Error getting translation for key ${key}:`, error);
			// 如果出错，尝试使用备用语言
			try {
				return getTranslation(key, this.fallbackLanguage, params);
			} catch (fallbackError) {
				console.error(`Fallback translation also failed for key ${key}:`, fallbackError);
				return key; // 如果都失败，返回键名
			}
		}
	}

	/**
	 * 检查语言是否支持
	 */
	public isLanguageSupported(language: string): language is SupportedLanguage {
		const supportedLanguages = getSupportedLanguages();
		return supportedLanguages.includes(language as SupportedLanguage);
	}

	/**
	 * 获取语言配置信息
	 */
	public getLanguageInfo(): Array<{ code: SupportedLanguage; name: string; nativeName: string }> {
		const languages = getSupportedLanguages();
		return languages.map(lang => ({
			code: lang,
			name: this.getLanguageNameInEnglish(lang),
			nativeName: getLanguageDisplayName(lang)
		}));
	}

	/**
	 * 获取英文语言名称
	 */
	private getLanguageNameInEnglish(language: SupportedLanguage): string {
		const names: Record<SupportedLanguage, string> = {
			'zh-CN': 'Chinese (Simplified)',
			'zh-TW': 'Chinese (Traditional)',
			'en-US': 'English',
			'ja-JP': 'Japanese',
			'de-DE': 'German',
			'fr-FR': 'French',
			'ru-RU': 'Russian',
			'es-ES': 'Spanish'
		};
		return names[language] || language;
	}

	/**
	 * 重新加载语言配置（兼容旧接口，现在不需要重新加载）
	 */
	public async reloadLanguages(): Promise<void> {
		console.log('Language table is static, no reload needed');
	}
}
