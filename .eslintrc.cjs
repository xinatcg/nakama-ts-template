module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['standard-with-typescript', 'prettier'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/strict-boolean-expressions': 'off', // let a = "" !a
    '@typescript-eslint/consistent-type-assertions': 'off', // let request = {} as RpcFindMatchRequest
  },
  ignorePatterns: [
    'jest-config.ts',
    'rollup.config.js',
    '.eslintrc.cjs',
    'build/**',
  ],
}
