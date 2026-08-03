import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FieldDerivedMetaProvider } from './field-derived-meta-context.client'
import { Field } from './field.client'
import { FieldLayout } from './field-layout'

describe('Field aria-describedby with derived metadata', () => {
  it('uses error id exclusively when invalid', () => {
    render(
      <FieldDerivedMetaProvider meta={{ rows: [{ label: 'Typical uses', value: 'Care' }] }}>
        <Field.Root id="archetype" error="Required" hint="Choose an archetype.">
          <FieldLayout
            label={<Field.Label>Archetype</Field.Label>}
            control={<input aria-label="Archetype" />}
          />
        </Field.Root>
      </FieldDerivedMetaProvider>,
    )

    const control = screen.getByLabelText('Archetype')
    expect(control).toHaveAttribute('aria-describedby', 'archetype-error')
  })

  it('uses hint id when only hint is present', () => {
    render(
      <Field.Root id="override" hint="Replaces the archetype's typical uses for this building.">
        <FieldLayout
          label={<Field.Label>Function override</Field.Label>}
          control={<input aria-label="Function override" />}
        />
      </Field.Root>,
    )

    const control = screen.getByLabelText('Function override')
    expect(control).toHaveAttribute('aria-describedby', 'override-hint')
  })

  it('uses derived metadata id when only metadata is present', () => {
    render(
      <FieldDerivedMetaProvider meta={{ rows: [{ label: 'Typical uses', value: 'Care' }] }}>
        <Field.Root id="archetype">
          <FieldLayout
            label={<Field.Label>Archetype</Field.Label>}
            control={<input aria-label="Archetype" />}
          />
        </Field.Root>
      </FieldDerivedMetaProvider>,
    )

    const control = screen.getByLabelText('Archetype')
    expect(control).toHaveAttribute('aria-describedby', 'archetype-derived-meta')
  })

  it('combines hint and derived metadata ids when both are present', () => {
    render(
      <FieldDerivedMetaProvider meta={{ rows: [{ label: 'Typical uses', value: 'Care' }] }}>
        <Field.Root id="archetype" hint="Optional guidance.">
          <FieldLayout
            label={<Field.Label>Archetype</Field.Label>}
            control={<input aria-label="Archetype" />}
          />
        </Field.Root>
      </FieldDerivedMetaProvider>,
    )

    const control = screen.getByLabelText('Archetype')
    expect(control).toHaveAttribute('aria-describedby', 'archetype-hint archetype-derived-meta')
  })
})

describe('FieldLayout derived metadata placement', () => {
  it('renders derived metadata outside the alignment anchor', () => {
    const { container } = render(
      <FieldDerivedMetaProvider meta={{ rows: [{ label: 'Typical uses', value: 'Care' }] }}>
        <Field.Root id="archetype">
          <FieldLayout
            label={<Field.Label>Archetype</Field.Label>}
            control={<input aria-label="Archetype" />}
          />
        </Field.Root>
      </FieldDerivedMetaProvider>,
    )

    const anchor = container.querySelector('[data-field-align]')
    expect(anchor).not.toBeNull()
    expect(anchor).not.toHaveTextContent('Typical uses')
    expect(screen.getByText('Typical uses')).toBeInTheDocument()
  })
})
