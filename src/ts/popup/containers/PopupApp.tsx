import * as React from "react";
import { RewriteRules } from "../../rewriteRules";
import "./PopupApp.scss";
import { RewrittenUrlsView } from "../../rewrittenUrls/view";
class PopupApp extends React.Component {
	render() {
		return (
			<div className="options-popup">
				<RewriteRules />
				<RewrittenUrlsView />
			</div>
		);
	}
}

export default PopupApp;
