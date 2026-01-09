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
        // Use a single retry when the extension context is invalidated.
        // Re-resolve runtime inside the send function to pick up a reloaded extension.
        let didRetry = false;
        const send = () => {
          const rt = (typeof chrome !== 'undefined' && chrome.runtime)
            ? chrome.runtime
            : (typeof browser !== 'undefined' && browser.runtime)
              ? browser.runtime
              : undefined;

          if (!rt || typeof rt.sendMessage !== 'function') {
            console.warn('ClipSuit(content): runtime unavailable on retry');
            return;
          }

          try {
            // Use callback form to detect async failures via runtime.lastError
            rt.sendMessage({ type: "ADD_ITEM", text: selectedText }, (response) => {
              const lastErr = rt && rt.lastError ? rt.lastError : undefined;
              if (lastErr) {
                const msg = lastErr.message || '';
                if (msg.includes('invalidated') && !didRetry) {
                  console.warn('ClipSuit(content): extension context invalidated, retrying once...');
                  didRetry = true;
                  setTimeout(send, 250);
                } else if (msg.includes('closed before a response') || msg.includes('message port closed')) {
                  // Benign: background didn't respond synchronously; ignore to avoid noisy logs
                  console.debug('ClipSuit(content): message port closed before response (ignored)');
                } else {
                  console.error('ClipSuit(content): sendMessage failed (async)', lastErr);
                }
              }
            });
          } catch (asyncSendErr) {
            // Some environments throw synchronously (e.g., invalidated context)
            if (asyncSendErr && asyncSendErr.message && asyncSendErr.message.includes('invalidated') && !didRetry) {
              console.warn('ClipSuit(content): extension context invalidated, retrying once...');
              didRetry = true;
              setTimeout(send, 250);
            } else {
              console.error('ClipSuit(content): sendMessage threw', asyncSendErr);
            }
          }
        };

        send();
      } catch (sendErr) {
        // Fatal fallback: ensure we don't let unexpected errors bubble up
        console.warn('ClipSuit(content): sendMessage failed unexpectedly', sendErr);
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