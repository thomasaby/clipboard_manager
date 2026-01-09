# ClipSuit

A professional clipboard history manager Chrome extension that captures and manages your clipboard snippets efficiently.

## Features

- **Clipboard History**: Automatically captures all copied items
- **Search**: Quickly search through your clipboard history
- **Pin Important Items**: Mark frequently used snippets as pinned
- **Keyboard Shortcut**: Quick access with `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac)
- **Smart Storage**: Maintains up to 200 items with pinned items always preserved

## Project Structure

```
clipboard_manager/
├── src/
│   ├── scripts/           # Core extension scripts
│   │   ├── background.js  # Service worker - handles history management
│   │   └── content.js     # Content script - listens for copy events
│   └── popup/            # Popup UI
│       ├── popup.html    # UI structure
│       ├── popup.css     # Styling
│       └── popup.js      # Popup logic
├── public/               # Static assets (if needed)
├── docs/                 # Documentation
├── tests/                # Test files
├── manifest.json         # Extension configuration
├── package.json          # Project metadata and dependencies
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Development

### Installation

1. Clone or download this project
2. Install dependencies (optional for development):
   ```bash
   npm install
   ```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `clipboard_manager` folder
5. The extension will appear in your extensions menu

### Usage

- **Copy anything** and it's automatically saved to history
- **Click `Ctrl+Shift+V`** to open the clipboard history popup
- **Search** for specific items using the search bar
- **Click 📌** to pin frequently used snippets
- **Click an item** to copy it to your clipboard and close the popup

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Storage**: Chrome Local Storage (persistent)
- **Permissions**: 
  - `storage` - for clipboard history
  - `clipboardWrite` - to write to clipboard
  - `clipboardRead` - to read copied items

## Future Enhancements

- [ ] Import/Export functionality
- [ ] Cloud sync across devices
- [ ] Category/Tag support
- [ ] Clipboard history statistics
- [ ] Custom keyboard shortcuts
- [ ] Theme customization

## License

MIT

## Support

For issues or feature requests, please create an issue in the repository.
