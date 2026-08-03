import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '../../test-utils'

import { FieldDerivedMetaProvider } from './field-derived-meta-context.client'
import { FieldDerivedMeta } from './field-derived-meta.client'

describe('FieldDerivedMeta', () => {
  it('renders label and value rows', () => {
    render(
      <FieldDerivedMetaProvider
        meta={{
          rows: [{ label: 'Typical uses', value: 'Assembly · Governance' }],
        }}
      >
        <FieldDerivedMeta id="field-derived-meta" />
      </FieldDerivedMetaProvider>,
    )

    expect(screen.getByText('Typical uses')).toBeInTheDocument()
    expect(screen.getByText('Assembly · Governance')).toBeInTheDocument()
  })

  it('reserves one metadata line without placeholder text when empty', () => {
    const { container } = render(
      <FieldDerivedMetaProvider reserveSpace>
        <FieldDerivedMeta />
      </FieldDerivedMetaProvider>,
    )

    const region = container.firstChild as HTMLElement
    expect(region).toHaveClass('min-h-[1.125rem]')
    expect(region).toHaveAttribute('aria-hidden', 'true')
    expect(region.textContent).toBe('')
    expect(region).not.toHaveAttribute('id')
  })

  it('applies metadata region id only when rows are present', () => {
    render(
      <FieldDerivedMetaProvider meta={{ rows: [{ label: 'Typical uses', value: 'Care' }] }}>
        <FieldDerivedMeta id="field-derived-meta" />
      </FieldDerivedMetaProvider>,
    )

    expect(document.getElementById('field-derived-meta')).toHaveTextContent('Care')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FieldDerivedMetaProvider
        meta={{ rows: [{ label: 'Typical uses', value: 'Lodging · Retail' }] }}
      >
        <FieldDerivedMeta id="field-derived-meta" />
      </FieldDerivedMetaProvider>,
    )

    await expectNoAxeViolations(container)
  })
})
