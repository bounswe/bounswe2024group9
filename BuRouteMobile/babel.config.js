module.exports = {
  presets: ['module:@react-native/babel-preset',
            ['@babel/preset-env', {targets: {node: 'current'}}],
            '@babel/preset-typescript'
  ],
  plugins: ['@babel/plugin-transform-react-jsx'],
};
