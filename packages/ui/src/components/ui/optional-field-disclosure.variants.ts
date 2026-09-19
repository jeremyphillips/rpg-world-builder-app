import { fieldAnatomyStackClasses } from './field.variants'

/** @deprecated Prefer {@link fieldAnatomyStackVariants} with the field `size` in the component. */
export const optionalFieldDisclosureStackClasses = fieldAnatomyStackClasses

/** Label + remove action row when the optional field is expanded. */
export const optionalFieldDisclosureHeaderClasses = 'flex items-center justify-between gap-2'

/** Optional add/remove text actions — font weight only; geometry lives on Button `variant="text"`. */
export const optionalFieldDisclosureActionButtonClasses = 'font-normal'

/** @deprecated Use optionalFieldDisclosureActionButtonClasses */
export const optionalFieldDisclosureAddButtonClasses = optionalFieldDisclosureActionButtonClasses
