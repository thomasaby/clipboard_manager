const MAX_ITEMS = 200;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ADD_ITEM") {
    saveToHistory(message.text);
  }
});

async function saveToHistory(text) {
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

  history.unshift(newItem);

  // Keep pinned items, but trim unpinned items if over capacity
  const pinnedItems = history.filter(i => i.pinned);
  const unpinnedItems = history.filter(i => !i.pinned);
  
  const trimmedUnpinned = unpinnedItems.slice(0, MAX_ITEMS - pinnedItems.length);
  const newHistory = [...pinnedItems, ...trimmedUnpinned].sort((a, b) => b.id - a.id);

  chrome.storage.local.set({ history: newHistory });
}