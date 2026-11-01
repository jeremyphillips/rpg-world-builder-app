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

  it('reads sr-only visibility from Field.Root when the layout prop is omitted', () => {
    const { container } = render(
      <Field.Root id="limit" labelVisibility="srOnly" anatomy>
        <FieldLayout label={<FormFieldLabel label="Limit" />} control={<input />} />
      </Field.Root>,
    )

    const labelRegion = container.querySelector('[data-field-label-region]')
    expect(labelRegion?.childElementCount).toBe(0)
    expect(screen.getByText('Limit').closest('label')).toHaveClass('sr-only')
    expect(screen.getByLabelText('Limit')).toBeInTheDocument()
  })

  it('keeps an info action in the label region when the label text is sr-only', () => {
    const { container } = render(
      <Field.Root id="limit" labelVisibility="srOnly" anatomy>
        <FieldLayout
          label={<FormFieldLabel label="Limit" info="Only positive values." />}
          control={<input />}
        />
      </Field.Root>,
    )

    const infoButton = screen.getByRole('button', { name: 'About Limit' })
    const controlRegion = container.querySelector('[data-field-control-region]')
    expect(infoButton).not.toHaveClass('sr-only')
    expect(controlRegion).toContainElement(infoButton)
    expect(container.querySelector('[data-field-label-region]')?.childElementCount).toBe(0)
    expect(screen.getByText('Limit').closest('label')).toHaveClass('sr-only')
  })

  it('does not hide a nested field label or a segment label', () => {
    render(
      <Field.Root id="parent" labelVisibility="srOnly" anatomy>
        <FieldLayout
          label={<FormFieldLabel label="Parent" />}
          control={
            <div>
              <label htmlFor="segment">Segment</label>
              <input id="segment" />
              <Field.Root id="child">
                <FormFieldLabel label="Child" />
                <Field.Control>
                  <input />
                </Field.Control>
              </Field.Root>
            </div>
          }
        />
      </Field.Root>,
    )

    expect(screen.getByText('Parent').closest('label')).toHaveClass('sr-only')
    expect(screen.getByText('Segment')).not.toHaveClass('sr-only')
    expect(screen.getByText('Child').closest('label')).not.toHaveClass('sr-only')
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
