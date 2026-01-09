document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.getElementById('list-container');
  const searchInput = document.getElementById('search');

  const renderItems = (filter = "") => {
    try {
      chrome.storage.local.get(['history'], (data) => {
        try {
          const history = data.history || [];
          listContainer.innerHTML = '';

          const filtered = history.filter(i => 
            i.text.toLowerCase().includes(filter.toLowerCase())
          );

          // Show pinned items first while preserving the original recent->old order
          const pinnedItems = filtered.filter(i => i.pinned);
          const unpinnedItems = filtered.filter(i => !i.pinned);
          const ordered = [...pinnedItems, ...unpinnedItems];

          ordered.forEach(item => {
            const div = document.createElement('div');
            div.className = 'item' + (item.pinned ? ' pinned' : '');
            const pinIconUrl = chrome.runtime.getURL('icons/push-pin.png');
            div.innerHTML = `
              <button class="pin-btn ${item.pinned ? 'active' : ''}" data-id="${item.id}" title="${item.pinned ? 'Unpin' : 'Pin'}">
                <img class="pin-icon" src="${pinIconUrl}" alt="Pin">
              </button>
              <span class="code-preview">${escapeHtml(item.text)}</span>
              <div class="meta">${item.timestamp}</div>
            `;

            // Copy to clipboard on click
            div.addEventListener('click', (e) => {
              if (e.target.closest && e.target.closest('.pin-btn')) return;
              navigator.clipboard.writeText(item.text).catch(err => {
                console.error('Failed to copy to clipboard:', err);
              });
              window.close(); // Close popup after copying
            });

            // Toggle pin on click
            div.querySelector('.pin-btn').addEventListener('click', () => togglePin(item.id));

            listContainer.appendChild(div);
          });
        } catch (error) {
          console.error('Error rendering items:', error);
          listContainer.innerHTML = '<div style="color: red; padding: 10px;">Error loading clipboard history</div>';
        }
      });
    } catch (error) {
      console.error('Error fetching storage:', error);
    }
  };

  async function togglePin(id) {
    try {
      const data = await chrome.storage.local.get(['history']);
      const history = data.history.map(item => {
        if (item.id === id) item.pinned = !item.pinned;
        return item;
      });
      await chrome.storage.local.set({ history });
      renderItems(searchInput.value);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[m]));
  }

  searchInput.addEventListener('input', (e) => renderItems(e.target.value));
  renderItems();
});
