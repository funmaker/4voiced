import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { merge } from "webpack-merge";
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin'; // https://github.com/ericclemmons/start-server-webpack-plugin/issues/40
import commons from "./server.commons.mjs";
import path from "path";

const isWin = process.platform === "win32";
const root = process.cwd();

export default merge(commons, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.join(root, 'build'),
  },
  entry: [
    isWin ? './node_modules/webpack/hot/poll?1000' : './node_modules/webpack/hot/signal.js',
    './server.ts',
  ],
  watch: true,
  externals: [nodeExternals({
    allowlist: [isWin ? 'webpack/hot/poll?1000' : 'webpack/hot/signal'],
  })],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new RunScriptWebpackPlugin({
      name: commons.output.filename,
      signal: !isWin,
      autoRestart: false,
    }),
  ],
});
