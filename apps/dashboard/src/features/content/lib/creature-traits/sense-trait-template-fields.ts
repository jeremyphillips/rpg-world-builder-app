import type { FormItem } from '@rpg/ui/form'

import { senseRangeJoinedPairField } from '../forms/fields/content-sense-range-form-fields'

export function senseTraitTemplateFields(): FormItem[] {
  return [
    senseRangeJoinedPairField({
      amountName: 'config.range',
      width: '1/3',
      required: true,
    }),
    {
      type: 'richtext',
      name: 'details',
      label: 'Details',
      optionalDisclosure: { intent: 'add', actionSubject: 'details' },
    },
  ]
}
