import { describe, expect, it } from 'vitest'

import { expectRichTextHtml } from '../lib/expect-rich-text-html'
import { loadSeedClasses, loadSeedSubclasses, seedClassSlugs } from './index'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 class seed', () => {
  const classes = loadSeedClasses(RULESET)
  const subclasses = loadSeedSubclasses(RULESET)

  it('ships all 12 classes and their subclasses (validated against the schema at load)', () => {
    expect(classes).toHaveLength(12)
    expect(subclasses).toHaveLength(12)
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const cls of classes) {
      expect(cls.id).toBe(`${RULESET}:${cls.slug}`)
      expect(cls.source).toBe('system')
      expect(cls.campaignId).toBeNull()
      expect(cls.rulesetId).toBe(RULESET)
    }
  })

  it('has unique class slugs', () => {
    const slugs = classes.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedClassSlugs(RULESET).size).toBe(12)
  })

  it('references existing parent class ids from every subclass', () => {
    const classIds = new Set(classes.map((c) => c.id))
    for (const sub of subclasses) {
      expect(classIds.has(sub.classId)).toBe(true)
    }
  })

  it('stores non-empty descriptions as rich-text HTML', () => {
    for (const cls of classes) {
      expectRichTextHtml(cls.description)
      for (const feature of cls.features) {
        expectRichTextHtml(feature.description)
      }
    }
    for (const sub of subclasses) {
      expectRichTextHtml(sub.description)
    }
  })
})
