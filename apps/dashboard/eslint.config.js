import { buildingArchetypeAppQuarantine } from '@rpg/config/eslint/building-archetype-quarantine'
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
        patterns: [
          {
            group: ['**/control-action.variants', '@rpg/ui/**/control-action*'],
            message:
              'Use Button, iconGhostControlVariants, or shared primitives — not internal control-action geometry.',
          },
        ],
      },
    ],
  },
}

/** Semantic style layer guards — see packages/ui/docs/semantic-style-layers.md */
const dashboardSemanticStyleLayerGuards = {
  files: ['src/features/**/*.variants.ts'],
  ignores: [
    '**/*.{test,integration.test,stories}.ts',
    // Host navigation accent — row hover stays local (F9); focus migrated (F6).
    'src/features/character/components/character-builder-shell.variants.ts',
    'src/features/character/components/steps/score-token.variants.ts',
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/hover:bg-row-(hover|selected)/]',
        message:
          'Use interactiveRowVariants from @rpg/ui for row hover/selection fills — see packages/ui/docs/semantic-style-layers.md.',
      },
      {
        selector: 'TemplateElement[value.raw=/hover:bg-row-(hover|selected)/]',
        message:
          'Use interactiveRowVariants from @rpg/ui for row hover/selection fills — see packages/ui/docs/semantic-style-layers.md.',
      },
      {
        selector: 'Literal[value=/border-row-selected-border/]',
        message:
          'Use interactiveRowVariants from @rpg/ui for row selection chrome — see packages/ui/docs/semantic-style-layers.md.',
      },
      {
        selector: 'Literal[value=/focus-visible:ring-2/]',
        message:
          'Compose interactiveFocusVariants from @rpg/ui — features do not assemble focus ring stacks.',
      },
      {
        selector: 'TemplateElement[value.raw=/focus-visible:ring-2/]',
        message:
          'Compose interactiveFocusVariants from @rpg/ui — features do not assemble focus ring stacks.',
      },
      {
        selector: 'VariableDeclarator[id.name=/RemoveButtonClasses$/]',
        message:
          'Use Button or iconGhostControlVariants — do not add feature remove button class constants.',
      },
      {
        selector:
          'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name=/RemoveButtonClasses$/]',
        message:
          'Use Button or iconGhostControlVariants — do not add feature remove button class constants.',
      },
    ],
  },
}

const dashboardEntityCatalogPickerImportGuard = {
  files: ['src/features/**/*picker*.{ts,tsx}', 'src/features/**/*drawer*.{ts,tsx}'],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    'src/features/content/lib/entity/catalog-entity-picker-sheet.client.tsx',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/ui',
            importNames: ['CatalogPickerSheet'],
            message:
              'Entity-backed catalog pickers must use CatalogEntityPickerSheet from @/features/content. Raw CatalogPickerSheet is for generic/non-entity catalogs only.',
          },
        ],
      },
    ],
  },
}

const dashboardDragHandleGuard = {
  files: ['src/features/**/*.variants.ts'],
  ignores: [
    '**/*.{test,integration.test,stories}.ts',
    'src/features/character/components/steps/score-token.variants.ts',
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/cursor-grab/]',
        message:
          'Use dragHandleVariants from @rpg/ui for sortable grip chrome — see packages/ui/docs/semantic-style-layers.md.',
      },
    ],
  },
}

export default [
  ...react,
  ...storybook.configs['flat/recommended'],
  buildingArchetypeAppQuarantine,
  dashboardStorybookRouterRule,
  dashboardEntitySurfaceImportGuard,
  dashboardSheetImportGuard,
  dashboardEntityCatalogPickerImportGuard,
  dashboardSemanticStyleLayerGuards,
  dashboardDragHandleGuard,
]
