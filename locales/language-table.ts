// 语言表格系统 - 所有翻译集中管理
// 支持的语言类型
export type SupportedLanguage = 'en-US' | 'zh-CN' | 'zh-TW' | 'ja-JP' | 'de-DE' | 'fr-FR' | 'ru-RU' | 'es-ES';

// 翻译表格结构
export interface TranslationTable {
	[key: string]: Record<SupportedLanguage, string>;
}

// 所有翻译键值对
export const LANGUAGE_KEYS: TranslationTable = {
	// 通用按钮和操作
	'common.confirm': {
		'en-US': 'Confirm',
		'zh-CN': '确认',
		'zh-TW': '確認',
		'ja-JP': '確認',
		'de-DE': 'Bestätigen',
		'fr-FR': 'Confirmer',
		'ru-RU': 'Подтвердить',
		'es-ES': 'Confirmar'
	},


	'common.open': {
		'en-US': 'Open',
		'zh-CN': '打开',
		'zh-TW': '開啟',
		'ja-JP': '開く',
		'de-DE': 'Öffnen',
		'fr-FR': 'Ouvrir',
		'ru-RU': 'Открыть',
		'es-ES': 'Abrir'
	},
	'common.loading': {
		'en-US': 'Loading...',
		'zh-CN': '加载中...',
		'zh-TW': '載入中...',
		'ja-JP': '読み込み中...',
		'de-DE': 'Laden...',
		'fr-FR': 'Chargement...',
		'ru-RU': 'Загрузка...',
		'es-ES': 'Cargando...'
	},
	'common.error': {
		'en-US': 'Error',
		'zh-CN': '错误',
		'zh-TW': '錯誤',
		'ja-JP': 'エラー',
		'de-DE': 'Fehler',
		'fr-FR': 'Erreur',
		'ru-RU': 'Ошибка',
		'es-ES': 'Error'
	},
	'common.success': {
		'en-US': 'Success',
		'zh-CN': '成功',
		'zh-TW': '成功',
		'ja-JP': '成功',
		'de-DE': 'Erfolg',
		'fr-FR': 'Succès',
		'ru-RU': 'Успех',
		'es-ES': 'Éxito'
	},

	// 设置相关
	'settings.title': {
		'en-US': 'Research Attachment Hub Settings',
		'zh-CN': '研究附件中心设置',
		'zh-TW': '研究附件中心設定',
		'ja-JP': '研究アタッチメントハブ設定',
		'de-DE': 'Forschungsanhang-Hub-Einstellungen',
		'fr-FR': 'Paramètres du Hub de Pièces Jointes de Recherche',
		'ru-RU': 'Настройки центра исследовательских вложений',
		'es-ES': 'Configuración del Centro de Adjuntos de Investigación'
	},
	'settings.basic': {
		'en-US': 'Basic Settings',
		'zh-CN': '基础设置',
		'zh-TW': '基礎設定',
		'ja-JP': '基本設定',
		'de-DE': 'Grundeinstellungen',
		'fr-FR': 'Paramètres de Base',
		'ru-RU': 'Базовые настройки',
		'es-ES': 'Configuración Básica'
	},
	'settings.language': {
		'en-US': 'Language',
		'zh-CN': '语言',
		'zh-TW': '語言',
		'ja-JP': '言語',
		'de-DE': 'Sprache',
		'fr-FR': 'Langue',
		'ru-RU': 'Язык',
		'es-ES': 'Idioma'
	},
	'settings.languageDesc': {
		'en-US': 'Select the display language for the plugin',
		'zh-CN': '选择插件的显示语言',
		'zh-TW': '選擇插件的顯示語言',
		'ja-JP': 'プラグインの表示言語を選択',
		'de-DE': 'Wählen Sie die Anzeigesprache für das Plugin',
		'fr-FR': 'Sélectionnez la langue d\'affichage du plugin',
		'ru-RU': 'Выберите язык отображения плагина',
		'es-ES': 'Seleccione el idioma de visualización del plugin'
	},
	'settings.defaultFolder': {
		'en-US': 'Default Attachment Folder',
		'zh-CN': '默认附件文件夹',
		'zh-TW': '預設附件資料夾',
		'ja-JP': 'デフォルトのアタッチメントフォルダ',
		'de-DE': 'Standard-Anhangsordner',
		'fr-FR': 'Dossier de Pièces Jointes par Défaut',
		'ru-RU': 'Папка вложений по умолчанию',
		'es-ES': 'Carpeta de Adjuntos Predeterminada'
	},
	'settings.defaultFolderDesc': {
		'en-US': 'The default folder where attachments will be stored',
		'zh-CN': '附件存储的默认文件夹',
		'zh-TW': '附件儲存的預設資料夾',
		'ja-JP': 'アタッチメントが保存されるデフォルトフォルダ',
		'de-DE': 'Der Standardordner, in dem Anhänge gespeichert werden',
		'fr-FR': 'Le dossier par défaut où les pièces jointes seront stockées',
		'ru-RU': 'Папка по умолчанию для хранения вложений',
		'es-ES': 'La carpeta predeterminada donde se almacenarán los adjuntos'
	},

	// 主界面
	'views.mainView.title': {
		'en-US': 'Research Attachment Hub',
		'zh-CN': '研究附件中心',
		'zh-TW': '研究附件中心',
		'ja-JP': '研究アタッチメントハブ',
		'de-DE': 'Forschungsanhang-Hub',
		'fr-FR': 'Hub de Pièces Jointes de Recherche',
		'ru-RU': 'Центр исследовательских вложений',
		'es-ES': 'Centro de Adjuntos de Investigación'
	},
	'views.mainView.searchPlaceholder': {
		'en-US': 'Search attachments...',
		'zh-CN': '搜索附件...',
		'zh-TW': '搜尋附件...',
		'ja-JP': 'アタッチメントを検索...',
		'de-DE': 'Anhänge suchen...',
		'fr-FR': 'Rechercher des pièces jointes...',
		'ru-RU': 'Поиск вложений...',
		'es-ES': 'Buscar adjuntos...'
	},
	'views.mainView.noResults': {
		'en-US': 'No attachments found',
		'zh-CN': '未找到附件',
		'zh-TW': '未找到附件',
		'ja-JP': 'アタッチメントが見つかりません',
		'de-DE': 'Keine Anhänge gefunden',
		'fr-FR': 'Aucune pièce jointe trouvée',
		'ru-RU': 'Вложения не найдены',
		'es-ES': 'No se encontraron adjuntos'
	},
	'views.mainView.copy': {
		'en-US': 'Copy ',
		'zh-CN': '复制',
		'zh-TW': '複製',
		'ja-JP': 'コピー',
		'de-DE': 'Kopieren',
		'fr-FR': 'Copier',
		'ru-RU': 'Копировать',
		'es-ES': 'Copiar'
	},
	'views.mainView.copyComplete': {
		'en-US': 'Copy complete ',
		'zh-CN': '复制完整',
		'zh-TW': '複製完整',
		'ja-JP': '完全なコピー',
		'de-DE': 'Vollständig kopieren',
		'fr-FR': 'Copier complet',
		'ru-RU': 'Копировать полностью',
		'es-ES': 'Copiar completo'
	},
	'views.mainView.search': {
		'en-US': 'Search ',
		'zh-CN': '搜索',
		'zh-TW': '搜尋',
		'ja-JP': '検索',
		'de-DE': 'Suchen',
		'fr-FR': 'Rechercher',
		'ru-RU': 'Поиск',
		'es-ES': 'Buscar'
	},

	// 模态框标题
	'modal.search.title': {
		'en-US': 'Search Paper by DOI',
		'zh-CN': '通过DOI搜索论文',
		'zh-TW': '通過DOI搜尋論文',
		'ja-JP': 'DOIで論文を検索',
		'de-DE': 'Papier über DOI suchen',
		'fr-FR': 'Rechercher un document par DOI',
		'ru-RU': 'Поиск статьи по DOI',
		'es-ES': 'Buscar artículo por DOI'
	},
	'modal.edit.title': {
		'en-US': 'Edit Attachment',
		'zh-CN': '编辑附件',
		'zh-TW': '編輯附件',
		'ja-JP': 'アタッチメントを編集',
		'de-DE': 'Anhang bearbeiten',
		'fr-FR': 'Modifier la pièce jointe',
		'ru-RU': 'Редактировать вложение',
		'es-ES': 'Editar adjunto'
	},
	'modal.import.title': {
		'en-US': 'Import Attachments',
		'zh-CN': '导入附件',
		'zh-TW': '導入附件',
		'ja-JP': 'アタッチメントをインポート',
		'de-DE': 'Anhänge importieren',
		'fr-FR': 'Importer des pièces jointes',
		'ru-RU': 'Импортировать вложения',
		'es-ES': 'Importar adjuntos'
	},
	'modal.download.title': {
		'en-US': 'Download Paper',
		'zh-CN': '下载论文',
		'zh-TW': '下載論文',
		'ja-JP': '論文をダウンロード',
		'de-DE': 'Papier herunterladen',
		'fr-FR': 'Télécharger le document',
		'ru-RU': 'Скачать статью',
		'es-ES': 'Descargar artículo'
	},
	'modal.duplicate.title': {
		'en-US': 'Duplicate DOI Found',
		'zh-CN': '发现重复DOI',
		'zh-TW': '發現重複DOI',
		'ja-JP': '重複DOIが見つかりました',
		'de-DE': 'Doppelte DOI gefunden',
		'fr-FR': 'DOI en double trouvé',
		'ru-RU': 'Найден дублирующийся DOI',
		'es-ES': 'DOI duplicado encontrado'
	},
	'modal.scan.title': {
		'en-US': 'Scan Attachments',
		'zh-CN': '扫描附件',
		'zh-TW': '掃描附件',
		'ja-JP': 'アタッチメントをスキャン',
		'de-DE': 'Anhänge scannen',
		'fr-FR': 'Scanner les pièces jointes',
		'ru-RU': 'Сканировать вложения',
		'es-ES': 'Escanear adjuntos'
	},
	'modal.lost.title': {
		'en-US': 'Lost Markdown Files',
		'zh-CN': '丢失的Markdown文件',
		'zh-TW': '遺失的Markdown檔案',
		'ja-JP': '失われたMarkdownファイル',
		'de-DE': 'Verlorene Markdown-Dateien',
		'fr-FR': 'Fichiers Markdown perdus',
		'ru-RU': 'Потерянные Markdown файлы',
		'es-ES': 'Archivos Markdown perdidos'
	},

	// 模态框按钮
	'modal.button.search': {
		'en-US': 'Search',
		'zh-CN': '搜索',
		'zh-TW': '搜尋',
		'ja-JP': '検索',
		'de-DE': 'Suchen',
		'fr-FR': 'Rechercher',
		'ru-RU': 'Поиск',
		'es-ES': 'Buscar'
	},
	'modal.button.open': {
		'en-US': 'Open PDF',
		'zh-CN': '打开PDF',
		'zh-TW': '開啟PDF',
		'ja-JP': 'PDFを開く',
		'de-DE': 'PDF öffnen',
		'fr-FR': 'Ouvrir le PDF',
		'ru-RU': 'Открыть PDF',
		'es-ES': 'Abrir PDF'
	},
	'modal.button.copyPath': {
		'en-US': 'Copy Path',
		'zh-CN': '复制路径',
		'zh-TW': '複製路徑',
		'ja-JP': 'パスをコピー',
		'de-DE': 'Pfad kopieren',
		'fr-FR': 'Copier le chemin',
		'ru-RU': 'Копировать путь',
		'es-ES': 'Copiar ruta'
	},
	'modal.button.download': {
		'en-US': 'Download',
		'zh-CN': '下载',
		'zh-TW': '下載',
		'ja-JP': 'ダウンロード',
		'de-DE': 'Herunterladen',
		'fr-FR': 'Télécharger',
		'ru-RU': 'Скачать',
		'es-ES': 'Descargar'
	},
	'modal.button.import': {
		'en-US': 'Import',
		'zh-CN': '导入',
		'zh-TW': '導入',
		'ja-JP': 'インポート',
		'de-DE': 'Importieren',
		'fr-FR': 'Importer',
		'ru-RU': 'Импортировать',
		'es-ES': 'Importar'
	},
	'modal.button.browse': {
		'en-US': 'Browse',
		'zh-CN': '浏览',
		'zh-TW': '瀏覽',
		'ja-JP': 'ブラウズ',
		'de-DE': 'Durchsuchen',
		'fr-FR': 'Parcourir',
		'ru-RU': 'Обзор',
		'es-ES': 'Examinar'
	},
	'modal.button.selectFile': {
		'en-US': 'Select File',
		'zh-CN': '选择文件',
		'zh-TW': '選擇檔案',
		'ja-JP': 'ファイルを選択',
		'de-DE': 'Datei auswählen',
		'fr-FR': 'Sélectionner un fichier',
		'ru-RU': 'Выбрать файл',
		'es-ES': 'Seleccionar archivo'
	},

	// 表单标签
	'form.doi': {
		'en-US': 'DOI',
		'zh-CN': 'DOI',
		'zh-TW': 'DOI',
		'ja-JP': 'DOI',
		'de-DE': 'DOI',
		'fr-FR': 'DOI',
		'ru-RU': 'DOI',
		'es-ES': 'DOI'
	},
	'form.title': {
		'en-US': 'Title',
		'zh-CN': '标题',
		'zh-TW': '標題',
		'ja-JP': 'タイトル',
		'de-DE': 'Titel',
		'fr-FR': 'Titre',
		'ru-RU': 'Заголовок',
		'es-ES': 'Título'
	},
	'form.authors': {
		'en-US': 'Authors',
		'zh-CN': '作者',
		'zh-TW': '作者',
		'ja-JP': '著者',
		'de-DE': 'Autoren',
		'fr-FR': 'Auteurs',
		'ru-RU': 'Авторы',
		'es-ES': 'Autores'
	},
	'form.journal': {
		'en-US': 'Journal',
		'zh-CN': '期刊',
		'zh-TW': '期刊',
		'ja-JP': 'ジャーナル',
		'de-DE': 'Zeitschrift',
		'fr-FR': 'Journal',
		'ru-RU': 'Журнал',
		'es-ES': 'Revista'
	},
	'form.year': {
		'en-US': 'Year',
		'zh-CN': '年份',
		'zh-TW': '年份',
		'ja-JP': '年',
		'de-DE': 'Jahr',
		'fr-FR': 'Année',
		'ru-RU': 'Год',
		'es-ES': 'Año'
	},
	'form.tags': {
		'en-US': 'Tags',
		'zh-CN': '标签',
		'zh-TW': '標籤',
		'ja-JP': 'タグ',
		'de-DE': 'Tags',
		'fr-FR': 'Étiquettes',
		'ru-RU': 'Теги',
		'es-ES': 'Etiquetas'
	},
	'form.filePath': {
		'en-US': 'File Path',
		'zh-CN': '文件路径',
		'zh-TW': '檔案路徑',
		'ja-JP': 'ファイルパス',
		'de-DE': 'Dateipfad',
		'fr-FR': 'Chemin du fichier',
		'ru-RU': 'Путь к файлу',
		'es-ES': 'Ruta del archivo'
	},
	'form.referenceCount': {
		'en-US': 'Reference Count',
		'zh-CN': '引用次数',
		'zh-TW': '引用次數',
		'ja-JP': '参照回数',
		'de-DE': 'Zitierhäufigkeit',
		'fr-FR': 'Nombre de citations',
		'ru-RU': 'Количество ссылок',
		'es-ES': 'Recuento de referencias'
	},
	'form.addedTime': {
		'en-US': 'Added',
		'zh-CN': '添加时间',
		'zh-TW': '新增時間',
		'ja-JP': '追加日時',
		'de-DE': 'Hinzugefügt',
		'fr-FR': 'Ajouté',
		'ru-RU': 'Добавлено',
		'es-ES': 'Añadido'
	},

	// 提示消息
	'notices.noAvailableTags': {
		'en-US': 'No available tags found',
		'zh-CN': '没有找到可用标签',
		'zh-TW': '沒有找到可用標籤',
		'ja-JP': '利用可能なタグが見つかりません',
		'de-DE': 'Keine verfügbaren Tags gefunden',
		'fr-FR': 'Aucune étiquette disponible trouvée',
		'ru-RU': 'Доступные теги не найдены',
		'es-ES': 'No se encontraron etiquetas disponibles'
	},
	'notices.pleaseSelectTag': {
		'en-US': 'Please select a tag',
		'zh-CN': '请选择一个标签',
		'zh-TW': '請選擇一個標籤',
		'ja-JP': 'タグを選択してください',
		'de-DE': 'Bitte wählen Sie ein Tag',
		'fr-FR': 'Veuillez sélectionner une étiquette',
		'ru-RU': 'Пожалуйста, выберите тег',
		'es-ES': 'Por favor seleccione una etiqueta'
	},
	'notices.noAttachmentsWithTag': {
		'en-US': 'No attachments found with tag: {tag}',
		'zh-CN': '没有找到标签为 {tag} 的附件',
		'zh-TW': '沒有找到標籤為 {tag} 的附件',
		'ja-JP': 'タグ {tag} のアタッチメントが見つかりません',
		'de-DE': 'Keine Anhänge mit Tag: {tag} gefunden',
		'fr-FR': 'Aucune pièce jointe trouvée avec l\'étiquette : {tag}',
		'ru-RU': 'Вложения с тегом {tag} не найдены',
		'es-ES': 'No se encontraron adjuntos con la etiqueta: {tag}'
	},
	'notices.searchFailed': {
		'en-US': 'Search failed: {message}',
		'zh-CN': '搜索失败：{message}',
		'zh-TW': '搜尋失敗：{message}',
		'ja-JP': '検索に失敗しました：{message}',
		'de-DE': 'Suche fehlgeschlagen: {message}',
		'fr-FR': 'La recherche a échoué : {message}',
		'ru-RU': 'Поиск не удался: {message}',
		'es-ES': 'La búsqueda falló: {message}'
	},
	'notices.copiedToClipboard': {
		'en-US': 'Copied to clipboard',
		'zh-CN': '已复制到剪贴板',
		'zh-TW': '已複製到剪貼簿',
		'ja-JP': 'クリップボードにコピーされました',
		'de-DE': 'In die Zwischenablage kopiert',
		'fr-FR': 'Copié dans le presse-papiers',
		'ru-RU': 'Скопировано в буфер обмена',
		'es-ES': 'Copiado al portapapeles'
	},

	'notices.downloadSuccess': {
		'en-US': 'Download completed successfully',
		'zh-CN': '下载成功完成',
		'zh-TW': '下載成功完成',
		'ja-JP': 'ダウンロードが正常に完了しました',
		'de-DE': 'Download erfolgreich abgeschlossen',
		'fr-FR': 'Téléchargement terminé avec succès',
		'ru-RU': 'Загрузка успешно завершена',
		'es-ES': 'Descarga completada exitosamente'
	},
	'notices.importSuccess': {
		'en-US': 'Import completed successfully',
		'zh-CN': '导入成功完成',
		'zh-TW': '導入成功完成',
		'ja-JP': 'インポートが正常に完了しました',
		'de-DE': 'Import erfolgreich abgeschlossen',
		'fr-FR': 'Importation terminée avec succès',
		'ru-RU': 'Импорт успешно завершен',
		'es-ES': 'Importación completada exitosamente'
	},

	// 扫描相关提示
	'notices.scanningVault': {
		'en-US': 'Scanning vault for attachment files...',
		'zh-CN': '正在扫描保险库中的附件文件...',
		'zh-TW': '正在掃描保險庫中的附件檔案...',
		'ja-JP': 'アタッチメントファイルをスキャンしています...',
		'de-DE': 'Durchsuche Tresor nach Anhangdateien...',
		'fr-FR': 'Analyse du coffre-fort pour les fichiers joints...',
		'ru-RU': 'Сканирование хранилища для файлов вложений...',
		'es-ES': 'Escaneando la bóveda en busca de archivos adjuntos...'
	},
	'notices.scanError': {
		'en-US': 'Error scanning vault',
		'zh-CN': '扫描保险库时出错',
		'zh-TW': '掃描保險庫時出錯',
		'ja-JP': 'ボールトのスキャン中にエラーが発生しました',
		'de-DE': 'Fehler beim Scannen des Tresors',
		'fr-FR': 'Erreur lors de l\'analyse du coffre-fort',
		'ru-RU': 'Ошибка при сканировании хранилища',
		'es-ES': 'Error al escanear la bóveda'
	},
	'notices.noFilesSelected': {
		'en-US': 'No files selected',
		'zh-CN': '没有选择文件',
		'zh-TW': '沒有選擇檔案',
		'ja-JP': 'ファイルが選択されていません',
		'de-DE': 'Keine Dateien ausgewählt',
		'fr-FR': 'Aucun fichier sélectionné',
		'ru-RU': 'Файлы не выбраны',
		'es-ES': 'No se seleccionaron archivos'
	},
	'notices.addFilesError': {
		'en-US': 'Error adding files to Attachment Manager',
		'zh-CN': '添加文件到附件管理器时出错',
		'zh-TW': '新增檔案到附件管理器時出錯',
		'ja-JP': 'アタッチメントマネージャーへのファイル追加エラー',
		'de-DE': 'Fehler beim Hinzufügen von Dateien zum Anhang-Manager',
		'fr-FR': 'Erreur lors de l\'ajout de fichiers au gestionnaire de pièces jointes',
		'ru-RU': 'Ошибка при добавлении файлов в менеджер вложений',
		'es-ES': 'Error al agregar archivos al gestor de adjuntos'
	},

	// 数据库相关提示
	'notices.databaseSaveError': {
		'en-US': 'Failed to save database',
		'zh-CN': '保存数据库失败',
		'zh-TW': '儲存資料庫失敗',
		'ja-JP': 'データベースの保存に失敗しました',
		'de-DE': 'Datenbank konnte nicht gespeichert werden',
		'fr-FR': 'Échec de l\'enregistrement de la base de données',
		'ru-RU': 'Не удалось сохранить базу данных',
		'es-ES': 'Error al guardar la base de datos'
	},
	'notices.databaseLoadError': {
		'en-US': 'Failed to load database',
		'zh-CN': '加载数据库失败',
		'zh-TW': '載入資料庫失敗',
		'ja-JP': 'データベースの読み込みに失敗しました',
		'de-DE': 'Datenbank konnte nicht geladen werden',
		'fr-FR': 'Échec du chargement de la base de données',
		'ru-RU': 'Не удалось загрузить базу данных',
		'es-ES': 'Error al cargar la base de datos'
	},
	'notices.dataMigrated': {
		'en-US': 'Data migrated to new storage location',
		'zh-CN': '数据已迁移到新存储位置',
		'zh-TW': '資料已遷移到新儲存位置',
		'ja-JP': 'データが新しい保存場所に移行されました',
		'de-DE': 'Daten wurden an neuen Speicherort migriert',
		'fr-FR': 'Données migrées vers le nouvel emplacement de stockage',
		'ru-RU': 'Данные перенесены в новое место хранения',
		'es-ES': 'Datos migrados a nueva ubicación de almacenamiento'
	},
	'notices.databaseRestoreSuccess': {
		'en-US': 'Database restored successfully',
		'zh-CN': '数据库恢复成功',
		'zh-TW': '資料庫恢復成功',
		'ja-JP': 'データベースが正常に復元されました',
		'de-DE': 'Datenbank erfolgreich wiederhergestellt',
		'fr-FR': 'Base de données restaurée avec succès',
		'ru-RU': 'База данных успешно восстановлена',
		'es-ES': 'Base de datos restaurada exitosamente'
	},
	'notices.databaseRestoreFailed': {
		'en-US': 'Failed to restore database',
		'zh-CN': '数据库恢复失败',
		'zh-TW': '資料庫恢復失敗',
		'ja-JP': 'データベースの復元に失敗しました',
		'de-DE': 'Datenbankwiederherstellung fehlgeschlagen',
		'fr-FR': 'Échec de la restauration de la base de données',
		'ru-RU': 'Не удалось восстановить базу данных',
		'es-ES': 'Error al restaurar la base de datos'
	},

	// DOI搜索相关
	'notices.doiSearchSuccess': {
		'en-US': 'DOI search completed successfully',
		'zh-CN': 'DOI搜索成功完成',
		'zh-TW': 'DOI搜尋成功完成',
		'ja-JP': 'DOI検索が正常に完了しました',
		'de-DE': 'DOI-Suche erfolgreich abgeschlossen',
		'fr-FR': 'Recherche DOI terminée avec succès',
		'ru-RU': 'Поиск DOI успешно завершен',
		'es-ES': 'Búsqueda DOI completada exitosamente'
	},
	'notices.doiSearchFailed': {
		'en-US': 'DOI search failed',
		'zh-CN': 'DOI搜索失败',
		'zh-TW': 'DOI搜尋失敗',
		'ja-JP': 'DOI検索に失敗しました',
		'de-DE': 'DOI-Suche fehlgeschlagen',
		'fr-FR': 'Recherche DOI échouée',
		'ru-RU': 'Поиск DOI не удался',
		'es-ES': 'Búsqueda DOI fallida'
	},
	'notices.doiSearchNoResults': {
		'en-US': 'No results found for DOI: {doi}',
		'zh-CN': '没有找到DOI: {doi} 的结果',
		'zh-TW': '沒有找到DOI: {doi} 的結果',
		'ja-JP': 'DOI: {doi} の検索結果が見つかりません',
		'de-DE': 'Keine Ergebnisse für DOI: {doi} gefunden',
		'fr-FR': 'Aucun résultat trouvé pour DOI : {doi}',
		'ru-RU': 'Результатов для DOI: {doi} не найдено',
		'es-ES': 'No se encontraron resultados para DOI: {doi}'
	},
	'notices.invalidDOI': {
		'en-US': 'Invalid DOI format',
		'zh-CN': 'DOI格式无效',
		'zh-TW': 'DOI格式無效',
		'ja-JP': 'DOIの形式が無効です',
		'de-DE': 'Ungültiges DOI-Format',
		'fr-FR': 'Format DOI invalide',
		'ru-RU': 'Неверный формат DOI',
		'es-ES': 'Formato DOI inválido'
	},
	'notices.pleaseEnterDOI': {
		'en-US': 'Please enter a DOI',
		'zh-CN': '请输入DOI',
		'zh-TW': '請輸入DOI',
		'ja-JP': 'DOIを入力してください',
		'de-DE': 'Bitte geben Sie eine DOI ein',
		'fr-FR': 'Veuillez entrer un DOI',
		'ru-RU': 'Пожалуйста, введите DOI',
		'es-ES': 'Por favor ingrese un DOI'
	},

	// 下载相关提示
	'notices.pleaseEnterURL': {
		'en-US': 'Please enter a URL first',
		'zh-CN': '请先输入URL',
		'zh-TW': '請先輸入URL',
		'ja-JP': '最初にURLを入力してください',
		'de-DE': 'Bitte geben Sie zuerst eine URL ein',
		'fr-FR': 'Veuillez d\'abord entrer une URL',
		'ru-RU': 'Пожалуйста, сначала введите URL',
		'es-ES': 'Por favor ingrese una URL primero'
	},
	'notices.invalidURL': {
		'en-US': 'Invalid URL',
		'zh-CN': '无效的URL',
		'zh-TW': '無效的URL',
		'ja-JP': '無効なURLです',
		'de-DE': 'Ungültige URL',
		'fr-FR': 'URL invalide',
		'ru-RU': 'Неверный URL',
		'es-ES': 'URL inválida'
	},
	'notices.downloadError': {
		'en-US': 'Download error: {message}',
		'zh-CN': '下载错误：{message}',
		'zh-TW': '下載錯誤：{message}',
		'ja-JP': 'ダウンロードエラー：{message}',
		'de-DE': 'Download-Fehler: {message}',
		'fr-FR': 'Erreur de téléchargement : {message}',
		'ru-RU': 'Ошибка загрузки: {message}',
		'es-ES': 'Error de descarga: {message}'
	},
	'notices.downloadStarted': {
		'en-US': 'Download started',
		'zh-CN': '下载已开始',
		'zh-TW': '下載已開始',
		'ja-JP': 'ダウンロードを開始しました',
		'de-DE': 'Download gestartet',
		'fr-FR': 'Téléchargement commencé',
		'ru-RU': 'Загрузка началась',
		'es-ES': 'Descarga iniciada'
	},


	// 导入相关提示
	'notices.importError': {
		'en-US': 'Import error: {message}',
		'zh-CN': '导入错误：{message}',
		'zh-TW': '導入錯誤：{message}',
		'ja-JP': 'インポートエラー：{message}',
		'de-DE': 'Import-Fehler: {message}',
		'fr-FR': 'Erreur d\'importation : {message}',
		'ru-RU': 'Ошибка импорта: {message}',
		'es-ES': 'Error de importación: {message}'
	},
	'notices.importCancelled': {
		'en-US': 'Import cancelled',
		'zh-CN': '导入已取消',
		'zh-TW': '導入已取消',
		'ja-JP': 'インポートがキャンセルされました',
		'de-DE': 'Import abgebrochen',
		'fr-FR': 'Importation annulée',
		'ru-RU': 'Импорт отменен',
		'es-ES': 'Importación cancelada'
	},
	'notices.invalidImportFile': {
		'en-US': 'Invalid import file format',
		'zh-CN': '无效的导入文件格式',
		'zh-TW': '無效的導入檔案格式',
		'ja-JP': '無効なインポートファイル形式です',
		'de-DE': 'Ungültiges Importdateiformat',
		'fr-FR': 'Format de fichier d\'importation invalide',
		'ru-RU': 'Неверный формат файла импорта',
		'es-ES': 'Formato de archivo de importación inválido'
	},
	'notices.importFileTooLarge': {
		'en-US': 'Import file is too large',
		'zh-CN': '导入文件过大',
		'zh-TW': '導入檔案過大',
		'ja-JP': 'インポートファイルが大きすぎます',
		'de-DE': 'Importdatei ist zu groß',
		'fr-FR': 'Le fichier d\'importation est trop volumineux',
		'ru-RU': 'Файл импорта слишком большой',
		'es-ES': 'El archivo de importación es demasiado grande'
	},

	// 标签相关提示
	'notices.tagSyncSuccess': {
		'en-US': 'Tag synchronization completed',
		'zh-CN': '标签同步完成',
		'zh-TW': '標籤同步完成',
		'ja-JP': 'タグ同期が完了しました',
		'de-DE': 'Tag-Synchronisierung abgeschlossen',
		'fr-FR': 'Synchronisation des étiquettes terminée',
		'ru-RU': 'Синхронизация тегов завершена',
		'es-ES': 'Sincronización de etiquetas completada'
	},
	'notices.tagSyncError': {
		'en-US': 'Tag synchronization failed: {message}',
		'zh-CN': '标签同步失败：{message}',
		'zh-TW': '標籤同步失敗：{message}',
		'ja-JP': 'タグ同期に失敗しました：{message}',
		'de-DE': 'Tag-Synchronisierung fehlgeschlagen: {message}',
		'fr-FR': 'Échec de la synchronisation des étiquettes : {message}',
		'ru-RU': 'Синхронизация тегов не удалась: {message}',
		'es-ES': 'Error en la sincronización de etiquetas: {message}'
	},
	'notices.tagAlreadyExists': {
		'en-US': 'Tag already exists: {tag}',
		'zh-CN': '标签已存在：{tag}',
		'zh-TW': '標籤已存在：{tag}',
		'ja-JP': 'タグは既に存在します：{tag}',
		'de-DE': 'Tag existiert bereits: {tag}',
		'fr-FR': 'L\'étiquette existe déjà : {tag}',
		'ru-RU': 'Тег уже существует: {tag}',
		'es-ES': 'La etiqueta ya existe: {tag}'
	},
	'notices.tagAdded': {
		'en-US': 'Tag added: {tag}',
		'zh-CN': '已添加标签：{tag}',
		'zh-TW': '已新增標籤：{tag}',
		'ja-JP': 'タグが追加されました：{tag}',
		'de-DE': 'Tag hinzugefügt: {tag}',
		'fr-FR': 'Étiquette ajoutée : {tag}',
		'ru-RU': 'Тег добавлен: {tag}',
		'es-ES': 'Etiqueta agregada: {tag}'
	},
	'notices.tagRemoved': {
		'en-US': 'Tag removed: {tag}',
		'zh-CN': '已移除标签：{tag}',
		'zh-TW': '已移除標籤：{tag}',
		'ja-JP': 'タグが削除されました：{tag}',
		'de-DE': 'Tag entfernt: {tag}',
		'fr-FR': 'Étiquette supprimée : {tag}',
		'ru-RU': 'Тег удален: {tag}',
		'es-ES': 'Etiqueta eliminada: {tag}'
	},

	// 文件操作相关提示
	'notices.fileDeleted': {
		'en-US': 'File deleted: {filename}',
		'zh-CN': '文件已删除：{filename}',
		'zh-TW': '檔案已刪除：{filename}',
		'ja-JP': 'ファイルが削除されました：{filename}',
		'de-DE': 'Datei gelöscht: {filename}',
		'fr-FR': 'Fichier supprimé : {filename}',
		'ru-RU': 'Файл удален: {filename}',
		'es-ES': 'Archivo eliminado: {filename}'
	},
	'notices.fileDeleteError': {
		'en-US': 'Error deleting file: {message}',
		'zh-CN': '删除文件时出错：{message}',
		'zh-TW': '刪除檔案時出錯：{message}',
		'ja-JP': 'ファイルの削除エラー：{message}',
		'de-DE': 'Fehler beim Löschen der Datei: {message}',
		'fr-FR': 'Erreur lors de la suppression du fichier : {message}',
		'ru-RU': 'Ошибка при удалении файла: {message}',
		'es-ES': 'Error al eliminar archivo: {message}'
	},
	'notices.fileRenamed': {
		'en-US': 'File renamed from {oldName} to {newName}',
		'zh-CN': '文件已重命名：从 {oldName} 到 {newName}',
		'zh-TW': '檔案已重命名：從 {oldName} 到 {newName}',
		'ja-JP': 'ファイル名が変更されました：{oldName} から {newName} へ',
		'de-DE': 'Datei umbenannt von {oldName} zu {newName}',
		'fr-FR': 'Fichier renommé de {oldName} à {newName}',
		'ru-RU': 'Файл переименован из {oldName} в {newName}',
		'es-ES': 'Archivo renombrado de {oldName} a {newName}'
	},
	'notices.fileRenameError': {
		'en-US': 'Error renaming file: {message}',
		'zh-CN': '重命名文件时出错：{message}',
		'zh-TW': '重命名檔案時出錯：{message}',
		'ja-JP': 'ファイル名の変更エラー：{message}',
		'de-DE': 'Fehler beim Umbenennen der Datei: {message}',
		'fr-FR': 'Erreur lors du renommage du fichier : {message}',
		'ru-RU': 'Ошибка при переименовании файла: {message}',
		'es-ES': 'Error al renombrar archivo: {message}'
	},
	'notices.fileMoved': {
		'en-US': 'File moved to: {path}',
		'zh-CN': '文件已移动到：{path}',
		'zh-TW': '檔案已移動到：{path}',
		'ja-JP': 'ファイルが移動されました：{path}',
		'de-DE': 'Datei verschoben nach: {path}',
		'fr-FR': 'Fichier déplacé vers : {path}',
		'ru-RU': 'Файл перемещен в: {path}',
		'es-ES': 'Archivo movido a: {path}'
	},
	'notices.fileMoveError': {
		'en-US': 'Error moving file: {message}',
		'zh-CN': '移动文件时出错：{message}',
		'zh-TW': '移動檔案時出錯：{message}',
		'ja-JP': 'ファイルの移動エラー：{message}',
		'de-DE': 'Fehler beim Verschieben der Datei: {message}',
		'fr-FR': 'Erreur lors du déplacement du fichier : {message}',
		'ru-RU': 'Ошибка при перемещении файла: {message}',
		'es-ES': 'Error al mover archivo: {message}'
	},
	'notices.fileNotFound': {
		'en-US': 'File not found: {filename}',
		'zh-CN': '文件未找到：{filename}',
		'zh-TW': '檔案未找到：{filename}',
		'ja-JP': 'ファイルが見つかりません：{filename}',
		'de-DE': 'Datei nicht gefunden: {filename}',
		'fr-FR': 'Fichier non trouvé : {filename}',
		'ru-RU': 'Файл не найден: {filename}',
		'es-ES': 'Archivo no encontrado: {filename}'
	},
	'notices.fileAlreadyExists': {
		'en-US': 'File already exists: {filename}',
		'zh-CN': '文件已存在：{filename}',
		'zh-TW': '檔案已存在：{filename}',
		'ja-JP': 'ファイルは既に存在します：{filename}',
		'de-DE': 'Datei existiert bereits: {filename}',
		'fr-FR': 'Le fichier existe déjà : {filename}',
		'ru-RU': 'Файл уже существует: {filename}',
		'es-ES': 'El archivo ya existe: {filename}'
	},

	// 系统相关提示
	'notices.settingsSaved': {
		'en-US': 'Settings saved successfully',
		'zh-CN': '设置保存成功',
		'zh-TW': '設定儲存成功',
		'ja-JP': '設定が正常に保存されました',
		'de-DE': 'Einstellungen erfolgreich gespeichert',
		'fr-FR': 'Paramètres enregistrés avec succès',
		'ru-RU': 'Настройки успешно сохранены',
		'es-ES': 'Configuración guardada exitosamente'
	},
	'notices.settingsSaveError': {
		'en-US': 'Error saving settings: {message}',
		'zh-CN': '保存设置时出错：{message}',
		'zh-TW': '儲存設定時出錯：{message}',
		'ja-JP': '設定の保存エラー：{message}',
		'de-DE': 'Fehler beim Speichern der Einstellungen: {message}',
		'fr-FR': 'Erreur lors de l\'enregistrement des paramètres : {message}',
		'ru-RU': 'Ошибка при сохранении настроек: {message}',
		'es-ES': 'Error al guardar configuración: {message}'
	},
	'notices.pluginUpdated': {
		'en-US': 'Plugin updated to version {version}',
		'zh-CN': '插件已更新到版本 {version}',
		'zh-TW': '外掛已更新到版本 {version}',
		'ja-JP': 'プラグインがバージョン {version} に更新されました',
		'de-DE': 'Plugin auf Version {version} aktualisiert',
		'fr-FR': 'Plugin mis à jour vers la version {version}',
		'ru-RU': 'Плагин обновлен до версии {version}',
		'es-ES': 'Plugin actualizado a la versión {version}'
	},
	'notices.operationCancelled': {
		'en-US': 'Operation cancelled',
		'zh-CN': '操作已取消',
		'zh-TW': '操作已取消',
		'ja-JP': '操作がキャンセルされました',
		'de-DE': 'Operation abgebrochen',
		'fr-FR': 'Opération annulée',
		'ru-RU': 'Операция отменена',
		'es-ES': 'Operación cancelada'
	},
	'notices.operationCompleted': {
		'en-US': 'Operation completed successfully',
		'zh-CN': '操作成功完成',
		'zh-TW': '操作成功完成',
		'ja-JP': '操作が正常に完了しました',
		'de-DE': 'Operation erfolgreich abgeschlossen',
		'fr-FR': 'Opération terminée avec succès',
		'ru-RU': 'Операция успешно завершена',
		'es-ES': 'Operación completada exitosamente'
	},
	'notices.pleaseSelectFiles': {
		'en-US': 'Please select files',
		'zh-CN': '请选择文件',
		'zh-TW': '請選擇檔案',
		'ja-JP': 'ファイルを選択してください',
		'de-DE': 'Bitte wählen Sie Dateien aus',
		'fr-FR': 'Veuillez sélectionner des fichiers',
		'ru-RU': 'Пожалуйста, выберите файлы',
		'es-ES': 'Por favor seleccione archivos'
	},
	'notices.metadataExtracted': {
		'en-US': 'Metadata extracted successfully',
		'zh-CN': '元数据提取成功',
		'zh-TW': '元資料提取成功',
		'ja-JP': 'メタデータが正常に抽出されました',
		'de-DE': 'Metadaten erfolgreich extrahiert',
		'fr-FR': 'Métadonnées extraites avec succès',
		'ru-RU': 'Метаданные успешно извлечены',
		'es-ES': 'Metadatos extraídos exitosamente'
	},
	'notices.metadataExtractFailed': {
		'en-US': 'Failed to extract metadata. Please check the URL or enter information manually.',
		'zh-CN': '元数据提取失败。请检查URL或手动输入信息。',
		'zh-TW': '元資料提取失敗。請檢查URL或手動輸入資訊。',
		'ja-JP': 'メタデータの抽出に失敗しました。URLを確認するか、手動で情報を入力してください。',
		'de-DE': 'Metadatenextraktion fehlgeschlagen. Bitte überprüfen Sie die URL oder geben Sie die Informationen manuell ein.',
		'fr-FR': 'Échec de l\'extraction des métadonnées. Veuillez vérifier l\'URL ou saisir les informations manuellement.',
		'ru-RU': 'Не удалось извлечь метаданные. Пожалуйста, проверьте URL или введите информацию вручную.',
		'es-ES': 'Error al extraer metadatos. Por favor verifique la URL o ingrese la información manualmente.'
	},

	// Download Modal

	'modals.downloadPaper.paperURL': {
		'en-US': 'Paper URL',
		'zh-CN': '论文URL',
		'zh-TW': '論文URL',
		'ja-JP': '論文URL',
		'de-DE': 'Papier-URL',
		'fr-FR': 'URL de l\'article',
		'ru-RU': 'URL статьи',
		'es-ES': 'URL del artículo'
	},
	'modals.downloadPaper.paperURLDesc': {
		'en-US': 'Enter the URL of the paper to download',
		'zh-CN': '输入要下载的论文URL',
		'zh-TW': '輸入要下載的論文URL',
		'ja-JP': 'ダウンロードする論文のURLを入力してください',
		'de-DE': 'Geben Sie die URL des herunterzuladenden Papiers ein',
		'fr-FR': 'Entrez l\'URL de l\'article à télécharger',
		'ru-RU': 'Введите URL статьи для скачивания',
		'es-ES': 'Ingrese la URL del artículo a descargar'
	},
	'modals.downloadPaper.autoIdentify': {
		'en-US': 'Auto Identify',
		'zh-CN': '自动识别',
		'zh-TW': '自動識別',
		'ja-JP': '自動識別',
		'de-DE': 'Automatisch erkennen',
		'fr-FR': 'Identification automatique',
		'ru-RU': 'Автоопределение',
		'es-ES': 'Identificación automática'
	},
	'modals.downloadPaper.autoIdentifyTooltip': {
		'en-US': 'Automatically identify paper title, DOI, and other metadata from the URL',
		'zh-CN': '从URL自动识别论文标题、DOI和其他元数据',
		'zh-TW': '從URL自動識別論文標題、DOI和其他元資料',
		'ja-JP': 'URLから論文タイトル、DOI、その他のメタデータを自動的に識別します',
		'de-DE': 'Papiertitel, DOI und andere Metadaten automatisch aus der URL erkennen',
		'fr-FR': 'Identifier automatiquement le titre, le DOI et les autres métadonnées de l\'article depuis l\'URL',
		'ru-RU': 'Автоматически определить название статьи, DOI и другие метаданные из URL',
		'es-ES': 'Identificar automáticamente el título del artículo, DOI y otros metadatos desde la URL'
	},
	'modals.downloadPaper.identifying': {
		'en-US': 'Identifying...',
		'zh-CN': '识别中...',
		'zh-TW': '識別中...',
		'ja-JP': '識別中...',
		'de-DE': 'Erkennen...',
		'fr-FR': 'Identification...',
		'ru-RU': 'Определение...',
		'es-ES': 'Identificando...'
	},
	'modals.downloadPaper.doi': {
		'en-US': 'DOI',
		'zh-CN': 'DOI',
		'zh-TW': 'DOI',
		'ja-JP': 'DOI',
		'de-DE': 'DOI',
		'fr-FR': 'DOI',
		'ru-RU': 'DOI',
		'es-ES': 'DOI'
	},
	'modals.downloadPaper.doiDesc': {
		'en-US': 'Paper DOI (will be auto-extracted from URL if possible)',
		'zh-CN': '论文DOI（如果可能，将从URL自动提取）',
		'zh-TW': '論文DOI（如果可能，將從URL自動提取）',
		'ja-JP': '論文DOI（可能であればURLから自動的に抽出されます）',
		'de-DE': 'Papier-DOI (wird bei Bedarf automatisch aus der URL extrahiert)',
		'fr-FR': 'DOI de l\'article (sera automatiquement extrait de l\'URL si possible)',
		'ru-RU': 'DOI статьи (будет автоматически извлечен из URL, если возможно)',
		'es-ES': 'DOI del artículo (se extraerá automáticamente de la URL si es posible)'
	},
	'modals.downloadPaper.title': {
		'en-US': 'Title',
		'zh-CN': '标题',
		'zh-TW': '標題',
		'ja-JP': 'タイトル',
		'de-DE': 'Titel',
		'fr-FR': 'Titre',
		'ru-RU': 'Название',
		'es-ES': 'Título'
	},
	'modals.downloadPaper.titleDesc': {
		'en-US': 'Paper title',
		'zh-CN': '论文标题',
		'zh-TW': '論文標題',
		'ja-JP': '論文タイトル',
		'de-DE': 'Papiertitel',
		'fr-FR': 'Titre de l\'article',
		'ru-RU': 'Название статьи',
		'es-ES': 'Título del artículo'
	},
	'modals.downloadPaper.titlePlaceholder': {
		'en-US': 'Enter paper title',
		'zh-CN': '输入论文标题',
		'zh-TW': '輸入論文標題',
		'ja-JP': '論文タイトルを入力',
		'de-DE': 'Papiertitel eingeben',
		'fr-FR': 'Entrez le titre de l\'article',
		'ru-RU': 'Введите название статьи',
		'es-ES': 'Ingrese el título del artículo'
	},
	'modals.downloadPaper.author': {
		'en-US': 'Author',
		'zh-CN': '作者',
		'zh-TW': '作者',
		'ja-JP': '著者',
		'de-DE': 'Autor',
		'fr-FR': 'Auteur',
		'ru-RU': 'Автор',
		'es-ES': 'Autor'
	},
	'modals.downloadPaper.authorDesc': {
		'en-US': 'Paper author(s)',
		'zh-CN': '论文作者',
		'zh-TW': '論文作者',
		'ja-JP': '論文著者',
		'de-DE': 'Papierautor(en)',
		'fr-FR': 'Auteur(s) de l\'article',
		'ru-RU': 'Автор(ы) статьи',
		'es-ES': 'Autor(es) del artículo'
	},
	'modals.downloadPaper.authorPlaceholder': {
		'en-US': 'Enter author name(s)',
		'zh-CN': '输入作者姓名',
		'zh-TW': '輸入作者姓名',
		'ja-JP': '著者名を入力',
		'de-DE': 'Autorennamen eingeben',
		'fr-FR': 'Entrez le(s) nom(s) de l\'auteur',
		'ru-RU': 'Введите имя(имена) автора',
		'es-ES': 'Ingrese el nombre del autor(es)'
	},
	'modals.downloadPaper.year': {
		'en-US': 'Year',
		'zh-CN': '年份',
		'zh-TW': '年份',
		'ja-JP': '年',
		'de-DE': 'Jahr',
		'fr-FR': 'Année',
		'ru-RU': 'Год',
		'es-ES': 'Año'
	},
	'modals.downloadPaper.yearDesc': {
		'en-US': 'Publication year',
		'zh-CN': '发表年份',
		'zh-TW': '發表年份',
		'ja-JP': '発表年',
		'de-DE': 'Veröffentlichungsjahr',
		'fr-FR': 'Année de publication',
		'ru-RU': 'Год публикации',
		'es-ES': 'Año de publicación'
	},
	'modals.downloadPaper.publisher': {
		'en-US': 'Publisher/Journal/Conference',
		'zh-CN': '出版商/期刊/会议',
		'zh-TW': '出版商/期刊/會議',
		'ja-JP': '出版者/ジャーナル/会議',
		'de-DE': 'Verlag/Zeitschrift/Konferenz',
		'fr-FR': 'Éditeur/Revue/Conférence',
		'ru-RU': 'Издатель/Журнал/Конференция',
		'es-ES': 'Editorial/Revista/Conferencia'
	},
	'modals.downloadPaper.publisherDesc': {
		'en-US': 'Journal name, conference name, or publisher',
		'zh-CN': '期刊名称、会议名称或出版商',
		'zh-TW': '期刊名稱、會議名稱或出版商',
		'ja-JP': 'ジャーナル名、会議名、または出版者',
		'de-DE': 'Zeitschriftname, Konferenzname oder Verlag',
		'fr-FR': 'Nom de la revue, nom de la conférence ou éditeur',
		'ru-RU': 'Название журнала, название конференции или издатель',
		'es-ES': 'Nombre de la revista, nombre de la conferencia o editorial'
	},
	'modals.downloadPaper.publisherPlaceholder': {
		'en-US': 'e.g., Nature, ICML 2024, IEEE',
		'zh-CN': '例如：Nature, ICML 2024, IEEE',
		'zh-TW': '例如：Nature, ICML 2024, IEEE',
		'ja-JP': '例：Nature, ICML 2024, IEEE',
		'de-DE': 'z.B. Nature, ICML 2024, IEEE',
		'fr-FR': 'ex. Nature, ICML 2024, IEEE',
		'ru-RU': 'например, Nature, ICML 2024, IEEE',
		'es-ES': 'p.ej., Nature, ICML 2024, IEEE'
	},
	'modals.downloadPaper.journalLevel': {
		'en-US': 'Journal Level',
		'zh-CN': '期刊等级',
		'zh-TW': '期刊等級',
		'ja-JP': 'ジャーナルレベル',
		'de-DE': 'Zeitschriftenlevel',
		'fr-FR': 'Niveau de la revue',
		'ru-RU': 'Уровень журнала',
		'es-ES': 'Nivel de la revista'
	},
	'modals.downloadPaper.journalLevelDesc': {
		'en-US': 'CCF level or SCI zone (auto-detected, can be manually adjusted)',
		'zh-CN': 'CCF等级或SCI分区（自动检测，可手动调整）',
		'zh-TW': 'CCF等級或SCI分區（自動偵測，可手動調整）',
		'ja-JP': 'CCFレベルまたはSCIゾーン（自動検出、手動調整可能）',
		'de-DE': 'CCF-Level oder SCI-Zone (automatisch erkannt, kann manuell angepasst werden)',
		'fr-FR': 'Niveau CCF ou zone SCI (détecté automatiquement, peut être ajusté manuellement)',
		'ru-RU': 'Уровень CCF или зона SCI (автоматически определено, можно настроить вручную)',
		'es-ES': 'Nivel CCF o zona SCI (detectado automáticamente, se puede ajustar manualmente)'
	},
	'modals.downloadPaper.tags': {
		'en-US': 'Tags',
		'zh-CN': '标签',
		'zh-TW': '標籤',
		'ja-JP': 'タグ',
		'de-DE': 'Tags',
		'fr-FR': 'Étiquettes',
		'ru-RU': 'Теги',
		'es-ES': 'Etiquetas'
	},
	'modals.downloadPaper.tagsDesc': {
		'en-US': 'Tags for organization. Use picker to multi-select, or type manually (comma-separated).',
		'zh-CN': '用于组织的标签。使用选择器进行多选，或手动输入（逗号分隔）。',
		'zh-TW': '用於組織的標籤。使用選擇器進行多選，或手動輸入（逗號分隔）。',
		'ja-JP': '組織用のタグ。選択ピッカーで複数選択、または手動で入力（カンマ区切り）。',
		'de-DE': 'Tags zur Organisation. Verwenden Sie die Auswahl für Mehrfachauswahl oder geben Sie manuell ein (kommagetrennt).',
		'fr-FR': 'Étiquettes pour l\'organisation. Utilisez le sélecteur pour sélectionner plusieurs ou tapez manuellement (séparé par des virgules).',
		'ru-RU': 'Теги для организации. Используйте выбор для множественного выбора или введите вручную (через запятую).',
		'es-ES': 'Etiquetas para la organización. Use el selector para seleccionar varias o escriba manualmente (separado por comas).'
	},
	'modals.downloadPaper.tagsPlaceholder': {
		'en-US': 'machine learning, AI, research',
		'zh-CN': '机器学习, 人工智能, 研究',
		'zh-TW': '機器學習, 人工智慧, 研究',
		'ja-JP': '機械学習, AI, 研究',
		'de-DE': 'Maschinelles Lernen, KI, Forschung',
		'fr-FR': 'apprentissage automatique, IA, recherche',
		'ru-RU': 'машинное обучение, ИИ, исследование',
		'es-ES': 'aprendizaje automático, IA, investigación'
	},
	'modals.downloadPaper.targetFolder': {
		'en-US': 'Target Folder',
		'zh-CN': '目标文件夹',
		'zh-TW': '目標資料夾',
		'ja-JP': '対象フォルダ',
		'de-DE': 'Zielordner',
		'fr-FR': 'Dossier cible',
		'ru-RU': 'Целевая папка',
		'es-ES': 'Carpeta de destino'
	},
	'modals.downloadPaper.targetFolderDesc': {
		'en-US': 'Folder to store the PDF (supports variables like {{current_folder}})',
		'zh-CN': '存储PDF的文件夹（支持{{current_folder}}等变量）',
		'zh-TW': '儲存PDF的資料夾（支援{{current_folder}}等變數）',
		'ja-JP': 'PDFを保存するフォルダ（{{current_folder}}などの変数をサポート）',
		'de-DE': 'Ordner zum Speichern der PDF (unterstützt Variablen wie {{current_folder}})',
		'fr-FR': 'Dossier pour stocker le PDF (prend en charge des variables comme {{current_folder}})',
		'ru-RU': 'Папка для сохранения PDF (поддерживает переменные вроде {{current_folder}})',
		'es-ES': 'Carpeta para almacenar el PDF (admite variables como {{current_folder}})'
	},
	'modals.downloadPaper.targetFolderPlaceholder': {
		'en-US': 'Enter folder path',
		'zh-CN': '输入文件夹路径',
		'zh-TW': '輸入資料夾路徑',
		'ja-JP': 'フォルダパスを入力',
		'de-DE': 'Ordnerpfad eingeben',
		'fr-FR': 'Entrez le chemin du dossier',
		'ru-RU': 'Введите путь к папке',
		'es-ES': 'Ingrese la ruta de la carpeta'
	},
	'modals.downloadPaper.enableRename': {
		'en-US': 'Enable File Renaming',
		'zh-CN': '启用文件重命名',
		'zh-TW': '啟用檔案重命名',
		'ja-JP': 'ファイル名の変更を有効にする',
		'de-DE': 'Dateiumbenennung aktivieren',
		'fr-FR': 'Activer le renommage de fichier',
		'ru-RU': 'Включить переименование файлов',
		'es-ES': 'Habilitar renombrado de archivos'
	},
	'modals.downloadPaper.enableRenameDesc': {
		'en-US': 'Rename file using template: ',
		'zh-CN': '使用模板重命名文件：',
		'zh-TW': '使用模板重命名檔案：',
		'ja-JP': 'テンプレートを使用してファイル名を変更：',
		'de-DE': 'Datei mit Vorlage umbenennen: ',
		'fr-FR': 'Renommer le fichier en utilisant le modèle : ',
		'ru-RU': 'Переименовать файл с использованием шаблона: ',
		'es-ES': 'Renombrar archivo usando plantilla: '
	},
	'modals.downloadPaper.autoCopyExternal': {
		'en-US': 'Auto Copy External Files',
		'zh-CN': '自动复制外部文件',
		'zh-TW': '自動複製外部檔案',
		'ja-JP': '外部ファイルを自動コピー',
		'de-DE': 'Externe Dateien automatisch kopieren',
		'fr-FR': 'Copier automatiquement les fichiers externes',
		'ru-RU': 'Автоматически копировать внешние файлы',
		'es-ES': 'Copiar automáticamente archivos externos'
	},
	'modals.downloadPaper.autoCopyExternalDesc': {
		'en-US': 'Automatically copy files from outside vault to attachment directory',
		'zh-CN': '自动将保险库外的文件复制到附件目录',
		'zh-TW': '自動將保險庫外的檔案複製到附件目錄',
		'ja-JP': 'ボールト外のファイルをアタッチメントディレクトリに自動的にコピー',
		'de-DE': 'Dateien von außerhalb des Tresors automatisch in das Anhangverzeichnis kopieren',
		'fr-FR': 'Copier automatiquement les fichiers en dehors du coffre-fort vers le répertoire des pièces jointes',
		'ru-RU': 'Автоматически копировать файлы извне хранилища в каталог вложений',
		'es-ES': 'Copiar automáticamente archivos fuera de la bóveda al directorio de adjuntos'
	},
	'modals.downloadPaper.templateHelpTitle': {
		'en-US': '📝 File name template variables:',
		'zh-CN': '📝 文件名模板变量说明：',
		'zh-TW': '📝 檔案名模板變數說明：',
		'ja-JP': '📝 ファイル名テンプレート変数：',
		'de-DE': '📝 Dateinamenvorlagenvariablen:',
		'fr-FR': '📝 Variables du modèle de nom de fichier :',
		'ru-RU': '📝 Переменные шаблона имени файла:',
		'es-ES': '📝 Variables de plantilla de nombre de archivo:'
	},
	'modals.downloadPaper.downloadButton': {
		'en-US': 'Download Paper',
		'zh-CN': '下载论文',
		'zh-TW': '下載論文',
		'ja-JP': '論文をダウンロード',
		'de-DE': 'Papier herunterladen',
		'fr-FR': 'Télécharger l\'article',
		'ru-RU': 'Скачать статью',
		'es-ES': 'Descargar artículo'
	},

	// Import Modal
	'modals.importPDF.reimportTitle': {
		'en-US': 'Re-import PDF',
		'zh-CN': '重新导入PDF',
		'zh-TW': '重新導入PDF',
		'ja-JP': 'PDFを再インポート',
		'de-DE': 'PDF erneut importieren',
		'fr-FR': 'Réimporter le PDF',
		'ru-RU': 'Повторно импортировать PDF',
		'es-ES': 'Reimportar PDF'
	},
	'modals.importPDF.importTitle': {
		'en-US': 'Import Local PDF',
		'zh-CN': '导入本地PDF',
		'zh-TW': '導入本地PDF',
		'ja-JP': 'ローカルPDFをインポート',
		'de-DE': 'Lokales PDF importieren',
		'fr-FR': 'Importer le PDF local',
		'ru-RU': 'Импортировать локальный PDF',
		'es-ES': 'Importar PDF local'
	},
	'modals.importPDF.reimporting': {
		'en-US': 'Re-importing',
		'zh-CN': '重新导入',
		'zh-TW': '重新導入',
		'ja-JP': '再インポート中',
		'de-DE': 'Erneut importieren',
		'fr-FR': 'Réimportation',
		'ru-RU': 'Повторный импорт',
		'es-ES': 'Reimportando'
	},
	'modals.importPDF.chooseFile': {
		'en-US': 'Choose a PDF file to import',
		'zh-CN': '选择要导入的PDF文件',
		'zh-TW': '選擇要導入的PDF檔案',
		'ja-JP': 'インポートするPDFファイルを選択',
		'de-DE': 'PDF-Datei zum Import auswählen',
		'fr-FR': 'Choisir un fichier PDF à importer',
		'ru-RU': 'Выберите PDF файл для импорта',
		'es-ES': 'Elegir archivo PDF para importar'
	},
	'modals.importPDF.selectNewPDFFile': {
		'en-US': 'Select New PDF File',
		'zh-CN': '选择新的PDF文件',
		'zh-TW': '選擇新的PDF檔案',
		'ja-JP': '新しいPDFファイルを選択',
		'de-DE': 'Neue PDF-Datei auswählen',
		'fr-FR': 'Sélectionner un nouveau fichier PDF',
		'ru-RU': 'Выбрать новый PDF файл',
		'es-ES': 'Seleccionar nuevo archivo PDF'
	},
	'modals.importPDF.selectPDFFile': {
		'en-US': 'Select PDF File',
		'zh-CN': '选择PDF文件',
		'zh-TW': '選擇PDF檔案',
		'ja-JP': 'PDFファイルを選択',
		'de-DE': 'PDF-Datei auswählen',
		'fr-FR': 'Sélectionner le fichier PDF',
		'ru-RU': 'Выбрать PDF файл',
		'es-ES': 'Seleccionar archivo PDF'
	},
	'modals.importPDF.chooseNewFile': {
		'en-US': 'Choose a new PDF file to replace the missing one',
		'zh-CN': '选择新的PDF文件以替换丢失的文件',
		'zh-TW': '選擇新的PDF檔案以替換遺失的檔案',
		'ja-JP': '新しいPDFファイルを選択して紛失したファイルを置き換える',
		'de-DE': 'Neue PDF-Datei auswählen, um die fehlende Datei zu ersetzen',
		'fr-FR': 'Choisir un nouveau fichier PDF pour remplacer le fichier manquant',
		'ru-RU': 'Выберите новый PDF файл для замены отсутствующего файла',
		'es-ES': 'Elegir nuevo archivo PDF para reemplazar el archivo faltante'
	},
	'modals.importPDF.browseFiles': {
		'en-US': 'Browse Files',
		'zh-CN': '浏览文件',
		'zh-TW': '瀏覽檔案',
		'ja-JP': 'ファイルを参照',
		'de-DE': 'Dateien durchsuchen',
		'fr-FR': 'Parcourir les fichiers',
		'ru-RU': 'Просмотреть файлы',
		'es-ES': 'Explorar archivos'
	},
	'modals.importPDF.currentFile': {
		'en-US': 'Current File',
		'zh-CN': '当前文件',
		'zh-TW': '當前檔案',
		'ja-JP': '現在のファイル',
		'de-DE': 'Aktuelle Datei',
		'fr-FR': 'Fichier actuel',
		'ru-RU': 'Текущий файл',
		'es-ES': 'Archivo actual'
	},
	'modals.importPDF.status': {
		'en-US': 'Status',
		'zh-CN': '状态',
		'zh-TW': '狀態',
		'ja-JP': 'ステータス',
		'de-DE': 'Status',
		'fr-FR': 'Statut',
		'ru-RU': 'Статус',
		'es-ES': 'Estado'
	},
	'modals.importPDF.fileExists': {
		'en-US': 'File exists',
		'zh-CN': '文件存在',
		'zh-TW': '檔案存在',
		'ja-JP': 'ファイルが存在します',
		'de-DE': 'Datei existiert',
		'fr-FR': 'Le fichier existe',
		'ru-RU': 'Файл существует',
		'es-ES': 'El archivo existe'
	},
	'modals.importPDF.fileMissing': {
		'en-US': 'File missing',
		'zh-CN': '文件丢失',
		'zh-TW': '檔案遺失',
		'ja-JP': 'ファイルが見つかりません',
		'de-DE': 'Datei fehlt',
		'fr-FR': 'Fichier manquant',
		'ru-RU': 'Файл отсутствует',
		'es-ES': 'Archivo faltante'
	},
	'modals.importPDF.path': {
		'en-US': 'Path',
		'zh-CN': '路径',
		'zh-TW': '路徑',
		'ja-JP': 'パス',
		'de-DE': 'Pfad',
		'fr-FR': 'Chemin',
		'ru-RU': 'Путь',
		'es-ES': 'Ruta'
	},
	'modals.importPDF.targetFolder': {
		'en-US': 'Target Folder',
		'zh-CN': '目标文件夹',
		'zh-TW': '目標資料夾',
		'ja-JP': '対象フォルダ',
		'de-DE': 'Zielordner',
		'fr-FR': 'Dossier cible',
		'ru-RU': 'Целевая папка',
		'es-ES': 'Carpeta de destino'
	},
	'modals.importPDF.targetFolderDesc': {
		'en-US': 'Folder to store the PDF (supports variables like {{current_folder}})',
		'zh-CN': '存储PDF的文件夹（支持{{current_folder}}等变量）',
		'zh-TW': '儲存PDF的資料夾（支援{{current_folder}}等變數）',
		'ja-JP': 'PDFを保存するフォルダ（{{current_folder}}などの変数をサポート）',
		'de-DE': 'Ordner zum Speichern der PDF (unterstützt Variablen wie {{current_folder}})',
		'fr-FR': 'Dossier pour stocker le PDF (prend en charge des variables comme {{current_folder}})',
		'ru-RU': 'Папка для сохранения PDF (поддерживает переменные вроде {{current_folder}})',
		'es-ES': 'Carpeta para almacenar el PDF (admite variables como {{current_folder}})'
	},
	'modals.importPDF.enableFileRenaming': {
		'en-US': 'Enable File Renaming',
		'zh-CN': '启用文件重命名',
		'zh-TW': '啟用檔案重命名',
		'ja-JP': 'ファイル名の変更を有効にする',
		'de-DE': 'Dateiumbenennung aktivieren',
		'fr-FR': 'Activer le renommage de fichier',
		'ru-RU': 'Включить переименование файлов',
		'es-ES': 'Habilitar renombrado de archivos'
	},
	'modals.importPDF.enableFileRenamingDesc': {
		'en-US': 'Rename file using template: ',
		'zh-CN': '使用模板重命名文件：',
		'zh-TW': '使用模板重命名檔案：',
		'ja-JP': 'テンプレートを使用してファイル名を変更：',
		'de-DE': 'Datei mit Vorlage umbenennen: ',
		'fr-FR': 'Renommer le fichier en utilisant le modèle : ',
		'ru-RU': 'Переименовать файл с использованием шаблона: ',
		'es-ES': 'Renombrar archivo usando plantilla: '
	},
	'modals.importPDF.autoCopyExternalFiles': {
		'en-US': 'Auto Copy External Files',
		'zh-CN': '自动复制外部文件',
		'zh-TW': '自動複製外部檔案',
		'ja-JP': '外部ファイルを自動コピー',
		'de-DE': 'Externe Dateien automatisch kopieren',
		'fr-FR': 'Copier automatiquement les fichiers externes',
		'ru-RU': 'Автоматически копировать внешние файлы',
		'es-ES': 'Copiar automáticamente archivos externos'
	},
	'modals.importPDF.autoCopyExternalFilesDesc': {
		'en-US': 'Automatically copy files from outside vault to attachment directory',
		'zh-CN': '自动将保险库外的文件复制到附件目录',
		'zh-TW': '自動將保險庫外的檔案複製到附件目錄',
		'ja-JP': 'ボールト外のファイルをアタッチメントディレクトリに自動的にコピー',
		'de-DE': 'Dateien von außerhalb des Tresors automatisch in das Anhangverzeichnis kopieren',
		'fr-FR': 'Copier automatiquement les fichiers en dehors du coffre-fort vers le répertoire des pièces jointes',
		'ru-RU': 'Автоматически копировать файлы извне хранилища в каталог вложений',
		'es-ES': 'Copiar automáticamente archivos fuera de la bóveda al directorio de adjuntos'
	},
	'modals.importPDF.autoExtractMetadata': {
		'en-US': 'Auto Extract Metadata',
		'zh-CN': '自动提取元数据',
		'zh-TW': '自動提取元資料',
		'ja-JP': 'メタデータを自動抽出',
		'de-DE': 'Metadaten automatisch extrahieren',
		'fr-FR': 'Extraire automatiquement les métadonnées',
		'ru-RU': 'Автоматически извлекать метаданные',
		'es-ES': 'Extraer metadatos automáticamente'
	},
	'modals.importPDF.autoExtractMetadataDesc': {
		'en-US': 'Automatically extract title, author, year, and DOI from PDF',
		'zh-CN': '自动从PDF提取标题、作者、年份和DOI',
		'zh-TW': '自動從PDF提取標題、作者、年份和DOI',
		'ja-JP': 'PDFからタイトル、著者、年、DOIを自動的に抽出',
		'de-DE': 'Titel, Autor, Jahr und DOI automatisch aus PDF extrahieren',
		'fr-FR': 'Extraire automatiquement le titre, l\'auteur, l\'année et le DOI du PDF',
		'ru-RU': 'Автоматически извлекать название, автора, год и DOI из PDF',
		'es-ES': 'Extraer automáticamente título, autor, año y DOI del PDF'
	},
	'modals.importPDF.title': {
		'en-US': 'Title',
		'zh-CN': '标题',
		'zh-TW': '標題',
		'ja-JP': 'タイトル',
		'de-DE': 'Titel',
		'fr-FR': 'Titre',
		'ru-RU': 'Название',
		'es-ES': 'Título'
	},
	'modals.importPDF.titleDesc': {
		'en-US': 'Paper title',
		'zh-CN': '论文标题',
		'zh-TW': '論文標題',
		'ja-JP': '論文タイトル',
		'de-DE': 'Papiertitel',
		'fr-FR': 'Titre de l\'article',
		'ru-RU': 'Название статьи',
		'es-ES': 'Título del artículo'
	},
	'modals.importPDF.titlePlaceholder': {
		'en-US': 'Enter paper title',
		'zh-CN': '输入论文标题',
		'zh-TW': '輸入論文標題',
		'ja-JP': '論文タイトルを入力',
		'de-DE': 'Papiertitel eingeben',
		'fr-FR': 'Entrez le titre de l\'article',
		'ru-RU': 'Введите название статьи',
		'es-ES': 'Ingrese el título del artículo'
	},
	'modals.importPDF.author': {
		'en-US': 'Author',
		'zh-CN': '作者',
		'zh-TW': '作者',
		'ja-JP': '著者',
		'de-DE': 'Autor',
		'fr-FR': 'Auteur',
		'ru-RU': 'Автор',
		'es-ES': 'Autor'
	},
	'modals.importPDF.authorDesc': {
		'en-US': 'Paper author(s)',
		'zh-CN': '论文作者',
		'zh-TW': '論文作者',
		'ja-JP': '論文著者',
		'de-DE': 'Papierautor(en)',
		'fr-FR': 'Auteur(s) de l\'article',
		'ru-RU': 'Автор(ы) статьи',
		'es-ES': 'Autor(es) del artículo'
	},
	'modals.importPDF.authorPlaceholder': {
		'en-US': 'Enter author name(s)',
		'zh-CN': '输入作者姓名',
		'zh-TW': '輸入作者姓名',
		'ja-JP': '著者名を入力',
		'de-DE': 'Autorennamen eingeben',
		'fr-FR': 'Entrez le(s) nom(s) de l\'auteur',
		'ru-RU': 'Введите имя(имена) автора',
		'es-ES': 'Ingrese el nombre(s) del autor'
	},
	'modals.importPDF.year': {
		'en-US': 'Year',
		'zh-CN': '年份',
		'zh-TW': '年份',
		'ja-JP': '年',
		'de-DE': 'Jahr',
		'fr-FR': 'Année',
		'ru-RU': 'Год',
		'es-ES': 'Año'
	},
	'modals.importPDF.yearDesc': {
		'en-US': 'Publication year',
		'zh-CN': '发表年份',
		'zh-TW': '發表年份',
		'ja-JP': '発表年',
		'de-DE': 'Veröffentlichungsjahr',
		'fr-FR': 'Année de publication',
		'ru-RU': 'Год публикации',
		'es-ES': 'Año de publicación'
	},
	'modals.importPDF.yearPlaceholder': {
		'en-US': '2024',
		'zh-CN': '2024',
		'zh-TW': '2024',
		'ja-JP': '2024',
		'de-DE': '2024',
		'fr-FR': '2024',
		'ru-RU': '2024',
		'es-ES': '2024'
	},
	'modals.importPDF.publisher': {
		'en-US': 'Publisher/Journal/Conference',
		'zh-CN': '出版商/期刊/会议',
		'zh-TW': '出版商/期刊/會議',
		'ja-JP': '出版社/ジャーナル/会議',
		'de-DE': 'Verlag/Zeitschrift/Konferenz',
		'fr-FR': 'Éditeur/Journal/Conférence',
		'ru-RU': 'Издатель/Журнал/Конференция',
		'es-ES': 'Editor/Revista/Conferencia'
	},
	'modals.importPDF.publisherDesc': {
		'en-US': 'Journal name, conference name, or publisher',
		'zh-CN': '期刊名称、会议名称或出版商',
		'zh-TW': '期刊名稱、會議名稱或出版商',
		'ja-JP': 'ジャーナル名、会議名、または出版社名',
		'de-DE': 'Zeitschriftenname, Konferenzname oder Verlag',
		'fr-FR': 'Nom du journal, nom de la conférence ou éditeur',
		'ru-RU': 'Название журнала, название конференции или издатель',
		'es-ES': 'Nombre de la revista, nombre de la conferencia o editor'
	},
	'modals.importPDF.publisherPlaceholder': {
		'en-US': 'e.g., Nature, ICML 2024, IEEE',
		'zh-CN': '例如：Nature、ICML 2024、IEEE',
		'zh-TW': '例如：Nature、ICML 2024、IEEE',
		'ja-JP': '例：Nature、ICML 2024、IEEE',
		'de-DE': 'z.B. Nature, ICML 2024, IEEE',
		'fr-FR': 'ex. Nature, ICML 2024, IEEE',
		'ru-RU': 'например, Nature, ICML 2024, IEEE',
		'es-ES': 'p.ej., Nature, ICML 2024, IEEE'
	},
	'modals.importPDF.journalLevel': {
		'en-US': 'Journal Level',
		'zh-CN': '期刊级别',
		'zh-TW': '期刊級別',
		'ja-JP': 'ジャーナルレベル',
		'de-DE': 'Zeitschriften-Level',
		'fr-FR': 'Niveau du journal',
		'ru-RU': 'Уровень журнала',
		'es-ES': 'Nivel de revista'
	},
	'modals.importPDF.journalLevelDesc': {
		'en-US': 'CCF level or SCI zone (auto-detected, can be manually adjusted)',
		'zh-CN': 'CCF级别或SCI分区（自动检测，可手动调整）',
		'zh-TW': 'CCF級別或SCI分區（自動檢測，可手動調整）',
		'ja-JP': 'CCFレベルまたはSCIゾーン（自動検出、手動調整可能）',
		'de-DE': 'CCF-Level oder SCI-Zone (automatisch erkannt, kann manuell angepasst werden)',
		'fr-FR': 'Niveau CCF ou zone SCI (détecté automatiquement, peut être ajusté manuellement)',
		'ru-RU': 'Уровень CCF или зона SCI (автоматически определяется, можно настроить вручную)',
		'es-ES': 'Nivel CCF o zona SCI (detectado automáticamente, se puede ajustar manualmente)'
	},
	'modals.importPDF.doi': {
		'en-US': 'DOI',
		'zh-CN': 'DOI',
		'zh-TW': 'DOI',
		'ja-JP': 'DOI',
		'de-DE': 'DOI',
		'fr-FR': 'DOI',
		'ru-RU': 'DOI',
		'es-ES': 'DOI'
	},
	'modals.importPDF.doiDesc': {
		'en-US': 'Paper DOI (will be auto-extracted if possible)',
		'zh-CN': '论文DOI（如可能将自动提取）',
		'zh-TW': '論文DOI（如可能將自動提取）',
		'ja-JP': '論文DOI（可能であれば自動的に抽出されます）',
		'de-DE': 'Paper-DOI (wird automatisch extrahiert, falls möglich)',
		'fr-FR': 'DOI de l\'article (sera extrait automatiquement si possible)',
		'ru-RU': 'DOI статьи (будет автоматически извлечен, если возможно)',
		'es-ES': 'DOI del artículo (se extraerá automáticamente si es posible)'
	},
	'modals.importPDF.doiPlaceholder': {
		'en-US': '10.1000/...',
		'zh-CN': '10.1000/...',
		'zh-TW': '10.1000/...',
		'ja-JP': '10.1000/...',
		'de-DE': '10.1000/...',
		'fr-FR': '10.1000/...',
		'ru-RU': '10.1000/...',
		'es-ES': '10.1000/...'
	},
	'modals.importPDF.tags': {
		'en-US': 'Tags',
		'zh-CN': '标签',
		'zh-TW': '標籤',
		'ja-JP': 'タグ',
		'de-DE': 'Tags',
		'fr-FR': 'Étiquettes',
		'ru-RU': 'Теги',
		'es-ES': 'Etiquetas'
	},
	'modals.importPDF.tagsDesc': {
		'en-US': 'Tags for organization. Use picker to multi-select, or type manually (comma-separated).',
		'zh-CN': '用于组织的标签。使用选择器进行多选，或手动输入（逗号分隔）。',
		'zh-TW': '用於組織的標籤。使用選擇器進行多選，或手動輸入（逗號分隔）。',
		'ja-JP': '組織用のタグ。選択ツールで複数選択するか、手動で入力（カンマ区切り）。',
		'de-DE': 'Tags zur Organisation. Verwenden Sie die Auswahl für Mehrfachauswahl oder geben Sie manuell ein (durch Kommas getrennt).',
		'fr-FR': 'Étiquettes pour l\'organisation. Utilisez le sélecteur pour la sélection multiple ou tapez manuellement (séparé par des virgules).',
		'ru-RU': 'Теги для организации. Используйте выбор для множественного выбора или введите вручную (через запятую).',
		'es-ES': 'Etiquetas para la organización. Use el selector para selección múltiple o escriba manualmente (separado por comas).'
	},
	'modals.importPDF.tagsPlaceholder': {
		'en-US': 'machine learning, AI, research',
		'zh-CN': '机器学习, 人工智能, 研究',
		'zh-TW': '機器學習, 人工智能, 研究',
		'ja-JP': '機械学習, AI, 研究',
		'de-DE': 'Maschinelles Lernen, KI, Forschung',
		'fr-FR': 'apprentissage automatique, IA, recherche',
		'ru-RU': 'машинное обучение, ИИ, исследование',
		'es-ES': 'aprendizaje automático, IA, investigación'
	},

	// Common Modal Buttons
	'common.cancel': {
		'en-US': 'Cancel',
		'zh-CN': '取消',
		'zh-TW': '取消',
		'ja-JP': 'キャンセル',
		'de-DE': 'Abbrechen',
		'fr-FR': 'Annuler',
		'ru-RU': 'Отмена',
		'es-ES': 'Cancelar'
	},
	'common.import': {
		'en-US': 'Import',
		'zh-CN': '导入',
		'zh-TW': '導入',
		'ja-JP': 'インポート',
		'de-DE': 'Importieren',
		'fr-FR': 'Importer',
		'ru-RU': 'Импортировать',
		'es-ES': 'Importar'
	},
	'common.browse': {
		'en-US': 'Browse',
		'zh-CN': '浏览',
		'zh-TW': '瀏覽',
		'ja-JP': '参照',
		'de-DE': 'Durchsuchen',
		'fr-FR': 'Parcourir',
		'ru-RU': 'Обзор',
		'es-ES': 'Explorar'
	},
	'common.select': {
		'en-US': 'Select',
		'zh-CN': '选择',
		'zh-TW': '選擇',
		'ja-JP': '選択',
		'de-DE': 'Auswählen',
		'fr-FR': 'Sélectionner',
		'ru-RU': 'Выбрать',
		'es-ES': 'Seleccionar'
	},
	'common.save': {
		'en-US': 'Save',
		'zh-CN': '保存',
		'zh-TW': '儲存',
		'ja-JP': '保存',
		'de-DE': 'Speichern',
		'fr-FR': 'Sauvegarder',
		'ru-RU': 'Сохранить',
		'es-ES': 'Guardar'
	},
	'common.delete': {
		'en-US': 'Delete',
		'zh-CN': '删除',
		'zh-TW': '刪除',
		'ja-JP': '削除',
		'de-DE': 'Löschen',
		'fr-FR': 'Supprimer',
		'ru-RU': 'Удалить',
		'es-ES': 'Eliminar'
	},
	'common.edit': {
		'en-US': 'Edit',
		'zh-CN': '编辑',
		'zh-TW': '編輯',
		'ja-JP': '編集',
		'de-DE': 'Bearbeiten',
		'fr-FR': 'Modifier',
		'ru-RU': 'Редактировать',
		'es-ES': 'Editar'
	},
	'common.search': {
		'en-US': 'Search',
		'zh-CN': '搜索',
		'zh-TW': '搜尋',
		'ja-JP': '検索',
		'de-DE': 'Suchen',
		'fr-FR': 'Rechercher',
		'ru-RU': 'Поиск',
		'es-ES': 'Buscar'
	},
	'common.close': {
		'en-US': 'Close',
		'zh-CN': '关闭',
		'zh-TW': '關閉',
		'ja-JP': '閉じる',
		'de-DE': 'Schließen',
		'fr-FR': 'Fermer',
		'ru-RU': 'Закрыть',
		'es-ES': 'Cerrar'
	},
	'common.yes': {
		'en-US': 'Yes',
		'zh-CN': '是',
		'zh-TW': '是',
		'ja-JP': 'はい',
		'de-DE': 'Ja',
		'fr-FR': 'Oui',
		'ru-RU': 'Да',
		'es-ES': 'Sí'
	},
	'common.no': {
		'en-US': 'No',
		'zh-CN': '否',
		'zh-TW': '否',
		'ja-JP': 'いいえ',
		'de-DE': 'Nein',
		'fr-FR': 'Non',
		'ru-RU': 'Нет',
		'es-ES': 'No'
	},

	// 额外的Notice消息
	'notices.autoIdentifyFailed': {
		'en-US': 'Failed to auto-identify information, please fill manually',
		'zh-CN': '自动识别信息失败，请手动填写',
		'zh-TW': '自動識別資訊失敗，請手動填寫',
		'ja-JP': '自動識別に失敗しました。手動で入力してください',
		'de-DE': 'Automatische Erkennung fehlgeschlagen, bitte manuell eingeben',
		'fr-FR': 'Échec de l\'identification automatique, veuillez saisir manuellement',
		'ru-RU': 'Автоопределение не удалось, пожалуйста, введите вручную',
		'es-ES': 'Falló la identificación automática, por favor ingrese manualmente'
	},
	'notices.extractingInfo': {
		'en-US': 'Extracting information from webpage...',
		'zh-CN': '正在从网页提取信息...',
		'zh-TW': '正在從網頁提取資訊...',
		'ja-JP': 'ウェブページから情報を抽出しています...',
		'de-DE': 'Extrahiere Informationen von der Webseite...',
		'fr-FR': 'Extraction des informations depuis la page web...',
		'ru-RU': 'Извлечение информации с веб-страницы...',
		'es-ES': 'Extrayendo información de la página web...'
	},
	'notices.providePaperTitle': {
		'en-US': 'Please provide a paper title',
		'zh-CN': '请提供论文标题',
		'zh-TW': '請提供論文標題',
		'ja-JP': '論文タイトルを入力してください',
		'de-DE': 'Bitte Papiertitel angeben',
		'fr-FR': 'Veuillez fournir le titre de l\'article',
		'ru-RU': 'Пожалуйста, укажите название статьи',
		'es-ES': 'Por favor proporcione el título del artículo'
	},
	'notices.startingDownload': {
		'en-US': 'Starting download...',
		'zh-CN': '开始下载...',
		'zh-TW': '開始下載...',
		'ja-JP': 'ダウンロードを開始しています...',
		'de-DE': 'Download wird gestartet...',
		'fr-FR': 'Démarrage du téléchargement...',
		'ru-RU': 'Начинается загрузка...',
		'es-ES': 'Comenzando descarga...'
	},
	'notices.noFileSelected': {
		'en-US': 'No file selected',
		'zh-CN': '未选择文件',
		'zh-TW': '未選擇檔案',
		'ja-JP': 'ファイルが選択されていません',
		'de-DE': 'Keine Datei ausgewählt',
		'fr-FR': 'Aucun fichier sélectionné',
		'ru-RU': 'Файл не выбран',
		'es-ES': 'Ningún archivo seleccionado'
	},
	'notices.downloadCancelled': {
		'en-US': 'Download cancelled',
		'zh-CN': '下载已取消',
		'zh-TW': '下載已取消',
		'ja-JP': 'ダウンロードがキャンセルされました',
		'de-DE': 'Download abgebrochen',
		'fr-FR': 'Téléchargement annulé',
		'ru-RU': 'Загрузка отменена',
		'es-ES': 'Descarga cancelada'
	},
	'notices.obsidianWindowLimit': {
		'en-US': 'Due to Obsidian limitations, file selection is not available in standalone window mode. Please open the plugin in a new tab.',
		'zh-CN': '由于Obsidian限制，在独立窗口模式下无法选择文件。请在新标签页中打开插件。',
		'zh-TW': '由於Obsidian限制，在獨立窗口模式下無法選擇檔案。請在新標籤頁中打開插件。',
		'ja-JP': 'Obsidianの制限により、スタンドアロンウィンドウモードではファイル選択ができません。新しいタブでプラグインを開いてください。',
		'de-DE': 'Aufgrund von Obsidian-Beschränkungen ist die Dateiauswahl im eigenständigen Fenstermodus nicht verfügbar. Bitte öffnen Sie das Plugin in einem neuen Tab.',
		'fr-FR': 'En raison des limitations d\'Obsidian, la sélection de fichiers n\'est pas disponible en mode fenêtre autonome. Veuillez ouvrir le plugin dans un nouvel onglet.',
		'ru-RU': 'Из-за ограничений Obsidian выбор файлов недоступен в режиме отдельного окна. Пожалуйста, откройте плагин в новой вкладке.',
		'es-ES': 'Debido a las limitaciones de Obsidian, la selección de archivos no está disponible en modo ventana independiente. Por favor abra el plugin en una nueva pestaña.'
	},
	'notices.MDFileCreated': {
		'en-US': 'MD file created successfully',
		'zh-CN': 'MD文件创建成功',
		'zh-TW': 'MD檔案建立成功',
		'ja-JP': 'MDファイルが正常に作成されました',
		'de-DE': 'MD-Datei erfolgreich erstellt',
		'fr-FR': 'Fichier MD créé avec succès',
		'ru-RU': 'MD файл успешно создан',
		'es-ES': 'Archivo MD creado exitosamente'
	},
	'notices.MDFileCreateFailed': {
		'en-US': 'Failed to create MD file',
		'zh-CN': 'MD文件创建失败',
		'zh-TW': 'MD檔案建立失敗',
		'ja-JP': 'MDファイルの作成に失敗しました',
		'de-DE': 'MD-Datei konnte nicht erstellt werden',
		'fr-FR': 'Échec de la création du fichier MD',
		'ru-RU': 'Не удалось создать MD файл',
		'es-ES': 'Error al crear archivo MD'
	},
	'notices.recordUpdated': {
		'en-US': 'Record and MD file updated successfully',
		'zh-CN': '记录和MD文件更新成功',
		'zh-TW': '記錄和MD檔案更新成功',
		'ja-JP': 'レコードとMDファイルが正常に更新されました',
		'de-DE': 'Datensatz und MD-Datei erfolgreich aktualisiert',
		'fr-FR': 'Enregistrement et fichier MD mis à jour avec succès',
		'ru-RU': 'Запись и MD файл успешно обновлены',
		'es-ES': 'Registro y archivo MD actualizados exitosamente'
	},
	'notices.recordUpdatedMDFailed': {
		'en-US': 'Record updated but MD file update failed',
		'zh-CN': '记录更新成功但MD文件更新失败',
		'zh-TW': '記錄更新成功但MD檔案更新失敗',
		'ja-JP': 'レコードは更新されましたが、MDファイルの更新に失敗しました',
		'de-DE': 'Datensatz aktualisiert, aber MD-Datei-Update fehlgeschlagen',
		'fr-FR': 'Enregistrement mis à jour mais échec de la mise à jour du fichier MD',
		'ru-RU': 'Запись обновлена, но обновление MD файла не удалось',
		'es-ES': 'Registro actualizado pero falló la actualización del archivo MD'
	},
	'notices.recordCreatedMDSuccess': {
		'en-US': 'Record updated and MD file created successfully',
		'zh-CN': '记录更新成功且MD文件创建成功',
		'zh-TW': '記錄更新成功且MD檔案建立成功',
		'ja-JP': 'レコードが更新され、MDファイルが正常に作成されました',
		'de-DE': 'Datensatz aktualisiert und MD-Datei erfolgreich erstellt',
		'fr-FR': 'Enregistrement mis à jour et fichier MD créé avec succès',
		'ru-RU': 'Запись обновлена и MD файл успешно создан',
		'es-ES': 'Registro actualizado y archivo MD creado exitosamente'
	},
	'notices.recordCreatedMDFailed': {
		'en-US': 'Record updated but MD file creation failed',
		'zh-CN': '记录更新成功但MD文件创建失败',
		'zh-TW': '記錄更新成功但MD檔案建立失敗',
		'ja-JP': 'レコードは更新されましたが、MDファイルの作成に失敗しました',
		'de-DE': 'Datensatz aktualisiert, aber MD-Datei-Erstellung fehlgeschlagen',
		'fr-FR': 'Enregistrement mis à jour mais échec de la création du fichier MD',
		'ru-RU': 'Запись обновлена, но создание MD файла не удалось',
		'es-ES': 'Registro actualizado pero falló la creación del archivo MD'
	},
	'notices.recordSaveFailed': {
		'en-US': 'Failed to save record',
		'zh-CN': '保存记录失败',
		'zh-TW': '儲存記錄失敗',
		'ja-JP': 'レコードの保存に失敗しました',
		'de-DE': 'Datensatz konnte nicht gespeichert werden',
		'fr-FR': 'Échec de la sauvegarde de l\'enregistrement',
		'ru-RU': 'Не удалось сохранить запись',
		'es-ES': 'Error al guardar el registro'
	},
	'notices.selectRecordsToImport': {
		'en-US': 'Please select at least one record to import',
		'zh-CN': '请至少选择一个记录进行导入',
		'zh-TW': '請至少選擇一個記錄進行導入',
		'ja-JP': 'インポートするレコードを少なくとも1つ選択してください',
		'de-DE': 'Bitte wählen Sie mindestens einen Datensatz zum Importieren aus',
		'fr-FR': 'Veuillez sélectionner au moins un enregistrement à importer',
		'ru-RU': 'Пожалуйста, выберите хотя бы одну запись для импорта',
		'es-ES': 'Por favor seleccione al menos un registro para importar'
	},
	'notices.importDataFormatError': {
		'en-US': 'Import data format error',
		'zh-CN': '导入数据格式错误',
		'zh-TW': '導入資料格式錯誤',
		'ja-JP': 'インポートデータ形式エラー',
		'de-DE': 'Importdatenformatfehler',
		'fr-FR': 'Erreur de format des données d\'importation',
		'ru-RU': 'Ошибка формата данных импорта',
		'es-ES': 'Error de formato de datos de importación'
	},

	'notices.invalidDOIFormat': {
		'en-US': 'Invalid DOI format',
		'zh-CN': 'DOI格式无效',
		'zh-TW': 'DOI格式無效',
		'ja-JP': 'DOI形式が無効です',
		'de-DE': 'Ungültiges DOI-Format',
		'fr-FR': 'Format DOI invalide',
		'ru-RU': 'Неверный формат DOI',
		'es-ES': 'Formato DOI inválido'
	},

	'notices.PDFOpened': {
		'en-US': 'PDF opened successfully',
		'zh-CN': 'PDF打开成功',
		'zh-TW': 'PDF開啟成功',
		'ja-JP': 'PDFが正常に開きました',
		'de-DE': 'PDF erfolgreich geöffnet',
		'fr-FR': 'PDF ouvert avec succès',
		'ru-RU': 'PDF успешно открыт',
		'es-ES': 'PDF abierto exitosamente'
	},
	'notices.PDFFileNotFound': {
		'en-US': 'PDF file not found',
		'zh-CN': '未找到PDF文件',
		'zh-TW': '找不到PDF檔案',
		'ja-JP': 'PDFファイルが見つかりません',
		'de-DE': 'PDF-Datei nicht gefunden',
		'fr-FR': 'Fichier PDF non trouvé',
		'ru-RU': 'PDF файл не найден',
		'es-ES': 'Archivo PDF no encontrado'
	},
	'notices.failedToOpenPDF': {
		'en-US': 'Failed to open PDF',
		'zh-CN': '打开PDF失败',
		'zh-TW': '開啟PDF失敗',
		'ja-JP': 'PDFのオープンに失敗しました',
		'de-DE': 'PDF konnte nicht geöffnet werden',
		'fr-FR': 'Échec de l\'ouverture du PDF',
		'ru-RU': 'Не удалось открыть PDF',
		'es-ES': 'Error al abrir PDF'
	},
	'notices.pathCopied': {
		'en-US': 'File path copied to clipboard',
		'zh-CN': '文件路径已复制到剪贴板',
		'zh-TW': '檔案路徑已複製到剪貼簿',
		'ja-JP': 'ファイルパスがクリップボードにコピーされました',
		'de-DE': 'Dateipfad in die Zwischenablage kopiert',
		'fr-FR': 'Chemin du fichier copié dans le presse-papiers',
		'ru-RU': 'Путь к файлу скопирован в буфер обмена',
		'es-ES': 'Ruta del archivo copiada al portapapeles'
	},
	'notices.failedToCopyPath': {
		'en-US': 'Failed to copy path',
		'zh-CN': '复制路径失败',
		'zh-TW': '複製路徑失敗',
		'ja-JP': 'パスのコピーに失敗しました',
		'de-DE': 'Pfad konnte nicht kopiert werden',
		'fr-FR': 'Échec de la copie du chemin',
		'ru-RU': 'Не удалось скопировать путь',
		'es-ES': 'Error al copiar la ruta'
	},
	'notices.APACopied': {
		'en-US': 'APA citation copied to clipboard',
		'zh-CN': 'APA引用已复制到剪贴板',
		'zh-TW': 'APA引用已複製到剪貼簿',
		'ja-JP': 'APA引用がクリップボードにコピーされました',
		'de-DE': 'APA-Zitat in die Zwischenablage kopiert',
		'fr-FR': 'Citation APA copiée dans le presse-papiers',
		'ru-RU': 'APA цитата скопирована в буфер обмена',
		'es-ES': 'Cita APA copiada al portapapeles'
	},
	'notices.failedToCopyAPA': {
		'en-US': 'Failed to copy APA citation',
		'zh-CN': '复制APA引用失败',
		'zh-TW': '複製APA引用失敗',
		'ja-JP': 'APA引用のコピーに失敗しました',
		'de-DE': 'APA-Zitat konnte nicht kopiert werden',
		'fr-FR': 'Échec de la copie de la citation APA',
		'ru-RU': 'Не удалось скопировать APA цитату',
		'es-ES': 'Error al copiar cita APA'
	},
	'notices.BibTeXCopied': {
		'en-US': 'BibTeX copied to clipboard',
		'zh-CN': 'BibTeX已复制到剪贴板',
		'zh-TW': 'BibTeX已複製到剪貼簿',
		'ja-JP': 'BibTeXがクリップボードにコピーされました',
		'de-DE': 'BibTeX in die Zwischenablage kopiert',
		'fr-FR': 'BibTeX copié dans le presse-papiers',
		'ru-RU': 'BibTeX скопирован в буфер обмена',
		'es-ES': 'BibTeX copiado al portapapeles'
	},
	'notices.failedToCopyBibTeX': {
		'en-US': 'Failed to copy BibTeX',
		'zh-CN': '复制BibTeX失败',
		'zh-TW': '複製BibTeX失敗',
		'ja-JP': 'BibTeXのコピーに失敗しました',
		'de-DE': 'BibTeX konnte nicht kopiert werden',
		'fr-FR': 'Échec de la copie de BibTeX',
		'ru-RU': 'Не удалось скопировать BibTeX',
		'es-ES': 'Error al copiar BibTeX'
	},
	'notices.fileRevealed': {
		'en-US': 'File revealed in file explorer',
		'zh-CN': '已在文件管理器中显示文件',
		'zh-TW': '已在檔案管理員中顯示檔案',
		'ja-JP': 'ファイルエクスプローラーでファイルが表示されました',
		'de-DE': 'Datei im Datei-Explorer angezeigt',
		'fr-FR': 'Fichier affiché dans l\'explorateur de fichiers',
		'ru-RU': 'Файл показан в проводнике',
		'es-ES': 'Archivo mostrado en el explorador de archivos'
	},
	'notices.failedToShowFile': {
		'en-US': 'Failed to show file in folder',
		'zh-CN': '在文件夹中显示文件失败',
		'zh-TW': '在資料夾中顯示檔案失敗',
		'ja-JP': 'フォルダー内でのファイル表示に失敗しました',
		'de-DE': 'Datei konnte nicht im Ordner angezeigt werden',
		'fr-FR': 'Échec de l\'affichage du fichier dans le dossier',
		'ru-RU': 'Не удалось показать файл в папке',
		'es-ES': 'Error al mostrar archivo en la carpeta'
	},
	'notices.pleaseEnterValidPath': {
		'en-US': 'Please enter a valid file path',
		'zh-CN': '请输入有效的文件路径',
		'zh-TW': '請輸入有效的檔案路徑',
		'ja-JP': '有効なファイルパスを入力してください',
		'de-DE': 'Bitte geben Sie einen gültigen Dateipfad ein',
		'fr-FR': 'Veuillez entrer un chemin de fichier valide',
		'ru-RU': 'Пожалуйста, введите правильный путь к файлу',
		'es-ES': 'Por favor ingrese una ruta de archivo válida'
	},
	'notices.invalidPathOrFileNotExist': {
		'en-US': 'Path invalid or file does not exist, please check the path',
		'zh-CN': '路径无效或文件不存在，请检查路径',
		'zh-TW': '路徑無效或檔案不存在，請檢查路徑',
		'ja-JP': 'パスが無効またはファイルが存在しません。パスを確認してください',
		'de-DE': 'Pfad ungültig oder Datei existiert nicht, bitte überprüfen Sie den Pfad',
		'fr-FR': 'Chemin invalide ou fichier inexistant, veuillez vérifier le chemin',
		'ru-RU': 'Путь недействителен или файл не существует, пожалуйста, проверьте путь',
		'es-ES': 'Ruta inválida o archivo no existe, por favor verifique la ruta'
	},

	// 额外的系统通知消息
	'notices.failedToOpenFileDialog': {
		'en-US': 'Failed to open file dialog, please try refreshing the page',
		'zh-CN': '无法打开文件选择对话框，请尝试刷新页面后重试',
		'zh-TW': '無法開啟檔案選擇對話框，請嘗試重新整理頁面後重試',
		'ja-JP': 'ファイル選択ダイアログを開けません。ページを更新してから再試行してください',
		'de-DE': 'Dateidialog konnte nicht geöffnet werden, bitte versuchen Sie die Seite zu aktualisieren',
		'fr-FR': 'Échec de l\'ouverture de la boîte de dialogue de fichiers, veuillez actualiser la page',
		'ru-RU': 'Не удалось открыть диалог выбора файлов, пожалуйста, обновите страницу',
		'es-ES': 'Error al abrir el diálogo de archivos, por favor actualice la página'
	},

	'notices.MDFileUpdateFailed': {
		'en-US': 'Failed to update MD file',
		'zh-CN': '更新MD文件失败',
		'zh-TW': '更新MD檔案失敗',
		'ja-JP': 'MDファイルの更新に失敗しました',
		'de-DE': 'MD-Datei konnte nicht aktualisiert werden',
		'fr-FR': 'Échec de la mise à jour du fichier MD',
		'ru-RU': 'Не удалось обновить MD файл',
		'es-ES': 'Error al actualizar archivo MD'
	},
	'notices.MDSyncFailed': {
		'en-US': 'Failed to sync information from MD file',
		'zh-CN': '从MD文件同步信息失败',
		'zh-TW': '從MD檔案同步資訊失敗',
		'ja-JP': 'MDファイルからの情報同期に失敗しました',
		'de-DE': 'Synchronisation der Informationen aus der MD-Datei fehlgeschlagen',
		'fr-FR': 'Échec de la synchronisation des informations depuis le fichier MD',
		'ru-RU': 'Не удалось синхронизировать информацию из MD файла',
		'es-ES': 'Error al sincronizar información desde archivo MD'
	},
	'notices.MDFileDeleteFailed': {
		'en-US': 'Failed to delete MD file',
		'zh-CN': '删除MD文件失败',
		'zh-TW': '刪除MD檔案失敗',
		'ja-JP': 'MDファイルの削除に失敗しました',
		'de-DE': 'MD-Datei konnte nicht gelöscht werden',
		'fr-FR': 'Échec de la suppression du fichier MD',
		'ru-RU': 'Не удалось удалить MD файл',
		'es-ES': 'Error al eliminar archivo MD'
	},
	'notices.MDSyncAllFailed': {
		'en-US': 'Failed to sync MD files',
		'zh-CN': '同步MD文件失败',
		'zh-TW': '同步MD檔案失敗',
		'ja-JP': 'MDファイルの同期に失敗しました',
		'de-DE': 'Synchronisation der MD-Dateien fehlgeschlagen',
		'fr-FR': 'Échec de la synchronisation des fichiers MD',
		'ru-RU': 'Не удалось синхронизировать MD файлы',
		'es-ES': 'Error al sincronizar archivos MD'
	},
	'notices.MDRecreateFailed': {
		'en-US': 'Failed to recreate MD file',
		'zh-CN': '重新创建MD文件失败',
		'zh-TW': '重新建立MD檔案失敗',
		'ja-JP': 'MDファイルの再作成に失敗しました',
		'de-DE': 'MD-Datei konnte nicht neu erstellt werden',
		'fr-FR': 'Échec de la recréation du fichier MD',
		'ru-RU': 'Не удалось пересоздать MD файл',
		'es-ES': 'Error al recrear archivo MD'
	},
	'notices.allTagsAreUpToDate': {
		'en-US': 'All attachment tags are up to date',
		'zh-CN': '所有附件的标签都是最新的',
		'zh-TW': '所有附件的標籤都是最新的',
		'ja-JP': 'すべての添付ファイルのタグが最新です',
		'de-DE': 'Alle Anhang-Tags sind auf dem neuesten Stand',
		'fr-FR': 'Toutes les balises des pièces jointes sont à jour',
		'ru-RU': 'Все теги вложений актуальны',
		'es-ES': 'Todas las etiquetas de adjuntos están actualizadas'
	},
	'notices.settingsMigrated': {
		'en-US': 'Settings migrated to hubsetting.json',
		'zh-CN': '设置已迁移到hubsetting.json',
		'zh-TW': '設定已遷移到hubsetting.json',
		'ja-JP': '設定がhubsetting.jsonに移行されました',
		'de-DE': 'Einstellungen wurden zu hubsetting.json migriert',
		'fr-FR': 'Paramètres migrés vers hubsetting.json',
		'ru-RU': 'Настройки перенесены в hubsetting.json',
		'es-ES': 'Configuración migrada a hubsetting.json'
	},
	'notices.settingsSaveFailed': {
		'en-US': 'Failed to save settings',
		'zh-CN': '保存设置失败',
		'zh-TW': '儲存設定失敗',
		'ja-JP': '設定の保存に失敗しました',
		'de-DE': 'Einstellungen konnten nicht gespeichert werden',
		'fr-FR': 'Échec de la sauvegarde des paramètres',
		'ru-RU': 'Не удалось сохранить настройки',
		'es-ES': 'Error al guardar configuración'
	},
	'notices.settingsReset': {
		'en-US': 'Settings reset to defaults',
		'zh-CN': '设置已重置为默认值',
		'zh-TW': '設定已重設為預設值',
		'ja-JP': '設定がデフォルトにリセットされました',
		'de-DE': 'Einstellungen auf Standardwerte zurückgesetzt',
		'fr-FR': 'Paramètres réinitialisés aux valeurs par défaut',
		'ru-RU': 'Настройки сброшены к значениям по умолчанию',
		'es-ES': 'Configuración restablecida a valores predeterminados'
	},
	'notices.settingsRestored': {
		'en-US': 'Settings restored successfully',
		'zh-CN': '设置已成功恢复',
		'zh-TW': '設定已成功恢復',
		'ja-JP': '設定が正常に復元されました',
		'de-DE': 'Einstellungen erfolgreich wiederhergestellt',
		'fr-FR': 'Paramètres restaurés avec succès',
		'ru-RU': 'Настройки успешно восстановлены',
		'es-ES': 'Configuración restaurada exitosamente'
	},
	'notices.settingsRestoreFailed': {
		'en-US': 'Failed to restore settings',
		'zh-CN': '恢复设置失败',
		'zh-TW': '恢復設定失敗',
		'ja-JP': '設定の復元に失敗しました',
		'de-DE': 'Einstellungen konnten nicht wiederhergestellt werden',
		'fr-FR': 'Échec de la restauration des paramètres',
		'ru-RU': 'Не удалось восстановить настройки',
		'es-ES': 'Error al restaurar configuración'
	},
	'notices.tagFileCreateFailed': {
		'en-US': 'Failed to create tag file',
		'zh-CN': '创建标签文件失败',
		'zh-TW': '建立標籤檔案失敗',
		'ja-JP': 'タグファイルの作成に失敗しました',
		'de-DE': 'Tag-Datei konnte nicht erstellt werden',
		'fr-FR': 'Échec de la création du fichier de balises',
		'ru-RU': 'Не удалось создать файл тегов',
		'es-ES': 'Error al crear archivo de etiquetas'
	},
	'notices.orphanTagsCleaned': {
		'en-US': 'Orphaned tag files cleaned up',
		'zh-CN': '孤立的标签文件已清理',
		'zh-TW': '孤立的標籤檔案已清理',
		'ja-JP': '孤立したタグファイルがクリーンアップされました',
		'de-DE': 'Verwaiste Tag-Dateien wurden bereinigt',
		'fr-FR': 'Fichiers de balises orphelins nettoyés',
		'ru-RU': 'Осиротевшие файлы тегов очищены',
		'es-ES': 'Archivos de etiquetas huérfanos limpiados'
	},
	'notices.tagSyncFailed': {
		'en-US': 'Failed to sync tags to Obsidian',
		'zh-CN': '同步标签到Obsidian失败',
		'zh-TW': '同步標籤到Obsidian失敗',
		'ja-JP': 'Obsidianへのタグ同期に失敗しました',
		'de-DE': 'Synchronisation der Tags zu Obsidian fehlgeschlagen',
		'fr-FR': 'Échec de la synchronisation des balises vers Obsidian',
		'ru-RU': 'Не удалось синхронизировать теги с Obsidian',
		'es-ES': 'Error al sincronizar etiquetas con Obsidian'
	},
	'notices.tagsSynced': {
		'en-US': 'Tags synchronized to Obsidian',
		'zh-CN': '标签已同步到Obsidian',
		'zh-TW': '標籤已同步到Obsidian',
		'ja-JP': 'タグがObsidianに同期されました',
		'de-DE': 'Tags wurden zu Obsidian synchronisiert',
		'fr-FR': 'Balises synchronisées vers Obsidian',
		'ru-RU': 'Теги синхронизированы с Obsidian',
		'es-ES': 'Etiquetas sincronizadas con Obsidian'
	},
	'notices.tagIndexCreated': {
		'en-US': 'Tag search index created',
		'zh-CN': '标签搜索索引已创建',
		'zh-TW': '標籤搜尋索引已建立',
		'ja-JP': 'タグ検索インデックスが作成されました',
		'de-DE': 'Tag-Suchindex erstellt',
		'fr-FR': 'Index de recherche de balises créé',
		'ru-RU': 'Индекс поиска тегов создан',
		'es-ES': 'Índice de búsqueda de etiquetas creado'
	},
	'notices.tagIndexCreateFailed': {
		'en-US': 'Failed to create tag search index',
		'zh-CN': '创建标签搜索索引失败',
		'zh-TW': '建立標籤搜尋索引失敗',
		'ja-JP': 'タグ検索インデックスの作成に失敗しました',
		'de-DE': 'Tag-Suchindex konnte nicht erstellt werden',
		'fr-FR': 'Échec de la création de l\'index de recherche de balises',
		'ru-RU': 'Не удалось создать индекс поиска тегов',
		'es-ES': 'Error al crear índice de búsqueda de etiquetas'
	},
	'notices.databaseSaveFailed': {
		'en-US': 'Failed to save database',
		'zh-CN': '保存数据库失败',
		'zh-TW': '儲存資料庫失敗',
		'ja-JP': 'データベースの保存に失敗しました',
		'de-DE': 'Datenbank konnte nicht gespeichert werden',
		'fr-FR': 'Échec de la sauvegarde de la base de données',
		'ru-RU': 'Не удалось сохранить базу данных',
		'es-ES': 'Error al guardar base de datos'
	},
	'notices.databaseLoadFailed': {
		'en-US': 'Failed to load database',
		'zh-CN': '加载数据库失败',
		'zh-TW': '載入資料庫失敗',
		'ja-JP': 'データベースの読み込みに失敗しました',
		'de-DE': 'Datenbank konnte nicht geladen werden',
		'fr-FR': 'Échec du chargement de la base de données',
		'ru-RU': 'Не удалось загрузить базу данных',
		'es-ES': 'Error al cargar base de datos'
	},

	'notices.databaseRestored': {
		'en-US': 'Database restored successfully',
		'zh-CN': '数据库已成功恢复',
		'zh-TW': '資料庫已成功恢復',
		'ja-JP': 'データベースが正常に復元されました',
		'de-DE': 'Datenbank erfolgreich wiederhergestellt',
		'fr-FR': 'Base de données restaurée avec succès',
		'ru-RU': 'База данных успешно восстановлена',
		'es-ES': 'Base de datos restaurada exitosamente'
	},


	'notices.columnSettingsApplied': {
		'en-US': 'Column display settings applied',
		'zh-CN': '列显示设置已应用',
		'zh-TW': '列顯示設定已套用',
		'ja-JP': '列表示設定が適用されました',
		'de-DE': 'Spaltenanzeigeeinstellungen angewendet',
		'fr-FR': 'Paramètres d\'affichage des colonnes appliqués',
		'ru-RU': 'Настройки отображения столбцов применены',
		'es-ES': 'Configuración de visualización de columnas aplicada'
	},
	'notices.MLACopied': {
		'en-US': 'MLA citation copied to clipboard',
		'zh-CN': 'MLA引用已复制到剪贴板',
		'zh-TW': 'MLA引用已複製到剪貼簿',
		'ja-JP': 'MLA引用がクリップボードにコピーされました',
		'de-DE': 'MLA-Zitat in die Zwischenablage kopiert',
		'fr-FR': 'Citation MLA copiée dans le presse-papiers',
		'ru-RU': 'MLA цитата скопирована в буфер обмена',
		'es-ES': 'Cita MLA copiada al portapapeles'
	},
	'notices.DOILinkCopied': {
		'en-US': 'DOI link copied to clipboard',
		'zh-CN': 'DOI链接已复制到剪贴板',
		'zh-TW': 'DOI連結已複製到剪貼簿',
		'ja-JP': 'DOIリンクがクリップボードにコピーされました',
		'de-DE': 'DOI-Link in die Zwischenablage kopiert',
		'fr-FR': 'Lien DOI copié dans le presse-papiers',
		'ru-RU': 'DOI ссылка скопирована в буфер обмена',
		'es-ES': 'Enlace DOI copiado al portapapeles'
	},
	'notices.recordDeleted': {
		'en-US': 'Record deleted successfully',
		'zh-CN': '记录删除成功',
		'zh-TW': '記錄刪除成功',
		'ja-JP': 'レコードが正常に削除されました',
		'de-DE': 'Datensatz erfolgreich gelöscht',
		'fr-FR': 'Enregistrement supprimé avec succès',
		'ru-RU': 'Запись успешно удалена',
		'es-ES': 'Registro eliminado exitosamente'
	},
	'notices.recordDeleteFailed': {
		'en-US': 'Failed to delete record',
		'zh-CN': '删除记录失败',
		'zh-TW': '刪除記錄失敗',
		'ja-JP': 'レコードの削除に失敗しました',
		'de-DE': 'Datensatz konnte nicht gelöscht werden',
		'fr-FR': 'Échec de la suppression de l\'enregistrement',
		'ru-RU': 'Не удалось удалить запись',
		'es-ES': 'Error al eliminar registro'
	},
	'notices.fileSelectFailed': {
		'en-US': 'File selection failed',
		'zh-CN': '文件选择失败',
		'zh-TW': '檔案選擇失敗',
		'ja-JP': 'ファイル選択に失敗しました',
		'de-DE': 'Dateiauswahl fehlgeschlagen',
		'fr-FR': 'Échec de la sélection du fichier',
		'ru-RU': 'Ошибка выбора файла',
		'es-ES': 'Error al seleccionar archivo'
	},
	'notices.clickToSelectFile': {
		'en-US': 'Click to select file',
		'zh-CN': '点击选择文件',
		'zh-TW': '點擊選擇檔案',
		'ja-JP': 'クリックしてファイルを選択',
		'de-DE': 'Klicken Sie zum Auswählen der Datei',
		'fr-FR': 'Cliquez pour sélectionner le fichier',
		'ru-RU': 'Нажмите для выбора файла',
		'es-ES': 'Haga clic para seleccionar archivo'
	},
	'notices.fileSelectorCreationFailed': {
		'en-US': 'Failed to create file selector',
		'zh-CN': '创建文件选择器失败',
		'zh-TW': '建立檔案選擇器失敗',
		'ja-JP': 'ファイルセレクターの作成に失敗しました',
		'de-DE': 'Dateiauswahl konnte nicht erstellt werden',
		'fr-FR': 'Échec de la création du sélecteur de fichier',
		'ru-RU': 'Не удалось создать выбор файла',
		'es-ES': 'Error al crear selector de archivos'
	},
	'notices.processingPackage': {
		'en-US': 'Processing package...',
		'zh-CN': '正在处理包...',
		'zh-TW': '正在處理套件...',
		'ja-JP': 'パッケージを処理しています...',
		'de-DE': 'Paket wird verarbeitet...',
		'fr-FR': 'Traitement du package...',
		'ru-RU': 'Обработка пакета...',
		'es-ES': 'Procesando paquete...'
	},
	'notices.packageImported': {
		'en-US': 'Package imported successfully',
		'zh-CN': '包导入成功',
		'zh-TW': '套件匯入成功',
		'ja-JP': 'パッケージが正常にインポートされました',
		'de-DE': 'Paket erfolgreich importiert',
		'fr-FR': 'Package importé avec succès',
		'ru-RU': 'Пакет успешно импортирован',
		'es-ES': 'Paquete importado exitosamente'
	},
	'notices.importPackageFailed': {
		'en-US': 'Failed to import package: {error}',
		'zh-CN': '导入包失败: {error}',
		'zh-TW': '匯入套件失敗: {error}',
		'ja-JP': 'パッケージのインポートに失敗しました: {error}',
		'de-DE': 'Paketimport fehlgeschlagen: {error}',
		'fr-FR': 'Échec de l\'importation du package : {error}',
		'ru-RU': 'Ошибка импорта пакета: {error}',
		'es-ES': 'Error al importar paquete: {error}'
	},

	// 标签相关
	'tags.searchByTag': {
		'en-US': 'Search by Tag',
		'zh-CN': '按标签搜索',
		'zh-TW': '按標籤搜尋',
		'ja-JP': 'タグで検索',
		'de-DE': 'Nach Tag suchen',
		'fr-FR': 'Rechercher par étiquette',
		'ru-RU': 'Поиск по тегу',
		'es-ES': 'Buscar por etiqueta'
	},
	'tags.selectTag': {
		'en-US': 'Select Tag...',
		'zh-CN': '选择标签...',
		'zh-TW': '選擇標籤...',
		'ja-JP': 'タグを選択...',
		'de-DE': 'Tag auswählen...',
		'fr-FR': 'Sélectionner une étiquette...',
		'ru-RU': 'Выберите тег...',
		'es-ES': 'Seleccionar etiqueta...'
	},

	// 文件操作
	'fileOperations.open': {
		'en-US': 'Open File',
		'zh-CN': '打开文件',
		'zh-TW': '開啟檔案',
		'ja-JP': 'ファイルを開く',
		'de-DE': 'Datei öffnen',
		'fr-FR': 'Ouvrir le fichier',
		'ru-RU': 'Открыть файл',
		'es-ES': 'Abrir archivo'
	},
	'fileOperations.reveal': {
		'en-US': 'Reveal in Explorer',
		'zh-CN': '在资源管理器中显示',
		'zh-TW': '在檔案總管中顯示',
		'ja-JP': 'エクスプローラーで表示',
		'de-DE': 'Im Explorer anzeigen',
		'fr-FR': 'Afficher dans l\'explorateur',
		'ru-RU': 'Показать в проводнике',
		'es-ES': 'Mostrar en el explorador'
	},
	'fileOperations.copyPath': {
		'en-US': 'Copy File Path',
		'zh-CN': '复制文件路径',
		'zh-TW': '複製檔案路徑',
		'ja-JP': 'ファイルパスをコピー',
		'de-DE': 'Dateipfad kopieren',
		'fr-FR': 'Copier le chemin du fichier',
		'ru-RU': 'Копировать путь к файлу',
		'es-ES': 'Copiar ruta del archivo'
	},
	'fileOperations.delete': {
		'en-US': 'Delete File',
		'zh-CN': '删除文件',
		'zh-TW': '刪除檔案',
		'ja-JP': 'ファイルを削除',
		'de-DE': 'Datei löschen',
		'fr-FR': 'Supprimer le fichier',
		'ru-RU': 'Удалить файл',
		'es-ES': 'Eliminar archivo'
	},

	// 主界面相关
	'views.mainView.tableScrollTip': {
		'en-US': 'Scroll horizontally to view all columns',
		'zh-CN': '横向滚动查看所有列',
		'zh-TW': '橫向滾動查看所有列',
		'ja-JP': '水平にスクロールしてすべての列を表示',
		'de-DE': 'Horizontal scrollen, um alle Spalten anzuzeigen',
		'fr-FR': 'Faire défiler horizontalement pour voir toutes les colonnes',
		'ru-RU': 'Прокрутите по горизонтали, чтобы увидеть все столбцы',
		'es-ES': 'Desplazarse horizontalmente para ver todas las columnas'
	},
	'views.mainView.noMDFile': {
		'en-US': 'No associated markdown file',
		'zh-CN': '无关联的Markdown文件',
		'zh-TW': '無關聯的Markdown檔案',
		'ja-JP': '関連付けられたMarkdownファイルがありません',
		'de-DE': 'Keine zugeordnete Markdown-Datei',
		'fr-FR': 'Aucun fichier markdown associé',
		'ru-RU': 'Нет связанного markdown файла',
		'es-ES': 'No hay archivo markdown asociado'
	},
	'views.mainView.rootDirectory': {
		'en-US': 'Root Directory',
		'zh-CN': '根目录',
		'zh-TW': '根目錄',
		'ja-JP': 'ルートディレクトリ',
		'de-DE': 'Stammverzeichnis',
		'fr-FR': 'Répertoire racine',
		'ru-RU': 'Корневая директория',
		'es-ES': 'Directorio raíz'
	},
	'views.mainView.location': {
		'en-US': 'Location',
		'zh-CN': '位置',
		'zh-TW': '位置',
		'ja-JP': '場所',
		'de-DE': 'Speicherort',
		'fr-FR': 'Emplacement',
		'ru-RU': 'Расположение',
		'es-ES': 'Ubicación'
	},
	'views.mainView.tableAutoFitTip': {
		'en-US': 'Table columns auto-fitted to content',
		'zh-CN': '表格列已根据内容自动调整',
		'zh-TW': '表格列已根據內容自動調整',
		'ja-JP': 'テーブルの列がコンテンツに合わせて自動調整されました',
		'de-DE': 'Tabellenspalten wurden dem Inhalt angepasst',
		'fr-FR': 'Colonnes du tableau ajustées automatiquement au contenu',
		'ru-RU': 'Столбцы таблицы автоматически подогнаны под содержимое',
		'es-ES': 'Columnas de la tabla ajustadas automáticamente al contenido'
	},

	// 主界面按钮和标题
	'views.mainView.view': {
		'en-US': 'View',
		'zh-CN': '视图',
		'zh-TW': '視圖',
		'ja-JP': 'ビュー',
		'de-DE': 'Ansicht',
		'fr-FR': 'Vue',
		'ru-RU': 'Просмотр',
		'es-ES': 'Vista'
	},
	'views.mainView.tableView': {
		'en-US': 'Table View',
		'zh-CN': '表格视图',
		'zh-TW': '表格視圖',
		'ja-JP': 'テーブルビュー',
		'de-DE': 'Tabellenansicht',
		'fr-FR': 'Vue Tableau',
		'ru-RU': 'Табличный вид',
		'es-ES': 'Vista de Tabla'
	},
	'views.mainView.cardViewMode': {
		'en-US': 'Card View',
		'zh-CN': '卡片视图',
		'zh-TW': '卡片視圖',
		'ja-JP': 'カードビュー',
		'de-DE': 'Kartenansicht',
		'fr-FR': 'Vue Carte',
		'ru-RU': 'Карточный вид',
		'es-ES': 'Vista de Tarjeta'
	},
	'views.mainView.previewViewMode': {
		'en-US': 'Preview View',
		'zh-CN': '预览视图',
		'zh-TW': '預覽視圖',
		'ja-JP': 'プレビュービュー',
		'de-DE': 'Vorschauansicht',
		'fr-FR': 'Vue Aperçu',
		'ru-RU': 'Предварительный просмотр',
		'es-ES': 'Vista Previa'
	},
	'views.mainView.operations': {
		'en-US': 'Operations',
		'zh-CN': '操作',
		'zh-TW': '操作',
		'ja-JP': '操作',
		'de-DE': 'Operationen',
		'fr-FR': 'Opérations',
		'ru-RU': 'Операции',
		'es-ES': 'Operaciones'
	},
	'views.mainView.importPDF': {
		'en-US': 'Import PDF',
		'zh-CN': '导入PDF',
		'zh-TW': '導入PDF',
		'ja-JP': 'PDFをインポート',
		'de-DE': 'PDF importieren',
		'fr-FR': 'Importer PDF',
		'ru-RU': 'Импортировать PDF',
		'es-ES': 'Importar PDF'
	},
	'views.mainView.downloadPaper': {
		'en-US': 'Download Paper',
		'zh-CN': '下载论文',
		'zh-TW': '下載論文',
		'ja-JP': '論文をダウンロード',
		'de-DE': 'Papier herunterladen',
		'fr-FR': 'Télécharger l\'article',
		'ru-RU': 'Скачать статью',
		'es-ES': 'Descargar Artículo'
	},
	'views.mainView.searchDOI': {
		'en-US': 'Search by DOI',
		'zh-CN': '通过DOI搜索',
		'zh-TW': '通過DOI搜尋',
		'ja-JP': 'DOIで検索',
		'de-DE': 'Über DOI suchen',
		'fr-FR': 'Rechercher par DOI',
		'ru-RU': 'Поиск по DOI',
		'es-ES': 'Buscar por DOI'
	},
	'views.mainView.management': {
		'en-US': 'Management',
		'zh-CN': '管理',
		'zh-TW': '管理',
		'ja-JP': '管理',
		'de-DE': 'Verwaltung',
		'fr-FR': 'Gestion',
		'ru-RU': 'Управление',
		'es-ES': 'Gestión'
	},
	'views.mainView.scanAllAttachments': {
		'en-US': 'Scan All Attachments',
		'zh-CN': '扫描所有附件',
		'zh-TW': '掃描所有附件',
		'ja-JP': 'すべての添付ファイルをスキャン',
		'de-DE': 'Alle Anhänge scannen',
		'fr-FR': 'Analyser toutes les pièces jointes',
		'ru-RU': 'Сканировать все вложения',
		'es-ES': 'Escanear todos los archivos adjuntos'
	},
	'views.mainView.refreshView': {
		'en-US': 'Refresh View',
		'zh-CN': '刷新视图',
		'zh-TW': '重新整理視圖',
		'ja-JP': 'ビューを更新',
		'de-DE': 'Ansicht aktualisieren',
		'fr-FR': 'Rafraîchir la vue',
		'ru-RU': 'Обновить вид',
		'es-ES': 'Actualizar Vista'
	},
	'views.mainView.syncTags': {
		'en-US': 'Sync Tags',
		'zh-CN': '同步标签',
		'zh-TW': '同步標籤',
		'ja-JP': 'タグを同期',
		'de-DE': 'Tags synchronisieren',
		'fr-FR': 'Synchroniser les étiquettes',
		'ru-RU': 'Синхронизировать теги',
		'es-ES': 'Sincronizar Etiquetas'
	},
	'views.mainView.tagsSyncCompleted': {
		'en-US': 'Tags sync completed',
		'zh-CN': '标签同步完成',
		'zh-TW': '標籤同步完成',
		'ja-JP': 'タグ同期が完了しました',
		'de-DE': 'Tagsynchronisierung abgeschlossen',
		'fr-FR': 'Synchronisation des étiquettes terminée',
		'ru-RU': 'Синхронизация тегов завершена',
		'es-ES': 'Sincronización de etiquetas completada'
	},
	'views.mainView.updateReferences': {
		'en-US': 'Update References',
		'zh-CN': '更新引用',
		'zh-TW': '更新引用',
		'ja-JP': '参照を更新',
		'de-DE': 'Referenzen aktualisieren',
		'fr-FR': 'Mettre à jour les références',
		'ru-RU': 'Обновить ссылки',
		'es-ES': 'Actualizar Referencias'
	},
	'views.mainView.createAllMDFiles': {
		'en-US': 'Create All MD Files',
		'zh-CN': '创建所有MD文件',
		'zh-TW': '創建所有MD檔案',
		'ja-JP': 'すべてのMDファイルを作成',
		'de-DE': 'Alle MD-Dateien erstellen',
		'fr-FR': 'Créer tous les fichiers MD',
		'ru-RU': 'Создать все MD файлы',
		'es-ES': 'Crear todos los archivos MD'
	},
	'views.mainView.mdFileSyncCompleted': {
		'en-US': 'MD file sync completed',
		'zh-CN': 'MD文件同步完成',
		'zh-TW': 'MD檔案同步完成',
		'ja-JP': 'MDファイル同期が完了しました',
		'de-DE': 'MD-Dateisynchronisierung abgeschlossen',
		'fr-FR': 'Synchronisation des fichiers MD terminée',
		'ru-RU': 'Синхронизация MD файлов завершена',
		'es-ES': 'Sincronización de archivos MD completada'
	},
	'views.mainView.createMDFileFailed': {
		'en-US': 'Create MD file failed: {message}',
		'zh-CN': '创建MD文件失败: {message}',
		'zh-TW': '創建MD檔案失敗: {message}',
		'ja-JP': 'MDファイルの作成に失敗しました: {message}',
		'de-DE': 'MD-Datei erstellen fehlgeschlagen: {message}',
		'fr-FR': 'Échec de la création du fichier MD : {message}',
		'ru-RU': 'Не удалось создать MD файл: {message}',
		'es-ES': 'Error al crear archivo MD: {message}'
	},
	'views.mainView.syncMDFileTags': {
		'en-US': 'Sync MD File Tags',
		'zh-CN': '同步MD文件标签',
		'zh-TW': '同步MD檔案標籤',
		'ja-JP': 'MDファイルタグを同期',
		'de-DE': 'MD-Datei-Tags synchronisieren',
		'fr-FR': 'Synchroniser les étiquettes des fichiers MD',
		'ru-RU': 'Синхронизировать теги MD файлов',
		'es-ES': 'Sincronizar etiquetas de archivos MD'
	},
	'views.mainView.mdFileSyncFailed': {
		'en-US': 'MD file sync failed: {message}',
		'zh-CN': 'MD文件同步失败: {message}',
		'zh-TW': 'MD檔案同步失敗: {message}',
		'ja-JP': 'MDファイル同期に失敗しました: {message}',
		'de-DE': 'MD-Dateisynchronisierung fehlgeschlagen: {message}',
		'fr-FR': 'Échec de la synchronisation des fichiers MD : {message}',
		'ru-RU': 'Не удалось синхронизировать MD файлы: {message}',
		'es-ES': 'Error al sincronizar archivos MD: {message}'
	},
	'views.mainView.checkLostMDFiles': {
		'en-US': 'Check Lost MD Files',
		'zh-CN': '检查丢失的MD文件',
		'zh-TW': '檢查遺失的MD檔案',
		'ja-JP': '失われたMDファイルを確認',
		'de-DE': 'Verlorene MD-Dateien überprüfen',
		'fr-FR': 'Vérifier les fichiers MD perdus',
		'ru-RU': 'Проверить потерянные MD файлы',
		'es-ES': 'Verificar archivos MD perdidos'
	},
	'views.mainView.noLostMDFiles': {
		'en-US': 'No lost MD files found',
		'zh-CN': '未发现丢失的MD文件',
		'zh-TW': '未發現遺失的MD檔案',
		'ja-JP': '失われたMDファイルは見つかりませんでした',
		'de-DE': 'Keine verlorenen MD-Dateien gefunden',
		'fr-FR': 'Aucun fichier MD perdu trouvé',
		'ru-RU': 'Потерянные MD файлы не найдены',
		'es-ES': 'No se encontraron archivos MD perdidos'
	},
	'views.mainView.checkLostMDFilesFailed': {
		'en-US': 'Check lost MD files failed: {message}',
		'zh-CN': '检查丢失的MD文件失败: {message}',
		'zh-TW': '檢查遺失的MD檔案失敗: {message}',
		'ja-JP': '失われたMDファイルの確認に失敗しました: {message}',
		'de-DE': 'Überprüfung der verlorenen MD-Dateien fehlgeschlagen: {message}',
		'fr-FR': 'Échec de la vérification des fichiers MD perdus : {message}',
		'ru-RU': 'Не удалось проверить потерянные MD файлы: {message}',
		'es-ES': 'Error al verificar archivos MD perdidos: {message}'
	},
	'views.mainView.searchByTag': {
		'en-US': 'Search by Tag',
		'zh-CN': '按标签搜索',
		'zh-TW': '按標籤搜尋',
		'ja-JP': 'タグで検索',
		'de-DE': 'Nach Tag suchen',
		'fr-FR': 'Rechercher par étiquette',
		'ru-RU': 'Поиск по тегу',
		'es-ES': 'Buscar por etiqueta'
	},
	'views.mainView.useCommandPanel': {
		'en-US': 'Please use the command panel',
		'zh-CN': '请使用命令面板',
		'zh-TW': '請使用命令面板',
		'ja-JP': 'コマンドパネルを使用してください',
		'de-DE': 'Bitte verwenden Sie das Befehlspanel',
		'fr-FR': 'Veuillez utiliser le panneau de commandes',
		'ru-RU': 'Пожалуйста, используйте панель команд',
		'es-ES': 'Por favor, use el panel de comandos'
	},
	'views.mainView.data': {
		'en-US': 'Data',
		'zh-CN': '数据',
		'zh-TW': '數據',
		'ja-JP': 'データ',
		'de-DE': 'Daten',
		'fr-FR': 'Données',
		'ru-RU': 'Данные',
		'es-ES': 'Datos'
	},
	'views.mainView.tags': {
		'en-US': 'Tags',
		'zh-CN': '标签',
		'zh-TW': '標籤',
		'ja-JP': 'タグ',
		'de-DE': 'Tags',
		'fr-FR': 'Étiquettes',
		'ru-RU': 'Теги',
		'es-ES': 'Etiquetas'
	},
	'views.mainView.allAttachments': {
		'en-US': 'All Attachments',
		'zh-CN': '所有附件',
		'zh-TW': '所有附件',
		'ja-JP': 'すべての添付ファイル',
		'de-DE': 'Alle Anhänge',
		'fr-FR': 'Toutes les pièces jointes',
		'ru-RU': 'Все вложения',
		'es-ES': 'Todos los archivos adjuntos'
	},
	'views.mainView.exportAllData': {
		'en-US': 'Export All Data',
		'zh-CN': '导出所有数据',
		'zh-TW': '匯出所有數據',
		'ja-JP': 'すべてのデータをエクスポート',
		'de-DE': 'Alle Daten exportieren',
		'fr-FR': 'Exporter toutes les données',
		'ru-RU': 'Экспортировать все данные',
		'es-ES': 'Exportar todos los datos'
	},
	'views.mainView.exportCompletePackage': {
		'en-US': 'Export Complete Package',
		'zh-CN': '导出完整包',
		'zh-TW': '匯出完整包',
		'ja-JP': '完全なパッケージをエクスポート',
		'de-DE': 'Vollständiges Paket exportieren',
		'fr-FR': 'Exporter le package complet',
		'ru-RU': 'Экспортировать полный пакет',
		'es-ES': 'Exportar paquete completo'
	},
	'views.mainView.importCompletePackage': {
		'en-US': 'Import Complete Package',
		'zh-CN': '导入完整数据包',
		'zh-TW': '導入完整數據包',
		'ja-JP': '完全なパッケージをインポート',
		'de-DE': 'Vollständiges Paket importieren',
		'fr-FR': 'Importer le package complet',
		'ru-RU': 'Импортировать полный пакет',
		'es-ES': 'Importar paquete completo'
	},


	// Import Package Modal
	'modals.importPackage.title': {
		'en-US': 'Import Research Attachment Package',
		'zh-CN': '导入研究附件包',
		'zh-TW': '導入研究附件包',
		'ja-JP': '研究添付ファイルパッケージをインポート',
		'de-DE': 'Forschungsanhang-Paket importieren',
		'fr-FR': 'Importer le package de pièces jointes de recherche',
		'ru-RU': 'Импорт пакета исследовательских вложений',
		'es-ES': 'Importar paquete de adjuntos de investigación'
	},
	'modals.importPackage.description': {
		'en-US': 'Select the research attachment package file to import (.zip format). This will import all attachment files, database records, and plugin settings.',
		'zh-CN': '选择要导入的研究附件包文件（.zip格式）。这将导入所有附件文件、数据库记录和插件设置。',
		'zh-TW': '選擇要導入的研究附件包文件（.zip格式）。這將導入所有附件文件、數據庫記錄和插件設置。',
		'ja-JP': 'インポートする研究添付ファイルパッケージ（.zip形式）を選択します。すべての添付ファイル、データベースレコード、プラグイン設定をインポートします。',
		'de-DE': 'Wählen Sie die zu importierende Forschungsanhang-Paketdatei (.zip-Format). Dies importiert alle Anhangdateien, Datenbankeinträge und Plugin-Einstellungen.',
		'fr-FR': 'Sélectionnez le fichier package de pièces jointes de recherche à importer (format .zip). Cela importera tous les fichiers joints, les enregistrements de base de données et les paramètres du plugin.',
		'ru-RU': 'Выберите файл пакета исследовательских вложений для импорта (формат .zip). Это импортирует все файлы вложений, записи базы данных и настройки плагина.',
		'es-ES': 'Seleccione el archivo de paquete de adjuntos de investigación para importar (formato .zip). Esto importará todos los archivos adjuntos, registros de base de datos y configuraciones del plugin.'
	},
	'modals.importPackage.selectFile': {
		'en-US': 'Select Import Package File',
		'zh-CN': '选择导入包文件',
		'zh-TW': '選擇導入包文件',
		'ja-JP': 'インポートパッケージファイルを選択',
		'de-DE': 'Import-Paketdatei auswählen',
		'fr-FR': 'Sélectionner le fichier package à importer',
		'ru-RU': 'Выбрать файл пакета для импорта',
		'es-ES': 'Seleccionar archivo de paquete a importar'
	},
	'modals.importPackage.dragDropHint': {
		'en-US': 'Or drag and drop files here',
		'zh-CN': '或直接拖拽文件到这里',
		'zh-TW': '或直接拖拽文件到這裡',
		'ja-JP': 'またはファイルをここにドラッグ＆ドロップ',
		'de-DE': 'Oder Dateien hierher ziehen und ablegen',
		'fr-FR': 'Ou glisser-déposer les fichiers ici',
		'ru-RU': 'Или перетащите файлы сюда',
		'es-ES': 'O arrastrar y soltar archivos aquí'
	},
	'modals.importPackage.zipFormat': {
		'en-US': 'Support .zip format',
		'zh-CN': '支持.zip格式',
		'zh-TW': '支持.zip格式',
		'ja-JP': '.zip形式をサポート',
		'de-DE': '.zip-Format unterstützen',
		'fr-FR': 'Support du format .zip',
		'ru-RU': 'Поддержка формата .zip',
		'es-ES': 'Soporte formato .zip'
	},
	'modals.importPackage.importInfo': {
		'en-US': 'Import Information',
		'zh-CN': '导入信息',
		'zh-TW': '導入信息',
		'ja-JP': 'インポート情報',
		'de-DE': 'Import-Informationen',
		'fr-FR': 'Informations d\'import',
		'ru-RU': 'Информация об импорте',
		'es-ES': 'Información de importación'
	},
	'modals.importPackage.importInfoDesc': {
		'en-US': 'This operation will:',
		'zh-CN': '此操作将：',
		'zh-TW': '此操作將：',
		'ja-JP': 'この操作は以下を実行します：',
		'de-DE': 'Diese Operation wird:',
		'fr-FR': 'Cette opération va:',
		'ru-RU': 'Эта операция будет:',
		'es-ES': 'Esta operación va a:'
	},
	'modals.importPackage.importSteps': {
		'en-US': '• Import all attachment files\n• Restore database records\n• Restore plugin settings\n• Update file references',
		'zh-CN': '• 导入所有附件文件\n• 恢复数据库记录\n• 恢复插件设置\n• 更新文件引用',
		'zh-TW': '• 導入所有附件文件\n• 恢復數據庫記錄\n• 恢復插件設置\n• 更新文件引用',
		'ja-JP': '• すべての添付ファイルをインポート\n• データベースレコードを復元\n• プラグイン設定を復元\n• ファイル参照を更新',
		'de-DE': '• Alle Anhangdateien importieren\n• Datenbankeinträge wiederherstellen\n• Plugin-Einstellungen wiederherstellen\n• Dateiverweise aktualisieren',
		'fr-FR': '• Importer tous les fichiers joints\n• Restaurer les enregistrements de base de données\n• Restaurer les paramètres du plugin\n• Mettre à jour les références de fichiers',
		'ru-RU': '• Импортировать все файлы вложений\n• Восстановить записи базы данных\n• Восстановить настройки плагина\n• Обновить ссылки на файлы',
		'es-ES': '• Importar todos los archivos adjuntos\n• Restaurar registros de base de datos\n• Restaurar configuraciones del plugin\n• Actualizar referencias de archivos'
	},
	'modals.importPackage.clickToSelect': {
		'en-US': 'Click to select file',
		'zh-CN': '点击选择文件',
		'zh-TW': '點擊選擇文件',
		'ja-JP': 'クリックしてファイルを選択',
		'de-DE': 'Klicken Sie zum Auswählen der Datei',
		'fr-FR': 'Cliquez pour sélectionner le fichier',
		'ru-RU': 'Нажмите для выбора файла',
		'es-ES': 'Haga clic para seleccionar archivo'
	},
	'modals.importPackage.selectZIPFile': {
		'en-US': 'Select ZIP File',
		'zh-CN': '选择 ZIP 文件',
		'zh-TW': '選擇 ZIP 文件',
		'ja-JP': 'ZIP ファイルを選択',
		'de-DE': 'ZIP-Datei auswählen',
		'fr-FR': 'Sélectionner fichier ZIP',
		'ru-RU': 'Выберите ZIP-файл',
		'es-ES': 'Seleccionar archivo ZIP'
	},
	'modals.importPackage.obWindowLimit': {
		'en-US': 'Due to OB limitations, file picker cannot be opened in standalone window. Open Hub in tab to use normally',
		'zh-CN': '由于ob限制，在独立窗口无法打开文件选择器，在tab中打开Hub可正常使用',
		'zh-TW': '由於ob限制，在獨立視窗無法開啟檔案選擇器，在tab中開啟Hub可正常使用',
		'ja-JP': 'obの制限により、スタンドアロンウィンドウではファイルピッカーを開くことができません。タブでHubを開くと正常に使用できます',
		'de-DE': 'Aufgrund von OB-Beschränkungen kann der Dateiauswahldialog nicht in einem eigenständigen Fenster geöffnet werden. Öffnen Sie Hub in einem Tab für normale Nutzung',
		'fr-FR': "En raison des limitations d'OB, le sélecteur de fichiers ne peut pas être ouvert dans une fenêtre autonome. Ouvrez Hub dans un onglet pour une utilisation normale",
		'ru-RU': 'Из-за ограничений OB невозможно открыть выбор файлов в отдельном окне. Откройте Hub во вкладке для нормального использования',
		'es-ES': 'Debido a las limitaciones de OB, no se puede abrir el selector de archivos en una ventana independiente. Abra Hub en una pestaña para usar normalmente'
	},
	'views.mainView.pleaseSelectAttachments': {
		'en-US': 'Please select attachments',
		'zh-CN': '请选择附件',
		'zh-TW': '請選擇附件',
		'ja-JP': '添付ファイルを選択してください',
		'de-DE': 'Bitte Anhänge auswählen',
		'fr-FR': 'Veuillez sélectionner les pièces jointes',
		'ru-RU': 'Пожалуйста, выберите вложения',
		'es-ES': 'Por favor, seleccione archivos adjuntos'
	},
	'views.mainView.exportSelectedFailed': {
		'en-US': 'Export selected failed: {message}',
		'zh-CN': '导出所选失败: {message}',
		'zh-TW': '匯出所選失敗: {message}',
		'ja-JP': '選択項目のエクスポートに失敗しました: {message}',
		'de-DE': 'Exportieren der Auswahl fehlgeschlagen: {message}',
		'fr-FR': 'Échec de l\'exportation sélectionnée : {message}',
		'ru-RU': 'Не удалось экспортировать выбранное: {message}',
		'es-ES': 'Error al exportar seleccionados: {message}'
	},
	'views.mainView.exportSelectedPackageFailed': {
		'en-US': 'Export selected package failed: {message}',
		'zh-CN': '导出所选包失败: {message}',
		'zh-TW': '匯出所選包失敗: {message}',
		'ja-JP': '選択したパッケージのエクスポートに失敗しました: {message}',
		'de-DE': 'Exportieren des ausgewählten Pakets fehlgeschlagen: {message}',
		'fr-FR': 'Échec de l\'exportation du package sélectionné : {message}',
		'ru-RU': 'Не удалось экспортировать выбранный пакет: {message}',
		'es-ES': 'Error al exportar paquete seleccionado: {message}'
	},
	'views.mainView.recordList': {
		'en-US': 'Record List',
		'zh-CN': '记录列表',
		'zh-TW': '記錄列表',
		'ja-JP': 'レコードリスト',
		'de-DE': 'Datensatzliste',
		'fr-FR': 'Liste des enregistrements',
		'ru-RU': 'Список записей',
		'es-ES': 'Lista de Registros'
	},
	'views.mainView.previewPanel': {
		'en-US': 'Preview Panel',
		'zh-CN': '预览面板',
		'zh-TW': '預覽面板',
		'ja-JP': 'プレビューパネル',
		'de-DE': 'Vorschau-Paneel',
		'fr-FR': 'Panneau d\'aperçu',
		'ru-RU': 'Панель предпросмотра',
		'es-ES': 'Panel de Vista Previa'
	},
	'views.mainView.previewDescription': {
		'en-US': 'Select a record to preview',
		'zh-CN': '选择记录进行预览',
		'zh-TW': '選擇記錄進行預覽',
		'ja-JP': 'プレビューするレコードを選択',
		'de-DE': 'Datensatz zur Vorschau auswählen',
		'fr-FR': 'Sélectionner un enregistrement pour l\'aperçu',
		'ru-RU': 'Выберите запись для предпросмотра',
		'es-ES': 'Seleccionar registro para previsualizar'
	},
	'views.mainView.noRecordsFound': {
		'en-US': 'No records found',
		'zh-CN': '未找到记录',
		'zh-TW': '未找到記錄',
		'ja-JP': 'レコードが見つかりません',
		'de-DE': 'Keine Datensätze gefunden',
		'fr-FR': 'Aucun enregistrement trouvé',
		'ru-RU': 'Записи не найдены',
		'es-ES': 'No se encontraron registros'
	},
	'views.mainView.authorLabel': {
		'en-US': 'Author:',
		'zh-CN': '作者:',
		'zh-TW': '作者:',
		'ja-JP': '著者:',
		'de-DE': 'Autor:',
		'fr-FR': 'Auteur:',
		'ru-RU': 'Автор:',
		'es-ES': 'Autor:'
	},
	'views.mainView.yearLabel': {
		'en-US': 'Year:',
		'zh-CN': '年份:',
		'zh-TW': '年份:',
		'ja-JP': '年:',
		'de-DE': 'Jahr:',
		'fr-FR': 'Année:',
		'ru-RU': 'Год:',
		'es-ES': 'Año:'
	},
	'views.mainView.publisherLabel': {
		'en-US': 'Publisher:',
		'zh-CN': '出版商:',
		'zh-TW': '出版商:',
		'ja-JP': '出版社:',
		'de-DE': 'Verlag:',
		'fr-FR': 'Éditeur:',
		'ru-RU': 'Издатель:',
		'es-ES': 'Editorial:'
	},
	'views.mainView.journalLevelLabel': {
		'en-US': 'Journal Level:',
		'zh-CN': '期刊等级:',
		'zh-TW': '期刊等級:',
		'ja-JP': 'ジャーナルレベル:',
		'de-DE': 'Journal-Level:',
		'fr-FR': 'Niveau du journal:',
		'ru-RU': 'Уровень журнала:',
		'es-ES': 'Nivel de Revista:'
	},
	'views.mainView.mdFileLabel': {
		'en-US': 'MD File:',
		'zh-CN': 'MD文件:',
		'zh-TW': 'MD檔案:',
		'ja-JP': 'MDファイル:',
		'de-DE': 'MD-Datei:',
		'fr-FR': 'Fichier MD:',
		'ru-RU': 'MD файл:',
		'es-ES': 'Archivo MD:'
	},
	'views.mainView.mdFileCreated': {
		'en-US': 'Created',
		'zh-CN': '已创建',
		'zh-TW': '已創建',
		'ja-JP': '作成済み',
		'de-DE': 'Erstellt',
		'fr-FR': 'Créé',
		'ru-RU': 'Создано',
		'es-ES': 'Creado'
	},
	'views.mainView.mdFileLost': {
		'en-US': 'Lost',
		'zh-CN': '丢失',
		'zh-TW': '遺失',
		'ja-JP': '失われた',
		'de-DE': 'Verloren',
		'fr-FR': 'Perdu',
		'ru-RU': 'Потеряно',
		'es-ES': 'Perdido'
	},
	'views.mainView.mdFileLostClickToHandle': {
		'en-US': 'Click to handle lost MD file',
		'zh-CN': '点击处理丢失的MD文件',
		'zh-TW': '點擊處理遺失的MD檔案',
		'ja-JP': 'クリックして失われたMDファイルを処理',
		'de-DE': 'Klicken Sie, um verlorene MD-Datei zu behandeln',
		'fr-FR': 'Cliquer pour gérer le fichier MD perdu',
		'ru-RU': 'Нажмите для обработки потерянного MD файла',
		'es-ES': 'Hacer clic para manejar archivo MD perdido'
	},
	'views.mainView.mdFileNotCreated': {
		'en-US': 'Not Created',
		'zh-CN': '未创建',
		'zh-TW': '未創建',
		'ja-JP': '未作成',
		'de-DE': 'Nicht erstellt',
		'fr-FR': 'Non créé',
		'ru-RU': 'Не создано',
		'es-ES': 'No Creado'
	},
	'views.mainView.mdFileNotCreatedClickToCreate': {
		'en-US': 'Click to create MD file',
		'zh-CN': '点击创建MD文件',
		'zh-TW': '點擊創建MD文件',
		'ja-JP': 'クリックしてMDファイルを作成',
		'de-DE': 'Klicken Sie, um MD-Datei zu erstellen',
		'fr-FR': 'Cliquer pour créer le fichier MD',
		'ru-RU': 'Нажмите для создания MD файла',
		'es-ES': 'Hacer clic para crear archivo MD'
	},
	'views.mainView.fileInfo': {
		'en-US': 'File Information',
		'zh-CN': '文件信息',
		'zh-TW': '檔案資訊',
		'ja-JP': 'ファイル情報',
		'de-DE': 'Dateiinformation',
		'fr-FR': 'Informations du fichier',
		'ru-RU': 'Информация о файле',
		'es-ES': 'Información del Archivo'
	},
	'views.mainView.openFile': {
		'en-US': 'Open File',
		'zh-CN': '打开文件',
		'zh-TW': '開啟檔案',
		'ja-JP': 'ファイルを開く',
		'de-DE': 'Datei öffnen',
		'fr-FR': 'Ouvrir le fichier',
		'ru-RU': 'Открыть файл',
		'es-ES': 'Abrir Archivo'
	},
	'views.mainView.edit': {
		'en-US': 'Edit',
		'zh-CN': '编辑',
		'zh-TW': '編輯',
		'ja-JP': '編集',
		'de-DE': 'Bearbeiten',
		'fr-FR': 'Modifier',
		'ru-RU': 'Редактировать',
		'es-ES': 'Editar'
	},
	'views.mainView.cite': {
		'en-US': 'Cite',
		'zh-CN': '引用',
		'zh-TW': '引用',
		'ja-JP': '引用',
		'de-DE': 'Zitieren',
		'fr-FR': 'Citer',
		'ru-RU': 'Цитировать',
		'es-ES': 'Citar'
	},
	'views.mainView.bibtexCopied': {
		'en-US': 'BibTeX copied to clipboard',
		'zh-CN': 'BibTeX已复制到剪贴板',
		'zh-TW': 'BibTeX已複製到剪貼簿',
		'ja-JP': 'BibTeXがクリップボードにコピーされました',
		'de-DE': 'BibTeX in die Zwischenablage kopiert',
		'fr-FR': 'BibTeX copié dans le presse-papiers',
		'ru-RU': 'BibTeX скопирован в буфер обмена',
		'es-ES': 'BibTeX copiado al portapapeles'
	},
	'views.mainView.bibtexCopyFailed': {
		'en-US': 'BibTeX copy failed',
		'zh-CN': 'BibTeX复制失败',
		'zh-TW': 'BibTeX複製失敗',
		'ja-JP': 'BibTeXのコピーに失敗しました',
		'de-DE': 'BibTeX-Kopieren fehlgeschlagen',
		'fr-FR': 'Échec de la copie BibTeX',
		'ru-RU': 'Не удалось скопировать BibTeX',
		'es-ES': 'Error al copiar BibTeX'
	},
	'views.mainView.handleLostMDFile': {
		'en-US': 'Handle Lost MD File',
		'zh-CN': '处理丢失的MD文件',
		'zh-TW': '處理遺失的MD檔案',
		'ja-JP': '失われたMDファイルを処理',
		'de-DE': 'Verlorene MD-Datei behandeln',
		'fr-FR': 'Gérer le fichier MD perdu',
		'ru-RU': 'Обработать потерянный MD файл',
		'es-ES': 'Manejar archivo MD perdido'
	},
	'views.mainView.refreshing': {
		'en-US': 'Refreshing...',
		'zh-CN': '刷新中...',
		'zh-TW': '重新整理中...',
		'ja-JP': '更新中...',
		'de-DE': 'Aktualisierung...',
		'fr-FR': 'Rafraîchissement...',
		'ru-RU': 'Обновление...',
		'es-ES': 'Actualizando...'
	},
	'views.mainView.refreshSuccess': {
		'en-US': 'Refresh completed',
		'zh-CN': '刷新完成',
		'zh-TW': '重新整理完成',
		'ja-JP': '更新が完了しました',
		'de-DE': 'Aktualisierung abgeschlossen',
		'fr-FR': 'Rafraîchissement terminé',
		'ru-RU': 'Обновление завершено',
		'es-ES': 'Actualización completada'
	},
	'views.mainView.refreshFailed': {
		'en-US': 'Refresh failed: {message}',
		'zh-CN': '刷新失败: {message}',
		'zh-TW': '重新整理失敗: {message}',
		'ja-JP': '更新に失敗しました: {message}',
		'de-DE': 'Aktualisierung fehlgeschlagen: {message}',
		'fr-FR': 'Échec du rafraîchissement : {message}',
		'ru-RU': 'Не удалось обновить: {message}',
		'es-ES': 'Error al actualizar: {message}'
	},
	'views.mainView.deleteMDFile': {
		'en-US': 'Delete MD File',
		'zh-CN': '删除MD文件',
		'zh-TW': '刪除MD檔案',
		'ja-JP': 'MDファイルを削除',
		'de-DE': 'MD-Datei löschen',
		'fr-FR': 'Supprimer le fichier MD',
		'ru-RU': 'Удалить MD файл',
		'es-ES': 'Eliminar archivo MD'
	},
	'views.mainView.createMDFile': {
		'en-US': 'Create MD File',
		'zh-CN': '创建MD文件',
		'zh-TW': '創建MD檔案',
		'ja-JP': 'MDファイルを作成',
		'de-DE': 'MD-Datei erstellen',
		'fr-FR': 'Créer le fichier MD',
		'ru-RU': 'Создать MD файл',
		'es-ES': 'Crear archivo MD'
	},
	'views.mainView.deleteMDFileFailed': {
		'en-US': 'Delete MD file failed: {message}',
		'zh-CN': '删除MD文件失败: {message}',
		'zh-TW': '刪除MD檔案失敗: {message}',
		'ja-JP': 'MDファイルの削除に失敗しました: {message}',
		'de-DE': 'MD-Datei löschen fehlgeschlagen: {message}',
		'fr-FR': 'Échec de la suppression du fichier MD : {message}',
		'ru-RU': 'Не удалось удалить MD файл: {message}',
		'es-ES': 'Error al eliminar archivo MD: {message}'
	},
	'views.mainView.titleColumn': {
		'en-US': 'Title',
		'zh-CN': '标题',
		'zh-TW': '標題',
		'ja-JP': 'タイトル',
		'de-DE': 'Titel',
		'fr-FR': 'Titre',
		'ru-RU': 'Заголовок',
		'es-ES': 'Título'
	},
	'views.mainView.authorColumn': {
		'en-US': 'Author',
		'zh-CN': '作者',
		'zh-TW': '作者',
		'ja-JP': '著者',
		'de-DE': 'Autor',
		'fr-FR': 'Auteur',
		'ru-RU': 'Автор',
		'es-ES': 'Autor'
	},
	'views.mainView.yearColumn': {
		'en-US': 'Year',
		'zh-CN': '年份',
		'zh-TW': '年份',
		'ja-JP': '年',
		'de-DE': 'Jahr',
		'fr-FR': 'Année',
		'ru-RU': 'Год',
		'es-ES': 'Año'
	},
	'views.mainView.ccfA': {
		'en-US': 'CCF-A',
		'zh-CN': 'CCF-A',
		'zh-TW': 'CCF-A',
		'ja-JP': 'CCF-A',
		'de-DE': 'CCF-A',
		'fr-FR': 'CCF-A',
		'ru-RU': 'CCF-A',
		'es-ES': 'CCF-A'
	},
	'views.mainView.ccfB': {
		'en-US': 'CCF-B',
		'zh-CN': 'CCF-B',
		'zh-TW': 'CCF-B',
		'ja-JP': 'CCF-B',
		'de-DE': 'CCF-B',
		'fr-FR': 'CCF-B',
		'ru-RU': 'CCF-B',
		'es-ES': 'CCF-B'
	},
	'views.mainView.ccfC': {
		'en-US': 'CCF-C',
		'zh-CN': 'CCF-C',
		'zh-TW': 'CCF-C',
		'ja-JP': 'CCF-C',
		'de-DE': 'CCF-C',
		'fr-FR': 'CCF-C',
		'ru-RU': 'CCF-C',
		'es-ES': 'CCF-C'
	},
	'views.mainView.sci1': {
		'en-US': 'SCI-1',
		'zh-CN': 'SCI-1',
		'zh-TW': 'SCI-1',
		'ja-JP': 'SCI-1',
		'de-DE': 'SCI-1',
		'fr-FR': 'SCI-1',
		'ru-RU': 'SCI-1',
		'es-ES': 'SCI-1'
	},
	'views.mainView.sci2': {
		'en-US': 'SCI-2',
		'zh-CN': 'SCI-2',
		'zh-TW': 'SCI-2',
		'ja-JP': 'SCI-2',
		'de-DE': 'SCI-2',
		'fr-FR': 'SCI-2',
		'ru-RU': 'SCI-2',
		'es-ES': 'SCI-2'
	},
	'views.mainView.sci3': {
		'en-US': 'SCI-3',
		'zh-CN': 'SCI-3',
		'zh-TW': 'SCI-3',
		'ja-JP': 'SCI-3',
		'de-DE': 'SCI-3',
		'fr-FR': 'SCI-3',
		'ru-RU': 'SCI-3',
		'es-ES': 'SCI-3'
	},
	'views.mainView.sci4': {
		'en-US': 'SCI-4',
		'zh-CN': 'SCI-4',
		'zh-TW': 'SCI-4',
		'ja-JP': 'SCI-4',
		'de-DE': 'SCI-4',
		'fr-FR': 'SCI-4',
		'ru-RU': 'SCI-4',
		'es-ES': 'SCI-4'
	},
	'views.mainView.other': {
		'en-US': 'Other',
		'zh-CN': '其他',
		'zh-TW': '其他',
		'ja-JP': 'その他',
		'de-DE': 'Andere',
		'fr-FR': 'Autre',
		'ru-RU': 'Другое',
		'es-ES': 'Otro'
	},
	'views.mainView.unknown': {
		'en-US': 'Unknown',
		'zh-CN': '未知',
		'zh-TW': '未知',
		'ja-JP': '不明',
		'de-DE': 'Unbekannt',
		'fr-FR': 'Inconnu',
		'ru-RU': 'Неизвестно',
		'es-ES': 'Desconocido'
	},
	'views.mainView.columnDisplayControl': {
		'en-US': 'Column Display Control',
		'zh-CN': '列显示控制',
		'zh-TW': '列顯示控制',
		'ja-JP': '列表示制御',
		'de-DE': 'Spaltenanzeige-Steuerung',
		'fr-FR': 'Contrôle d\'affichage des colonnes',
		'ru-RU': 'Управление отображением столбцов',
		'es-ES': 'Control de Visualización de Columnas'
	},
	'views.mainView.columnControlDescription': {
		'en-US': 'Select columns to display',
		'zh-CN': '选择要显示的列',
		'zh-TW': '選擇要顯示的列',
		'ja-JP': '表示する列を選択',
		'de-DE': 'Anzuzeigende Spalten auswählen',
		'fr-FR': 'Sélectionner les colonnes à afficher',
		'ru-RU': 'Выберите столбцы для отображения',
		'es-ES': 'Seleccionar columnas para mostrar'
	},
	'views.mainView.titleDescription': {
		'en-US': 'Paper title',
		'zh-CN': '论文标题',
		'zh-TW': '論文標題',
		'ja-JP': '論文タイトル',
		'de-DE': 'Papier-Titel',
		'fr-FR': 'Titre de l\'article',
		'ru-RU': 'Название статьи',
		'es-ES': 'Título del artículo'
	},
	'views.mainView.authorDescription': {
		'en-US': 'Author names',
		'zh-CN': '作者姓名',
		'zh-TW': '作者姓名',
		'ja-JP': '著者名',
		'de-DE': 'Autorennamen',
		'fr-FR': 'Noms des auteurs',
		'ru-RU': 'Имена авторов',
		'es-ES': 'Nombres de autores'
	},
	'views.mainView.yearDescription': {
		'en-US': 'Publication year',
		'zh-CN': '出版年份',
		'zh-TW': '出版年份',
		'ja-JP': '出版年',
		'de-DE': 'Veröffentlichungsjahr',
		'fr-FR': 'Année de publication',
		'ru-RU': 'Год публикации',
		'es-ES': 'Año de publicación'
	},
	'views.mainView.publisherDescription': {
		'en-US': 'Publisher name',
		'zh-CN': '出版商名称',
		'zh-TW': '出版商名稱',
		'ja-JP': '出版社名',
		'de-DE': 'Verlagsname',
		'fr-FR': 'Nom de l\'éditeur',
		'ru-RU': 'Название издателя',
		'es-ES': 'Nombre de la editorial'
	},
	'views.mainView.journalLevelDescription': {
		'en-US': 'Journal classification level',
		'zh-CN': '期刊分类等级',
		'zh-TW': '期刊分類等級',
		'ja-JP': 'ジャーナル分類レベル',
		'de-DE': 'Journal-Klassifizierungslevel',
		'fr-FR': 'Niveau de classification du journal',
		'ru-RU': 'Уровень классификации журнала',
		'es-ES': 'Nivel de clasificación de revista'
	},
	'views.mainView.doiDescription': {
		'en-US': 'Digital Object Identifier',
		'zh-CN': '数字对象标识符',
		'zh-TW': '數位物件識別碼',
		'ja-JP': 'デジタルオブジェクト識別子',
		'de-DE': 'Digital Object Identifier',
		'fr-FR': 'Identifiant d\'objet numérique',
		'ru-RU': 'Цифровой идентификатор объекта',
		'es-ES': 'Identificador de objeto digital'
	},
	'views.mainView.fileTypeDescription': {
		'en-US': 'File type (PDF, DOC, etc.)',
		'zh-CN': '文件类型 (PDF, DOC等)',
		'zh-TW': '檔案類型 (PDF, DOC等)',
		'ja-JP': 'ファイルタイプ (PDF, DOC等)',
		'de-DE': 'Dateityp (PDF, DOC, etc.)',
		'fr-FR': 'Type de fichier (PDF, DOC, etc.)',
		'ru-RU': 'Тип файла (PDF, DOC и т.д.)',
		'es-ES': 'Tipo de archivo (PDF, DOC, etc.)'
	},
	'views.mainView.mdFileDescription': {
		'en-US': 'Associated markdown file status',
		'zh-CN': '关联的markdown文件状态',
		'zh-TW': '關聯的markdown檔案狀態',
		'ja-JP': '関連付けられたmarkdownファイルのステータス',
		'de-DE': 'Status der zugeordneten Markdown-Datei',
		'fr-FR': 'Statut du fichier markdown associé',
		'ru-RU': 'Статус связанного markdown файла',
		'es-ES': 'Estado del archivo markdown asociado'
	},
	'views.mainView.fileSizeDescription': {
		'en-US': 'File size in KB/MB',
		'zh-CN': '文件大小 (KB/MB)',
		'zh-TW': '檔案大小 (KB/MB)',
		'ja-JP': 'ファイルサイズ (KB/MB)',
		'de-DE': 'Dateigröße in KB/MB',
		'fr-FR': 'Taille du fichier en KB/MB',
		'ru-RU': 'Размер файла в KB/MB',
		'es-ES': 'Tamaño del archivo en KB/MB'
	},
	'views.mainView.locationDescription': {
		'en-US': 'File storage location',
		'zh-CN': '文件存储位置',
		'zh-TW': '檔案儲存位置',
		'ja-JP': 'ファイル保存場所',
		'de-DE': 'Dateispeicherort',
		'fr-FR': 'Emplacement de stockage du fichier',
		'ru-RU': 'Место хранения файла',
		'es-ES': 'Ubicación de almacenamiento del archivo'
	},
	'views.mainView.tagsDescription': {
		'en-US': 'Associated tags',
		'zh-CN': '关联标签',
		'zh-TW': '關聯標籤',
		'ja-JP': '関連付けられたタグ',
		'de-DE': 'Zugeordnete Tags',
		'fr-FR': 'Étiquettes associées',
		'ru-RU': 'Связанные теги',
		'es-ES': 'Etiquetas asociadas'
	},
	'views.mainView.referenceCountDescription': {
		'en-US': 'Number of references',
		'zh-CN': '引用数量',
		'zh-TW': '引用數量',
		'ja-JP': '参照数',
		'de-DE': 'Anzahl der Referenzen',
		'fr-FR': 'Nombre de références',
		'ru-RU': 'Количество ссылок',
		'es-ES': 'Número de referencias'
	},
	'views.mainView.addedTimeDescription': {
		'en-US': 'Date when added to database',
		'zh-CN': '添加到数据库的日期',
		'zh-TW': '添加到數據庫的日期',
		'ja-JP': 'データベースに追加された日付',
		'de-DE': 'Datum der Aufnahme in die Datenbank',
		'fr-FR': 'Date d\'ajout à la base de données',
		'ru-RU': 'Дата добавления в базу данных',
		'es-ES': 'Fecha de adición a la base de datos'
	},
	'views.mainView.actions': {
		'en-US': 'Actions',
		'zh-CN': '操作',
		'zh-TW': '操作',
		'ja-JP': '操作',
		'de-DE': 'Aktionen',
		'fr-FR': 'Actions',
		'ru-RU': 'Действия',
		'es-ES': 'Acciones'
	},
	'views.mainView.actionsDescription': {
		'en-US': 'Available actions',
		'zh-CN': '可用操作',
		'zh-TW': '可用操作',
		'ja-JP': '利用可能な操作',
		'de-DE': 'Verfügbare Aktionen',
		'fr-FR': 'Actions disponibles',
		'ru-RU': 'Доступные действия',
		'es-ES': 'Acciones disponibles'
	},
	'views.mainView.publisher': {
		'en-US': 'Publisher',
		'zh-CN': '出版商',
		'zh-TW': '出版商',
		'ja-JP': '出版社',
		'de-DE': 'Verlag',
		'fr-FR': 'Éditeur',
		'ru-RU': 'Издатель',
		'es-ES': 'Editor'
	},
	'views.mainView.journalLevel': {
		'en-US': 'Journal Level',
		'zh-CN': '期刊级别',
		'zh-TW': '期刊級別',
		'ja-JP': 'ジャーナルレベル',
		'de-DE': 'Zeitschriften-Level',
		'fr-FR': 'Niveau du journal',
		'ru-RU': 'Уровень журнала',
		'es-ES': 'Nivel de revista'
	},
	'views.mainView.doi': {
		'en-US': 'DOI',
		'zh-CN': 'DOI',
		'zh-TW': 'DOI',
		'ja-JP': 'DOI',
		'de-DE': 'DOI',
		'fr-FR': 'DOI',
		'ru-RU': 'DOI',
		'es-ES': 'DOI'
	},
	'views.mainView.fileType': {
		'en-US': 'File Type',
		'zh-CN': '文件类型',
		'zh-TW': '檔案類型',
		'ja-JP': 'ファイルタイプ',
		'de-DE': 'Dateityp',
		'fr-FR': 'Type de fichier',
		'ru-RU': 'Тип файла',
		'es-ES': 'Tipo de archivo'
	},
	'views.mainView.mdFile': {
		'en-US': 'MD File',
		'zh-CN': 'MD文件',
		'zh-TW': 'MD檔案',
		'ja-JP': 'MDファイル',
		'de-DE': 'MD-Datei',
		'fr-FR': 'Fichier MD',
		'ru-RU': 'MD файл',
		'es-ES': 'Archivo MD'
	},
	'views.mainView.fileSize': {
		'en-US': 'File Size',
		'zh-CN': '文件大小',
		'zh-TW': '檔案大小',
		'ja-JP': 'ファイルサイズ',
		'de-DE': 'Dateigröße',
		'fr-FR': 'Taille du fichier',
		'ru-RU': 'Размер файла',
		'es-ES': 'Tamaño de archivo'
	},
	'views.mainView.referenceCount': {
		'en-US': 'Reference Count',
		'zh-CN': '引用次数',
		'zh-TW': '引用次數',
		'ja-JP': '参照回数',
		'de-DE': 'Verweiszähler',
		'fr-FR': 'Nombre de références',
		'ru-RU': 'Количество ссылок',
		'es-ES': 'Contador de referencias'
	},
	'views.mainView.addedTime': {
		'en-US': 'Added Time',
		'zh-CN': '添加时间',
		'zh-TW': '添加時間',
		'ja-JP': '追加日時',
		'de-DE': 'Hinzugefügt am',
		'fr-FR': 'Date d\'ajout',
		'ru-RU': 'Время добавления',
		'es-ES': 'Tiempo añadido'
	},
	'views.mainView.listView': {
		'en-US': 'List View',
		'zh-CN': '列表视图',
		'zh-TW': '列表視圖',
		'ja-JP': 'リストビュー',
		'de-DE': 'Listenansicht',
		'fr-FR': 'Vue Liste',
		'ru-RU': 'Список',
		'es-ES': 'Vista de Lista'
	},
	'views.mainView.previewView': {
		'en-US': 'Preview View',
		'zh-CN': '预览视图',
		'zh-TW': '預覽視圖',
		'ja-JP': 'プレビュービュー',
		'de-DE': 'Vorschauansicht',
		'fr-FR': 'Vue Aperçu',
		'ru-RU': 'Предварительный просмотр',
		'es-ES': 'Vista Previa'
	},
	'views.mainView.cardView': {
		'en-US': 'Card View',
		'zh-CN': '卡片视图',
		'zh-TW': '卡片視圖',
		'ja-JP': 'カードビュー',
		'de-DE': 'Kartenansicht',
		'fr-FR': 'Vue Carte',
		'ru-RU': 'Карточный вид',
		'es-ES': 'Vista de Tarjeta'
	},

	// 设置相关
	'settings.cleanupOrphanedTagFiles': {
		'en-US': 'Cleanup Orphaned Tag Files',
		'zh-CN': '清理孤立标签文件',
		'zh-TW': '清理孤立標籤檔案',
		'ja-JP': '孤立したタグファイルをクリーンアップ',
		'de-DE': 'Verwaiste Tag-Dateien bereinigen',
		'fr-FR': 'Nettoyer les fichiers d\'étiquettes orphelins',
		'ru-RU': 'Очистить осиротевшие файлы тегов',
		'es-ES': 'Limpiar archivos de etiquetas huérfanos'
	},
	'settings.cleanupOrphanedTagFilesDesc': {
		'en-US': 'Remove tag files that no longer have associated attachments',
		'zh-CN': '删除不再有关联附件的标签文件',
		'zh-TW': '刪除不再有關聯附件的標籤檔案',
		'ja-JP': '関連付けられた添付ファイルがなくなったタグファイルを削除',
		'de-DE': 'Tag-Dateien entfernen, die keine zugeordneten Anhänge mehr haben',
		'fr-FR': 'Supprimer les fichiers d\'étiquettes qui n\'ont plus de pièces jointes associées',
		'ru-RU': 'Удалить файлы тегов, которые больше не имеют связанных вложений',
		'es-ES': 'Eliminar archivos de etiquetas que ya no tienen archivos adjuntos asociados'
	},
	'settings.createTagSearchIndex': {
		'en-US': 'Create Tag Search Index',
		'zh-CN': '创建标签搜索索引',
		'zh-TW': '創建標籤搜尋索引',
		'ja-JP': 'タグ検索インデックスを作成',
		'de-DE': 'Tag-Suchindex erstellen',
		'fr-FR': 'Créer l\'index de recherche d\'étiquettes',
		'ru-RU': 'Создать индекс поиска тегов',
		'es-ES': 'Crear índice de búsqueda de etiquetas'
	},
	'settings.createTagSearchIndexDesc': {
		'en-US': 'Build search index for faster tag-based searches',
		'zh-CN': '构建搜索索引以加快基于标签的搜索',
		'zh-TW': '構建搜尋索引以加快基於標籤的搜尋',
		'ja-JP': 'タグベースの検索を高速化するための検索インデックスを構築',
		'de-DE': 'Suchindex für schnellere tagbasierte Suchen erstellen',
		'fr-FR': 'Construire l\'index de recherche pour des recherches basées sur les étiquettes plus rapides',
		'ru-RU': 'Построить индекс поиска для более быстрого поиска по тегам',
		'es-ES': 'Construir índice de búsqueda para búsquedas basadas en etiquetas más rápidas'
	},
	'settings.advanced': {
		'en-US': 'Advanced',
		'zh-CN': '高级',
		'zh-TW': '高級',
		'ja-JP': '高度',
		'de-DE': 'Erweitert',
		'fr-FR': 'Avancé',
		'ru-RU': 'Расширенный',
		'es-ES': 'Avanzado'
	},
	'settings.debugTagSync': {
		'en-US': 'Debug Tag Sync',
		'zh-CN': '调试标签同步',
		'zh-TW': '調試標籤同步',
		'ja-JP': 'タグ同期をデバッグ',
		'de-DE': 'Tag-Synchronisierung debuggen',
		'fr-FR': 'Déboguer la synchronisation des étiquettes',
		'ru-RU': 'Отладка синхронизации тегов',
		'es-ES': 'Depurar sincronización de etiquetas'
	},
	'settings.debugTagSyncDesc': {
		'en-US': 'Enable detailed logging for tag synchronization',
		'zh-CN': '启用标签同步的详细日志记录',
		'zh-TW': '啟用標籤同步的詳細日誌記錄',
		'ja-JP': 'タグ同期の詳細ログ記録を有効にする',
		'de-DE': 'Detaillierte Protokollierung für Tag-Synchronisierung aktivieren',
		'fr-FR': 'Activer la journalisation détaillée pour la synchronisation des étiquettes',
		'ru-RU': 'Включить подробное логирование для синхронизации тегов',
		'es-ES': 'Habilitar registro detallado para sincronización de etiquetas'
	},
	'settings.mdFileManagement': {
		'en-US': 'MD File Management',
		'zh-CN': 'MD文件管理',
		'zh-TW': 'MD檔案管理',
		'ja-JP': 'MDファイル管理',
		'de-DE': 'MD-Dateiverwaltung',
		'fr-FR': 'Gestion des fichiers MD',
		'ru-RU': 'Управление MD файлами',
		'es-ES': 'Gestión de archivos MD'
	},
	'settings.autoCreateMD': {
		'en-US': 'Auto Create MD Files',
		'zh-CN': '自动创建MD文件',
		'zh-TW': '自動創建MD檔案',
		'ja-JP': 'MDファイルを自動作成',
		'de-DE': 'MD-Dateien automatisch erstellen',
		'fr-FR': 'Créer automatiquement des fichiers MD',
		'ru-RU': 'Автоматически создавать MD файлы',
		'es-ES': 'Crear archivos MD automáticamente'
	},
	'settings.autoCreateMDDesc': {
		'en-US': 'Automatically create markdown files when adding new attachments',
		'zh-CN': '添加新附件时自动创建markdown文件',
		'zh-TW': '添加新附件時自動創建markdown檔案',
		'ja-JP': '新しい添付ファイルを追加する際にmarkdownファイルを自動作成',
		'de-DE': 'Markdown-Dateien automatisch erstellen beim Hinzufügen neuer Anhänge',
		'fr-FR': 'Créer automatiquement des fichiers markdown lors de l\'ajout de nouvelles pièces jointes',
		'ru-RU': 'Автоматически создавать markdown файлы при добавлении новых вложений',
		'es-ES': 'Crear archivos markdown automáticamente al agregar nuevos archivos adjuntos'
	},
	'settings.systemStatus': {
		'en-US': 'System Status',
		'zh-CN': '系统状态',
		'zh-TW': '系統狀態',
		'ja-JP': 'システムステータス',
		'de-DE': 'Systemstatus',
		'fr-FR': 'État du système',
		'ru-RU': 'Состояние системы',
		'es-ES': 'Estado del sistema'
	},
	'settings.totalAttachments': {
		'en-US': 'Total Attachments',
		'zh-CN': '总附件数',
		'zh-TW': '總附件數',
		'ja-JP': '総添付ファイル数',
		'de-DE': 'Gesamte Anhänge',
		'fr-FR': 'Total des pièces jointes',
		'ru-RU': 'Всего вложений',
		'es-ES': 'Archivos adjuntos totales'
	},
	'settings.mdFilesCreated': {
		'en-US': 'MD Files Created',
		'zh-CN': '已创建MD文件',
		'zh-TW': '已創建MD檔案',
		'ja-JP': '作成されたMDファイル',
		'de-DE': 'Erstellte MD-Dateien',
		'fr-FR': 'Fichiers MD créés',
		'ru-RU': 'Создано MD файлов',
		'es-ES': 'Archivos MD creados'
	},
	'settings.databaseTags': {
		'en-US': 'Database Tags',
		'zh-CN': '数据库标签',
		'zh-TW': '數據庫標籤',
		'ja-JP': 'データベースタグ',
		'de-DE': 'Datenbank-Tags',
		'fr-FR': 'Étiquettes de base de données',
		'ru-RU': 'Теги базы данных',
		'es-ES': 'Etiquetas de base de datos'
	},
	'settings.obsidianTags': {
		'en-US': 'Obsidian Tags',
		'zh-CN': 'Obsidian标签',
		'zh-TW': 'Obsidian標籤',
		'ja-JP': 'Obsidianタグ',
		'de-DE': 'Obsidian-Tags',
		'fr-FR': 'Étiquettes Obsidian',
		'ru-RU': 'Теги Obsidian',
		'es-ES': 'Etiquetas de Obsidian'
	},
	'settings.lastUpdate': {
		'en-US': 'Last Update',
		'zh-CN': '最后更新',
		'zh-TW': '最後更新',
		'ja-JP': '最終更新',
		'de-DE': 'Letzte Aktualisierung',
		'fr-FR': 'Dernière mise à jour',
		'ru-RU': 'Последнее обновление',
		'es-ES': 'Última actualización'
	},
	'settings.systemStatusDesc': {
		'en-US': 'Current system statistics and health information',
		'zh-CN': '当前系统统计和健康信息',
		'zh-TW': '當前系統統計和健康信息',
		'ja-JP': '現在のシステム統計と健全性情報',
		'de-DE': 'Aktuelle Systemstatistiken und Gesundheitsinformationen',
		'fr-FR': 'Statistiques système actuelles et informations de santé',
		'ru-RU': 'Текущая статистика системы и информация о состоянии',
		'es-ES': 'Estadísticas del sistema actual e información de salud'
	},
	'settings.viewAndExport': {
		'en-US': 'View & Export',
		'zh-CN': '视图与导出',
		'zh-TW': '視圖與導出',
		'ja-JP': 'ビューとエクスポート',
		'de-DE': 'Ansicht & Export',
		'fr-FR': 'Vue et Exportation',
		'ru-RU': 'Просмотр и экспорт',
		'es-ES': 'Vista y Exportar'
	},
	'settings.defaultView': {
		'en-US': 'Default View',
		'zh-CN': '默认视图',
		'zh-TW': '預設視圖',
		'ja-JP': 'デフォルトビュー',
		'de-DE': 'Standardansicht',
		'fr-FR': 'Vue par défaut',
		'ru-RU': 'Вид по умолчанию',
		'es-ES': 'Vista predeterminada'
	},
	'settings.defaultViewDesc': {
		'en-US': 'Select the default view mode when opening the plugin',
		'zh-CN': '选择打开插件时的默认视图模式',
		'zh-TW': '選擇打開插件時的預設視圖模式',
		'ja-JP': 'プラグインを開く際のデフォルトビューモードを選択',
		'de-DE': 'Standardansichtsmodus beim Öffnen des Plugins auswählen',
		'fr-FR': 'Sélectionner le mode de vue par défaut lors de l\'ouverture du plugin',
		'ru-RU': 'Выберите режим просмотра по умолчанию при открытии плагина',
		'es-ES': 'Seleccionar el modo de vista predeterminado al abrir el plugin'
	},
	'settings.openMode': {
		'en-US': 'Open Mode',
		'zh-CN': '打开模式',
		'zh-TW': '開啟模式',
		'ja-JP': 'オープンモード',
		'de-DE': 'Öffnungsmodus',
		'fr-FR': 'Mode d\'ouverture',
		'ru-RU': 'Режим открытия',
		'es-ES': 'Modo de apertura'
	},
	'settings.openModeDesc': {
		'en-US': 'How to open attachments when clicking on them',
		'zh-CN': '点击附件时的打开方式',
		'zh-TW': '點擊附件時的開啟方式',
		'ja-JP': '添付ファイルをクリックした際の開き方',
		'de-DE': 'Wie Anhänge beim Klicken geöffnet werden',
		'fr-FR': 'Comment ouvrir les pièces jointes en cliquant dessus',
		'ru-RU': 'Как открывать вложения при нажатии',
		'es-ES': 'Cómo abrir archivos adjuntos al hacer clic'
	},
	'settings.openModeNewTab': {
		'en-US': 'New Tab',
		'zh-CN': '新标签页',
		'zh-TW': '新標籤頁',
		'ja-JP': '新しいタブ',
		'de-DE': 'Neuer Tab',
		'fr-FR': 'Nouvel onglet',
		'ru-RU': 'Новая вкладка',
		'es-ES': 'Nueva pestaña'
	},
	'settings.openModeCurrentTab': {
		'en-US': 'Current Tab',
		'zh-CN': '当前标签页',
		'zh-TW': '當前標籤頁',
		'ja-JP': '現在のタブ',
		'de-DE': 'Aktueller Tab',
		'fr-FR': 'Onglet actuel',
		'ru-RU': 'Текущая вкладка',
		'es-ES': 'Pestaña actual'
	},
	'settings.openModeNewWindow': {
		'en-US': 'New Window',
		'zh-CN': '新窗口',
		'zh-TW': '新視窗',
		'ja-JP': '新しいウィンドウ',
		'de-DE': 'Neues Fenster',
		'fr-FR': 'Nouvelle fenêtre',
		'ru-RU': 'Новое окно',
		'es-ES': 'Nueva ventana'
	},
	'settings.exportFormat': {
		'en-US': 'Export Format',
		'zh-CN': '导出格式',
		'zh-TW': '導出格式',
		'ja-JP': 'エクスポート形式',
		'de-DE': 'Exportformat',
		'fr-FR': 'Format d\'exportation',
		'ru-RU': 'Формат экспорта',
		'es-ES': 'Formato de exportación'
	},
	'settings.exportFormatDesc': {
		'en-US': 'Select the format for exporting data',
		'zh-CN': '选择导出数据的格式',
		'zh-TW': '選擇導出數據的格式',
		'ja-JP': 'データをエクスポートする形式を選択',
		'de-DE': 'Format für den Datenexport auswählen',
		'fr-FR': 'Sélectionner le format pour exporter les données',
		'ru-RU': 'Выберите формат для экспорта данных',
		'es-ES': 'Seleccionar el formato para exportar datos'
	},
	'settings.fileManagement': {
		'en-US': 'File Management',
		'zh-CN': '文件管理',
		'zh-TW': '檔案管理',
		'ja-JP': 'ファイル管理',
		'de-DE': 'Dateiverwaltung',
		'fr-FR': 'Gestion des fichiers',
		'ru-RU': 'Управление файлами',
		'es-ES': 'Gestión de archivos'
	},
	'settings.researchFilesDirectory': {
		'en-US': 'Research Files Directory',
		'zh-CN': '研究文件目录',
		'zh-TW': '研究檔案目錄',
		'ja-JP': '研究ファイルディレクトリ',
		'de-DE': 'Forschungsdateien-Verzeichnis',
		'fr-FR': 'Répertoire des fichiers de recherche',
		'ru-RU': 'Каталог исследовательских файлов',
		'es-ES': 'Directorio de archivos de investigación'
	},
	'settings.researchFilesDirectoryDesc': {
		'en-US': 'Directory where research files will be stored',
		'zh-CN': '研究文件将存储的目录',
		'zh-TW': '研究檔案將存儲的目錄',
		'ja-JP': '研究ファイルが保存されるディレクトリ',
		'de-DE': 'Verzeichnis, in dem Forschungsdateien gespeichert werden',
		'fr-FR': 'Répertoire où seront stockés les fichiers de recherche',
		'ru-RU': 'Каталог для хранения исследовательских файлов',
		'es-ES': 'Directorio donde se almacenarán los archivos de investigación'
	},
	'settings.defaultFolderPlaceholder': {
		'en-US': 'Enter folder path...',
		'zh-CN': '输入文件夹路径...',
		'zh-TW': '輸入資料夾路徑...',
		'ja-JP': 'フォルダパスを入力...',
		'de-DE': 'Ordnerpfad eingeben...',
		'fr-FR': 'Entrez le chemin du dossier...',
		'ru-RU': 'Введите путь к папке...',
		'es-ES': 'Ingrese la ruta de la carpeta...'
	},
	'settings.attachmentsPlaceholder': {
		'en-US': 'Enter attachments folder...',
		'zh-CN': '输入附件文件夹...',
		'zh-TW': '輸入附件資料夾...',
		'ja-JP': '添付ファイルフォルダを入力...',
		'de-DE': 'Anhangordner eingeben...',
		'fr-FR': 'Entrez le dossier des pièces jointes...',
		'ru-RU': 'Введите папку вложений...',
		'es-ES': 'Ingrese la carpeta de archivos adjuntos...'
	},
	'settings.fileNameTemplate': {
		'en-US': 'File Name Template',
		'zh-CN': '文件名模板',
		'zh-TW': '檔案名稱模板',
		'ja-JP': 'ファイル名テンプレート',
		'de-DE': 'Dateinamenvorlage',
		'fr-FR': 'Modèle de nom de fichier',
		'ru-RU': 'Шаблон имени файла',
		'es-ES': 'Plantilla de nombre de archivo'
	},
	'settings.fileNameTemplateDesc': {
		'en-US': 'Template for generating file names. Available variables: {{title}}, {{author}}, {{year}}, {{doi}}, {{journal}}, {{date}}',
		'zh-CN': '生成文件名的模板。可用变量：{{title}}、{{author}}、{{year}}、{{doi}}、{{journal}}、{{date}}',
		'zh-TW': '生成檔案名稱的模板。可用變量：{{title}}、{{author}}、{{year}}、{{doi}}、{{journal}}、{{date}}',
		'ja-JP': 'ファイル名を生成するためのテンプレート。利用可能な変数：{{title}}、{{author}}、{{year}}、{{doi}}、{{journal}}、{{date}}',
		'de-DE': 'Vorlage für die Generierung von Dateinamen. Verfügbare Variablen: {{title}}, {{author}}, {{year}}, {{doi}}, {{journal}}, {{date}}',
		'fr-FR': 'Modèle pour générer les noms de fichiers. Variables disponibles : {{title}}, {{author}}, {{year}}, {{doi}}, {{journal}}, {{date}}',
		'ru-RU': 'Шаблон для генерации имен файлов. Доступные переменные: {{title}}, {{author}}, {{year}}, {{doi}}, {{journal}}, {{date}}',
		'es-ES': 'Plantilla para generar nombres de archivo. Variables disponibles: {{title}}, {{author}}, {{year}}, {{doi}}, {{journal}}, {{date}}'
	},
	'settings.fileNameTemplatePlaceholder': {
		'en-US': 'e.g., {{author}}_{{year}}_{{title}}',
		'zh-CN': '例如：{{author}}_{{year}}_{{title}}',
		'zh-TW': '例如：{{author}}_{{year}}_{{title}}',
		'ja-JP': '例：{{author}}_{{year}}_{{title}}',
		'de-DE': 'z.B. {{author}}_{{year}}_{{title}}',
		'fr-FR': 'ex. {{author}}_{{year}}_{{title}}',
		'ru-RU': 'например {{author}}_{{year}}_{{title}}',
		'es-ES': 'ej. {{author}}_{{year}}_{{title}}'
	},
	'settings.tempDir': {
		'en-US': 'Temporary Directory',
		'zh-CN': '临时目录',
		'zh-TW': '暫存目錄',
		'ja-JP': '一時ディレクトリ',
		'de-DE': 'Temporäres Verzeichnis',
		'fr-FR': 'Répertoire temporaire',
		'ru-RU': 'Временный каталог',
		'es-ES': 'Directorio temporal'
	},
	'settings.tempDirDesc': {
		'en-US': 'Directory for temporary files (downloads, processing)',
		'zh-CN': '临时文件（下载、处理）的目录',
		'zh-TW': '暫存檔案（下載、處理）的目錄',
		'ja-JP': '一時ファイル（ダウンロード、処理）のディレクトリ',
		'de-DE': 'Verzeichnis für temporäre Dateien (Downloads, Verarbeitung)',
		'fr-FR': 'Répertoire pour les fichiers temporaires (téléchargements, traitement)',
		'ru-RU': 'Каталог для временных файлов (загрузки, обработка)',
		'es-ES': 'Directorio para archivos temporales (descargas, procesamiento)'
	},
	'settings.tempDirPlaceholder': {
		'en-US': 'e.g., research-attachment-hub/tmp',
		'zh-CN': '例如：research-attachment-hub/tmp',
		'zh-TW': '例如：research-attachment-hub/tmp',
		'ja-JP': '例：research-attachment-hub/tmp',
		'de-DE': 'z.B. research-attachment-hub/tmp',
		'fr-FR': 'ex. research-attachment-hub/tmp',
		'ru-RU': 'например research-attachment-hub/tmp',
		'es-ES': 'ej. research-attachment-hub/tmp'
	},
	'settings.autoCopyExternalFiles': {
		'en-US': 'Auto Copy External Files',
		'zh-CN': '自动复制外部文件',
		'zh-TW': '自動複製外部檔案',
		'ja-JP': '外部ファイルを自動コピー',
		'de-DE': 'Externe Dateien automatisch kopieren',
		'fr-FR': 'Copier automatiquement les fichiers externes',
		'ru-RU': 'Автоматически копировать внешние файлы',
		'es-ES': 'Copiar archivos externos automáticamente'
	},
	'settings.autoCopyExternalFilesDesc': {
		'en-US': 'Automatically copy external files to the research directory',
		'zh-CN': '自动将外部文件复制到研究目录',
		'zh-TW': '自動將外部檔案複製到研究目錄',
		'ja-JP': '外部ファイルを研究ディレクトリに自動的にコピー',
		'de-DE': 'Externe Dateien automatisch in das Forschungsverzeichnis kopieren',
		'fr-FR': 'Copier automatiquement les fichiers externes dans le répertoire de recherche',
		'ru-RU': 'Автоматически копировать внешние файлы в каталог исследований',
		'es-ES': 'Copiar archivos externos automáticamente al directorio de investigación'
	},
	'settings.enableFileRenaming': {
		'en-US': 'Enable File Renaming',
		'zh-CN': '启用文件重命名',
		'zh-TW': '啟用檔案重新命名',
		'ja-JP': 'ファイル名の変更を有効にする',
		'de-DE': 'Dateiumbenennung aktivieren',
		'fr-FR': 'Activer le renommage de fichiers',
		'ru-RU': 'Включить переименование файлов',
		'es-ES': 'Habilitar renombrado de archivos'
	},
	'settings.enableFileRenamingDesc': {
		'en-US': 'Rename files based on the file name template',
		'zh-CN': '根据文件名模板重命名文件',
		'zh-TW': '根據檔案名稱模板重新命名檔案',
		'ja-JP': 'ファイル名テンプレートに基づいてファイル名を変更',
		'de-DE': 'Dateien basierend auf der Dateinamenvorlage umbenennen',
		'fr-FR': 'Renommer les fichiers selon le modèle de nom de fichier',
		'ru-RU': 'Переименовывать файлы на основе шаблона имени файла',
		'es-ES': 'Renombrar archivos según la plantilla de nombre de archivo'
	},
	'settings.templateVariables': {
		'en-US': 'Template Variables',
		'zh-CN': '模板变量',
		'zh-TW': '模板變量',
		'ja-JP': 'テンプレート変数',
		'de-DE': 'Vorlagenvariablen',
		'fr-FR': 'Variables du modèle',
		'ru-RU': 'Переменные шаблона',
		'es-ES': 'Variables de plantilla'
	},
	'settings.autoExtractDOI': {
		'en-US': 'Auto Extract DOI',
		'zh-CN': '自动提取DOI',
		'zh-TW': '自動提取DOI',
		'ja-JP': 'DOIを自動抽出',
		'de-DE': 'DOI automatisch extrahieren',
		'fr-FR': 'Extraire automatiquement le DOI',
		'ru-RU': 'Автоматически извлекать DOI',
		'es-ES': 'Extraer DOI automáticamente'
	},
	'settings.autoExtractDOIDesc': {
		'en-US': 'Automatically extract DOI from PDF files and research papers',
		'zh-CN': '自动从PDF文件和研究论文中提取DOI',
		'zh-TW': '自動從PDF檔案和研究論文中提取DOI',
		'ja-JP': 'PDFファイルや研究論文からDOIを自動的に抽出',
		'de-DE': 'DOI automatisch aus PDF-Dateien und Forschungsarbeiten extrahieren',
		'fr-FR': 'Extraire automatiquement le DOI des fichiers PDF et des articles de recherche',
		'ru-RU': 'Автоматически извлекать DOI из PDF файлов и научных работ',
		'es-ES': 'Extraer automáticamente DOI de archivos PDF y artículos de investigación'
	},
	'settings.autoExtractMetadata': {
		'en-US': 'Auto Extract Metadata',
		'zh-CN': '自动提取元数据',
		'zh-TW': '自動提取元數據',
		'ja-JP': 'メタデータを自動抽出',
		'de-DE': 'Metadaten automatisch extrahieren',
		'fr-FR': 'Extraire automatiquement les métadonnées',
		'ru-RU': 'Автоматически извлекать метаданные',
		'es-ES': 'Extraer metadatos automáticamente'
	},
	'settings.autoExtractMetadataDesc': {
		'en-US': 'Automatically extract metadata (title, author, journal, etc.) from research papers',
		'zh-CN': '自动从研究论文中提取元数据（标题、作者、期刊等）',
		'zh-TW': '自動從研究論文中提取元數據（標題、作者、期刊等）',
		'ja-JP': '研究論文からメタデータ（タイトル、著者、ジャーナルなど）を自動的に抽出',
		'de-DE': 'Metadaten (Titel, Autor, Zeitschrift usw.) automatisch aus Forschungsarbeiten extrahieren',
		'fr-FR': 'Extraire automatiquement les métadonnées (titre, auteur, journal, etc.) des articles de recherche',
		'ru-RU': 'Автоматически извлекать метаданные (название, автор, журнал и т.д.) из научных работ',
		'es-ES': 'Extraer automáticamente metadatos (título, autor, revista, etc.) de artículos de investigación'
	},
	'settings.tagManagement': {
		'en-US': 'Tag Management',
		'zh-CN': '标签管理',
		'zh-TW': '標籤管理',
		'ja-JP': 'タグ管理',
		'de-DE': 'Tag-Verwaltung',
		'fr-FR': 'Gestion des étiquettes',
		'ru-RU': 'Управление тегами',
		'es-ES': 'Gestión de etiquetas'
	},
	'settings.createTagFiles': {
		'en-US': 'Create Tag Files',
		'zh-CN': '创建标签文件',
		'zh-TW': '創建標籤檔案',
		'ja-JP': 'タグファイルを作成',
		'de-DE': 'Tag-Dateien erstellen',
		'fr-FR': 'Créer des fichiers d\'étiquettes',
		'ru-RU': 'Создать файлы тегов',
		'es-ES': 'Crear archivos de etiquetas'
	},
	'settings.createTagFilesDesc': {
		'en-US': 'Create individual tag files for better organization',
		'zh-CN': '创建单独的标签文件以获得更好的组织',
		'zh-TW': '創建單獨的標籤檔案以獲得更好的組織',
		'ja-JP': 'より良い組織化のために個別のタグファイルを作成',
		'de-DE': 'Individuelle Tag-Dateien für bessere Organisation erstellen',
		'fr-FR': 'Créer des fichiers d\'étiquettes individuels pour une meilleure organisation',
		'ru-RU': 'Создавать отдельные файлы тегов для лучшей организации',
		'es-ES': 'Crear archivos de etiquetas individuales para mejor organización'
	},
	'settings.syncTagsToObsidian': {
		'en-US': 'Sync Tags to Obsidian',
		'zh-CN': '同步标签到Obsidian',
		'zh-TW': '同步標籤到Obsidian',
		'ja-JP': 'Obsidianにタグを同期',
		'de-DE': 'Tags mit Obsidian synchronisieren',
		'fr-FR': 'Synchroniser les étiquettes avec Obsidian',
		'ru-RU': 'Синхронизировать теги с Obsidian',
		'es-ES': 'Sincronizar etiquetas con Obsidian'
	},
	'settings.syncTagsToObsidianDesc': {
		'en-US': 'Synchronize research tags with Obsidian\'s tag system',
		'zh-CN': '将研究标签与Obsidian的标签系统同步',
		'zh-TW': '將研究標籤與Obsidian的標籤系統同步',
		'ja-JP': '研究タグをObsidianのタグシステムと同期',
		'de-DE': 'Forschungstags mit Obsidians Tagsystem synchronisieren',
		'fr-FR': 'Synchroniser les étiquettes de recherche avec le système d\'étiquettes d\'Obsidian',
		'ru-RU': 'Синхронизировать исследовательские теги с системой тегов Obsidian',
		'es-ES': 'Sincronizar etiquetas de investigación con el sistema de etiquetas de Obsidian'
	},

	// 通知消息
	'notices.PDFNotFound': {
		'en-US': 'PDF file not found: {path}',
		'zh-CN': 'PDF文件未找到: {path}',
		'zh-TW': 'PDF檔案未找到: {path}',
		'ja-JP': 'PDFファイルが見つかりません: {path}',
		'de-DE': 'PDF-Datei nicht gefunden: {path}',
		'fr-FR': 'Fichier PDF introuvable : {path}',
		'ru-RU': 'PDF файл не найден: {path}',
		'es-ES': 'Archivo PDF no encontrado: {path}'
	},
	'notices.openingPDF': {
		'en-US': 'Opening PDF...',
		'zh-CN': '正在打开PDF...',
		'zh-TW': '正在開啟PDF...',
		'ja-JP': 'PDFを開いています...',
		'de-DE': 'PDF wird geöffnet...',
		'fr-FR': 'Ouverture du PDF...',
		'ru-RU': 'Открытие PDF...',
		'es-ES': 'Abriendo PDF...'
	},
	'notices.referenceCountUpdated': {
		'en-US': 'Reference count updated: {count}',
		'zh-CN': '引用计数已更新: {count}',
		'zh-TW': '引用計數已更新: {count}',
		'ja-JP': '参照カウントが更新されました: {count}',
		'de-DE': 'Verweiszähler aktualisiert: {count}',
		'fr-FR': 'Compteur de références mis à jour : {count}',
		'ru-RU': 'Счетчик ссылок обновлен: {count}',
		'es-ES': 'Contador de referencias actualizado: {count}'
	},
	'plugin.loadSuccess': {
		'en-US': 'Research Attachment Hub loaded successfully',
		'zh-CN': '研究附件中心加载成功',
		'zh-TW': '研究附件中心加載成功',
		'ja-JP': 'リサーチアタッチメントハブが正常に読み込まれました',
		'de-DE': 'Research Attachment Hub erfolgreich geladen',
		'fr-FR': 'Research Attachment Hub chargé avec succès',
		'ru-RU': 'Research Attachment Hub успешно загружен',
		'es-ES': 'Research Attachment Hub cargado exitosamente'
	},
	'notices.exportSuccess': {
		'en-US': 'Export successful: {type} exported to {filename}',
		'zh-CN': '导出成功: {type} 已导出到 {filename}',
		'zh-TW': '匯出成功: {type} 已匯出到 {filename}',
		'ja-JP': 'エクスポート成功: {type} が {filename} にエクスポートされました',
		'de-DE': 'Export erfolgreich: {type} wurde nach {filename} exportiert',
		'fr-FR': 'Exportation réussie : {type} exporté vers {filename}',
		'ru-RU': 'Экспорт успешен: {type} экспортирован в {filename}',
		'es-ES': 'Exportación exitosa: {type} exportado a {filename}'
	},
	'notices.exportStart': {
		'en-US': 'Starting export...',
		'zh-CN': '开始导出...',
		'zh-TW': '開始匯出...',
		'ja-JP': 'エクスポートを開始しています...',
		'de-DE': 'Export wird gestartet...',
		'fr-FR': 'Début de l\'exportation...',
		'ru-RU': 'Начало экспорта...',
		'es-ES': 'Iniciando exportación...'
	},
	'notices.exportCompleted': {
		'en-US': 'Export completed: {type} ({copiedCount} copied, {missingCount} missing)',
		'zh-CN': '导出完成: {type} ({copiedCount} 个已复制, {missingCount} 个缺失)',
		'zh-TW': '匯出完成: {type} ({copiedCount} 個已複製, {missingCount} 個缺失)',
		'ja-JP': 'エクスポート完了: {type} ({copiedCount} 個コピー済み, {missingCount} 個見つかりません)',
		'de-DE': 'Export abgeschlossen: {type} ({copiedCount} kopiert, {missingCount} fehlt)',
		'fr-FR': 'Exportation terminée : {type} ({copiedCount} copiés, {missingCount} manquants)',
		'ru-RU': 'Экспорт завершен: {type} ({copiedCount} скопировано, {missingCount} отсутствует)',
		'es-ES': 'Exportación completada: {type} ({copiedCount} copiados, {missingCount} faltantes)'
	},
	'notices.exportFailed': {
		'en-US': 'Export failed: {message}',
		'zh-CN': '导出失败: {message}',
		'zh-TW': '匯出失敗: {message}',
		'ja-JP': 'エクスポート失敗: {message}',
		'de-DE': 'Export fehlgeschlagen: {message}',
		'fr-FR': 'Échec de l\'exportation : {message}',
		'ru-RU': 'Ошибка экспорта: {message}',
		'es-ES': 'Error en exportación: {message}'
	}
};

// 获取翻译的实用函数
export function getTranslation(key: string, language: SupportedLanguage, params?: Record<string, any>): string {
	const translation = LANGUAGE_KEYS[key];
	if (!translation) {
		console.warn(`Translation key not found: ${key}`);
		return key;
	}

	let text = translation[language] || translation['en-US'] || key;

	// 替换参数
	if (params) {
		Object.keys(params).forEach(param => {
			text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
		});
	}

	return text;
}

// 检查缺失的翻译
export function checkMissingTranslations(language: SupportedLanguage): string[] {
	const missing: string[] = [];
	Object.keys(LANGUAGE_KEYS).forEach(key => {
		if (!LANGUAGE_KEYS[key][language] || LANGUAGE_KEYS[key][language] === '') {
			missing.push(key);
		}
	});
	return missing;
}

// 获取所有支持的語言
export function getSupportedLanguages(): SupportedLanguage[] {
	return ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'de-DE', 'fr-FR', 'ru-RU', 'es-ES'];
}

// 获取语言显示名称
export function getLanguageDisplayName(language: SupportedLanguage): string {
	const names: Record<SupportedLanguage, string> = {
		'en-US': 'English',
		'zh-CN': '中文简体',
		'zh-TW': '中文繁體',
		'ja-JP': '日本語',
		'de-DE': 'Deutsch',
		'fr-FR': 'Français',
		'ru-RU': 'Русский',
		'es-ES': 'Español'
	};
	return names[language];
}

// 导出为CSV格式
export function exportToCSV(): string {
	const languages = getSupportedLanguages();
	const keys = Object.keys(LANGUAGE_KEYS);
	
	let csv = 'Key,' + languages.join(',') + '\n';
	
	keys.forEach(key => {
		const row = [key];
		languages.forEach(lang => {
			row.push(LANGUAGE_KEYS[key][lang] || '');
		});
		csv += row.join(',') + '\n';
	});
	
	return csv;
}