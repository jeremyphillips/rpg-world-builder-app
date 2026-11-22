/**
 * One-shot: replace granting-feature spellcasting descriptions with residual-only HTML.
 * Run: node packages/catalog/scripts/slim-spellcasting-feature-residuals.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../src/classes/data/srd-cc-5.2.1')

const RESIDUAL_HTML = {
  bard: `<p>You have learned to cast spells through your bardic arts. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Bard spells, which appear in the Bard spell list later in the class's description.</p><p>Whenever you gain a Bard level, you can replace one of your cantrips with another cantrip of your choice from the Bard spell list.</p><p><strong>Spell Slots.</strong> The Bard Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.</p><p>If another Bard feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Bard spells for you.</p><p><strong>Spellcasting Focus.</strong> You can use a Musical Instrument as a Spellcasting Focus for your Bard spells.</p>`,

  cleric: `<p>You have learned to cast spells through prayer and meditation. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Cleric spells, which appear on the Cleric spell list later in the class's description.</p><p>Whenever you gain a Cleric level, you can replace one of your cantrips with another cantrip of your choice from the Cleric spell list.</p><p><strong>Spell Slots.</strong> The Cleric Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.</p><p>If another Cleric feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Cleric spells for you.</p>`,

  druid: `<p>You have learned to cast spells through studying the mystical forces of nature. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Druid spells, which appear on the Druid spell list later in the class's description.</p><p>Whenever you gain a Druid level, you can replace one of your cantrips with another cantrip of your choice from the Druid spell list.</p><p><strong>Spell Slots.</strong> The Druid Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.</p><p>If another Druid feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Druid spells for you.</p>`,

  sorcerer: `<p>Drawing from your innate magic, you can cast spells. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Sorcerer spells, which appear in the Sorcerer spell list later in the class's description.</p><p>Whenever you gain a Sorcerer level, you can replace one of your cantrips from this feature with another Sorcerer cantrip of your choice.</p><p><strong>Spell Slots.</strong> The Sorcerer Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.</p><p>If another Sorcerer feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Sorcerer spells for you.</p>`,

  paladin: `<p>You have learned to cast spells through prayer and meditation. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Paladin spells, which appear in the Paladin spell list later in the class's description.</p><p><strong>Spell Slots.</strong> The Paladin Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.</p><p>If another Paladin feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Paladin spells for you.</p>`,

  ranger: `<p>You have learned to channel the magical essence of nature to cast spells. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Ranger spells, which appear in the Ranger spell list later in the class's description.</p><p><strong>Spell Slots.</strong> The Ranger Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.</p><p>If another Ranger feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Ranger spells for you.</p>`,

  wizard: `<p>As a student of arcane magic, you have learned to cast spells. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Wizard spells, which appear in the Wizard spell list later in the class's description.</p><p>Whenever you finish a Long Rest, you can replace one of your cantrips from this feature with another Wizard cantrip of your choice.</p><p><strong>Spellbook.</strong> Your wizardly apprenticeship culminated in the creation of a unique book: your spellbook. It is a Tiny object that weighs 3 pounds, contains 100 pages, and can be read only by you or someone casting Identify. You determine the book's appearance and materials, such as a gilt-edged tome or a collection of vellum bound with twine.</p><p>The book contains the level 1+ spells you know.</p><p><strong>Spell Slots.</strong> The Wizard Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.</p><p>If another Wizard feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Wizard spells for you.</p><p><strong>Spellcasting Focus.</strong> You can use an Arcane Focus or your spellbook as a Spellcasting Focus for your Wizard spells.</p>`,

  warlock: `<p>Through occult ceremony, you have formed a pact with a mysterious entity to gain magical powers. The entity is a voice in the shadows—its identity unclear—but its boon to you is concrete: the ability to cast spells. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Warlock spells, which appear in the Warlock spell list later in the class's description.</p><p>Whenever you gain a Warlock level, you can replace one of your cantrips from this feature with another Warlock cantrip of your choice.</p><p><strong>Spell Slots.</strong> The Warlock Features table shows how many spell slots you have to cast your Warlock spells of levels 1–5. The table also shows the level of those slots, all of which are the same level. You regain all expended Pact Magic spell slots when you finish a Short or Long Rest.</p><p>To cast the level 1 spell Charm Person, you must spend one of those slots, and you cast it as a level 3 spell.</p><p>If another Warlock feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Warlock spells for you.</p>`,
}

const FEATURE_IDS = {
  warlock: 'pact-magic',
  default: 'spellcasting',
}

for (const [slug, description] of Object.entries(RESIDUAL_HTML)) {
  const path = join(dataDir, `${slug}.json`)
  const cls = JSON.parse(readFileSync(path, 'utf8'))
  const featureId = FEATURE_IDS[slug] ?? FEATURE_IDS.default
  const feature = cls.features.find((f) => f.id === featureId)
  if (!feature) throw new Error(`missing ${featureId} on ${slug}`)
  feature.description = description
  writeFileSync(path, `${JSON.stringify(cls, null, 2)}\n`, 'utf8')
  console.log(`updated ${slug} ${featureId}`)
}
