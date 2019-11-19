const webpack = require("webpack");
const path = require("path");

module.exports = function(env) {
	return {
		target: "web",
		entry: ["regenerator-runtime/runtime", "./src/js/index.js"],
		output: {
			path: path.resolve(__dirname, `dist/`),
			filename: "js/bundle.js"
		},
		devServer: {
			contentBase: `./dist/`
		},
		optimization: {
			minimize: true
		},
		module: {
			rules: [
				{
					test: /\.js$/, 
					exclude: /node_modules/,
					loader: "babel-loader",
				},
				{
	                test: /\.(s*)css$/,
	                use: ["style-loader","css-loader", "sass-loader"]
				},
				{
					test: /\.svg$/,
					loader: "svg-inline-loader"
				},
			    {
			        test: /\.(png|jpg|gif)$/,
		            loader: "file-loader",
		            options: {
					    outputPath: "../../../images/"
				  	}
		      	},
		      	{
				    test: /\.mp3$/,
				    loader: "file-loader",
				    options: {
					    outputPath: "audio/"
				  	}
				}
			]
		},
		resolve: {
			extensions: [".js", ".jsx"]
		}
	};
};
