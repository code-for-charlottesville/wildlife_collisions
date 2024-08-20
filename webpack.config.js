const path = require("path");

module.exports = {
    entry: {
        login: {
            import: './src/js/login.js',
            filename: 'login.js',
        },
        form: {
                import: './src/js/main.js',
                filename: 'bundle.js'
            }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: path.resolve(__dirname, 'dist', 'bundle.js'),
    },
    module: {
        rules: [
            // CSS rules
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    }
};