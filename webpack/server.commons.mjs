import path from 'path';
import nodeExternals from 'webpack-node-externals';

const root = process.cwd();

export const babelOptions = {
  presets: [
    ["@babel/preset-env", {
      targets: {
        node: "current",
      },
    }],
    "@babel/preset-react",
  ],
  plugins: [
    ['@emotion'],
  ],
};

// noinspection JSUnusedGlobalSymbols
export default {
  target: 'async-node',
  context: root,
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [root, 'node_modules'],
  },
  output: {
    path: path.join(root, 'dist'),
    filename: 'server.js',
    chunkFilename: '[contenthash].server.js',
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$|\.tsx$/,
        exclude: /(node_modules)/,
        use: [{
            loader: 'babel-loader',
            options: babelOptions,
          }, {
            loader: 'ts-loader',
          },
        ],
      }, {
        test: /\.js$|\.jsx$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: babelOptions,
      }, {
        test: /\.handlebars$/,
        loader: 'handlebars-loader',
      }, {
        test: /\.css$/,
        use: 'ignore-loader',
      }, {
        test: /\.sql$/i,
        use: 'raw-loader',
      },
    ],
  },
};
