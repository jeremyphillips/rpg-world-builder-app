/**
 * One-time dev migration: split legacy `activities` into `functions` and `practices`.
 *
 * Run from repo root:
 *   pnpm exec tsx tools/migrations/migrate-organization-activities.ts
 *
 * Requires MONGODB_URI (defaults to mongodb://127.0.0.1:27017/rpg).
 */
import mongoose from 'mongoose'

import { migrateOrganizationActivities } from '../../packages/contracts/src/rpg/vocab/organization-activity-migration'
import { HomebrewOrganizationModel } from '../../apps/api/src/features/content/organizations/homebrew-organization.model'

type LegacyOrganizationDoc = {
  _id: unknown
  activities?: readonly string[]
  functions?: readonly string[]
  practices?: readonly string[]
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/rpg'
  await mongoose.connect(uri)

  const docs = await HomebrewOrganizationModel.find({
    activities: { $exists: true, $ne: [] },
  })
    .select('_id activities functions practices')
    .lean<LegacyOrganizationDoc[]>()

  if (docs.length === 0) {
    console.log('No HomebrewOrganization docs with legacy activities found.')
    await mongoose.disconnect()
    return
  }

  let migratedCount = 0

  for (const doc of docs) {
    const legacyActivities = doc.activities ?? []
    const { functions, practices } = migrateOrganizationActivities(
      legacyActivities as Parameters<typeof migrateOrganizationActivities>[0],
    )

    await HomebrewOrganizationModel.updateOne(
      { _id: doc._id },
      {
        $set: {
          functions,
          practices,
        },
        $unset: { activities: '' },
      },
    )
    migratedCount += 1
  }

  console.log(
    `Migrated ${migratedCount} HomebrewOrganization docs from activities to functions/practices.`,
  )

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
