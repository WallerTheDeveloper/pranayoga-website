import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['seed/**', 'tests/**', 'scripts/**'],
    rules: { 'no-console': 'off' },
  },
  {
    ignores: [
      '.next/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '.claude/',
      'src/payload-types.ts',
      'src/app/(payload)/admin/importMap.js',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig
