import { fieldAnatomyStackClasses } from './field.variants'

/** @deprecated Prefer {@link fieldAnatomyStackVariants} with the field `size` in the component. */
export const optionalFieldDisclosureStackClasses = fieldAnatomyStackClasses

/** Label + remove action row when the optional field is expanded. */
export const optionalFieldDisclosureHeaderClasses = 'flex items-center justify-between gap-2'

/** Compact text action buttons (add / remove) — no fixed height or fill hover. */
export const optionalFieldDisclosureActionButtonClasses =
  'h-auto min-h-0 shrink-0 px-0 py-0 font-normal'

/** @deprecated Use optionalFieldDisclosureActionButtonClasses */
export const optionalFieldDisclosureAddButtonClasses = optionalFieldDisclosureActionButtonClasses
