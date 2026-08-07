import react from '@rpg/config/eslint/react'
import storybook from 'eslint-plugin-storybook'

const dashboardStorybookRouterRule = {
  files: ['**/*.stories.tsx'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-router-dom',
            importNames: [
              'MemoryRouter',
              'BrowserRouter',
              'RouterProvider',
              'createBrowserRouter',
              'createMemoryRouter',
            ],
            message:
              'Dashboard Storybook preview already provides MemoryRouter. Do not nest routers in stories.',
          },
        ],
      },
    ],
  },
}

const dashboardContentCardBodyGuard = {
  files: ['src/features/content/**/*.{ts,tsx}'],
  ignores: ['**/*.{test,integration.test}.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/ui',
            importNames: ['ContentCardBody'],
            message:
              'Import ContentEntityCard instead of ContentCardBody. See apps/dashboard/docs/content-entity-card.md.',
          },
        ],
      },
    ],
  },
}

export default [
  ...react,
  ...storybook.configs['flat/recommended'],
  dashboardStorybookRouterRule,
  dashboardContentCardBodyGuard,
]
