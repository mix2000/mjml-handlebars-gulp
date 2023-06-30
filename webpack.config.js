import * as path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {fileURLToPath} from 'url';
import {dirname, join} from "path";
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mjmlRules = {
    test: /\.mjml$/,
    use: [
        {
            loader: 'webpack-mjml-loader',
            options: { /* any mjml options */ minify: true} // optional, you can omit options
        }
    ]
};

export default function (_, argv) {
    const production = !!argv.mode;

    return {
        mode: production ? 'production' : 'development',
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        module: {
            rules: [mjmlRules],
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            historyApiFallback: true,
            hot: true,
            open: true,
            port: 9000,
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/Template/index.mjml',
            }),
            new CopyWebpackPlugin({
                patterns: [
                    /* Копирование изображений. */
                    {
                        from: join(path.resolve(__dirname, 'src'), 'Assets/Images'),
                        to: join(path.resolve(__dirname, 'dist'), 'Images'),
                    }],
            })
        ],
    }
};
