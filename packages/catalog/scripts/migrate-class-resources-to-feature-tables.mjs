#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../src/classes/data/srd-cc-5.2.1')

/** @type {Record<string, Array<{ featureId: string; tableId: string; tableName: string; columns: Array<{ resourceName: string; columnId: string; label: string }> }>>} */
const MIGRATIONS = {
  barbarian: [
    {
      featureId: 'rage',
      tableId: 'rage-progression',
      tableName: 'Rage progression',
      columns: [
        { resourceName: 'Rages', columnId: 'uses', label: 'Rages' },
        { resourceName: 'Rage Damage', columnId: 'damage-bonus', label: 'Rage Damage' },
      ],
    },
    {
      featureId: 'weapon-mastery',
      tableId: 'weapon-mastery-progression',
      tableName: 'Weapon Mastery progression',
      columns: [{ resourceName: 'Weapon Mastery', columnId: 'masteries', label: 'Weapon Mastery' }],
    },
  ],
  bard: [
    {
      featureId: 'bardic-inspiration',
      tableId: 'bardic-inspiration-progression',
      tableName: 'Bardic Inspiration progression',
      columns: [{ resourceName: 'Bardic Die', columnId: 'die', label: 'Bardic Die' }],
    },
  ],
  cleric: [
    {
      featureId: 'channel-divinity',
      tableId: 'channel-divinity-progression',
      tableName: 'Channel Divinity progression',
      columns: [{ resourceName: 'Channel Divinity', columnId: 'uses', label: 'Channel Divinity' }],
    },
  ],
  druid: [
    {
      featureId: 'wild-shape',
      tableId: 'wild-shape-progression',
      tableName: 'Wild Shape progression',
      columns: [{ resourceName: 'Wild Shape', columnId: 'uses', label: 'Wild Shape' }],
    },
  ],
  fighter: [
    {
      featureId: 'second-wind',
      tableId: 'second-wind-progression',
      tableName: 'Second Wind progression',
      columns: [{ resourceName: 'Second Wind', columnId: 'uses', label: 'Second Wind' }],
    },
    {
      featureId: 'weapon-mastery',
      tableId: 'weapon-mastery-progression',
      tableName: 'Weapon Mastery progression',
      columns: [{ resourceName: 'Weapon Mastery', columnId: 'masteries', label: 'Weapon Mastery' }],
    },
    {
      featureId: 'indomitable',
      tableId: 'indomitable-progression',
      tableName: 'Indomitable progression',
      columns: [{ resourceName: 'Indomitable', columnId: 'uses', label: 'Indomitable' }],
    },
  ],
  monk: [
    {
      featureId: 'martial-arts',
      tableId: 'martial-arts-progression',
      tableName: 'Martial Arts progression',
      columns: [{ resourceName: 'Martial Arts', columnId: 'die', label: 'Martial Arts' }],
    },
    {
      featureId: 'monks-focus',
      tableId: 'monks-focus-progression',
      tableName: "Monk's Focus progression",
      columns: [{ resourceName: 'Focus Points', columnId: 'points', label: 'Focus Points' }],
    },
    {
      featureId: 'unarmored-movement',
      tableId: 'unarmored-movement-progression',
      tableName: 'Unarmored Movement progression',
      columns: [
        { resourceName: 'Unarmored Movement', columnId: 'speed', label: 'Unarmored Movement' },
      ],
    },
  ],
  paladin: [
    {
      featureId: 'channel-divinity',
      tableId: 'channel-divinity-progression',
      tableName: 'Channel Divinity progression',
      columns: [{ resourceName: 'Channel Divinity', columnId: 'uses', label: 'Channel Divinity' }],
    },
  ],
  ranger: [
    {
      featureId: 'favored-enemy',
      tableId: 'favored-enemy-progression',
      tableName: 'Favored Enemy progression',
      columns: [{ resourceName: 'Favored Enemy', columnId: 'uses', label: 'Favored Enemy' }],
    },
  ],
  sorcerer: [
    {
      featureId: 'font-of-magic',
      tableId: 'font-of-magic-progression',
      tableName: 'Font of Magic progression',
      columns: [{ resourceName: 'Sorcery Points', columnId: 'points', label: 'Sorcery Points' }],
    },
  ],
  warlock: [
    {
      featureId: 'eldritch-invocations',
      tableId: 'eldritch-invocations-progression',
      tableName: 'Eldritch Invocations progression',
      columns: [
        { resourceName: 'Eldritch Invocations', columnId: 'count', label: 'Eldritch Invocations' },
      ],
    },
  ],
}

function buildTable(resourceByName, migration) {
  return {
    id: migration.tableId,
    name: migration.tableName,
    kind: 'levelProgression',
    columns: migration.columns.map(({ resourceName, columnId, label }) => {
      const resource = resourceByName.get(resourceName)
      if (!resource) {
        throw new Error(`Missing resource "${resourceName}" for ${migration.featureId}`)
      }
      return {
        id: columnId,
        label,
        valueType: 'number',
        entries: resource.entries.map(({ level, value }) => ({ level, value })),
      }
    }),
  }
}

for (const [slug, migrations] of Object.entries(MIGRATIONS)) {
  const path = join(DATA_DIR, `${slug}.json`)
  const cls = JSON.parse(readFileSync(path, 'utf8'))
  const resources = cls.resources ?? []
  const resourceByName = new Map(resources.map((resource) => [resource.name, resource]))

  for (const migration of migrations) {
    const feature = cls.features.find((entry) => entry.id === migration.featureId)
    if (!feature) {
      throw new Error(`${slug}: missing feature ${migration.featureId}`)
    }
    feature.tables = [...(feature.tables ?? []), buildTable(resourceByName, migration)]
  }

  delete cls.resources
  writeFileSync(path, `${JSON.stringify(cls, null, 2)}\n`)
  console.log(`Migrated ${slug}`)
}
