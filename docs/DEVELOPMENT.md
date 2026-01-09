# Development Guide

## Architecture Overview

### Background Service Worker (`src/scripts/background.js`)
- Listens for messages from content scripts
- Manages clipboard history in Chrome Local Storage
- Handles item deduplication and size limits
- Maintains pin status for items

### Content Script (`src/scripts/content.js`)
- Runs on all web pages
- Detects copy events
- Reads clipboard content using the Clipboard API (with fallback)
- Sends items to the background worker for storage

### Popup UI (`src/popup/`)
- Displays clipboard history
- Allows searching and filtering
- Pin/unpin functionality
- Copy-to-clipboard on click

## Key Data Structure

```javascript
{
  id: timestamp,           // Unique identifier
  text: string,           // The copied content
  timestamp: string,      // Human-readable date/time
  pinned: boolean         // Whether item is pinned
}
```

## Storage Limits

- Maximum 200 items in history
- Pinned items are always preserved
- Unpinned items are trimmed when over capacity

## Message Communication

### From Content Script to Background
```javascript
chrome.runtime.sendMessage({ 
  type: "ADD_ITEM", 
  text: copiedText 
});
```

## Browser API Notes

- Uses Chrome Manifest V3 (latest standard)
- Service workers replace background pages
- Clipboard API requires `clipboardRead` and `clipboardWrite` permissions
- Fallback uses `window.getSelection()` for restricted contexts

## Testing

To test the extension:

1. Load unpacked in Chrome DevTools (`chrome://extensions/`)
2. Open DevTools for the popup (right-click → Inspect)
3. Open Service Worker DevTools for background script debugging
4. Check Chrome Local Storage in DevTools → Application tab

## Debugging Tips

- **Service Worker issues**: Check `chrome://extensions/` → Details → Errors
- **Content script issues**: Check console on any webpage
- **Storage issues**: Use DevTools → Application → Local Storage
