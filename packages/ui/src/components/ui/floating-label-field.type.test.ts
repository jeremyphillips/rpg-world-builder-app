import { describe, expectTypeOf, it } from 'vitest'

import type { FloatingLabelFieldProps } from './floating-label-field.client'
import type { SelectFilterFieldDef, TextFilterFieldDef } from '../../filters/filter-schema.types'

type ForbiddenFloatingProp =
  | 'hintPosition'
  | 'labelPosition'
  | 'labelVisibility'
  | 'required'
  | 'anatomy'
  | 'rowParticipation'

describe('FloatingLabelField props', () => {
  it('omits layout props the composite owns', () => {
    expectTypeOf<ForbiddenFloatingProp & keyof FloatingLabelFieldProps>().toEqualTypeOf<never>()
  })

  it('requires one element child', () => {
    expectTypeOf<FloatingLabelFieldProps['children']>().toEqualTypeOf<React.ReactElement>()
  })
})

describe('floating filter schema', () => {
  it('rejects label overrides on floating selects', () => {
    type FloatingSelect = Extract<
      SelectFilterFieldDef<{ name: string }, { school?: string }, 'school'>,
      { layout: 'floating' }
    >
    expectTypeOf<FloatingSelect['ariaLabel']>().toEqualTypeOf<undefined>()
    expectTypeOf<FloatingSelect['triggerAriaLabel']>().toEqualTypeOf<undefined>()
  })

  it('rejects ariaLabel on floating text filters', () => {
    type FloatingText = Extract<
      TextFilterFieldDef<{ name: string }, { name?: string }, 'name'>,
      { layout: 'floating' }
    >
    expectTypeOf<FloatingText['ariaLabel']>().toEqualTypeOf<undefined>()
  })
})
