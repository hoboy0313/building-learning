module.exports = {
    extends: [
        '@ecomfe/eslint-config/strict',
        '@ecomfe/eslint-config/typescript/strict',
        '@ecomfe/eslint-config/import/strict',
        '@ecomfe/eslint-config/react/strict',
    ],

    parserOptions: {
        babelOptions: {
            plugins: [
                '@babel/plugin-syntax-import-assertions',
            ],
        },
    },

    rules: {
        '@typescript-eslint/no-floating-promises': 'off',
        'consistent-return': 'off',
        'react/jsx-no-bind': 'off',
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/no-named-as-default': 'off',
        'no-param-reassign': 'off',
        'import/extensions': [
            'error',
            'never',
            {
                scss: 'always',
                css: 'always',
                json: 'always',
                png: 'always',
                mjs: 'always',
            },
        ],
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                    'object',
                    'type',
                ],
            },
        ],
    },

    // 针对配置类型文件禁用
    overrides: [
        {
            files: ['*.cjs', '*.js', '*.d.ts'],
            rules: {
                'import/unambiguous': 'off',
                'import/no-commonjs': 'off',
            },
        },
    ],

    ignorePatterns: [
        'node_modules',
        '**/lib/**/*.ts',
        '**/lib/**/*.tsx',
        '**/es/**/*.ts',
        '**/es/**/*.tsx',
        '**/lib/**/*.js',
        '**/es/**/*.js',
        '*.json',
        'demos/**/*.*',
    ],
};
