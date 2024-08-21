const path = require("path");

module.exports = {
    mode: "development",
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: path.resolve(__dirname, 'dist', 'bundle.js'),
        filename: 'bundle.js',
    },
    resolve: {
        alias: {
            jquery: "jquery/src/jquery",
        },
    },
    module: {
        rules: [
            // CSS rules
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    devServer: {
        static: path.resolve(__dirname),
        port: 8080,
        hot: true,
    },
};
