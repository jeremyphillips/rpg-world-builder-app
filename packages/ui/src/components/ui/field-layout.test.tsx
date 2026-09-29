import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import { Field } from './field.client'
import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { FieldLayout } from './field-layout'
import {
  fieldAnatomyControlRegionRowTrackClasses,
  fieldAnatomyLabelRegionRowTrackClasses,
  fieldAnatomyMessageRegionRowTrackClasses,
  fieldLabelRegionVariants,
  fieldMessageRegionVariants,
} from './field.variants'

describe('FieldLayout three-region anatomy', () => {
  it('emits label, control, and message regions as Field.Root children', () => {
    const { container } = render(
      <Field.Root id="name" anatomy>
        <FieldLayout
          label={<Field.Label>Name</Field.Label>}
          control={<input aria-label="Name" />}
        />
      </Field.Root>,
    )

    const root = container.querySelector('[data-field-anatomy]')
    expect(root).not.toBeNull()
    expect(root?.children).toHaveLength(3)
    expect(root?.children[0]).toHaveAttribute('data-field-label-region')
    expect(root?.children[1]).toHaveAttribute('data-field-control-region')
    expect(root?.children[2]).toHaveAttribute('data-field-message-region')
  })

  it('keeps below-label hints in the label region', () => {
    const { container } = render(
      <Field.Root id="name" hint="Helper." anatomy>
        <FieldLayout
          label={<Field.Label>Name</Field.Label>}
          control={<input aria-label="Name" />}
        />
      </Field.Root>,
    )

    const labelRegion = container.querySelector('[data-field-label-region]')
    expect(labelRegion).toContainElement(screen.getByText('Helper.'))
    expect(container.querySelector('[data-field-message-region]')).not.toHaveTextContent('Helper.')
  })

  it('places below-control hints and errors in the message region', () => {
    const { container } = render(
      <Field.Root id="name" hint="Helper." hintPosition="below-control" error="Required." anatomy>
        <FieldLayout
          hintPosition="below-control"
          label={<Field.Label>Name</Field.Label>}
          control={<input aria-label="Name" />}
        />
      </Field.Root>,
    )

    const messageRegion = container.querySelector('[data-field-message-region]')
    expect(messageRegion).toContainElement(screen.getByRole('alert'))
    // Error replaces below-control hint
    expect(screen.queryByText('Helper.')).not.toBeInTheDocument()
  })

  it('keeps sr-only labels out of the label region layout slot', () => {
    const { container } = render(
      <Field.Root id="preset" anatomy>
        <FieldLayout
          labelVisibility="srOnly"
          label={<FormFieldLabel label="Starting point" labelVisibility="srOnly" />}
          control={<input aria-label="Starting point" />}
        />
      </Field.Root>,
    )

    const labelRegion = container.querySelector('[data-field-label-region]')
    expect(labelRegion?.childElementCount).toBe(0)
    expect(container.querySelector('[data-field-control-region]')).toHaveTextContent(
      'Starting point',
    )
  })

  it('renders an empty label region when the field has no label', () => {
    const { container } = render(
      <Field.Root id="name" anatomy>
        <FieldLayout label={null} control={<input aria-label="Name" />} />
      </Field.Root>,
    )

    const labelRegion = container.querySelector('[data-field-label-region]')
    expect(labelRegion).not.toBeNull()
    expect(labelRegion?.childElementCount).toBe(0)
  })
})

describe('field anatomy region row tracks', () => {
  it('assigns explicit subgrid rows when nested in a row participant', () => {
    const { container } = render(
      <FieldRowAnatomyProvider>
        <Field.Root id="mode" anatomy rowParticipation>
          <FieldLayout
            label={<Field.Label>Mode</Field.Label>}
            control={<input id="mode" aria-label="Mode" />}
          />
        </Field.Root>
      </FieldRowAnatomyProvider>,
    )

    expect(container.querySelector('[data-field-label-region]')).toHaveClass(
      ...fieldAnatomyLabelRegionRowTrackClasses.split(' '),
    )
    expect(container.querySelector('[data-field-control-region]')).toHaveClass(
      ...fieldAnatomyControlRegionRowTrackClasses.split(' '),
    )
    expect(container.querySelector('[data-field-message-region]')).toHaveClass(
      ...fieldAnatomyMessageRegionRowTrackClasses.split(' '),
    )
  })
})

describe('field anatomy region spacing tokens', () => {
  it('uses has-* padding so empty regions contribute no intrinsic height', () => {
    expect(fieldLabelRegionVariants({ size: 'md' })).toContain('has-[*]:pb-1.5')
    expect(fieldMessageRegionVariants({ size: 'md' })).toContain('has-[*]:pt-1.5')
    expect(fieldLabelRegionVariants({ size: 'sm' })).toContain('has-[*]:pb-1')
  })
})
