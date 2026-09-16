import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FieldDerivedMetaProvider } from './field-derived-meta-context.client'
import { Field } from './field.client'
import { FieldLayout } from './field-layout'

describe('Field aria-describedby with derived metadata', () => {
  it('combines below-label hint and error ids when invalid', () => {
    render(
      <FieldDerivedMetaProvider meta={{ rows: [{ label: 'Typical uses', value: 'Care' }] }}>
        <Field.Root id="archetype" error="Required" hint="Choose an archetype." anatomy>
          <FieldLayout
            label={<Field.Label>Archetype</Field.Label>}
            control={<input aria-label="Archetype" />}
          />
        </Field.Root>
      </FieldDerivedMetaProvider>,
    )

    const control = screen.getByLabelText('Archetype')
    expect(control).toHaveAttribute(
      'aria-describedby',
      'archetype-hint archetype-error archetype-derived-meta',
    )
  })

  it('uses hint id when only hint is present', () => {
    render(
      <Field.Root
        id="override"
        hint="Replaces the archetype's typical uses for this building."
        anatomy
      >
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
        <Field.Root id="archetype" anatomy>
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
        <Field.Root id="archetype" hint="Optional guidance." anatomy>
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
  it('renders derived metadata in the message region, outside the control region', () => {
    const { container } = render(
      <FieldDerivedMetaProvider meta={{ rows: [{ label: 'Typical uses', value: 'Care' }] }}>
        <Field.Root id="archetype" anatomy>
          <FieldLayout
            label={<Field.Label>Archetype</Field.Label>}
            control={<input aria-label="Archetype" />}
          />
        </Field.Root>
      </FieldDerivedMetaProvider>,
    )

    const controlRegion = container.querySelector('[data-field-control-region]')
    const messageRegion = container.querySelector('[data-field-message-region]')
    expect(controlRegion).not.toBeNull()
    expect(controlRegion).not.toHaveTextContent('Typical uses')
    expect(messageRegion).toContainElement(screen.getByText('Typical uses'))
  })
})
