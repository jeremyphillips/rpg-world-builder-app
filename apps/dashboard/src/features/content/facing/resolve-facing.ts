import type { ClassBodyFeature, ContentTrait, FacingResolution } from '@rpg/contracts'

import { adaptClassFeatureDraftRow } from './adapters/class-feature-draft.adapter'
import type { FeatureRowForm } from '../classes/lib/class-feature-form-fields'
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
      row: TraitRowForm & { id: string }
    }

export function resolveFacing(request: ResolveFacingRequest): FacingResolution {
  switch (request.domain) {
    case 'classFeature': {
      if (request.source === 'persisted') {
        return resolveClassFeaturePersistedFacing(request.feature, request.host)
      }
      const adapted = adaptClassFeatureDraftRow(request.row)
      if (adapted.status === 'invalid') return { status: 'invalid', code: adapted.code }
      return resolveClassFeatureDraftFacing(adapted.record, request.host)
    }
    case 'monsterAction':
      return resolveMonsterActionDraftFacing({
        values: request.values,
        ctx: request.ctx,
        actionId: request.actionId,
        section: request.section,
      })
    case 'trait': {
      if (request.source === 'persisted') {
        return resolveTraitPersistedFacing(request.trait)
      }
      const resolution = resolveSpeciesTraitDraftFacing(request.row)
      return resolution ?? { status: 'invalid', code: 'missing-kind' }
    }
  }
}

export function resolveClassFeatureRowFacing(
  row: FeatureRowForm | undefined,
  host: ClassFacingHostContext,
): FacingResolution | undefined {
  if (!row) return undefined
  return resolveFacing({ domain: 'classFeature', source: 'draft', row, host })
}
