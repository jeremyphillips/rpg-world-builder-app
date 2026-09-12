import type { FormItem } from '@rpg/ui/form'

/** Wraps detail `FormItems` in one group that opts out of per-field container chrome. */
export function wrapMasterDetailDetailFields(fields: FormItem[]): FormItem[] {
  return [
    {
      kind: 'group',
      fieldChrome: { variant: 'none' },
      fields,
    },
  ]
}
