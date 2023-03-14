/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  coverageProvider: "v8",
  testMatch:["**/*.test.ts"],
  roots:["<rootDir>/test"],
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },

  preset: "ts-jest",
};
