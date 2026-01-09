const MAX_ITEMS = 200;

// Initialize extension with error handling
chrome.runtime.onInstalled.addListener(() => {
  try {
    // Graceful fallback if icons are missing
    console.log('ClipSuit extension initialized');
  } catch (error) {
    console.warn('Error during initialization:', error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    console.log('ClipSuit(background): received message', message);
    if (message.type === "ADD_ITEM") {
      saveToHistory(message.text);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ error: error.message });
  }
});

async function saveToHistory(text) {
  try {
    const data = await chrome.storage.local.get(['history']);
    let history = data.history || [];

    // Don't add if it's an exact duplicate of the most recent item
    if (history.length > 0 && history[0].text === text) return;

    const newItem = {
      id: Date.now(),
      text: text,
      timestamp: new Date().toLocaleString(),
      pinned: false
    };

    console.log('ClipSuit(background): saving new item', newItem);

    history.unshift(newItem);

    // Keep pinned items, but trim unpinned items if over capacity
    const pinnedItems = history.filter(i => i.pinned);
    const unpinnedItems = history.filter(i => !i.pinned);
    
    const trimmedUnpinned = unpinnedItems.slice(0, MAX_ITEMS - pinnedItems.length);
    const newHistory = [...pinnedItems, ...trimmedUnpinned].sort((a, b) => b.id - a.id);

    chrome.storage.local.set({ history: newHistory });
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}
