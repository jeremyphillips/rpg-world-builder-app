import { buildingArchetypeAppQuarantine } from '@rpg/config/eslint/building-archetype-quarantine'
import { inlineMetadataSeparatorRestrictions } from '@rpg/config/eslint/inline-metadata-separator-restrictions'
import react from '@rpg/config/eslint/react'
import storybook from 'eslint-plugin-storybook'

const dashboardDatatableFilterRegionImportGuard = {
  files: [
    'src/lib/data-table/**/*.{ts,tsx}',
    'src/features/**/components/*overview*table*.{ts,tsx}',
    'src/features/admin/components/admin-users-overview-table.tsx',
  ],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    'src/lib/data-table/primary-filter-bar-region.tsx',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/ui',
            importNames: ['DataTableFilterRegion'],
            message:
              'Datatable table adapters compose DataTableFilterChrome only. PrimaryFilterPanel (primary-filter-bar-region.tsx) keeps DataTableFilterRegion for inbox/messages.',
          },
        ],
      },
    ],
  },
}

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
    'src/features/content/lib/entity/surfaces/cards/content/entity-card-static-renderer.tsx',
    'src/features/content/lib/entity/summary/entity-summary.client.tsx',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [],
      },
    ],
  },
}

const dashboardSheetImportGuard = {
  files: ['src/features/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    // Compact PreviewRail sheet hosts — same chrome contract as TabbedForm preview.
    'src/features/content/lib/forms/preview/content-preview-rail.tsx',
    'src/features/character/components/builder/preview/character-builder-preview-rail.tsx',
  ],
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
    'src/features/character/components/builder/steps/abilities/assignment/score-token.variants.ts',
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      ...inlineMetadataSeparatorRestrictions,
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

const dashboardPickerActionRowGuard = {
  files: ['src/**/*drawer*.{ts,tsx}', 'src/**/*picker*.{ts,tsx}'],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "JSXAttribute[name.name='className'][value.type='Literal'][value.value='flex justify-end']",
        message:
          'Ownership guard for copied picker action rows, not a general layout ban. Use dialogPanelActionRowClasses or the sheet/drawer footer slot.',
      },
      {
        selector:
          "JSXAttribute[name.name='className'][value.type='Literal'][value.value='flex justify-end gap-2']",
        message:
          'Ownership guard for copied picker action rows, not a general layout ban. Use dialogPanelActionRowClasses or the sheet/drawer footer slot.',
      },
    ],
  },
}

const dashboardEntityCatalogPickerImportGuard = {
  files: ['src/features/**/*picker*.{ts,tsx}', 'src/features/**/*drawer*.{ts,tsx}'],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    'src/features/content/lib/entity/surfaces/catalog/catalog-entity-picker-sheet.client.tsx',
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
    'src/features/character/components/builder/steps/abilities/assignment/score-token.variants.ts',
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      ...inlineMetadataSeparatorRestrictions,
      {
        selector: 'Literal[value=/cursor-grab/]',
        message:
          'Use dragHandleVariants from @rpg/ui for sortable grip chrome — see packages/ui/docs/semantic-style-layers.md.',
      },
    ],
  },
}

/** Form heading hierarchy — ban deprecated label and legend APIs in form field modules. */
const dashboardFormSlotGuards = {
  files: ['src/features/**/components/form/slots/**/*.{ts,tsx}'],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "JSXOpeningElement[name.name='input']",
        message:
          'Form slots must not use raw <input> — use @rpg/ui field primitives (CheckboxOption, SwitchField via config, etc.). Prefer FormItem[] over new slots; see apps/dashboard/docs/form-slot-register.md.',
      },
      {
        selector: "JSXOpeningElement[name.name='select']",
        message:
          'Form slots must not use raw <select> — use schema-driven select/combobox fields or @rpg/ui primitives.',
      },
      {
        selector: "JSXOpeningElement[name.name='textarea']",
        message:
          'Form slots must not use raw <textarea> — use schema-driven textarea fields or @rpg/ui primitives.',
      },
    ],
  },
}

const dashboardFormFieldGuards = {
  files: ['src/**/*-form-fields.ts', 'src/**/lib/**/*-form-fields.ts'],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      ...inlineMetadataSeparatorRestrictions,
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
        message: 'Group-level hint is ignored — use heading.hint.',
      },
      {
        selector:
          "ObjectExpression:has(> Property[key.name='kind'][value.value='group']) > Property[key.name='legend']",
        message: 'Use heading.label instead of legend on group configs.',
      },
      {
        selector:
          "ObjectExpression:has(> Property[key.name='kind'][value.value='group']) > Property[key.name='description']",
        message: 'Use heading.hint instead of description on group configs.',
      },
      {
        selector:
          "ObjectExpression:has(> Property[key.name='kind'][value.value='array']) > Property[key.name='label']",
        message: 'Use heading on named array configs instead of top-level label.',
      },
      {
        selector:
          "ObjectExpression:has(> Property[key.name='kind'][value.value='array']) > Property[key.name='hint']",
        message: 'Use heading.hint on named array configs.',
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
      ...inlineMetadataSeparatorRestrictions,
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

const dashboardContentCharacterPickerChromeGuard = {
  files: ['src/features/content/**/*.{ts,tsx}'],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '@/features/character/components/picker/**',
              '**/features/character/components/picker/**',
            ],
            message:
              'Catalog picker selection-action chrome lives in @rpg/ui. Import CatalogPickerSelectionActions, CatalogPickerActionButton, and resolveCatalogPickerRowActionPhase from @rpg/ui.',
          },
        ],
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
      ...inlineMetadataSeparatorRestrictions,
      {
        selector: "Property[key.name='playActor'] > Identifier[name='undefined']",
        message:
          'Character builder context must always carry an explicit ContentPlayActor — do not set playActor to undefined.',
      },
    ],
  },
}

const dashboardFastRefreshGuard = {
  files: ['src/**/*.tsx'],
  ignores: ['**/*.stories.tsx', '**/*.{test,integration.test}.tsx', 'src/stories/**'],
  rules: {
    'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
  },
}

const dashboardShellContractsImportGuard = {
  files: ['src/app/**/*.{ts,tsx}', 'src/components/layout/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/contracts',
            message:
              'Import @rpg/contracts/vocab, /shared, /runtime, /content, or another subpath. A root import invalidates this module on every contracts save.',
          },
        ],
      },
    ],
  },
}

const dashboardSourceExcerptImportGuard = {
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/catalog/source-excerpts',
            message:
              'Dashboard presentation must not import the source excerpt store. Catalog fields stay authoritative.',
          },
        ],
        patterns: [
          {
            group: ['**/source-excerpts/**', '**/source-excerpts'],
            message:
              'Dashboard presentation must not import the source excerpt store. Catalog fields stay authoritative.',
          },
        ],
      },
    ],
  },
}

const dashboardFacingPresentationImportGuard = {
  files: ['src/features/**/*.{ts,tsx}'],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    'src/features/content/facing/structured-facing-host-panel.tsx',
    'src/features/content/facing/facing-detail-body.tsx',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/ui',
            importNames: ['FacingHostPanel'],
            message:
              'Mount Rules Preview through StructuredFacingHostPanel / FacingDetailBody — features cannot import the host shell directly.',
          },
        ],
      },
    ],
  },
}

const dashboardTraitPipelineImportGuard = {
  files: ['src/**/*.{ts,tsx}'],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    'src/features/content/facing/domains/trait/**',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/contracts',
            importNames: ['formatLegendaryResistanceStatBlockTitle'],
            message:
              'Legendary Resistance headings are composed in trait facing adapters — do not call the heading helper directly.',
          },
        ],
        patterns: [
          {
            group: ['**/format-legendary-resistance*'],
            message:
              'Do not deep-import formatLegendaryResistanceStatBlockTitle in dashboard feature code.',
          },
        ],
      },
    ],
  },
}

const dashboardTraitComposerFormFieldImportGuard = {
  files: [
    'src/**/*-form-fields.ts',
    'src/**/lib/**/*-form-fields.ts',
    'src/features/content/lib/creature-traits/**/*.{ts,tsx}',
  ],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}', 'src/features/content/facing/**'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/contracts',
            importNames: [
              'formatLegendaryResistanceStatBlockTitle',
              'resolveTraitFacingParts',
              'renderTraitFacingBodyHtml',
            ],
            message:
              'Trait form modules use the field assembler and facing host — not the composer or heading helper.',
          },
        ],
        patterns: [
          {
            group: ['**/format-legendary-resistance*', '**/trait-facing*'],
            message:
              'Trait form modules must not deep-import trait facing composers or heading helpers.',
          },
        ],
      },
    ],
  },
}

const dashboardMonsterAcquisitionSectionKindsGuard = {
  files: ['src/features/content/monsters/lib/actions/acquisition/**/*.{ts,tsx}'],
  ignores: ['**/*.{test,integration.test,stories}.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/contracts',
            importNames: ['MONSTER_SECTION_KINDS'],
            message:
              'Use monsterSectionAllowsKind for menu and placement eligibility. MONSTER_SECTION_KINDS is schema-derived tuple metadata.',
          },
        ],
        patterns: [
          {
            group: ['**/section-tuples', '**/section-tuples.ts', '**/action/section-tuples*'],
            message:
              'Acquisition modules must use monsterSectionAllowsKind and eligibility helpers, not section schema tuples.',
          },
        ],
      },
    ],
  },
}

const dashboardSystemRulesetLiteralGuard = {
  files: ['src/**/*.{ts,tsx}'],
  ignores: [
    '**/*.{test,integration.test,stories}.{ts,tsx}',
    '**/fixtures/**',
    '**/*.fixtures.ts',
    '**/*.fixtures.tsx',
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value='srd-cc-5.2.1']",
        message:
          'Import DEFAULT_SYSTEM_RULESET_ID from @rpg/contracts for the system default identity — do not inline the ruleset literal in production code.',
      },
    ],
  },
}

const dashboardAuthApiContractsImportGuard = {
  files: ['src/features/auth/api/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@rpg/contracts',
            message:
              'Import @rpg/contracts/vocab, /shared, /runtime, /content, or another subpath. A root import invalidates this module on every contracts save.',
          },
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

export default [
  ...react,
  ...storybook.configs['flat/recommended'],
  buildingArchetypeAppQuarantine,
  dashboardSourceExcerptImportGuard,
  dashboardDatatableFilterRegionImportGuard,
  dashboardStorybookRouterRule,
  dashboardEntitySurfaceImportGuard,
  dashboardSheetImportGuard,
  dashboardEntityCatalogPickerImportGuard,
  dashboardPickerActionRowGuard,
  dashboardSemanticStyleLayerGuards,
  dashboardDragHandleGuard,
  dashboardFormFieldGuards,
  dashboardFormSlotGuards,
  dashboardContentPickerPolicyGuards,
  dashboardContentCharacterPickerChromeGuard,
  dashboardCharacterBuilderPlayActorGuard,
  dashboardFastRefreshGuard,
  dashboardShellContractsImportGuard,
  dashboardAuthApiContractsImportGuard,
  dashboardSystemRulesetLiteralGuard,
  dashboardMonsterAcquisitionSectionKindsGuard,
  dashboardFacingPresentationImportGuard,
  dashboardTraitPipelineImportGuard,
  dashboardTraitComposerFormFieldImportGuard,
]
