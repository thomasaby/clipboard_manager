// Listen for copy events on the webpage
document.addEventListener('copy', () => {
  try {
    const selectedText = window.getSelection().toString();
    if (!selectedText || selectedText.trim() === "") return;

    const runtime = (typeof chrome !== 'undefined' && chrome.runtime)
      ? chrome.runtime
      : (typeof browser !== 'undefined' && browser.runtime)
        ? browser.runtime
        : undefined;

    if (runtime && typeof runtime.sendMessage === 'function') {
      try {
        runtime.sendMessage({ type: "ADD_ITEM", text: selectedText });
      } catch (sendErr) {
        // Handle "Extension context invalidated" or other sendMessage errors
        if (sendErr.message && sendErr.message.includes('invalidated')) {
          console.warn('ClipSuit(content): extension context invalidated, retrying once...');
          // Silently fail—extension may have reloaded
        } else {
          console.error('ClipSuit(content): sendMessage failed', sendErr);
        }
      }
    } else if (typeof window.postMessage === 'function') {
      window.postMessage({ direction: "FROM_PAGE", type: "ADD_ITEM", text: selectedText }, "*");
    } else {
      console.warn('ClipSuit(content): no runtime available to send message');
    }
  } catch (err) {
    console.warn('ClipSuit(content): error handling copy event', err);
  }
});