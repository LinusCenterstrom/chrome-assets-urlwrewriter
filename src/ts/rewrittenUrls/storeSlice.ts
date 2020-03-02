import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RewrittenUrl } from "./types";

const rewrittenUrlSlice = createSlice({
	name: "settings",
	initialState: [] as RewrittenUrl[],
	reducers: {
		addRewrittenUrl: (state, action: PayloadAction<RewrittenUrl>) => {
			state.push(action.payload);
		},
		tabLoadingNewUrl: (state, action: PayloadAction<number>) => {
			return state.filter(s => s.tabId != action.payload);
		}
	}
});

export const { actions, caseReducers, reducer } = rewrittenUrlSlice;
