/**
 * Shared ghost **visual-state** classes — rest/hover/active/open fills only.
 * Geometry, focus rings, and hit targets stay on each control (Button, FilterInlineControl, …).
 * Not used for Badge `appearance` or Select field-input chrome.
 */
export const ghostControlVisualStateClasses =
  'bg-transparent hover:bg-accent hover:text-accent-foreground active:bg-accent/80'

/** Borderless open treatment for disclosure triggers (`aria-expanded={true}`). */
export const ghostControlExpandedClasses =
  'aria-expanded:bg-accent aria-expanded:text-accent-foreground'

/**
 * Icon-ghost `hover: 'accent'` keeps `control-hover` intentionally — denser row chrome,
 * not the toolbar accent fill. Do not force icon ghosts onto {@link ghostControlVisualStateClasses}.
 */
export const ICON_GHOST_ACCENT_HOVER_NOTE =
  'iconGhostControlVariants hover:accent uses control-hover; Button/toolbar ghost uses accent fills'
