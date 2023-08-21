/**
 * @type {import('webpack').Configuration}
 */
export default {
    module: {
        rules: [
            {
                test: /\.(?:ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    'replace-extension-loader', // 自实现 loader
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
        ],
    },
};
