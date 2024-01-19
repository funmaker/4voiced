import path from 'path';

const root = process.cwd();

export const babelOptions = {
  presets: [
    ["@babel/preset-env", {
      targets: {
        browsers: "last 2 versions",
      },
    }],
    "@babel/preset-react",
  ],
  plugins: [
    ['@emotion', {
      importMap: {
        '@mui/material': {
          styled: {
            canonicalImport: ['@emotion/styled', 'default'],
            styledBaseImport: ['@mui/material', 'styled'],
          },
        },
      },
    }],
  ],
};

// noinspection JSUnusedGlobalSymbols
export default {
  target: 'web',
  context: root,
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
    modules: [root, 'node_modules'],
  },
  output: {
    path: path.join(root, 'dist'),
    filename: 'client.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$|\.tsx$/,
        exclude: /(node_modules)/,
        use: [
          {
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
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
        ],
      },
    ],
  },
};
