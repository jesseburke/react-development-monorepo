const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {   
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
	    },
	    {
		test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
		use: [
		    {
			loader: 'file-loader',
			options: {
			    name: '[name].[ext]',
			    outputPath: 'fonts/'
			}
		    }
		]
	    }
	]
    },

    plugins: [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
	    title: 'Direction Field Grapher',
	    meta: {viewport: 'width=device-width, user-scalable=no'}
	})
    ],
    output: {
	filename: '[name].bundle.js',
	path: path.resolve(__dirname, 'dist')
    }
};

