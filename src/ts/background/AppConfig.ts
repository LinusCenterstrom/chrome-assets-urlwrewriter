import { Store, AppState } from "../store";
import { PersisitedAppState } from "../persistedAppState";

const appStateStorageKey = "app_state_2";

export async function loadPersistedAppState(): Promise<
	PersisitedAppState | undefined
> {
	const state = await chrome.storage.sync.get(appStateStorageKey);
	if (!state) {
		return undefined;
	}
	try {
		const parsed = JSON.parse(state[appStateStorageKey]);
		return parsed;
	} catch (err) {
		return undefined;
	}
}
function saveAppState(state: AppState) {
	const { rewrittenUrls: _, ...toSave } = state;
	chrome.storage.sync.set({
		[appStateStorageKey]: JSON.stringify(toSave)
	});
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
