import { z } from 'zod'

import { systemRulesetIdSchema } from '../primitives/ruleset'
import { versionedTemplateMetadataSchema } from '../primitives/versioned-template'
import { campaignConfigurationSchema, campaignIdentitySchema } from './campaign'
import { updateCampaignCharacterCreationInputSchema } from './patches/campaign-character-creation-patch'

/** Campaign fields a template may preconfigure. The user still supplies the campaign name. */
export const campaignTemplateDefaultsSchema = z.object({
  identity: campaignIdentitySchema.omit({ name: true }).strict().optional(),
  configuration: campaignConfigurationSchema.optional(),
  characterCreation: updateCampaignCharacterCreationInputSchema.optional(),
})

export type CampaignTemplateDefaults = z.infer<typeof campaignTemplateDefaultsSchema>

/**
 * A shipped starting point for campaign creation.
 *
 * World content remains independently versioned and is linked by stable pack
 * id so template presentation/default changes do not duplicate seed entries.
 */
export const campaignTemplateSchema = z.object({
  metadata: versionedTemplateMetadataSchema,
  rulesetId: systemRulesetIdSchema,
  defaults: campaignTemplateDefaultsSchema,
  worldSeedPackIds: z.array(z.string().min(1)).default([]),
})

export type CampaignTemplate = z.infer<typeof campaignTemplateSchema>

/**
 * Descriptor-only stub for a future collection of world-content seed entries.
 * Add a typed contents field when the first seeded world content type lands.
 */
export const worldSeedPackSchema = z.object({
  metadata: versionedTemplateMetadataSchema,
  rulesetId: systemRulesetIdSchema,
})

export type WorldSeedPack = z.infer<typeof worldSeedPackSchema>

/** Shipped preset catalog shape, including cross-record integrity checks. */
export const campaignPresetCatalogSchema = z
  .object({
    campaignTemplates: z.array(campaignTemplateSchema),
    worldSeedPacks: z.array(worldSeedPackSchema),
  })
  .superRefine(({ campaignTemplates, worldSeedPacks }, ctx) => {
    for (const [collectionName, collection] of [
      ['campaignTemplates', campaignTemplates],
      ['worldSeedPacks', worldSeedPacks],
    ] as const) {
      for (const field of ['id', 'slug'] as const) {
        const seen = new Set<string>()
        for (const [index, entry] of collection.entries()) {
          const value = entry.metadata[field]
          if (seen.has(value)) {
            ctx.addIssue({
              code: 'custom',
              message: `Duplicate ${field} "${value}"`,
              path: [collectionName, index, 'metadata', field],
            })
          }
          seen.add(value)
        }
      }
    }

    const packsById = new Map(worldSeedPacks.map((pack) => [pack.metadata.id, pack]))

    for (const [templateIndex, template] of campaignTemplates.entries()) {
      for (const [packIndex, packId] of template.worldSeedPackIds.entries()) {
        const pack = packsById.get(packId)
        if (!pack) {
          ctx.addIssue({
            code: 'custom',
            message: `Unknown world seed pack id "${packId}"`,
            path: ['campaignTemplates', templateIndex, 'worldSeedPackIds', packIndex],
          })
        } else if (pack.rulesetId !== template.rulesetId) {
          ctx.addIssue({
            code: 'custom',
            message: `World seed pack "${packId}" targets a different ruleset`,
            path: ['campaignTemplates', templateIndex, 'worldSeedPackIds', packIndex],
          })
        }
      }
    }
  })

export type CampaignPresetCatalog = z.infer<typeof campaignPresetCatalogSchema>
