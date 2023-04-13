import { createStore } from "../store";
import { actions } from "../rewrittenUrls/storeSlice";
import { groupBy } from "csharp-enumeration-functions";
import { loadPersistedAppState, configureApp } from "./AppConfig";
import { UrlRewriteRule } from "../rewriteRules/types";

function areEqual(
	a: UrlRewriteRule | null | undefined,
	b: UrlRewriteRule | null | undefined
) {
	//todo fixa
	return false;
	if (a == null && b == null) {
		return true;
	}
	if (a == null || b == null) {
		return false;
	}

	return JSON.stringify(a) == JSON.stringify(b);
}

function isEmptyOrDisabledRule(rule: UrlRewriteRule) {
	if (!rule.active) {
		return true;
	}
	return rule.fromHost == "" || rule.toHost == "";
}

function getChromeRuleIds(ruleId: number) {
	const rootRuleId = ruleId * 10;
	const headerRuleId = rootRuleId + 1;
	return {
		rootRuleId,
		headerRuleId,
		allRuleIds: [rootRuleId, headerRuleId]
	};
}

function createDynamicRuleProcessor() {
	let prevRules: UrlRewriteRule[] = [];
	chrome.webRequest.onCompleted;

	function applyRules(rewriteRules: UrlRewriteRule[]) {
		for (const rule of rewriteRules) {
			const cached = prevRules.find((x) => x.id == rule.id);
			if (areEqual(cached, rule)) {
				continue;
			}
			const { headerRuleId, rootRuleId, allRuleIds } = getChromeRuleIds(
				rule.id
			);

			if (isEmptyOrDisabledRule(rule)) {
				chrome.declarativeNetRequest.updateDynamicRules({
					removeRuleIds: allRuleIds
				});
				continue;
			}

			chrome.declarativeNetRequest.updateDynamicRules({
				addRules: [
					{
						id: rootRuleId,
						priority: 1,
						action: {
							type: "redirect" as any,
							redirect: {
								transform: {
									host: rule.toHost
								}
							}
						},
						condition: {
							requestDomains: [rule.fromHost]
						}
					},
					{
						id: headerRuleId,
						priority: 1,
						action: {
							type: "modifyHeaders" as any,
							responseHeaders: [
								{
									header: "Access-Control-Allow-Origin",
									value: "*",
									operation: "set" as any
								}
							]
						},
						condition: {
							requestDomains: [rule.toHost]
						}
					}
				],
				removeRuleIds: allRuleIds
			});
		}

		const toRemove = prevRules.filter(
			(x) => !rewriteRules.some((y) => y.id == x.id)
		);
		if (toRemove.length > 0) {
			const removeIds: number[] = [];
			for (const rule of toRemove) {
				const { allRuleIds } = getChromeRuleIds(rule.id);
				removeIds.push(...allRuleIds);
			}
			chrome.declarativeNetRequest.updateDynamicRules({
				removeRuleIds: removeIds
			});
		}
		prevRules = rewriteRules;
	}

	return applyRules;
}

async function loadAsync() {
	const persistedState = await loadPersistedAppState();
	const store = createStore(persistedState);
	configureApp(store, {
		autosaveFrequencyMS: 15000
	});
	const MAIN_FRAME_ID = 0;

	chrome.webNavigation.onCommitted.addListener(
		function (details) {
			if (details.frameId === MAIN_FRAME_ID) {
				store.dispatch(actions.tabLoadingNewUrl(details.tabId));
			}
		},
		{
			url: []
		}
	);

	const rulesProcessor = createDynamicRuleProcessor();
	rulesProcessor(store.getState().rewriteRules);
	store.subscribe(() => {
		const state = store.getState();
		rulesProcessor(state.rewriteRules);
	});

	chrome.webRequest.onBeforeRedirect.addListener(
		function (details) {
			if (details.statusCode == 307 && details.responseHeaders) {
				const reasonHeader = details.responseHeaders.find(
					(x) => x.name == "Non-Authoritative-Reason"
				);
				const locationHeader = details.responseHeaders.find(
					(x) => x.name == "Location"
				);
				if (
					reasonHeader &&
					reasonHeader.value == "WebRequest API" &&
					locationHeader &&
					locationHeader.value
				) {
					const state = store.getState();
					const parsedFrom = new URL(details.url);
					const parsedTo = new URL(locationHeader.value);

					const rule = state.rewriteRules.find(
						(x) =>
							x.fromHost == parsedFrom.host &&
							x.toHost == parsedTo.host
					);
					if (rule) {
						store.dispatch(
							actions.addRewrittenUrl({
								tabId: details.tabId,
								from: details.url,
								to: locationHeader.value,
								ruleIds: [rule.id]
							})
						);
					}
				}
			}
		},
		{
			urls: ["<all_urls>"]
		},
		["responseHeaders"]
	);

	let prevRewrittenRulesCount = new Map<number, number>();

	store.subscribe(function () {
		const state = store.getState();
		const byTabId = groupBy(state.rewrittenUrls, (r) => r.tabId);

		for (let tabRewrites of byTabId) {
			const prev = prevRewrittenRulesCount.get(tabRewrites.key);
			const rewriteCount = tabRewrites.items.length;
			if (prev !== rewriteCount) {
				const rewriteText =
					rewriteCount < 1000
						? rewriteCount.toString()
						: `${rewriteCount}+`;
				chrome.action.setBadgeText({
					text: rewriteText,
					tabId: tabRewrites.key
				});
			}
		}
	});
}
loadAsync();
