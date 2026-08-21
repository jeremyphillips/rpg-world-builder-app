import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { ClassFeatureItem } from './class-feature-item'

function renderClassFeatureItem(feature: Parameters<typeof ClassFeatureItem>[0]['feature']) {
  return render(
    <ul>
      <ClassFeatureItem feature={feature} />
    </ul>,
  )
}

describe('ClassFeatureItem', () => {
  it('renders an h4 heading and body on separate blocks for a single-paragraph feature', () => {
    renderClassFeatureItem({
      level: 5,
      name: 'Extra Attack',
      description:
        '<p>You can attack twice instead of once whenever you take the Attack action on your turn.</p>',
    })

    expect(
      screen.getByRole('heading', { level: 3, name: 'Level 5: Extra Attack' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/twice instead of once/)).toBeInTheDocument()
  })

  it('renders an h4 heading and multiple body paragraphs', () => {
    renderClassFeatureItem({
      level: 2,
      name: 'Fighting Style',
      description:
        '<p>You gain a Fighting Style feat of your choice (see "Feats").</p><p><strong>Druidic Warrior.</strong> You learn two Druid cantrips of your choice.</p>',
    })

    expect(
      screen.getByRole('heading', { level: 3, name: 'Level 2: Fighting Style' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Fighting Style feat/)).toBeInTheDocument()
    expect(screen.getByText(/Druidic Warrior/)).toBeInTheDocument()
  })

  it('renders heading-only features without a body', () => {
    renderClassFeatureItem({
      level: 19,
      name: 'Epic Boon',
    })
    expect(
      screen.getByRole('heading', { level: 3, name: 'Level 19: Epic Boon' }),
    ).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations for a single-paragraph feature', async () => {
    const { container } = renderClassFeatureItem({
      level: 3,
      name: 'Bonus Proficiencies',
      description: '<p>You gain proficiency with three skills of your choice.</p>',
    })
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations for a multi-paragraph feature', async () => {
    const { container } = renderClassFeatureItem({
      level: 1,
      name: 'Spellcasting',
      description:
        '<p>You have learned to cast spells through your bardic arts.</p><p><strong>Cantrips.</strong> You know two cantrips.</p>',
    })
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations for a heading-only feature', async () => {
    const { container } = renderClassFeatureItem({
      level: 19,
      name: 'Epic Boon',
    })
    await expectNoAxeViolations(container)
  })
})
