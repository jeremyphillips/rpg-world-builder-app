/**
 * One-off generator for SRD 5.2.1 weapon seed data.
 * Run: node packages/catalog/scripts/generate-srd-weapons.mjs
 * Validation happens at module load via packages/catalog/src/equipment/index.ts.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../src/equipment/data/srd-cc-5.2.1')
const RULESET = 'srd-cc-5.2.1'
const TS = '2024-05-21T00:00:00.000Z'

const lb = (value) => ({ value, unit: 'lb' })
const gp = (amount) => ({ amount, currency: 'gp' })
const sp = (amount) => ({ amount, currency: 'sp' })
const cp = (amount) => ({ amount, currency: 'cp' })

const d = (count, faces) => ({ kind: 'dice', count, faces })
const flat = (amount) => ({ kind: 'flat', amount })
const range = (normal, long) => ({ normal, long })

function weapon(slug, name, category, mode, damage, damageType, mastery, cost, weight, extra = {}) {
  const { properties = [], versatileDamage, range: weaponRange, specialRules } = extra
  const item = {
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    source: 'system',
    campaignId: null,
    createdAt: TS,
    updatedAt: TS,
    name,
    description: '',
    cost,
    weight,
    kind: 'weapon',
    category,
    mode,
    properties,
    mastery,
    ...(damage !== undefined && { damage }),
    ...(damageType !== undefined && { damageType }),
    ...(versatileDamage !== undefined && { versatileDamage }),
    ...(weaponRange !== undefined && { range: weaponRange }),
    ...(specialRules !== undefined && { specialRules }),
  }
  return item
}

const LANCE_SPECIAL =
  "You have Disadvantage when you use a Lance to attack a target within 5 feet of you. Also, a Lance requires two hands to wield when you aren't mounted."

const NET_SPECIAL =
  'A Large or smaller creature hit by a Net is Restrained until it is freed. A Net has no effect on creatures that are Formless or Huge or larger. A creature can use its action to make a DC 10 Strength check, freeing itself or another creature within its reach on a success. Dealing 5 slashing damage to the Net (AC 10) also frees the creature without harming it, ending the effect and destroying the Net.'

const weapons = [
  weapon(
    'battleaxe',
    'Battleaxe',
    'martial',
    'melee',
    d(1, 8),
    'slashing',
    'topple',
    gp(10),
    lb(4),
    { properties: ['versatile'], versatileDamage: d(1, 10) },
  ),
  weapon('blowgun', 'Blowgun', 'martial', 'ranged', flat(1), 'piercing', 'vex', gp(10), lb(1), {
    properties: ['ammunition', 'loading'],
    range: range(25, 100),
  }),
  weapon('club', 'Club', 'simple', 'melee', d(1, 4), 'bludgeoning', 'slow', sp(1), lb(2), {
    properties: ['light'],
  }),
  weapon('dagger', 'Dagger', 'simple', 'melee', d(1, 4), 'piercing', 'nick', gp(2), lb(1), {
    properties: ['finesse', 'light', 'thrown'],
    range: range(20, 60),
  }),
  weapon('dart', 'Dart', 'simple', 'ranged', d(1, 4), 'piercing', 'vex', cp(5), lb(0.25), {
    properties: ['finesse', 'thrown'],
    range: range(20, 60),
  }),
  weapon('flail', 'Flail', 'martial', 'melee', d(1, 8), 'bludgeoning', 'sap', gp(10), lb(2)),
  weapon('glaive', 'Glaive', 'martial', 'melee', d(1, 10), 'slashing', 'graze', gp(20), lb(6), {
    properties: ['heavy', 'reach', 'two-handed'],
  }),
  weapon(
    'greataxe',
    'Greataxe',
    'martial',
    'melee',
    d(1, 12),
    'slashing',
    'cleave',
    gp(30),
    lb(7),
    {
      properties: ['heavy', 'two-handed'],
    },
  ),
  weapon(
    'greatclub',
    'Greatclub',
    'simple',
    'melee',
    d(1, 8),
    'bludgeoning',
    'push',
    sp(2),
    lb(10),
    {
      properties: ['two-handed'],
    },
  ),
  weapon(
    'greatsword',
    'Greatsword',
    'martial',
    'melee',
    d(2, 6),
    'slashing',
    'graze',
    gp(50),
    lb(6),
    {
      properties: ['heavy', 'two-handed'],
    },
  ),
  weapon('halberd', 'Halberd', 'martial', 'melee', d(1, 10), 'slashing', 'cleave', gp(20), lb(6), {
    properties: ['heavy', 'reach', 'two-handed'],
  }),
  weapon(
    'hand-crossbow',
    'Hand Crossbow',
    'martial',
    'ranged',
    d(1, 6),
    'piercing',
    'vex',
    gp(75),
    lb(3),
    { properties: ['ammunition', 'light', 'loading'], range: range(30, 120) },
  ),
  weapon('handaxe', 'Handaxe', 'simple', 'melee', d(1, 6), 'slashing', 'vex', gp(5), lb(2), {
    properties: ['light', 'thrown'],
    range: range(20, 60),
  }),
  weapon(
    'heavy-crossbow',
    'Heavy Crossbow',
    'martial',
    'ranged',
    d(1, 10),
    'piercing',
    'push',
    gp(50),
    lb(18),
    {
      properties: ['ammunition', 'heavy', 'loading', 'two-handed'],
      range: range(100, 400),
    },
  ),
  weapon('javelin', 'Javelin', 'simple', 'melee', d(1, 6), 'piercing', 'slow', sp(5), lb(2), {
    properties: ['thrown'],
    range: range(30, 120),
  }),
  weapon('lance', 'Lance', 'martial', 'melee', d(1, 10), 'piercing', 'topple', gp(10), lb(6), {
    properties: ['heavy', 'reach', 'special', 'two-handed'],
    specialRules: LANCE_SPECIAL,
  }),
  weapon(
    'light-crossbow',
    'Light Crossbow',
    'simple',
    'ranged',
    d(1, 8),
    'piercing',
    'slow',
    gp(25),
    lb(5),
    { properties: ['ammunition', 'loading', 'two-handed'], range: range(80, 320) },
  ),
  weapon(
    'light-hammer',
    'Light Hammer',
    'simple',
    'melee',
    d(1, 4),
    'bludgeoning',
    'nick',
    gp(2),
    lb(2),
    {
      properties: ['light', 'thrown'],
      range: range(20, 60),
    },
  ),
  weapon('longbow', 'Longbow', 'martial', 'ranged', d(1, 8), 'piercing', 'slow', gp(50), lb(2), {
    properties: ['ammunition', 'heavy', 'two-handed'],
    range: range(150, 600),
  }),
  weapon('longsword', 'Longsword', 'martial', 'melee', d(1, 8), 'slashing', 'sap', gp(15), lb(3), {
    properties: ['versatile'],
    versatileDamage: d(1, 10),
  }),
  weapon('mace', 'Mace', 'simple', 'melee', d(1, 6), 'bludgeoning', 'sap', gp(5), lb(4)),
  weapon('maul', 'Maul', 'martial', 'melee', d(2, 6), 'bludgeoning', 'topple', gp(10), lb(10), {
    properties: ['heavy', 'two-handed'],
  }),
  weapon(
    'morningstar',
    'Morningstar',
    'martial',
    'melee',
    d(1, 8),
    'piercing',
    'sap',
    gp(15),
    lb(4),
  ),
  weapon('musket', 'Musket', 'martial', 'ranged', d(1, 12), 'piercing', 'slow', gp(500), lb(10), {
    properties: ['ammunition', 'loading', 'two-handed'],
    range: range(40, 120),
  }),
  weapon('net', 'Net', 'martial', 'ranged', undefined, undefined, 'topple', gp(1), lb(3), {
    properties: ['special', 'thrown'],
    range: range(5, 15),
    specialRules: NET_SPECIAL,
  }),
  weapon('pike', 'Pike', 'martial', 'melee', d(1, 10), 'piercing', 'push', gp(5), lb(18), {
    properties: ['heavy', 'reach', 'two-handed'],
  }),
  weapon('pistol', 'Pistol', 'martial', 'ranged', d(1, 10), 'piercing', 'vex', gp(250), lb(3), {
    properties: ['ammunition', 'loading'],
    range: range(30, 90),
  }),
  weapon(
    'quarterstaff',
    'Quarterstaff',
    'simple',
    'melee',
    d(1, 6),
    'bludgeoning',
    'topple',
    sp(2),
    lb(4),
    {
      properties: ['versatile'],
      versatileDamage: d(1, 8),
    },
  ),
  weapon('rapier', 'Rapier', 'martial', 'melee', d(1, 8), 'piercing', 'vex', gp(25), lb(2), {
    properties: ['finesse'],
  }),
  weapon('scimitar', 'Scimitar', 'martial', 'melee', d(1, 6), 'slashing', 'nick', gp(25), lb(3), {
    properties: ['finesse', 'light'],
  }),
  weapon('shortbow', 'Shortbow', 'simple', 'ranged', d(1, 6), 'piercing', 'vex', gp(25), lb(2), {
    properties: ['ammunition', 'two-handed'],
    range: range(80, 320),
  }),
  weapon(
    'shortsword',
    'Shortsword',
    'martial',
    'melee',
    d(1, 6),
    'piercing',
    'vex',
    gp(10),
    lb(2),
    {
      properties: ['finesse', 'light'],
    },
  ),
  weapon('sickle', 'Sickle', 'simple', 'melee', d(1, 4), 'slashing', 'nick', gp(1), lb(2), {
    properties: ['light'],
  }),
  weapon('sling', 'Sling', 'simple', 'ranged', d(1, 4), 'bludgeoning', 'slow', sp(1), lb(0), {
    properties: ['ammunition'],
    range: range(30, 120),
  }),
  weapon('spear', 'Spear', 'simple', 'melee', d(1, 6), 'piercing', 'sap', gp(1), lb(3), {
    properties: ['thrown', 'versatile'],
    versatileDamage: d(1, 8),
    range: range(20, 60),
  }),
  weapon('trident', 'Trident', 'martial', 'melee', d(1, 8), 'piercing', 'topple', gp(5), lb(4), {
    properties: ['thrown', 'versatile'],
    versatileDamage: d(1, 10),
    range: range(20, 60),
  }),
  weapon('war-pick', 'War Pick', 'martial', 'melee', d(1, 8), 'piercing', 'sap', gp(5), lb(2), {
    properties: ['versatile'],
    versatileDamage: d(1, 10),
  }),
  weapon(
    'warhammer',
    'Warhammer',
    'martial',
    'melee',
    d(1, 8),
    'bludgeoning',
    'push',
    gp(15),
    lb(5),
    {
      properties: ['versatile'],
      versatileDamage: d(1, 10),
    },
  ),
  weapon('whip', 'Whip', 'martial', 'melee', d(1, 4), 'slashing', 'slow', gp(2), lb(3), {
    properties: ['finesse', 'reach'],
  }),
]

weapons.sort((a, b) => a.slug.localeCompare(b.slug))

writeFileSync(join(DATA_DIR, 'weapon.json'), `${JSON.stringify(weapons, null, 2)}\n`)

console.log(`Wrote ${weapons.length} weapon records`)
