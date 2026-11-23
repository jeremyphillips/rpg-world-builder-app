/**
 * One-shot: set granting-feature intro and remove description (mechanics are generated).
 * Run: node packages/catalog/scripts/slim-spellcasting-feature-residuals.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../src/classes/data/srd-cc-5.2.1')

const INTROS = {
  bard: 'You have learned to cast spells through your bardic arts.',
  cleric: 'You have learned to cast spells through prayer and meditation.',
  druid: 'You have learned to cast spells through studying the mystical forces of nature.',
  paladin: 'You have learned to cast spells through prayer and meditation.',
  ranger: 'You have learned to channel the magical essence of nature to cast spells.',
  sorcerer: 'Drawing from your innate magic, you can cast spells.',
  warlock:
    'Through occult ceremony, you have formed a pact with a mysterious entity to gain magical powers. The entity is a voice in the shadows—its identity unclear—but its boon to you is concrete: the ability to cast spells.',
  wizard: 'As a student of arcane magic, you have learned to cast spells.',
}

const FEATURE_IDS = {
  warlock: 'pact-magic',
  default: 'spellcasting',
}

for (const [slug, introText] of Object.entries(INTROS)) {
  const path = join(dataDir, `${slug}.json`)
  const cls = JSON.parse(readFileSync(path, 'utf8'))
  const featureId = FEATURE_IDS[slug] ?? FEATURE_IDS.default
  const feature = cls.features.find((f) => f.id === featureId)
  if (!feature) throw new Error(`missing ${featureId} on ${slug}`)
  feature.intro = `<p>${introText}</p>`
  delete feature.description
  writeFileSync(path, `${JSON.stringify(cls, null, 2)}\n`, 'utf8')
  console.log(`updated ${slug} ${featureId}`)
}
