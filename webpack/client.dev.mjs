import webpack from 'webpack';
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { merge } from "webpack-merge";
import commons, { babelOptions } from "./client.commons.mjs";

babelOptions.plugins.unshift(require.resolve('react-refresh/babel'));

export default merge(commons, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './client.tsx',
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
});
