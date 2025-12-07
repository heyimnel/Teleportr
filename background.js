browser.storage.local.get("shortcuts").then((result) => {
	if (!result.shortcuts) {
		console.log("Teleportr: Initializing default shortcuts");
		browser.storage.local.set({ shortcuts: defaultShortcuts });
	} else {
		console.log(
			"Teleportr: Shortcuts loaded:",
			Object.keys(result.shortcuts).length,
			"shortcuts",
		);
	}
});

browser.webRequest.onBeforeRequest.addListener(
	(details) => {
		const url = new URL(details.url);

		let query = null;

		const queryParams = ["q", "query", "search", "s", "text"];

		for (const param of queryParams) {
			if (url.searchParams.has(param)) {
				query = url.searchParams.get(param);
				break;
			}
		}

		if (query) {
			const cleanQuery = query.trim().toLowerCase();

			return browser.storage.local.get("shortcuts").then((result) => {
				const userShortcuts = result.shortcuts || defaultShortcuts;

				const shortcut = userShortcuts[cleanQuery];
				if (shortcut) {
					const url = typeof shortcut === 'string' ? shortcut : shortcut.url;
					return { redirectUrl: url };
				}
				return {};
			});
		}

		return {};
	},
	{
		urls: ["<all_urls>"],
	},
	["blocking"],
);
