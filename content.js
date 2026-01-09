// Listen for copy events on the webpage
document.addEventListener('copy', () => {
  // We wait a tiny bit to ensure the clipboard has updated
  setTimeout(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const runtime = (typeof chrome !== 'undefined' && chrome.runtime)
          ? chrome.runtime
          : (typeof browser !== 'undefined' && browser.runtime)
            ? browser.runtime
            : undefined;

        if (runtime && typeof runtime.sendMessage === 'function') {
          runtime.sendMessage({ type: "ADD_ITEM", text: text });
        } else if (typeof window.postMessage === 'function') {
          window.postMessage({ direction: "FROM_PAGE", type: "ADD_ITEM", text }, "*");
        } else {
          console.warn('ClipSuit(content): no runtime to send message');
        }
      }
    } catch (err) {
      // Fallback: use window.getSelection if clipboard API is blocked
      const selectedText = window.getSelection().toString();
      if (selectedText) {
        const runtime = (typeof chrome !== 'undefined' && chrome.runtime)
          ? chrome.runtime
          : (typeof browser !== 'undefined' && browser.runtime)
            ? browser.runtime
            : undefined;

        if (runtime && typeof runtime.sendMessage === 'function') {
          runtime.sendMessage({ type: "ADD_ITEM", text: selectedText });
        } else if (typeof window.postMessage === 'function') {
          window.postMessage({ direction: "FROM_PAGE", type: "ADD_ITEM", text: selectedText }, "*");
        } else {
          console.warn('ClipSuit(content): no runtime to send message');
        }
      }
    }
  }, 100);
});