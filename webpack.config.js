const path = require("path");

module.exports = {
    mode: "development",
    entry: {
        app: './src/js/main.js',
        style: './src/js/bootstrap.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: "./dist/",
        filename: '[name].js',
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
