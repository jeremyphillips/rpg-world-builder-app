import {
  isGrantGroupsEligible,
  resolveTraitName,
  type ContentTraitKind,
  type GrantGroups,
} from '@rpg/contracts'
import {
  collectRowVariantTopologyFields,
  type ArrayRowVariantTopology,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import { creatureTraitTemplateFields } from '../../lib/creature-traits/creature-trait-template-fields'
import type { TraitRowForm } from './species-trait-form-schema'
import { grantArrayFields } from '../../lib/forms/grants/grant-form-fields'
import { GRANT_TYPES, GRANT_TYPE_LABELS } from '../../lib/forms/grants/grant-form-schema'
import { formRowsToGrantGroups } from '../../lib/forms/grants/grant-form-values'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  TRAIT_DERIVED_DISPLAY_DESCRIPTION,
  TRAIT_OVERRIDE_DISPLAY_LABEL,
} from './species-trait-form-labels'

export function visibleForTraitKind(kind: ContentTraitKind): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (watched) => watched['kind'] === kind,
  }
}

/** Form-only: reveals name/description override fields for grant traits. */
export function visibleForGrantOverrides(): FieldVisibility {
  return {
    dependsOn: ['kind', 'overrideDisplay'],
    visibleWhen: (watched) => watched['kind'] === 'grant' && watched['overrideDisplay'] === true,
  }
}

function traitCustomBranchFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'text',
      name: 'name',
      label: 'Name',
      required: true,
    },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
    },
  ]
}

function traitGrantBranchFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'text',
      name: 'nameOverride',
      label: 'Name override',
    },
    {
      kind: 'group',
      heading: {
        label: TRAIT_OVERRIDE_DISPLAY_LABEL,
        hint: TRAIT_DERIVED_DISPLAY_DESCRIPTION,
        labelVisibility: 'srOnly',
      },
      fields: [
        {
          type: 'switch',
          name: 'overrideDisplay',
          label: TRAIT_OVERRIDE_DISPLAY_LABEL,
        },
        {
          type: 'richtext',
          name: 'details',
          label: 'Details',
          linkable: true,
          internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
          contentTypeOptions: ctx.options?.richTextContentTypeOptions,
          optionalDisclosure: { intent: 'add', actionSubject: 'details' },
          visibility: visibleForGrantOverrides(),
        },
      ],
    },
    ...grantArrayFields(GRANT_TYPES, GRANT_TYPE_LABELS, ctx),
  ]
}

function traitTemplateBranchFields(_ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'text',
      name: 'nameOverride',
      label: 'Name override',
    },
    ...creatureTraitTemplateFields(),
  ]
}

export function buildSpeciesTraitRowVariantTopology(ctx: ContentFormCtx): ArrayRowVariantTopology {
  return {
    variants: {
      custom: traitCustomBranchFields(ctx),
      grant: traitGrantBranchFields(ctx),
      template: traitTemplateBranchFields(ctx),
    },
    fallback: traitCustomBranchFields(ctx),
  }
}

/** Compiler registration across declared trait branches (empty rows use topology only). */
export function traitRowVariantTopologyFields(ctx: ContentFormCtx): FormItem[] {
  return collectRowVariantTopologyFields(buildSpeciesTraitRowVariantTopology(ctx))
}

export function traitItemFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      visibility: visibleForTraitKind('custom'),
    },
    {
      kind: 'group',
      heading: {
        label: TRAIT_OVERRIDE_DISPLAY_LABEL,
        hint: TRAIT_DERIVED_DISPLAY_DESCRIPTION,
        labelVisibility: 'srOnly',
      },
      visibility: visibleForTraitKind('grant'),
      fields: [
        {
          type: 'switch',
          name: 'overrideDisplay',
          label: TRAIT_OVERRIDE_DISPLAY_LABEL,
        },
        {
          type: 'richtext',
          name: 'details',
          label: 'Details',
          linkable: true,
          internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
          contentTypeOptions: ctx.options?.richTextContentTypeOptions,
          optionalDisclosure: { intent: 'add', actionSubject: 'details' },
          visibility: visibleForGrantOverrides(),
        },
      ],
    },
    ...creatureTraitTemplateFields(),
    ...grantArrayFields(GRANT_TYPES, GRANT_TYPE_LABELS, ctx).map((field) => ({
      ...field,
      visibility: {
        dependsOn: ['kind'],
        visibleWhen: (watched: Record<string, unknown>) => watched['kind'] !== 'template',
      },
    })),
  ]
}

/** Heritage options always use authored custom traits. */
export function heritageOptionItemFields(ctx: ContentFormCtx): FormItem[] {
  return traitItemFields(ctx)
}

export function traitItemTitle(values: Record<string, unknown>, index: number): string {
  const row = values as TraitRowForm
  if (row.kind === 'template' && row.templateId) {
    return resolveTraitName({
      kind: 'template',
      id: row.id ?? `trait-${index}`,
      templateId: row.templateId,
      config: row.config,
    })
  }
  if (row.kind === 'grant') {
    const grantGroups: GrantGroups = formRowsToGrantGroups(row.grants)
    if (isGrantGroupsEligible(grantGroups)) {
      return resolveTraitName({
        kind: 'grant',
        id: row.id ?? `trait-${index}`,
        grantGroups,
        nameOverride: row.nameOverride,
      })
    }
  }
  return row.name?.trim() || ''
}
