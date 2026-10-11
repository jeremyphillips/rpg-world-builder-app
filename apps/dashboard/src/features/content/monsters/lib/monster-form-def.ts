import type { CreateMonsterInput, Monster } from '@rpg/contracts'

import {
  contentFormFields,
  contentFormRegistry,
  type ContentFormDef,
} from '../../lib/forms/registry/content-form-registry'
import { managedMediaFormDefFields } from '../../lib/forms/registry/managed-media-form-def.lib'
import { nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { monstersQueryKey, useMonsters } from '../hooks/use-monsters'
import { buildMonsterTabs } from './monster-form-fields'
import { buildMonsterPreviewIdentity, buildMonsterPreviewSections } from './monster-form-preview'
import { resolveMonsterFormSchema } from './monster-form-schema'
import {
  buildMonsterInput,
  monsterToFormValues,
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from './monster-form-values'

const monsterMediaFields = managedMediaFormDefFields('monsters') as {
  supportsManagedMedia: true
  mediaDomain: 'monster'
}

export const monsterFormDef: ContentFormDef<Monster, MonsterFormValues, CreateMonsterInput> = {
  routeKey: 'monsters',
  ...monsterMediaFields,
  schema: resolveMonsterFormSchema({}, 'publish') as ContentFormDef<
    Monster,
    MonsterFormValues,
    CreateMonsterInput
  >['schema'],
  draftSchema: resolveMonsterFormSchema({}, 'draft') as ContentFormDef<
    Monster,
    MonsterFormValues,
    CreateMonsterInput
  >['draftSchema'],
  resolveSchema: resolveMonsterFormSchema,
  nameField,
  resolveCreateDefaultValues: resolveMonsterCreateDefaultValues,
  createDefaultValues: resolveMonsterCreateDefaultValues(),
  buildTabs: buildMonsterTabs,
  buildFields: (ctx) => contentFormFields(monsterFormDef, ctx),
  toFormValues: monsterToFormValues,
  toInput: (values, ctx, validationIntent = 'publish') =>
    buildMonsterInput(values, ctx, validationIntent),
  useListQuery: useMonsters,
  queryKey: monstersQueryKey,
  preview: {
    buildIdentity: (values) => buildMonsterPreviewIdentity(values),
    buildSections: buildMonsterPreviewSections,
  },
}

contentFormRegistry['monsters'] = monsterFormDef
