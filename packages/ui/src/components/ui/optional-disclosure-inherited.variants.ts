/** 15px optional-disclosure inherited copy — label/summary prefix and value segments. */
export const optionalDisclosureInheritedTypeScale =
  'text-[length:var(--text-md)] leading-[var(--text-md--line-height)]'

export const optionalDisclosureInheritedLeadingVariants = [
  optionalDisclosureInheritedTypeScale,
  'text-muted-foreground font-normal',
].join(' ')

export const optionalDisclosureInheritedValueVariants = [
  optionalDisclosureInheritedTypeScale,
  'text-foreground font-normal',
].join(' ')
