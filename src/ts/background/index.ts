import { createStore } from "../store";
import { actions } from "../rewrittenUrls/storeSlice";
import { groupBy } from "csharp-enumeration-functions";
import { loadPersistedAppState, configureApp } from "./AppConfig";
const persistedState = loadPersistedAppState();
const store = createStore(persistedState);
configureApp(store, {
	autosaveFrequencyMS: 15000
});
const MAIN_FRAME_ID = 0;

chrome.webNavigation.onCommitted.addListener(
	function(details) {
		if (details.frameId === MAIN_FRAME_ID) {
			store.dispatch(actions.tabLoadingNewUrl(details.tabId));
		}
	},
	{
		url: []
	}
);

//after triggering a redirect for a request
//that same request will go through the onBeforeRequest pipe again with the new URL.
//we will not process that since that risks us ending up in an inifinite loop.
const processedRequests = new Set<string>();

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		if (processedRequests.has(details.requestId)) {
			return undefined;
		}
		processedRequests.add(details.requestId);

		const { rewriteRules } = store.getState();
		const activeCompleteRules = rewriteRules.filter(
			x => x.from && x.to && x.active
		);
		const matchingRules = activeCompleteRules.filter(
			r => details.url.indexOf(r.from) > -1
		);

		if (matchingRules.length > 0) {
			let newUrl = details.url;
			matchingRules.forEach(rule => {
				newUrl = newUrl.replace(rule.from, rule.to);
			});
			store.dispatch(
				actions.addRewrittenUrl({
					from: details.url,
					to: newUrl,
					//todo fixi, multiple replaces can cause all rules to not apply
					ruleIds: matchingRules.map(r => r.id),
					tabId: details.tabId
				})
			);

			return {
				redirectUrl: newUrl
			};
		}

		return undefined;
	},
	{
		urls: ["<all_urls>"]
	},
	["blocking"]
);

let prevRewrittenRulesCount = new Map<number, number>();

store.subscribe(function() {
	const state = store.getState();
	const byTabId = groupBy(state.rewrittenUrls, r => r.tabId);

	for (let tabRewrites of byTabId) {
		const prev = prevRewrittenRulesCount.get(tabRewrites.key);
		const rewriteCount = tabRewrites.items.length;
		if (prev !== rewriteCount) {
			const rewriteText =
				rewriteCount < 1000 ? rewriteCount.toString() : `${rewriteCount}+`;
			chrome.browserAction.setBadgeText({
				text: rewriteText,
				tabId: tabRewrites.key
			});
		}
	}
});
