import {
	configureStore,
	combineReducers,
	$CombinedState
} from "@reduxjs/toolkit";
import { reducer as rewriteRules } from "../rewriteRules/slice";
import { reducer as rewrittenUrls } from "../rewrittenUrls/storeSlice";
import { wrapStore } from "webext-redux";
import { PersisitedAppState } from "../persistedAppState";
import { useSelector as untypedUseSelector } from "react-redux";

export function createStore(initialState: PersisitedAppState | undefined) {
	const store = configureStore({
		reducer: combineReducers({
			rewriteRules,
			rewrittenUrls
		}),
		preloadedState: initialState && {
			...initialState
		}
	});
	wrapStore(store);
	return store;
}

export type Store = ReturnType<typeof createStore>;
export type AppState = Omit<
	ReturnType<Store["getState"]>,
	typeof $CombinedState
>;

type StoreSelector = {
	<TSelected = unknown>(
		selector: (state: AppState) => TSelected,
		equalityFn?: (left: TSelected, right: TSelected) => boolean
	): TSelected;
};

export const useSelector = untypedUseSelector as StoreSelector;
