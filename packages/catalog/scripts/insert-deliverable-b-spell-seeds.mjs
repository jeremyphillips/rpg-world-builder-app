/**
 * One-shot: insert deliverable B spell seeds from cached Open5e payloads.
 * Run: pnpm exec tsx packages/catalog/scripts/insert-deliverable-b-spell-seeds.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../src/spells/data/srd-cc-5.2.1')
const RULESET = 'srd-cc-5.2.1'
const STAMP = '2024-05-21T00:00:00.000Z'

function open5eSlugToPayload(slug) {
  const path = join('/tmp/srd-spells', `${slug}.json`)
  const raw = JSON.parse(readFileSync(path, 'utf8'))
  return raw.results[0]
}

function paragraphHtml(desc) {
  const text = desc.trim().replace(/\s+/g, ' ')
  return `<p>${text}</p>`
}

function scalingHtml(higher, cantrip = false) {
  if (!higher) return undefined
  const prefix = cantrip
    ? '<p>The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8).</p>'
    : `<p>${higher.trim()}</p>`
  if (cantrip && higher.includes('levels 5')) {
    return prefix
  }
  return `<p>${higher.trim()}</p>`
}

function classKeysToIds(classes) {
  return classes
    .map((entry) => entry.key.replace(/^srd-2024_/, ''))
    .sort((a, b) => a.localeCompare(b))
}

function durationFromOpen5e(o) {
  const duration = (o.duration ?? '').toLowerCase()
  if (duration === 'instantaneous' || duration === 'instant') {
    return { kind: 'instantaneous' }
  }
  if (duration === '1 round') {
    return { kind: 'timed', value: 1, unit: 'round' }
  }
  const minuteMatch = duration.match(/^(\d+) minute/)
  if (minuteMatch) {
    const base = {
      kind: 'timed',
      value: Number(minuteMatch[1]),
      unit: 'minute',
    }
    return o.concentration ? { ...base, concentration: true } : base
  }
  const hourMatch = duration.match(/^(\d+) hour/)
  if (hourMatch) {
    return { kind: 'timed', value: Number(hourMatch[1]), unit: 'hour' }
  }
  throw new Error(`Unhandled duration: ${o.duration} (${o.key})`)
}

function rangeFromOpen5e(o) {
  const text = (o.range_text ?? '').toLowerCase()
  if (text === 'self') return { kind: 'self' }
  if (text === 'touch') return { kind: 'touch' }
  if (typeof o.range === 'number' && o.range > 0) {
    return {
      kind: 'distance',
      value: { value: o.range, unit: 'ft' },
    }
  }
  throw new Error(`Unhandled range: ${o.range_text} (${o.key})`)
}

function castingTimeFromOpen5e(o) {
  const ct = (o.casting_time ?? 'action').toLowerCase()
  const unit = ct.includes('bonus')
    ? 'bonus-action'
    : ct.includes('reaction')
      ? 'reaction'
      : 'action'
  return {
    normal: { value: 1, unit },
    canBeCastAsRitual: Boolean(o.ritual),
  }
}

function componentsFromOpen5e(o) {
  const components = {}
  if (o.verbal) components.verbal = true
  if (o.somatic) components.somatic = true
  if (o.material && o.material_specified) {
    components.material = { description: o.material_specified }
  }
  return components
}

function tagsFromOpen5e(o) {
  const tags = {}
  if (o.damage_types?.length) {
    tags.damageTypes = [...o.damage_types].sort()
    tags.roles = ['damage']
  }
  if (o.saving_throw_ability === 'wisdom') {
    tags.roles = [...(tags.roles ?? []), 'control']
  }
  if (!o.attack_roll && !o.damage_types?.length && !o.saving_throw_ability) {
    tags.roles = ['buff']
  }
  return tags
}

function baseSpell(slug, extras = {}) {
  const o = open5eSlugToPayload(slug)
  const level = o.level
  const school = o.school?.key?.replace(/^srd-2024_/, '') ?? o.school?.name?.toLowerCase()
  const spell = {
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    catalogLayer: 'system',
    campaignId: null,
    createdAt: STAMP,
    updatedAt: STAMP,
    name: o.name,
    description: paragraphHtml(o.desc),
    school,
    level,
    classIds: classKeysToIds(o.classes ?? []),
    tags: tagsFromOpen5e(o),
    castingTime: castingTimeFromOpen5e(o),
    range: rangeFromOpen5e(o),
    duration: durationFromOpen5e(o),
    components: componentsFromOpen5e(o),
    ...extras,
  }

  if (level === 0 && o.higher_level) {
    spell.cantripScaling = scalingHtml(o.higher_level, true)
  } else if (level > 0 && o.higher_level) {
    spell.higherLevelSlotEffect = scalingHtml(o.higher_level, false)
  }

  return spell
}

const SPELLS = {
  'animal-friendship': baseSpell('animal-friendship', {
    tags: { conditions: ['charmed'], roles: ['control'] },
  }),
  'ensnaring-strike': baseSpell('ensnaring-strike', {
    tags: { conditions: ['restrained'], damageTypes: ['piercing'], roles: ['control', 'damage'] },
  }),
  'guiding-bolt': baseSpell('guiding-bolt', {
    deliveryMethod: 'ranged-spell-attack',
    tags: { damageTypes: ['radiant'], roles: ['damage', 'debuff'] },
  }),
  heroism: baseSpell('heroism', {
    tags: { conditions: ['frightened'], roles: ['buff', 'warding'] },
  }),
  'produce-flame': baseSpell('produce-flame', {
    deliveryMethod: 'ranged-spell-attack',
    tags: { damageTypes: ['fire'], roles: ['damage'], functions: ['utility'] },
  }),
  'ray-of-frost': baseSpell('ray-of-frost', {
    deliveryMethod: 'ranged-spell-attack',
    tags: { damageTypes: ['cold'], roles: ['damage', 'debuff'] },
  }),
  'searing-smite': baseSpell('searing-smite', {
    tags: { damageTypes: ['fire'], roles: ['damage'] },
  }),
  'shocking-grasp': baseSpell('shocking-grasp', {
    deliveryMethod: 'melee-spell-attack',
    tags: { damageTypes: ['lightning'], roles: ['damage', 'debuff'] },
  }),
  'sorcerous-burst': baseSpell('sorcerous-burst', {
    deliveryMethod: 'ranged-spell-attack',
    tags: { roles: ['damage'] },
  }),
  'starry-wisp': baseSpell('starry-wisp', {
    deliveryMethod: 'ranged-spell-attack',
    tags: { damageTypes: ['radiant'], roles: ['damage', 'debuff'] },
  }),
}

/** file -> slugs to insert (must exist in SPELLS). */
const INSERTIONS = {
  'level-1-a-f.json': ['animal-friendship', 'ensnaring-strike'],
  'level-1-f-i.json': ['guiding-bolt', 'heroism'],
  'level-0-p-t.json': [
    'produce-flame',
    'ray-of-frost',
    'shocking-grasp',
    'sorcerous-burst',
    'starry-wisp',
  ],
  'level-1-r-t.json': ['searing-smite'],
}

for (const [fileName, slugs] of Object.entries(INSERTIONS)) {
  const filePath = join(dataDir, fileName)
  const spells = JSON.parse(readFileSync(filePath, 'utf8'))
  const existing = new Set(spells.map((s) => s.slug))

  for (const slug of slugs) {
    if (existing.has(slug)) {
      console.warn(`skip existing ${slug} in ${fileName}`)
      continue
    }
    const next = SPELLS[slug]
    if (!next) throw new Error(`missing builder for ${slug}`)
    const index = spells.findIndex((s) => s.slug.localeCompare(slug) > 0)
    if (index === -1) {
      spells.push(next)
    } else {
      spells.splice(index, 0, next)
    }
    console.log(`inserted ${slug} -> ${fileName}`)
  }

  writeFileSync(filePath, `${JSON.stringify(spells, null, 2)}\n`, 'utf8')
}
