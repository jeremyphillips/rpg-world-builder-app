/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { DEFAULT_FORM_DENSITY, FormItems, FormSectionContext, type FormItem } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { damageFieldGroup } from '../forms/mechanics/damage-field-group'
import { MasterDetailDetailFormScope } from './master-detail-detail-form-scope'
import { wrapMasterDetailDetailFields } from './wrap-master-detail-detail-fields'

function legendTitleNode(label: string): HTMLElement {
  const labelEl = screen.getByText(label)
  const titled = labelEl.closest(
    '.text-style-field-legend, .text-style-field-legend-sub, .text-style-field-legend-compact',
  )
  expect(titled).toBeTruthy()
  return titled as HTMLElement
}

function FormItemsHarness({
  items,
  scoped = false,
  parentDepth,
}: {
  items: FormItem[]
  scoped?: boolean
  parentDepth?: number
}) {
  const form = useForm()
  const formItems = <FormItems items={items} idPrefix="detail" namePrefix="row.0" />
  const body = scoped ? (
    <MasterDetailDetailFormScope>{formItems}</MasterDetailDetailFormScope>
  ) : (
    formItems
  )

  if (parentDepth !== undefined) {
    return (
      <FormProvider {...form}>
        <FormSectionContext.Provider
          value={{
            depth: parentDepth,
            namedGroupDepth: parentDepth,
            headingTier: 'subsection',
            density: DEFAULT_FORM_DENSITY,
          }}
        >
          <MasterDetailDetailFormScope>{formItems}</MasterDetailDetailFormScope>
        </FormSectionContext.Provider>
      </FormProvider>
    )
  }

  return <FormProvider {...form}>{body}</FormProvider>
}

const damageGroup = damageFieldGroup({
  ctx: {},
  damageTypeName: 'damageType',
  rollName: 'roll',
  scope: 'physical',
})

describe('MasterDetailDetailFormScope', () => {
  it('renders section legends for top-level groups outside the detail scope', () => {
    render(<FormItemsHarness items={[damageGroup]} />)
    expect(legendTitleNode('Damage')).toHaveClass('text-style-field-legend')
    expect(legendTitleNode('Damage')).not.toHaveClass('text-style-field-legend-sub')
  })

  it('renders subsection legends inside the detail scope at depth 0', () => {
    render(<FormItemsHarness items={wrapMasterDetailDetailFields([damageGroup])} scoped />)

    expect(legendTitleNode('Damage')).toHaveClass('text-style-field-legend-sub')
    expect(legendTitleNode('Damage')).not.toHaveClass('text-style-field-legend')
  })

  it('renders nested named groups as subsection without reverting to section', () => {
    render(
      <FormItemsHarness
        scoped
        items={wrapMasterDetailDetailFields([
          {
            kind: 'group',
            heading: { label: 'Effects' },
            fields: [damageGroup],
          },
        ])}
      />,
    )

    expect(legendTitleNode('Effects')).toHaveClass('text-style-field-legend-sub')
    expect(legendTitleNode('Damage')).toHaveClass('text-style-field-legend-sub')
  })

  it('preserves namedGroupDepth when the parent is already nested', () => {
    render(<FormItemsHarness parentDepth={2} items={wrapMasterDetailDetailFields([damageGroup])} />)

    expect(legendTitleNode('Damage')).toHaveClass('text-style-field-legend-sub')
  })

  it('does not add a fieldset for the scope itself', () => {
    function ScopeOnlyHarness() {
      const form = useForm()
      return (
        <FormProvider {...form}>
          <MasterDetailDetailFormScope>
            <p data-testid="body">Detail body</p>
          </MasterDetailDetailFormScope>
        </FormProvider>
      )
    }

    const { container } = render(<ScopeOnlyHarness />)

    expect(screen.getByTestId('body')).toBeInTheDocument()
    expect(container.querySelectorAll('fieldset')).toHaveLength(0)
  })
})
