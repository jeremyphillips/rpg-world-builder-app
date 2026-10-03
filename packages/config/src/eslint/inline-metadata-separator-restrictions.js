/**
 * Discourage hand-rolled middle-dot metadata separators in production TS/TSX.
 * Use joinInlineMetadata (strings) or <InlineMetadata> (JSX) instead.
 */

export const INLINE_METADATA_SEPARATOR_RESTRICTION_MESSAGE =
  'Use joinInlineMetadata (strings) or <InlineMetadata> (JSX).'

export const inlineMetadataSeparatorRestrictions = [
  {
    selector: 'Literal[value=/^\\s*·\\s*$/]',
    message: INLINE_METADATA_SEPARATOR_RESTRICTION_MESSAGE,
  },
  {
    selector: 'Literal[value=/^·\\s|\\s·$/]',
    message: INLINE_METADATA_SEPARATOR_RESTRICTION_MESSAGE,
  },
  {
    selector: 'TemplateElement[value.raw=/^\\s*·\\s|\\s·\\s*$/]',
    message: INLINE_METADATA_SEPARATOR_RESTRICTION_MESSAGE,
  },
  {
    selector: 'TemplateElement[value.raw=/ · /]',
    message: INLINE_METADATA_SEPARATOR_RESTRICTION_MESSAGE,
  },
  {
    selector: 'JSXText[value=/(^|\\s)·(\\s|$)/]',
    message: INLINE_METADATA_SEPARATOR_RESTRICTION_MESSAGE,
  },
]

/** File-level overrides for intentional non-metadata middle dots. */
export const inlineMetadataSeparatorAllowlist = [
  '**/inline-metadata.ts',
  '**/inline-metadata.tsx',
  '**/class-capacity-progression.ts',
  '**/spellcasting-progression/messages.ts',
  '**/equipment-starting-package-toolbar.tsx',
  '**/content-overview-utility-actions.tsx',
  '**/overview-result-summary-dot-separator.tsx',
  '**/media-emblem-editor.client.tsx',
  '**/in-page-section-nav.lib.ts',
  '**/color-palette.lib.ts',
  '**/color-palette-catalog.tsx',
  '**/array-field-chrome-stability.harness.client.tsx',
]

const productionTestIgnores = [
  '**/*.test.*',
  '**/*.stories.*',
  '**/*.fixtures.*',
  '**/__tests__/**',
  '**/__stories__/**',
]

/** Flat-config block for production TS/TSX (extends base / react stacks). */
export const inlineMetadataSeparatorProductionGuard = {
  files: ['**/*.{ts,tsx}'],
  ignores: [...productionTestIgnores, ...inlineMetadataSeparatorAllowlist],
  rules: {
    'no-restricted-syntax': ['error', ...inlineMetadataSeparatorRestrictions],
  },
}
