import { describe, expect, it } from 'vitest'

import { getClassBySlug } from './index'

const RULESET = 'srd-cc-5.2.1' as const

const CASTERS = [
  'bard',
  'cleric',
  'druid',
  'paladin',
  'ranger',
  'sorcerer',
  'warlock',
  'wizard',
] as const

const DERIVED_IN_DESCRIPTION = [
  'are recommended',
  '<strong>Cantrips.</strong>',
  '<strong>Prepared Spells of Level 1+.</strong>',
  '<strong>Changing Your Prepared Spells.</strong>',
  '<strong>Spellcasting Ability.</strong>',
  'When you reach ',
  'levels 4 and 10',
  'For example, if you',
  'To start, choose',
  'The number of spells on your list increases',
]

function grantingSpellcastingHtml(slug: (typeof CASTERS)[number]): string {
  const cls = getClassBySlug(RULESET, slug)
  const feature = cls.features.find((f) => f.id === 'spellcasting' || f.id === 'pact-magic')
  expect(feature?.description).toBeTruthy()
  return feature!.description
}

describe('spellcasting granting feature residuals', () => {
  it.each(CASTERS)('%s omits derived mechanics from description HTML', (slug) => {
    const html = grantingSpellcastingHtml(slug)
    for (const fragment of DERIVED_IN_DESCRIPTION) {
      expect(html, `${slug} must not contain ${fragment}`).not.toContain(fragment)
    }
  })

  it('bard retains musical-instrument focus in description', () => {
    const html = grantingSpellcastingHtml('bard')
    expect(html).toContain('Musical Instrument')
  })

  it('wizard retains spellbook as focus clause', () => {
    const html = grantingSpellcastingHtml('wizard')
    expect(html).toContain('your spellbook as a Spellcasting Focus')
    expect(html).not.toContain('starts with six')
    expect(html).not.toContain('add two Wizard spells')
  })

  it('warlock retains pact slot recovery and upcast rider', () => {
    const html = grantingSpellcastingHtml('warlock')
    expect(html).toContain('Short or Long Rest')
    expect(html).toContain('Charm Person')
    expect(html).not.toContain("when you're a level 5 Warlock, you have two level 3")
    expect(getClassBySlug(RULESET, 'warlock').spellcasting?.spellSelection.change).toMatchObject({
      trigger: 'levelUp',
      limit: 1,
    })
  })

  it.each(['cleric', 'druid', 'sorcerer', 'bard'] as const)(
    '%s keeps cantrip replacement on level gain',
    (slug) => {
      const html = grantingSpellcastingHtml(slug)
      expect(html).toMatch(/replace one of your cantrips/)
    },
  )

  it.each(['cleric', 'druid', 'bard', 'sorcerer', 'wizard', 'paladin', 'ranger'] as const)(
    '%s keeps always-prepared carve-out',
    (slug) => {
      expect(grantingSpellcastingHtml(slug)).toContain('always have prepared')
    },
  )
})
