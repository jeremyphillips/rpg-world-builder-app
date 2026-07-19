/**
 * Exact Tailwind utility strings permitted to use `/NN` opacity on semantic colors.
 * Every other `bg-muted/*`, `border-border/*`, status wash stack, etc. is banned —
 * see `alpha-utility-ban.test.ts`.
 */
export const ALLOWED_ALPHA_UTILITIES = new Set([
  // Solid control hover/active (Button)
  'hover:bg-primary/90',
  'active:bg-primary/90',
  'active:bg-primary/80',
  'hover:bg-destructive/90',
  'active:bg-destructive/90',
  'active:bg-destructive/80',
  'hover:bg-secondary/80',
  'active:bg-secondary/60',
  'active:bg-accent/80',
  'hover:text-primary/90',
  'active:text-primary/80',
  // Environmental / backdrop
  'bg-background/95',
  'hover:bg-background/60',
  // Segmented inactive segment hover
  // Primary border emphasis (selection chrome — not a wash ladder)
  'hover:border-primary/50',
  'border-primary/50',
  'data-[state=checked]:ring-primary/20',
  'ring-primary/20',
  'ring-primary/30',
  'ring-destructive/30',
  // Text on transparent controls
  'text-foreground/80',
])
