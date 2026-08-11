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

const dashboardEntitySurfaceImportGuard = {
  files: ['src/features/**/*.{ts,tsx}'],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    'src/features/content/lib/content-entity-card.client.tsx',
    'src/features/content/lib/entity/entity-summary.client.tsx',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/ui',
            importNames: ['ContentCardHeading'],
            message:
              'Entity identity must compose EntityItem, ContentEntityCard, or DisclosureEntityCard. ContentCardHeading is internal to the entity surface.',
          },
          {
            name: '@rpg/ui',
            importNames: ['ContentCardBody'],
            message:
              'Entity presentation must compose EntityItem, ContentEntityCard, or DisclosureEntityCard. ContentCardBody is internal to the entity surface.',
          },
        ],
      },
    ],
  },
}

const dashboardSheetImportGuard = {
  files: ['src/features/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/ui',
            importNames: ['Sheet'],
            message:
              'Use DrawerShell (or CatalogPickerSheet / BuilderOptionDetailsSheet). Raw Sheet chrome is reserved for DrawerShell. See apps/dashboard/docs/drawer-shell.md.',
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
  dashboardEntitySurfaceImportGuard,
  dashboardSheetImportGuard,
]
