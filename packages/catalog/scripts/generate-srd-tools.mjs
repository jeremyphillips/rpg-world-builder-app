/**
 * One-off generator for SRD 5.2.1 tool seed data.
 * Run: node packages/catalog/scripts/generate-srd-tools.mjs
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

const util = (description, dc) => ({ description, dc })

function tool(slug, name, toolCategory, ability, cost, utilizes, extra = {}) {
  const { weight, crafts } = extra
  return {
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
    ...(weight !== undefined && { weight }),
    kind: 'tool',
    toolCategory,
    ability,
    utilizes,
    ...(crafts !== undefined && { crafts }),
  }
}

const tools = [
  // Artisan's tools (17)
  tool(
    'alchemists-supplies',
    "Alchemist's Supplies",
    'artisan',
    'int',
    gp(50),
    [util('Identify a substance', 15), util('Start a fire', 15)],
    {
      weight: lb(8),
      crafts: ['Acid', "Alchemist's Fire", 'Component Pouch', 'Oil', 'Paper', 'Perfume'],
    },
  ),
  tool(
    'brewers-supplies',
    "Brewer's Supplies",
    'artisan',
    'int',
    gp(20),
    [util('Detect poisoned drink', 15), util('Identify alcohol', 10)],
    { weight: lb(9), crafts: ['Antitoxin'] },
  ),
  tool(
    'calligraphers-supplies',
    "Calligrapher's Supplies",
    'artisan',
    'dex',
    gp(10),
    [util('Write text with impressive flourishes that guard against forgery', 15)],
    { weight: lb(5), crafts: ['Ink', 'Spell Scroll'] },
  ),
  tool(
    'carpenters-tools',
    "Carpenter's Tools",
    'artisan',
    'str',
    gp(8),
    [util('Seal or pry open a door or container', 20)],
    {
      weight: lb(6),
      crafts: [
        'Club',
        'Greatclub',
        'Quarterstaff',
        'Barrel',
        'Chest',
        'Ladder',
        'Pole',
        'Portable Ram',
        'Torch',
      ],
    },
  ),
  tool(
    'cartographers-tools',
    "Cartographer's Tools",
    'artisan',
    'wis',
    gp(15),
    [util('Draft a map of a small area', 15)],
    { weight: lb(6), crafts: ['Map'] },
  ),
  tool(
    'cobblers-tools',
    "Cobbler's Tools",
    'artisan',
    'dex',
    gp(5),
    [
      util(
        "Modify footwear to give Advantage on the wearer's next Dexterity (Acrobatics) check",
        10,
      ),
    ],
    { weight: lb(5), crafts: ["Climber's Kit"] },
  ),
  tool(
    'cooks-utensils',
    "Cook's Utensils",
    'artisan',
    'wis',
    gp(1),
    [util("Improve food's flavor", 10), util('Detect spoiled or poisoned food', 15)],
    { weight: lb(8), crafts: ['Rations'] },
  ),
  tool(
    'glassblowers-tools',
    "Glassblower's Tools",
    'artisan',
    'int',
    gp(30),
    [util('Discern what a glass object held in the past 24 hours', 15)],
    {
      weight: lb(5),
      crafts: ['Glass Bottle', 'Magnifying Glass', 'Spyglass', 'Vial'],
    },
  ),
  tool(
    'jewelers-tools',
    "Jeweler's Tools",
    'artisan',
    'int',
    gp(25),
    [util("Discern a gem's value", 15)],
    { weight: lb(2), crafts: ['Arcane Focus', 'Holy Symbol'] },
  ),
  tool(
    'leatherworkers-tools',
    "Leatherworker's Tools",
    'artisan',
    'dex',
    gp(5),
    [util('Add a design to a leather item', 10)],
    {
      weight: lb(5),
      crafts: [
        'Sling',
        'Whip',
        'Hide Armor',
        'Leather Armor',
        'Studded Leather Armor',
        'Backpack',
        'Crossbow Bolt Case',
        'Map or Scroll Case',
        'Parchment',
        'Pouch',
        'Quiver',
        'Waterskin',
      ],
    },
  ),
  tool(
    'masons-tools',
    "Mason's Tools",
    'artisan',
    'str',
    gp(10),
    [util('Chisel a symbol or hole in stone', 10)],
    { weight: lb(8), crafts: ['Block and Tackle'] },
  ),
  tool(
    'painters-supplies',
    "Painter's Supplies",
    'artisan',
    'wis',
    gp(10),
    [util("Paint a recognizable image of something you've seen", 10)],
    { weight: lb(5), crafts: ['Druidic Focus', 'Holy Symbol'] },
  ),
  tool(
    'potters-tools',
    "Potter's Tools",
    'artisan',
    'int',
    gp(10),
    [util('Discern what a ceramic object held in the past 24 hours', 15)],
    { weight: lb(3), crafts: ['Jug', 'Lamp'] },
  ),
  tool(
    'smiths-tools',
    "Smith's Tools",
    'artisan',
    'str',
    gp(20),
    [util('Pry open a door or container', 20)],
    {
      weight: lb(8),
      crafts: [
        'Any Melee weapon (except Club, Greatclub, Quarterstaff, and Whip)',
        'Medium armor (except Hide)',
        'Heavy armor',
        'Ball Bearings',
        'Bucket',
        'Caltrops',
        'Chain',
        'Crowbar',
        'Firearm Bullets',
        'Grappling Hook',
        'Iron Pot',
        'Iron Spikes',
        'Sling Bullets',
      ],
    },
  ),
  tool(
    'tinkers-tools',
    "Tinker's Tools",
    'artisan',
    'dex',
    gp(50),
    [util('Assemble a Tiny item composed of scrap, which falls apart in 1 minute', 20)],
    {
      weight: lb(10),
      crafts: [
        'Musket',
        'Pistol',
        'Bell',
        'Bullseye Lantern',
        'Flask',
        'Hooded Lantern',
        'Hunting Trap',
        'Lock',
        'Manacles',
        'Mirror',
        'Shovel',
        'Signal Whistle',
        'Tinderbox',
      ],
    },
  ),
  tool(
    'weavers-tools',
    "Weaver's Tools",
    'artisan',
    'dex',
    gp(1),
    [util('Mend a tear in clothing', 10), util('Sew a Tiny design', 10)],
    {
      weight: lb(5),
      crafts: [
        'Padded Armor',
        'Basket',
        'Bedroll',
        'Blanket',
        'Fine Clothes',
        'Net',
        'Robe',
        'Rope',
        'Sack',
        'String',
        'Tent',
        "Traveler's Clothes",
      ],
    },
  ),
  tool(
    'woodcarvers-tools',
    "Woodcarver's Tools",
    'artisan',
    'dex',
    gp(1),
    [util('Carve a pattern in wood', 10)],
    {
      weight: lb(5),
      crafts: [
        'Club',
        'Greatclub',
        'Quarterstaff',
        'Ranged weapons (except Pistol, Musket, and Sling)',
        'Arcane Focus',
        'Arrows',
        'Bolts',
        'Druidic Focus',
        'Ink Pen',
        'Needles',
      ],
    },
  ),

  // Gaming sets (4)
  tool('dice', 'Dice', 'gaming_set', 'wis', sp(1), [
    util('Discern whether someone is cheating', 10),
    util('Win the game', 20),
  ]),
  tool('dragonchess', 'Dragonchess', 'gaming_set', 'wis', gp(1), [
    util('Discern whether someone is cheating', 10),
    util('Win the game', 20),
  ]),
  tool('playing-cards', 'Playing Cards', 'gaming_set', 'wis', sp(5), [
    util('Discern whether someone is cheating', 10),
    util('Win the game', 20),
  ]),
  tool('three-dragon-ante', 'Three-Dragon Ante', 'gaming_set', 'wis', gp(1), [
    util('Discern whether someone is cheating', 10),
    util('Win the game', 20),
  ]),

  // Musical instruments (10)
  tool(
    'bagpipes',
    'Bagpipes',
    'musical_instrument',
    'cha',
    gp(30),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(6) },
  ),
  tool(
    'drum',
    'Drum',
    'musical_instrument',
    'cha',
    gp(6),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(3) },
  ),
  tool(
    'dulcimer',
    'Dulcimer',
    'musical_instrument',
    'cha',
    gp(25),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(10) },
  ),
  tool(
    'flute',
    'Flute',
    'musical_instrument',
    'cha',
    gp(2),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(1) },
  ),
  tool(
    'horn',
    'Horn',
    'musical_instrument',
    'cha',
    gp(3),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(2) },
  ),
  tool(
    'lute',
    'Lute',
    'musical_instrument',
    'cha',
    gp(35),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(2) },
  ),
  tool(
    'lyre',
    'Lyre',
    'musical_instrument',
    'cha',
    gp(30),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(2) },
  ),
  tool(
    'pan-flute',
    'Pan Flute',
    'musical_instrument',
    'cha',
    gp(12),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(2) },
  ),
  tool(
    'shawm',
    'Shawm',
    'musical_instrument',
    'cha',
    gp(2),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(1) },
  ),
  tool(
    'viol',
    'Viol',
    'musical_instrument',
    'cha',
    gp(30),
    [util('Play a known tune', 10), util('Improvise a song', 15)],
    { weight: lb(1) },
  ),

  // Other specialty kits (4)
  tool('disguise-kit', 'Disguise Kit', 'other', 'cha', gp(25), [util('Apply makeup', 10)], {
    weight: lb(3),
    crafts: ['Costume'],
  }),
  tool(
    'forgery-kit',
    'Forgery Kit',
    'other',
    'dex',
    gp(15),
    [
      util("Mimic 10 or fewer words of someone else's handwriting", 15),
      util('Duplicate a wax seal', 20),
    ],
    { weight: lb(5) },
  ),
  tool('herbalism-kit', 'Herbalism Kit', 'other', 'int', gp(5), [util('Identify a plant', 10)], {
    weight: lb(3),
    crafts: ['Antitoxin', 'Candle', "Healer's Kit", 'Potion of Healing'],
  }),
  tool(
    'poisoners-kit',
    "Poisoner's Kit",
    'other',
    'int',
    gp(50),
    [util('Detect a poisoned object', 10)],
    { weight: lb(2), crafts: ['Basic Poison'] },
  ),

  // Navigator's tools (1)
  tool(
    'navigators-tools',
    "Navigator's Tools",
    'navigator',
    'wis',
    gp(25),
    [util('Plot a course', 10), util('Determine position by stargazing', 15)],
    { weight: lb(2) },
  ),

  // Thieves' tools (1)
  tool(
    'thieves-tools',
    "Thieves' Tools",
    'thieves',
    'dex',
    gp(25),
    [util('Pick a lock', 15), util('Disarm a trap', 15)],
    { weight: lb(1) },
  ),
]

tools.sort((a, b) => a.slug.localeCompare(b.slug))

if (tools.length !== 37) {
  throw new Error(`Expected 37 tools, got ${tools.length}`)
}

const outPath = join(DATA_DIR, 'tool.json')
writeFileSync(outPath, `${JSON.stringify(tools, null, 2)}\n`)
console.log(`Wrote ${tools.length} tools to ${outPath}`)
