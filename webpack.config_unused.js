const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    //devtool: 'inline-source-map', // should comment this out for builds
    devServer: {
	contentBase: './dist'
    },
    module: {
	rules: [
	    {
		test: /\.css$/,
		use: [
		    'style-loader',
		    'css-loader'
		]
	    },
	    {
		test: /\.(js|jsx)$/,
		exclude: /node_modules/,
		use: {
		    loader: "babel-loader"
		}
	    }	    	  
	]
    },

    plugins: [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
	    title: 'Function Laboratory',
	    meta: {viewport: 'width=device-width, user-scalable=no'}
	})
    ],
    output: {
	filename: '[name].bundle.js',
	path: path.resolve(__dirname, 'dist')
    }
};

