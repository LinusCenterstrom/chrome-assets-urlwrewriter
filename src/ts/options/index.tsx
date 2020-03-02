import * as React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Store } from "webext-redux";

const store = new Store();

store.ready().then(() => {
	ReactDOM.render(
		<Provider store={store}>
			<div>Hej</div>
		</Provider>,
		document.getElementById("options-root")
	);
});
