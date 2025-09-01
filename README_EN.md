# Research Attachment Hub (RAH) - A Plugin for Obsidian Academic Research Attachment Management

**[中文](README.md) | [English](README_EN.md)**

An Obsidian plugin designed for academic research attachment management, supporting PDF paper management, DOI auto-detection, web information extraction, and complete data migration. While theoretically capable of managing all file types, it was specifically designed to address PDF paper management challenges, particularly the inability to tag attachments and handle paper citations.

Plugin features are still under development. To avoid disrupting your vault, please backup your vault before use. Features are continuously being improved - feedback and suggestions are welcome.

## 🚀 Quick Start

### Installation
1. Download the latest release from [GitHub Releases](https://github.com/your-repo/releases)
2. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/research-attachment-hub/` folder
3. Enable the plugin in Obsidian settings

### Basic Usage
1. **Add Papers**: Use `Ctrl/Cmd + P` → "Research Attachment Hub: Open" to open the interface
2. **Auto-Tag**: Papers are automatically tagged with metadata (title, authors, journal, etc.)
3. **Smart Links**: Move/rename files freely - links update automatically
4. **Search & Filter**: Find papers by tags, authors, or keywords

## ✨ Core Features

### 📌 Tag Management (Core Feature)
- **Internal Tags**: RAH's own tagging system for attachments
- **Obsidian Tags**: Auto-generated Markdown files make tags visible to Obsidian's tag manager
- **Smart Metadata**: Automatically extracts and organizes paper metadata
- **Cross-Reference**: Links between papers and related notes

### 🔗 Smart Link Tracking (Exclusive)
- **Real-time Tracking**: Monitors file movements and renames
- **Auto-Update**: Updates all references when files are moved
- **Path Binding**: Each database entry tracks its associated files
- **Zero Maintenance**: No manual link management required

### 📊 Advanced Management
- **DOI Detection**: Auto-extract DOI from PDFs and fetch metadata
- **Batch Operations**: Import entire folders of papers
- **Data Migration**: Export/import complete databases
- **Web Scraping**: Extract paper info from academic websites

## 📋 Usage Guide

### Daily Workflow
1. **Add New Papers**: Drag PDFs or use download modal
2. **Organize Existing**: Scan and categorize existing attachments
3. **Manage Tags**: Add custom tags or use auto-generated ones
4. **Cross-Reference**: Create links between related papers
5. **Move Files**: Organize freely - links stay intact
6. **Backup**: Regular exports for data safety

### Command Reference
| Command | Purpose |
|---------|---------|
| `RAH: Open` | Main interface |
| `RAH: Scan Attachments` | Find existing papers |
| `RAH: Export Database` | Backup your data |
| `RAH: Import Package` | Restore from backup |

## 🏗️ Development
Built upon [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) using TypeScript and Obsidian Plugin API. Development assisted by AI programming tools including Cursor and TRAE.

## ⚠️ Disclaimer
Use this plugin at your own risk. The developer is not responsible for any data loss, file corruption, or other damages resulting from plugin use. By using this plugin, you agree to accept full responsibility for any consequences. Always backup your vault data before use.

## 📄 License
MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing
- Report bugs via [GitHub Issues](https://github.com/your-repo/issues)
- Submit feature requests
- Contribute code via pull requests
- Help improve documentation

---

**Design Purpose**: Specifically created to solve Obsidian's inability to tag attachments, with special optimization for academic PDF paper management experience.

---

## ☕ Sponsor Support

If you find this plugin helpful, consider buying me a coffee to support development:

<script type='text/javascript' src='https://storage.ko-fi.com/cdn/widget/Widget_2.js'></script><script type='text/javascript'>kofiwidget2.init('Buy me a burger', '#72a4f2', 'Q5Q51KH1F2');kofiwidget2.draw();</script>

Your support helps keep this plugin updated and improved!