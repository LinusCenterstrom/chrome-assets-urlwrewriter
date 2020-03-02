import { Store, AppState } from "../store";
import { PersisitedAppState } from "../persistedAppState";

const appStateStorageKey = "app_state";

export function loadPersistedAppState(): PersisitedAppState | undefined {
	const state = localStorage.getItem(appStateStorageKey);
	if (!state) {
		return undefined;
	}
	try {
		const parsed = JSON.parse(state);
		return parsed;
	} catch (err) {
		return undefined;
	}
}
function saveAppState(state: AppState) {
	const { rewrittenUrls: _, ...toSave } = state;
	localStorage.setItem(appStateStorageKey, JSON.stringify(toSave));
}

const autoSaveAppState = (store: Store, autosaveFrequencyMS: number) => {
	chrome.tabs.onRemoved.addListener(() => saveAppState(store.getState()));
	chrome.windows.onRemoved.addListener(() => saveAppState(store.getState()));

	const saveFrequency = autosaveFrequencyMS;
	setInterval(() => saveAppState(store.getState()), saveFrequency);
};

export type AppOptions = {
	autosaveFrequencyMS: number;
};

export const configureApp = (store: Store, opts: AppOptions) => {
	autoSaveAppState(store, opts.autosaveFrequencyMS);
};
