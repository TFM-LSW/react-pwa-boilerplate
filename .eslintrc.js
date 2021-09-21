module.exports = {
  extends: ['airbnb', 'airbnb-typescript'],
  parserOptions: {
    project: './src/tsconfig.json'
  },
  rules: {
    'no-console': 0,
    'react/jsx-curly-spacing': [1, 'always']
  }
}
