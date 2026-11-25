import type { ClassBodyFeature, ContentTrait, FacingResolution } from '@rpg/contracts'

import { adaptClassFeatureDraftRow } from './adapters/class-feature-draft.adapter'
import type { ContentFormCtx } from '../lib/forms/registry/content-form-registry'
import type { MonsterActionSection } from '../monsters/lib/actions/references/monster-action-equipment-references'
import type { MonsterFormValues } from '../monsters/lib/monster-form-values'
import {
  resolveClassFeatureDraftFacing,
  resolveClassFeaturePersistedFacing,
} from './domains/class-feature/resolve-class-feature-facing'
import type { ClassFacingHostContext } from './domains/class-feature/class-facing-host'
import { resolveMonsterActionDraftFacing } from './domains/monster-action/resolve-monster-action-draft-facing'
import {
  resolveMonsterTraitDraftFacing,
  resolveSpeciesTraitDraftFacing,
  resolveTraitPersistedFacing,
} from './domains/trait/resolve-trait-facing'
import type { TraitRowForm } from '../species/lib/species-trait-form-fields'

export type ResolveFacingRequest =
  | {
      domain: 'classFeature'
      source: 'draft'
      row: unknown
      host: ClassFacingHostContext
    }
  | {
      domain: 'classFeature'
      source: 'persisted'
      feature: ClassBodyFeature
      host: ClassFacingHostContext
    }
  | {
      domain: 'monsterAction'
      source: 'draft'
      values: MonsterFormValues
      ctx: ContentFormCtx
      actionId: string
      section: MonsterActionSection
    }
  | {
      domain: 'trait'
      source: 'persisted'
      trait: ContentTrait
    }
  | {
      domain: 'trait'
      source: 'draft'
      hostId: 'species-traits' | 'heritage-options'
      row: TraitRowForm
    }
  | {
      domain: 'trait'
      source: 'draft'
      hostId: 'monster-traits'
      row: Record<string, unknown>
      monster: Pick<
        MonsterFormValues,
        'name' | 'lair' | 'forms' | 'movement' | 'movementAlternative'
      >
    }

type DraftTraitFacingRequest = Extract<ResolveFacingRequest, { domain: 'trait'; source: 'draft' }>

export function resolveFacing(
  request: Exclude<ResolveFacingRequest, DraftTraitFacingRequest>,
): FacingResolution
export function resolveFacing(request: ResolveFacingRequest): FacingResolution | undefined
export function resolveFacing(request: ResolveFacingRequest): FacingResolution | undefined {
  switch (request.domain) {
    case 'classFeature': {
      if (request.source === 'persisted') {
        return resolveClassFeaturePersistedFacing(request.feature, request.host)
      }
      const adapted = adaptClassFeatureDraftRow(request.row)
      if (adapted.status === 'incomplete') {
        return { status: 'incomplete', reason: adapted.reason }
      }
      if (adapted.status === 'invalid') {
        return { status: 'invalid', reason: adapted.reason }
      }
      return resolveClassFeatureDraftFacing(adapted.record, request.host)
    }
    case 'monsterAction':
      return resolveMonsterActionDraftFacing({
        values: request.values,
        ctx: request.ctx,
        actionId: request.actionId,
        section: request.section,
      }).resolution
    case 'trait':
      return resolveTraitFacing(request)
  }
}

function resolveTraitFacing(
  request: Extract<ResolveFacingRequest, { domain: 'trait' }>,
): FacingResolution | undefined {
  if (request.source === 'persisted') {
    return resolveTraitPersistedFacing(request.trait)
  }
  if (request.row.kind === 'custom') return undefined
  if (request.hostId === 'monster-traits') {
    const resolution = resolveMonsterTraitDraftFacing({
      row: request.row,
      monster: request.monster,
    })
    return resolution ?? { status: 'invalid', reason: { code: 'unsupported-kind' } }
  }
  const resolution = resolveSpeciesTraitDraftFacing(request.row)
  return resolution ?? { status: 'invalid', reason: { code: 'unresolvable-record' } }
}
