import webpack from 'webpack';
import path from "path";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { merge } from "webpack-merge";
import commons, { babelOptions } from "./client.commons.mjs";

babelOptions.plugins.unshift(require.resolve('react-refresh/babel'));
const root = process.cwd();

export default merge(commons, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.join(root, 'build', 'static'),
  },
  entry: [
    'webpack-hot-middleware/client',
    './client.tsx',
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
});
