import * as React from "react";
import { Dispatch } from "redux";
import { ThemeTypes } from "../../components/styles/themes";

interface IOptionsApp {
	theme: ThemeTypes;
	dispatch: Dispatch;
}

class OptionsApp extends React.Component<IOptionsApp> {
	render() {
		return null;
	}
}

export default OptionsApp;
