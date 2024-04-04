/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    ".(ts|tsx)": ["ts-jest", {
      compiler: 'ts-patch/compiler'
    }]
  },
  setupFiles: [
    '<rootDir>jest-config.ts'
  ]
};

