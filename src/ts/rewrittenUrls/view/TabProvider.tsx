import React, { useState, useEffect } from "react";
import { Spin } from "antd";

export const TabProvider: React.FC<{
	component: React.ComponentType<{
		tabId: number;
	}>;
}> = ({ component: Component }) => {
	const [tabId, setTabId] = useState<number | null>(null);

	useEffect(() => {
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true
			},
			tabs => {
				if (tabs.length > 0) {
					setTabId(tabs[0].id!);
				}
			}
		);
	}, []);

	if (!tabId) {
		return <Spin />;
	}

	return <Component tabId={tabId} />;
};
