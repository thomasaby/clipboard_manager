document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.getElementById('list-container');
  const searchInput = document.getElementById('search');

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
        div.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteItem(item.id); });

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
    const data = await chrome.storage.local.get(['history']);
    const history = (data.history || []).filter(item => item.id !== id);
    await chrome.storage.local.set({ history });
    renderItems(searchInput.value);
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[m]));
  }

  searchInput.addEventListener('input', (e) => renderItems(e.target.value));
  renderItems();
});