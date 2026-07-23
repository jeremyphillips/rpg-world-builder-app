import { MAX_CHARACTER_LEVEL, type CreateFeatInput, type Feat } from '@rpg/contracts'

import { contentFormRegistry, type ContentFormDef } from '../../lib/forms/content-form-registry'
import { nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { useFeats, featsQueryKey } from '../hooks/use-feats'
import {
  buildFeatFields,
  createFeatDraftFormSchema,
  createFeatFormSchema,
  featDraftFormSchema,
  featFormSchema,
  type FeatFormValues,
} from './feat-form-fields'
import { buildFeatCreateInput, featCreateDefaultValues, featToFormValues } from './feat-form-values'

const featFormDef: ContentFormDef<Feat, FeatFormValues, CreateFeatInput> = {
  routeKey: 'feats',
  schema: featFormSchema,
  draftSchema: featDraftFormSchema,
  nameField,
  resolveSchema: (ctx, intent = 'publish') => {
    const maxLevel = ctx.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
    return intent === 'draft' ? createFeatDraftFormSchema() : createFeatFormSchema(maxLevel)
  },
  coverage: 'structural',
  createDefaultValues: featCreateDefaultValues,
  buildFields: buildFeatFields,
  toFormValues: featToFormValues,
  toInput: buildFeatCreateInput,
  useListQuery: useFeats,
  queryKey: featsQueryKey,
}

contentFormRegistry['feats'] = featFormDef

export {
  featFormDef,
  featFormSchema,
  featDraftFormSchema,
  createFeatFormSchema,
  createFeatDraftFormSchema,
}
export type { FeatFormValues }
