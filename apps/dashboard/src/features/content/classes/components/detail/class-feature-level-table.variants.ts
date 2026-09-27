/** Read-only feature table — full-bleed row dividers, no row hover. */
export const classFeatureLevelTableClasses =
  '[&_tbody_tr]:border-b [&_tbody_tr]:border-border-subtle [&_tbody_tr]:hover:bg-transparent [&_tbody_tr:last-child]:border-b'

/** Override @rpg/ui TableBody last-row border removal so level-group separators stay full bleed. */
export const classFeatureLevelTableBodyClasses =
  '[&_tr:last-child]:border-b [&_tr:last-child]:border-border-subtle'

export const classFeatureLevelTableRowClasses = 'border-border-subtle hover:bg-transparent'

export const classFeatureLevelTableLevelCellClasses =
  'w-20 border-r border-border-subtle align-top font-medium text-foreground'

export const classFeatureLevelTableContentCellClasses = 'align-top'

export const classFeatureLevelTableFeatureBlockClasses = 'space-y-2 py-1'
