import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { merge } from "webpack-merge";
import StartServerPlugin from 'start-server-nestjs-webpack-plugin'; // https://github.com/ericclemmons/start-server-webpack-plugin/issues/40
import commons from "./server.commons.mjs";

const isWin = process.platform === "win32";

export default merge(commons, {
  mode: 'development',
  devtool: 'inline-source-map',
  externals: [nodeExternals({
    allowlist: [isWin ? 'webpack/hot/poll?1000' : 'webpack/hot/signal'],
  })],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new StartServerPlugin({
      name: commons.output.filename,
      signal: !isWin,
    }),
  ],
});
