import React, { useState } from "react";
import { useSelector } from "../../store";
import { List, Typography } from "antd";
import "./RewrittenPageRules.scss";

export const RewrittenPageRules: React.FC<{
	tabId: number;
}> = ({ tabId }) => {
	const hasActiveRules = useSelector(store =>
		store.rewriteRules.some(rule => rule.active)
	);
	const rewrites = useSelector(store =>
		store.rewrittenUrls.filter(rewrite => rewrite.tabId == tabId)
	);
	const [maxVisible] = useState<number | null>(10);

	if (!hasActiveRules && !rewrites.length) {
		return null;
	}

	const visibleRewrites = maxVisible ? rewrites.slice(0, maxVisible) : rewrites;

	return (
		<List
			className="rewritten-rules-list"
			header={
				<div>Rewritten urls for the current page ({rewrites.length})</div>
			}
			dataSource={visibleRewrites.reverse()}
			size="small"
			renderItem={item => (
				<List.Item className="rewritten-rules-listitem">
					<div>
						<Typography.Text delete>{item.from}</Typography.Text>
					</div>
					<Typography.Text mark>{item.to}</Typography.Text>
				</List.Item>
			)}
		></List>
	);
};
