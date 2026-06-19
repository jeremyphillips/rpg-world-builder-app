import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { FeatureItem } from './feature-item'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

function renderFeatureItem(feature: Parameters<typeof FeatureItem>[0]['feature']) {
  return render(
    <ul>
      <FeatureItem feature={feature} />
    </ul>,
  )
}

describe('FeatureItem', () => {
  it('renders composed feature HTML with level heading', () => {
    renderFeatureItem({
      level: 3,
      name: 'Bonus Proficiencies',
      description: '<p>You gain proficiency with three skills of your choice.</p>',
    })
    expect(screen.getByText(/Level 3: Bonus Proficiencies/)).toBeInTheDocument()
    expect(screen.getByText(/three skills of your choice/)).toBeInTheDocument()
  })

  it('renders heading-only features without a body', () => {
    renderFeatureItem({
      level: 19,
      name: 'Epic Boon',
    })
    expect(screen.getByText(/Level 19: Epic Boon/)).toBeInTheDocument()
  })

  it('has no axe accessibility violations for a single-paragraph feature', async () => {
    const { container } = renderFeatureItem({
      level: 3,
      name: 'Bonus Proficiencies',
      description: '<p>You gain proficiency with three skills of your choice.</p>',
    })
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })

  it('has no axe accessibility violations for a multi-paragraph feature', async () => {
    const { container } = renderFeatureItem({
      level: 1,
      name: 'Spellcasting',
      description:
        '<p>You have learned to cast spells through your bardic arts.</p><p><strong>Cantrips.</strong> You know two cantrips.</p>',
    })
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })

  it('has no axe accessibility violations for a heading-only feature', async () => {
    const { container } = renderFeatureItem({
      level: 19,
      name: 'Epic Boon',
    })
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
