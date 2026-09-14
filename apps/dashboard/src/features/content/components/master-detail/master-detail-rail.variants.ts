/** Shared border color for master-detail rail shells and internal separators. */
export const masterDetailRailBorderClasses = 'border-border-subtle'

/** List row separators — same token as the rail shell (`border-t`, not `divide-y`). */
export const masterDetailRailRowSeparatorClasses =
  '[&>li+li]:border-t [&>li+li]:border-border-subtle'
