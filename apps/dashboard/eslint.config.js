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

export default [...react, ...storybook.configs['flat/recommended'], dashboardStorybookRouterRule]
