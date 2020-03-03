import { UrlRewriteRule } from "./types";

export function applyRewriteRule(rule: UrlRewriteRule, url: string) {
	if (!rule.to || !rule.from) {
		return url;
	}

	try {
		let matchRegex;
		if (rule.regex) {
			matchRegex = new RegExp(rule.from);
		} else {
			matchRegex = new RegExp(escapeRegExp(rule.from), "g");
		}

		return url.replace(matchRegex, rule.to);
	} catch (err) {
		//todo log error
		return url;
	}
}

//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
function escapeRegExp(string: string) {
	return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
