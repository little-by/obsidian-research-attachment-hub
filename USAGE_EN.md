# ResearchAttachmentHub Usage Guide

**[中文](USAGE.md) | [English](USAGE_EN.md)**

## 🚀 Quick Start

### 1. First-Time Setup
After installing the plugin:
1. Open command palette (`Ctrl/Cmd + P`)
2. Type "Research Attachment Hub: Open" to launch the main interface
3. The plugin will automatically create necessary folders and configuration files

### 2. Adding Your First Paper

#### Method 1: Direct Download
1. Click "Download Paper" button
2. Enter DOI (e.g., `10.1038/nature12373`) or arXiv ID (e.g., `2301.12345`)
3. Plugin will fetch metadata and PDF automatically
4. Tags are auto-generated from paper metadata

#### Method 2: Import Existing PDFs
1. Use command "Research Attachment Hub: Scan Attachments"
2. Select folder containing your PDF papers
3. Plugin will process each file and extract metadata
4. Review and confirm the imported entries

#### Method 3: Manual Entry
1. Click "Add Entry" button
2. Fill in paper details manually
3. Attach PDF file from your vault
4. Add custom tags as needed

## 📋 Daily Usage Workflow

### Step 1: Add New Papers
- **Best Practice**: Use DOI download for new papers
- **Drag & Drop**: Directly drop PDFs into the interface
- **Batch Import**: Process entire folders of existing papers

### Step 2: Organize Existing Files
- **Auto-Scan**: Regularly scan for new PDFs in your vault
- **Metadata Check**: Verify and correct auto-extracted information
- **Tag Cleanup**: Consolidate similar tags for consistency

### Step 3: Manage Tags
- **RAH Tags**: Internal tags for attachment management
- **Obsidian Tags**: Auto-generated Markdown files for Obsidian compatibility
- **Custom Tags**: Add your own research-specific tags
- **Tag Hierarchy**: Create nested tags (e.g., `field/subfield/specific`)

### Step 4: Cross-Reference Papers
- **Link Notes**: Connect papers to related research notes
- **Citation Network**: Track which papers cite which
- **Project Tags**: Group papers by research project

### Step 5: Move Files Freely
- **Smart Links**: Move/rename files without breaking links
- **Auto-Update**: Plugin tracks all file movements
- **Path Binding**: Each entry maintains link to actual file

### Step 6: Regular Backup
- **Export Database**: Create complete backups
- **Package Format**: Single file contains all data
- **Migration Ready**: Easy transfer between vaults

## 🔍 Advanced Features

### View Modes Explained

#### 1. **Card View** (Default)
- Visual grid layout with paper thumbnails
- Quick preview of paper information
- Best for browsing large collections
- Supports drag-and-drop organization

#### 2. **Table View**
- Spreadsheet-like interface
- Sort by any column (date, author, journal)
- Filter and search across all fields
- Ideal for data analysis and cleanup

#### 3. **Tree View**
- Hierarchical folder structure
- Organize by year/journal/project
- Visual representation of tag relationships
- Great for systematic organization

### Data Management

#### Import Options
- **Single PDF**: Process one file at a time
- **Folder Scan**: Batch process entire directories
- **DOI Batch**: Download multiple papers by DOI list
- **Package Import**: Restore from backup files

#### Export Options
- **Complete Backup**: All papers + database
- **Metadata Only**: Just the database entries
- **Filtered Export**: Selected papers only
- **Format Options**: JSON, CSV, or plugin-specific format

### Troubleshooting Common Issues

#### PDF Not Processing
- **Check File**: Ensure PDF is not corrupted
- **Text Layer**: Verify PDF has selectable text (OCR if needed)
- **Permissions**: Check file access permissions

#### Metadata Missing
- **Manual Entry**: Add missing information manually
- **DOI Lookup**: Use DOI to fetch complete metadata
- **CrossRef**: Verify DOI on CrossRef.org

#### Links Broken
- **File Movement**: Plugin should auto-update, but check if file exists
- **Path Changes**: Verify file hasn't been moved outside vault
- **Database Sync**: Try refreshing the database

## 💡 Tips for Different Users

### New Users
1. Start with 5-10 papers to learn the interface
2. Use DOI download to see proper metadata extraction
3. Experiment with different view modes
4. Create simple tag system first

### Daily Researchers
1. Set up regular scan schedule for new papers
2. Use consistent tag naming conventions
3. Create project-specific tag hierarchies
4. Export backup weekly

### Advanced Users
1. Customize metadata extraction rules
2. Use batch operations for large collections
3. Integrate with other Obsidian plugins
4. Create custom export formats

## 🛠️ Command Reference

| Command | Purpose | Shortcut |
|---------|---------|----------|
| Open Research Hub | Main interface | `Ctrl/Cmd + P` → "RAH" |
| Scan Attachments | Find new PDFs | Available in commands |
| Export Database | Create backup | Available in commands |
| Import Package | Restore backup | Available in commands |

## 📊 Best Practices

### File Organization
- **Consistent Naming**: Use paper title or DOI as filename
- **Folder Structure**: Organize by year or research area
- **Tag Strategy**: Use both broad and specific tags
- **Regular Cleanup**: Review and update tags monthly

### Metadata Quality
- **Verify DOI**: Always check DOI accuracy
- **Author Names**: Use consistent name formats
- **Journal Names**: Use standard abbreviations
- **Keywords**: Add research-specific terms

### Backup Strategy
- **Weekly Export**: Regular database backups
- **Before Major Changes**: Always backup before reorganizing
- **Multiple Locations**: Keep backups in different locations
- **Test Restore**: Verify backups can be restored

---

**Need Help?** Check the [main README](README.md) for complete feature overview and troubleshooting guide.