const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const locateContentScripts = require("./utils/locateContentScripts");

const sourceRootPath = path.join(__dirname, "src");
const contentScriptsPath = path.join(sourceRootPath, "ts", "contentScripts");
const distRootPath = path.join(__dirname, "dist");
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const webBrowser = process.env.WEB_BROWSER ? process.env.WEB_BROWSER : "chrome";
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const contentScripts = locateContentScripts(contentScriptsPath);

const extensionReloader =
	nodeEnv === "watch"
		? new ExtensionReloader({
				port: 9128,
				reloadPage: true,
				entries: {
					background: "background",
					extensionPage: ["popup", "options"],
					contentScript: Object.keys(contentScripts)
				}
		  })
		: () => {
				this.apply = () => {};
		  };

const cleanWebpackPlugin =
	nodeEnv === "production"
		? new CleanWebpackPlugin()
		: () => {
				this.apply = () => {};
		  };
module.exports = {
	watch: nodeEnv === "watch",
	entry: {
		background: path.join(sourceRootPath, "ts", "background", "index.ts"),
		options: path.join(sourceRootPath, "ts", "options", "index.tsx"),
		popup: path.join(sourceRootPath, "ts", "popup", "index.tsx"),
		...contentScripts
	},
	output: {
		path: distRootPath,
		filename: "[name].js"
	},
	resolve: {
		extensions: [".js", ".ts", ".tsx", ".json"]
	},
	module: {
		rules: [
			{
				test: /\.(js|ts|tsx)?$/,
				loader: "babel-loader",
				exclude: /node_modules/,
				options: {
					cacheDirectory: true,
					babelrc: false,
					presets: ["@babel/preset-typescript", "@babel/preset-react"],
					plugins: [
						"transform-react-jsx",
						"@babel/plugin-proposal-class-properties",
						[
							"@babel/transform-runtime",
							{
								regenerator: true
							}
						],
						[
							"import",
							{
								libraryName: "antd",
								style: true // or 'css'
							}
						]
					]
				}
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							hmr: nodeEnv === "development"
						}
					},
					"css-loader",
					"sass-loader"
				]
			},
			{
				test: /\.less$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							hmr: nodeEnv === "development"
						}
					},
					"css-loader",
					{
						loader: "less-loader",
						options: {
							javascriptEnabled: true
						}
					}
				]
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			template: path.join(sourceRootPath, "html", "options.html"),
			inject: "body",
			filename: "options.html",
			title: "Assets Url Rewriter - Options Page",
			chunks: ["options"]
		}),
		new HtmlWebpackPlugin({
			template: path.join(sourceRootPath, "html", "popup.html"),
			inject: "body",
			filename: "popup.html",
			title: "Assets Url Rewriter - Popup Page",
			chunks: ["popup"]
		}),
		new CopyWebpackPlugin([
			{
				from: path.join(sourceRootPath, "assets"),
				to: path.join(distRootPath, "assets"),
				test: /\.(jpg|jpeg|png|gif|svg)?$/
			},
			{
				from: path.join(sourceRootPath, "manifest.json"),
				to: path.join(distRootPath, "manifest.json"),
				toType: "file"
			}
		]),
		new ForkTsCheckerWebpackPlugin(),
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify(
				nodeEnv === "production" ? "production" : "development"
			),
			WEB_BROWSER: JSON.stringify(webBrowser),
			"process.env.NODE_ENV": JSON.stringify(
				nodeEnv === "production" ? "production" : "development"
			)
		}),
		extensionReloader,
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: ["**/*", "!manifest.json"],
			cleanStaleWebpackAssets: false
		})
	]
};
