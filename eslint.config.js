const js = require("@eslint/js");
const globals = require("globals");
const pluginJest = require('eslint-plugin-jest');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
    { ignores: [".vscode-test/*"] },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.jest,
                ...globals.mocha,
            },
        },
        ...js.configs.recommended,
    },
    {
        // update this to match your test files
        files: ['src/**/*.spec.js', 'src/**/*.test.js'],
        plugins: { jest: pluginJest },
        languageOptions: {
            globals: pluginJest.environments.globals.globals,
        },
        rules: {
            'jest/no-disabled-tests': 'warn',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/prefer-to-have-length': 'warn',
            'jest/valid-expect': 'error',
        },
    },
    eslintPluginPrettierRecommended,
];