function loadShortcuts() {
	browser.storage.local.get("shortcuts").then((result) => {
		const shortcuts = result.shortcuts || {};
		const listElement = document.getElementById("shortcutList");

		if (Object.keys(shortcuts).length === 0) {
			listElement.innerHTML =
				'<div class="empty-state">No shortcuts yet. Add one below!</div>';
			return;
		}

		listElement.innerHTML = "";

		const shortcutsArray = Object.keys(shortcuts).map(key => {
			const shortcutValue = shortcuts[key];
			if (typeof shortcutValue === 'string') {
				return { key, url: shortcutValue, timestamp: 0 };
			}
			return { key, url: shortcutValue.url, timestamp: shortcutValue.timestamp };
		});

		shortcutsArray.sort((a, b) => b.timestamp - a.timestamp);

		shortcutsArray.forEach((shortcut) => {
			const item = document.createElement("div");
			item.className = "shortcut-item";

			item.innerHTML = `
        <div class="shortcut-info">
          <div class="shortcut-key">${shortcut.key}</div>
          <div class="shortcut-url">${shortcut.url}</div>
        </div>
        <button class="delete-btn" data-key="${shortcut.key}">Delete</button>
      `;

			listElement.appendChild(item);
		});

		document.querySelectorAll(".delete-btn").forEach((btn) => {
			btn.addEventListener("click", function () {
				deleteShortcut(this.dataset.key);
			});
		});
	});
}

function addShortcut() {
	const key = document.getElementById("newKey").value.trim().toLowerCase();
	const url = document.getElementById("newUrl").value.trim();

	if (!key || !url) {
		alert("Please fill in both fields");
		return;
	}

	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		alert("URL must start with http:// or https://");
		return;
	}

	browser.storage.local.get("shortcuts").then((result) => {
		const shortcuts = result.shortcuts || {};
		shortcuts[key] = { url: url, timestamp: Date.now() };

		browser.storage.local.set({ shortcuts }).then(() => {
			document.getElementById("newKey").value = "";
			document.getElementById("newUrl").value = "";
			loadShortcuts();
		});
	});
}

function deleteShortcut(key) {
	if (!confirm(`Delete shortcut "${key}"?`)) {
		return;
	}

	browser.storage.local.get("shortcuts").then((result) => {
		const shortcuts = result.shortcuts || {};
		delete shortcuts[key];

		browser.storage.local.set({ shortcuts }).then(() => {
			loadShortcuts();
		});
	});
}

document.getElementById("addBtn").addEventListener("click", addShortcut);

document.getElementById("newKey").addEventListener("keypress", (e) => {
	if (e.key === "Enter") addShortcut();
});

document.getElementById("newUrl").addEventListener("keypress", (e) => {
	if (e.key === "Enter") addShortcut();
});

loadShortcuts();
