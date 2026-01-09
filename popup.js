document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.getElementById('list-container');
  const searchInput = document.getElementById('search');

  // Storage helpers
  function storageGet(keys) { return new Promise(resolve => chrome.storage.local.get(keys, resolve)); }
  function storageSet(obj) { return new Promise(resolve => chrome.storage.local.set(obj, resolve)); }

  // Snackbar references (may not exist in root popup) — guard against missing DOM
  const snackbar = document.getElementById('undo-snackbar');
  const snackbarMsg = document.getElementById('snackbar-msg');
  const snackbarUndo = document.getElementById('snackbar-undo');
  let pendingDelete = null;
  let deleteTimeout = null;
  const DELETE_DELAY = 4500;
  if (snackbarUndo) snackbarUndo.addEventListener('click', (e) => { e.preventDefault(); undoDelete(); });

  const renderItems = (filter = "") => {
    chrome.storage.local.get(['history'], (data) => {
      const history = data.history || [];
      listContainer.innerHTML = '';

      const filtered = history.filter(i => 
        i.text.toLowerCase().includes(filter.toLowerCase())
      );

      filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        const trashIconUrl = chrome.runtime.getURL('icons/trash-bin.png');
        div.innerHTML = `
          <button class="pin-btn ${item.pinned ? 'active' : ''}" data-id="${item.id}">📌</button>
          <button class="delete-btn" data-id="${item.id}" title="Delete">
            <img class="delete-icon" src="${trashIconUrl}" alt="Delete">
          </button>
          <span class="code-preview">${escapeHtml(item.text)}</span>
          <div class="meta">${item.timestamp}</div>
        `;

        // Copy to clipboard on click
        div.addEventListener('click', (e) => {
          if (e.target.classList.contains('pin-btn') || e.target.closest('.delete-btn')) return;
          navigator.clipboard.writeText(item.text);
          window.close(); // Close popup after copying
        });

        // Toggle pin on click
        div.querySelector('.pin-btn').addEventListener('click', () => togglePin(item.id));

        // Delete on click
        div.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); animateDelete(item, div); });

        // Animate deletion then schedule removal (with undo support when possible)
        async function animateDelete(itemObj, element) {
          if (!element || element.classList.contains('deleting')) return;

          // Set explicit height for smooth collapse
          element.style.height = element.offsetHeight + 'px';
          // Force layout
          // eslint-disable-next-line no-unused-expressions
          element.offsetHeight;

          element.classList.add('deleting');

          setTimeout(() => {
            element.style.height = '0px';
            element.style.paddingTop = '0px';
            element.style.paddingBottom = '0px';
            element.style.marginTop = '0px';
            element.style.marginBottom = '0px';
          }, 160);

          // Wait for drown animation
          await new Promise(resolve => {
            let finished = false;
            const onEnd = (ev) => {
              if (ev && ev.animationName !== 'drown') return;
              if (finished) return;
              finished = true;
              element.removeEventListener('animationend', onEnd);
              resolve();
            };
            element.addEventListener('animationend', onEnd);
            setTimeout(() => { if (!finished) { finished = true; element.removeEventListener('animationend', onEnd); resolve(); } }, 800);
          });

          try { element.remove(); } catch (err) { }

          scheduleDelete(itemObj);
        }

        listContainer.appendChild(div);
      });
    });
  };

  async function togglePin(id) {
    const data = await chrome.storage.local.get(['history']);
    const history = data.history.map(item => {
      if (item.id === id) item.pinned = !item.pinned;
      return item;
    });
    await chrome.storage.local.set({ history });
    renderItems(searchInput.value);
  }

  async function deleteItem(id) {
    const data = await storageGet(['history']);
    const history = (data.history || []).filter(item => item.id !== id);
    await storageSet({ history });
    renderItems(searchInput.value);
  }

  async function scheduleDelete(item) {
    // If another delete is pending, commit it first
    if (pendingDelete) {
      await commitDelete();
    }

    // Remove the item from storage immediately so undo won't create a duplicate
    const data = await storageGet(['history']);
    const history = data.history || [];
    const index = history.findIndex(i => i.id === item.id);

    if (index !== -1) {
      history.splice(index, 1);
      await storageSet({ history });
    }

    pendingDelete = { item, index };

    if (snackbar && snackbarMsg) {
      snackbarMsg.textContent = item.text.length > 120 ? item.text.slice(0, 120) + '…' : item.text;
      snackbar.classList.add('show');
    }

    deleteTimeout = setTimeout(() => commitDelete(), DELETE_DELAY);
  }

  async function commitDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.item.id;
    const data = await storageGet(['history']);
    let history = data.history || [];
    history = history.filter(i => i.id !== id);
    await storageSet({ history });
    pendingDelete = null;
    if (deleteTimeout) { clearTimeout(deleteTimeout); deleteTimeout = null; }
    if (snackbar) snackbar.classList.remove('show');
    renderItems(searchInput.value);
  }

  async function undoDelete() {
    if (!pendingDelete) return;
    if (deleteTimeout) { clearTimeout(deleteTimeout); deleteTimeout = null; }
    const { item, index } = pendingDelete;
    const data = await storageGet(['history']);
    const history = data.history || [];
    const insertIndex = (typeof index === 'number' && index >= 0 && index <= history.length) ? index : 0;
    history.splice(insertIndex, 0, item);
    await storageSet({ history });
    pendingDelete = null;
    if (snackbar) snackbar.classList.remove('show');
    renderItems(searchInput.value);
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[m]));
  }

  searchInput.addEventListener('input', (e) => renderItems(e.target.value));
  renderItems();
});