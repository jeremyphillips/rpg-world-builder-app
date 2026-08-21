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
    'src/features/character/components/builder/character-builder-shell.variants.ts',
    'src/features/character/components/builder/steps/abilities/score-token.variants.ts',
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
    'src/features/content/lib/entity/catalog/catalog-entity-picker-sheet.client.tsx',
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
    'src/features/character/components/builder/steps/abilities/score-token.variants.ts',
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

/** Form heading hierarchy — ban deprecated label and legend APIs in form field modules. */
const dashboardFormFieldGuards = {
  files: ['src/**/*-form-fields.ts', 'src/**/lib/**/*-form-fields.ts'],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Property[key.name="legendSize"]',
        message: 'legendSize was removed — nest named groups under a section for subsection scale.',
      },
      {
        selector: 'Property[key.name="hideLabel"]',
        message: 'Use labelVisibility: "srOnly" instead of hideLabel.',
      },
      {
        selector: 'Property[key.name="labelHidden"]',
        message: 'Use labelVisibility: "srOnly" instead of labelHidden.',
      },
      {
        selector:
          "ObjectExpression:has(> Property[key.name='kind'][value.value='group']) > Property[key.name='hint']",
        message: 'Group-level hint is ignored — use description or heading.hint.',
      },
      {
        selector: 'Property[key.name="label"][value.type="Literal"][value.value=""]',
        message:
          'Field labels must be non-whitespace — use labelVisibility: "srOnly" to hide visible copy.',
      },
      {
        selector:
          'Property[key.name="surface"][parent.parent.type="Property"][parent.parent.key.name="dependents"]',
        message: 'Use dependents.chrome: "panel" with panel.surface for dependent panel wash.',
      },
    ],
  },
}

const dashboardContentPickerPolicyGuards = {
  files: [
    'src/features/**/*picker*.{ts,tsx}',
    'src/features/**/*drawer*.{ts,tsx}',
    'src/features/content/locations/lib/hierarchy/location-*-field-options*.ts',
    'src/features/content/locations/lib/building-organizations/building-organizations-create-tab-controller.lib.ts',
    'src/features/content/locations/lib/hierarchy/location-parent-replacement.ts',
    'src/features/content/locations/lib/hierarchy/bulk/build-bulk-change-parent-fields.ts',
    'src/features/content/lib/relationship/location-connection/location-connection-drawer-intent.ts',
    'src/features/content/organizations/lib/members/organization-member-class-discoverable.lib.ts',
    'src/features/content/organizations/lib/members/organization-member-species-discoverable.lib.ts',
  ],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    'src/features/content/lib/form-options/content-form-options.ts',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/features/content/classes/hooks/use-classes',
            message:
              'Picker eligibility must use ctx.options.classes purpose selectors — not raw useClasses list queries.',
          },
          {
            name: '@/features/content/species/hooks/use-species',
            message:
              'Picker eligibility must use ctx.options.species purpose selectors — not raw useSpecies list queries.',
          },
          {
            name: '@/features/content/spells/hooks/use-spells',
            message:
              'Picker eligibility must use ctx.options.spells purpose selectors — not raw useSpells list queries.',
          },
          {
            name: '@/features/content/feats/hooks/use-feats',
            message:
              'Picker eligibility must use ctx.options.feats purpose selectors — not raw useFeats list queries.',
          },
          {
            name: '@/features/content/equipment/hooks/use-equipment',
            message:
              'Picker eligibility must use ctx.options.equipment purpose selectors — not raw useEquipment list queries.',
          },
          {
            name: '@/features/content/skill-proficiencies/hooks/use-skill-proficiencies',
            message:
              'Picker eligibility must use ctx.options.skills purpose selectors — not raw useSkillProficiencies list queries.',
          },
          {
            name: '@/features/content/locations/hooks/use-locations',
            message:
              'World-graph pickers must use forReference() or filterReferenceableCatalogRows — not raw useLocations as the selectable source.',
          },
          {
            name: '@/features/content/organizations/hooks/use-organizations',
            message:
              'World-graph pickers must use forReference() or filterReferenceableCatalogRows — not raw useOrganizations as the selectable source.',
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "BinaryExpression[operator='==='] > MemberExpression[property.name='status'][object.property.name='status'] + Literal[value='draft']",
        message:
          'Do not filter picker eligibility with status === "draft". Use isContentReferenceable or forReference().',
      },
      {
        selector:
          "BinaryExpression[operator='==='] > MemberExpression[property.name='status'][object.property.name='status'] + Literal[value='published']",
        message:
          'Do not filter picker eligibility with status === "published". Use isContentReferenceable or forReference().',
      },
    ],
  },
}

const dashboardCharacterBuilderPlayActorGuard = {
  files: ['src/features/character/**/*.{ts,tsx}'],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "Property[key.name='playActor'] > Identifier[name='undefined']",
        message:
          'Character builder context must always carry an explicit ContentPlayActor — do not set playActor to undefined.',
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
  dashboardFormFieldGuards,
  dashboardContentPickerPolicyGuards,
  dashboardCharacterBuilderPlayActorGuard,
]
