const sls = require('serverless-webpack')

module.exports = {
    entry: sls.lib.entries,
    mode: 'development',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/preset-env"
                        ]
                    }
                }
            }
        ]
    }
}