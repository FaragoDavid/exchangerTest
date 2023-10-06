/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  setupFiles: ['dotenv/config'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  setupFilesAfterEnv: ['./src/test-setup.ts', 'jest-extended/all'],
  clearMocks: true,
};
