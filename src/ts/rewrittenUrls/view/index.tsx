import React from "react";
import { TabProvider } from "./TabProvider";
import { RewrittenPageRules } from "./RewrittenPageRules";

export const RewrittenUrlsView: React.FC = () => {
	return <TabProvider component={RewrittenPageRules} />;
};
