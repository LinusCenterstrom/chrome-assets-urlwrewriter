import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UrlRewriteRule } from "./types";

const settingsSlice = createSlice({
	name: "settings",
	initialState: [] as UrlRewriteRule[],
	reducers: {
		add: (state, action: PayloadAction<Omit<UrlRewriteRule, "id">>) => {
			const id = getMaxId(state) + 1;
			state.push({
				...action.payload,
				id
			});
		},
		delete: (state, action: PayloadAction<number>) => {
			state.splice(
				state.findIndex(rule => rule.id === action.payload),
				1
			);
		},
		toggleActive: (state, action: PayloadAction<number>) => {
			const toUpdate = state.find(r => r.id === action.payload);
			if (toUpdate) {
				toUpdate.active = !toUpdate.active;
			}
		},
		update: (
			state,
			action: PayloadAction<{
				from: string | undefined;
				to: string | undefined;
				id: number;
			}>
		) => {
			const toUpdate = state.find(r => r.id === action.payload.id);
			if (toUpdate) {
				if (action.payload.from !== undefined) {
					toUpdate.from = action.payload.from;
				}
				if (action.payload.to !== undefined) {
					toUpdate.to = action.payload.to;
				}
			}
		}
	}
});

export const { actions, caseReducers, reducer } = settingsSlice;

function getMaxId(rules: UrlRewriteRule[]) {
	let maxId = 0;
	for (let rule of rules) {
		if (rule.id > maxId) {
			maxId = rule.id;
		}
	}
	return maxId;
}
