import { MAX_CHARACTER_LEVEL, type CreateFeatInput, type Feat } from '@rpg/contracts'

import { contentFormRegistry, type ContentFormDef } from '../../lib/forms/content-form-registry'
import { useFeats, featsQueryKey } from '../hooks/use-feats'
import {
  buildFeatFields,
  createFeatFormSchema,
  featFormSchema,
  type FeatFormValues,
} from './feat-form-fields'
import { buildFeatCreateInput, featCreateDefaultValues, featToFormValues } from './feat-form-values'

const featFormDef: ContentFormDef<Feat, FeatFormValues, CreateFeatInput> = {
  routeKey: 'feats',
  schema: featFormSchema,
  resolveSchema: (ctx) =>
    createFeatFormSchema(ctx.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL),
  coverage: 'structural',
  createDefaultValues: featCreateDefaultValues,
  buildFields: buildFeatFields,
  toFormValues: featToFormValues,
  toInput: buildFeatCreateInput,
  useListQuery: useFeats,
  queryKey: featsQueryKey,
}

contentFormRegistry['feats'] = featFormDef

export { featFormDef, featFormSchema, createFeatFormSchema }
export type { FeatFormValues }
