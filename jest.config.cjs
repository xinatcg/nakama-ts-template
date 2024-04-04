/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      compiler: 'ts-patch/compiler'
    }
  },
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  setupFiles: [
    '<rootDir>jest-config.ts'
  ]
};

