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
      runtime.sendMessage({ type: "ADD_ITEM", text: selectedText });
      console.log("Copied text sent:", selectedText);
    } else if (typeof window.postMessage === 'function') {
      window.postMessage({ direction: "FROM_PAGE", type: "ADD_ITEM", text: selectedText }, "*");
      console.log("Copied text posted to page (fallback):", selectedText);
    } else {
      console.warn('ClipSuit(content): no runtime available to send message');
    }
  } catch (err) {
    console.error('ClipSuit(content): error handling copy event', err);
  }
});