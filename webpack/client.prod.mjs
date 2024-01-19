import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { merge } from "webpack-merge";
import commons from "./client.commons.mjs";

// noinspection JSUnusedGlobalSymbols
export default merge(commons, {
  mode: 'production',
  devtool: 'source-map',
  entry: './client.tsx',
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
  ],
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            url: false,
          },
        },
      ],
    }],
  },
});
