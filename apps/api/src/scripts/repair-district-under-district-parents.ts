/**
 * Dev repair: reparent published districts nested under another district to the
 * nearest settlement ancestor.
 *
 * Run from repo root:
 *   pnpm --filter @rpg/api exec tsx src/scripts/repair-district-under-district-parents.ts
 *
 * Optional dry run:
 *   DRY_RUN=1 pnpm --filter @rpg/api exec tsx src/scripts/repair-district-under-district-parents.ts
 *
 * Requires MONGODB_URI (defaults to mongodb://127.0.0.1:27017/rpg).
 */
import mongoose from 'mongoose'

import {
  buildLocationHierarchyGraphFromNodes,
  planDistrictUnderDistrictRepair,
  type LocationHierarchyNode,
} from '@rpg/contracts'

import { HomebrewLocationModel } from '../features/content/locations/homebrew-location.model'

type LocationRecord = {
  _id: unknown
  campaignId: string
  kind: LocationHierarchyNode['kind']
  name: string
  parentLocationId?: string
  status: string
}

const LANKHMAR_CHAIN_NAMES = ['Lankhmar', 'Park', 'Tenderloin', 'Guildhouse', 'Silver Eel'] as const

async function main(): Promise<void> {
  const dryRun = process.env.DRY_RUN === '1'
  const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/rpg'
  await mongoose.connect(uri)

  const records = await HomebrewLocationModel.find({})
    .select('campaignId kind name parentLocationId status')
    .lean<LocationRecord[]>()

  const nodes: LocationHierarchyNode[] = records.map((record) => ({
    id: String(record._id),
    kind: record.kind,
    parentLocationId: record.parentLocationId,
  }))
  const locationsById = buildLocationHierarchyGraphFromNodes(nodes)
  const recordsById = new Map(records.map((record) => [String(record._id), record]))

  const districtUnderDistrict = records.filter((record) => {
    if (record.kind !== 'district' || !record.parentLocationId) {
      return false
    }

    const parent = recordsById.get(record.parentLocationId)
    return parent?.kind === 'district'
  })

  console.log(`District-under-district count: ${districtUnderDistrict.length}`)
  console.log(
    `Published district-under-district count: ${
      districtUnderDistrict.filter((record) => record.status === 'published').length
    }`,
  )

  for (const name of LANKHMAR_CHAIN_NAMES) {
    const matches = records.filter((record) => record.name === name)
    if (matches.length === 0) {
      console.log(`${name}: not found`)
      continue
    }

    for (const match of matches) {
      console.log(
        `${name}: id=${String(match._id)} kind=${match.kind} parentLocationId=${match.parentLocationId ?? 'none'} status=${match.status}`,
      )
    }
  }

  const repairPlans = districtUnderDistrict
    .map((record) => {
      const node = locationsById.get(String(record._id))
      if (!node) {
        return null
      }
      return planDistrictUnderDistrictRepair(node, locationsById)
    })
    .filter(
      (plan): plan is Exclude<typeof plan, null | { status: 'valid' }> =>
        plan != null && plan.status !== 'valid',
    )

  const unrepairable = repairPlans.filter((plan) => plan.status === 'unrepairable')
  if (unrepairable.length > 0) {
    console.error('Unrepairable district nests (no settlement ancestor):')
    for (const plan of unrepairable) {
      const record = recordsById.get(plan.districtId)
      console.error(`- ${record?.name ?? plan.districtId}`)
    }
    await mongoose.disconnect()
    process.exitCode = 1
    return
  }

  const repairs = repairPlans.filter((plan) => plan.status === 'repair')
  if (repairs.length === 0) {
    console.log('No district-under-district records require repair.')
    await mongoose.disconnect()
    return
  }

  console.log(`Repairing ${repairs.length} district nest(s)${dryRun ? ' (dry run)' : ''}...`)
  for (const plan of repairs) {
    const record = recordsById.get(plan.districtId)
    console.log(
      `- ${record?.name ?? plan.districtId}: parentLocationId ${record?.parentLocationId} -> ${plan.repairedParentId}`,
    )

    if (!dryRun) {
      await HomebrewLocationModel.updateOne(
        { _id: plan.districtId },
        { $set: { parentLocationId: plan.repairedParentId } },
      )
    }
  }

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
