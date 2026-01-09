// Listen for copy events on the webpage
document.addEventListener('copy', () => {
  // We wait a tiny bit to ensure the clipboard has updated
  setTimeout(async () => {
    // Helper: obtain runtime object (chrome or browser)
    const getRuntime = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime) return chrome.runtime;
      if (typeof browser !== 'undefined' && browser.runtime) return browser.runtime;
      return undefined;
    };

    // Helper: safe send with fallbacks and error handling
    const safeSend = async (payload) => {
      const runtime = getRuntime();
      try {
        if (runtime && typeof runtime.sendMessage === 'function') {
          // Some runtimes return a Promise, others accept a callback.
          try {
            const result = runtime.sendMessage(payload, (resp) => {
              // callback form: check lastError to avoid uncaught errors
              if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
                // silently ignore invalidated context
              }
            });
            // If it returned a Promise, await it to catch errors
            if (result && typeof result.then === 'function') {
              await result.catch(() => {});
            }
            return;
          } catch (sendErr) {
            // sendMessage may throw synchronously (invalidated context) — fall through to fallback
          }
        }
      } catch (err) {
        // ignore and try fallback
      }

      // Fallback to window.postMessage (page-to-extension bridge)
      if (typeof window.postMessage === 'function') {
        try {
          window.postMessage({ direction: 'FROM_PAGE', ...payload }, '*');
        } catch (e) {
          // nothing else we can do
        }
      }
    };

    try {
      const text = await navigator.clipboard.readText();
      if (text) await safeSend({ type: 'ADD_ITEM', text });
    } catch (err) {
      // Fallback: use window.getSelection if clipboard API is blocked
      const selectedText = window.getSelection().toString();
      if (selectedText) await safeSend({ type: 'ADD_ITEM', text: selectedText });
    }
  }, 100);
});