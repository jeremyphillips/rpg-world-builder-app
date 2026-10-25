/**
 * Migrated semantic-control CVA modules — geometry lives in co-located `*.css`.
 * Variants map intent to `ui-*` modifiers only (no raw Tailwind height/padding/type/svg sizing).
 */
export const MIGRATED_SEMANTIC_CONTROL_VARIANT_FILES = [
  'packages/ui/src/components/ui/alert.variants.ts',
  'packages/ui/src/components/ui/badge.variants.ts',
  'packages/ui/src/components/ui/button.variants.ts',
  'packages/ui/src/components/ui/card.variants.ts',
  'packages/ui/src/components/ui/choice-control.variants.ts',
  'packages/ui/src/components/ui/compact-label.variants.ts',
  'packages/ui/src/components/ui/drag-handle.variants.ts',
  'packages/ui/src/components/ui/dropdown-menu-choice.variants.ts',
  'packages/ui/src/components/ui/empty-panel.variants.ts',
  'packages/ui/src/components/ui/field-control.variants.ts',
  'packages/ui/src/components/ui/field-input-chrome.variants.ts',
  'packages/ui/src/components/ui/floating-label-field.variants.ts',
  'packages/ui/src/components/ui/grouped-segment.variants.ts',
  'packages/ui/src/components/ui/icon-ghost-control.variants.ts',
  'packages/ui/src/components/ui/input-action-group.variants.ts',
  'packages/ui/src/components/ui/inset-panel.variants.ts',
  'packages/ui/src/components/ui/interactive-list.variants.ts',
  'packages/ui/src/components/ui/interactive-row.variants.ts',
  'packages/ui/src/components/ui/joined-pair-field.variants.ts',
  'packages/ui/src/components/ui/popover-content.variants.ts',
] as const

/** Raw geometry utilities forbidden in migrated variant modules. */
export const BANNED_SEMANTIC_CONTROL_GEOMETRY_PATTERNS: readonly RegExp[] = [
  /\bh-\d[\w.-]*/g,
  /\bpx-[\w.-]+/g,
  /\btext-(?:xs|sm|md|base)\b/g,
  /\[(?:&_svg|&>svg)\]:size-[\w.-]+/g,
]

export function stripTypeScriptComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

export function findBannedSemanticControlGeometry(source: string): string[] {
  const stripped = stripTypeScriptComments(source)
  const violations = new Set<string>()

  for (const pattern of BANNED_SEMANTIC_CONTROL_GEOMETRY_PATTERNS) {
    for (const match of stripped.matchAll(pattern)) {
      violations.add(match[0]!)
    }
  }

  return [...violations].sort()
}
