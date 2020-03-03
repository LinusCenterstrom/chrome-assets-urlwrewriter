import { applyRewriteRule } from "./applyRewriteRule";
import { UrlRewriteRule } from "./types";

function getTestRule(
	settings: Omit<UrlRewriteRule, "id" | "active">
): UrlRewriteRule {
	return {
		id: 1,
		active: true,
		...settings
	};
}

test("simpleRewriteRule", () => {
	const url = "https://test.test.test";
	const rule = getTestRule({
		from: "test.test.test",
		to: "test2.test2.test2",
		regex: false
	});

	const rewrittenUrl = applyRewriteRule(rule, url);
	expect(rewrittenUrl).toBe("https://test2.test2.test2");
});

test("simpleRewriteRule2", () => {
	const url = "https://www.google.com";
	const rule = getTestRule({
		from: "https://www.google.com",
		to: "https://www.google.se",
		regex: false
	});

	const rewrittenUrl = applyRewriteRule(rule, url);
	expect(rewrittenUrl).toBe("https://www.google.se");
});

test("simpleRewriteRule3", () => {
	const url = "https://www.google.com?stuff=true";
	const rule = getTestRule({
		from: "?stuff=true",
		to: "?stuff=true&newStuff=true",
		regex: false
	});

	const rewrittenUrl = applyRewriteRule(rule, url);
	expect(rewrittenUrl).toBe("https://www.google.com?stuff=true&newStuff=true");
});

test("regexRewriteRule", () => {
	const url = "https://www.google.com?stuff=true";
	const rule = getTestRule({
		from: "(.*?)\\?stuff=true",
		to: "$1",
		regex: true
	});

	const rewrittenUrl = applyRewriteRule(rule, url);
	expect(rewrittenUrl).toBe("https://www.google.com");
});

test("regexRewriteRule2", () => {
	const url = "https://www.google.com?stuff=true";
	const rule = getTestRule({
		from: "(https?://www\\.)(.*?)\\?stuff=(.*)",
		to: "$3.$2",
		regex: true
	});

	const rewrittenUrl = applyRewriteRule(rule, url);
	expect(rewrittenUrl).toBe("true.google.com");
});

test("brokenRegexRewriteRule", () => {
	const url = "https://www.google.com?stuff=true";
	const rule = getTestRule({
		from: "(www.google.com",
		to: "www.google.se",
		regex: true
	});

	const rewrittenUrl = applyRewriteRule(rule, url);
	expect(rewrittenUrl).toBe("https://www.google.com?stuff=true");
});
