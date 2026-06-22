import {
  diffClassSkillEdges,
  skillProficiencyBodySchema,
  skillSlugsSuggestingClass,
  suggestedClassesSchema,
  type SkillProficiency,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'
import { skillProficiencyWriteConfig } from '../skill-proficiencies/skill-proficiencies.config'
import { HomebrewSkillProficiencyModel } from '../skill-proficiencies/homebrew-skill-proficiency.model'
import { SkillProficiencyPatchModel } from '../skill-proficiencies/skill-proficiency-patch.model'
import { deepMerge } from './deep-merge'

function skillEntityBody(skill: SkillProficiency): Record<string, unknown> {
  const {
    id: _id,
    slug: _slug,
    rulesetId: _rulesetId,
    source: _source,
    campaignId: _campaignId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...body
  } = skill
  return body
}

/** Reads `proficiencies.skills.from` when present on a class create/update payload. */
export function extractSkillsFromFromUpdate(input: Record<string, unknown>): string[] | undefined {
  const proficiencies = input.proficiencies
  if (!proficiencies || typeof proficiencies !== 'object') return undefined
  const skills = (proficiencies as Record<string, unknown>).skills
  if (!skills || typeof skills !== 'object') return undefined
  const from = (skills as Record<string, unknown>).from
  if (!Array.isArray(from)) return undefined
  return from.filter((value): value is string => typeof value === 'string')
}

async function setSkillSuggestedClasses(
  campaignId: string,
  skill: SkillProficiency,
  suggestedClasses: string[],
): Promise<void> {
  suggestedClassesSchema.parse(suggestedClasses)

  if (skill.source === 'homebrew') {
    if (skill.campaignId !== campaignId) {
      throw new HttpError(403, 'forbidden', 'Cannot edit homebrew from another campaign.')
    }
    const updated = await HomebrewSkillProficiencyModel.findOneAndUpdate(
      { _id: skill.id, campaignId },
      { $set: { suggestedClasses } },
      { new: true },
    ).lean()
    if (!updated) {
      throw new HttpError(404, 'not_found', `Skill proficiency "${skill.slug}" not found.`)
    }
    return
  }

  const existingPatchDoc = await SkillProficiencyPatchModel.findOne({
    campaignId,
    targetId: skill.id,
  }).lean<{ patch: Record<string, unknown> }>()

  const cumulativePatch = deepMerge(existingPatchDoc?.patch ?? {}, { suggestedClasses })
  const mergedBody = deepMerge(skillEntityBody(skill), cumulativePatch)
  skillProficiencyBodySchema.parse(mergedBody)

  await SkillProficiencyPatchModel.findOneAndUpdate(
    { campaignId, targetId: skill.id },
    { $set: { patch: cumulativePatch } },
    { upsert: true, new: true },
  )
}

/**
 * Keeps `skill.suggestedClasses` aligned when a class form edits `proficiencies.skills.from`.
 * Call after the class record is persisted; diffs against the skill-side SSOT.
 */
export async function syncSuggestedClassesFromClass(
  campaignId: string,
  classSlug: string,
  nextSkillSlugs: readonly string[],
): Promise<void> {
  const skills = await resolveCatalogForCampaign(skillProficiencyWriteConfig.readConfig, campaignId)
  const previousSkillSlugs = skillSlugsSuggestingClass(classSlug, skills)
  const { added, removed } = diffClassSkillEdges(previousSkillSlugs, nextSkillSlugs)

  if (added.length === 0 && removed.length === 0) return

  const skillBySlug = new Map(skills.map((skill) => [skill.slug, skill]))
  const updates: Promise<void>[] = []

  for (const skillSlug of added) {
    const skill = skillBySlug.get(skillSlug)
    if (!skill) {
      throw new HttpError(404, 'not_found', `Skill proficiency "${skillSlug}" not found.`)
    }
    const nextSuggested = [...new Set([...skill.suggestedClasses, classSlug])]
    updates.push(setSkillSuggestedClasses(campaignId, skill, nextSuggested))
  }

  for (const skillSlug of removed) {
    const skill = skillBySlug.get(skillSlug)
    if (!skill) continue
    const nextSuggested = skill.suggestedClasses.filter((slug) => slug !== classSlug)
    if (nextSuggested.length === 0) {
      throw new HttpError(
        400,
        'validation_error',
        `Cannot remove skill "${skillSlug}" — "${classSlug}" is the only suggested class.`,
      )
    }
    updates.push(setSkillSuggestedClasses(campaignId, skill, nextSuggested))
  }

  await Promise.all(updates)
}
