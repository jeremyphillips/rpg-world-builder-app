import { evaluateFormSchema, runFormAction, type FormItem } from '@rpg/ui/form'

import { createRulesFields } from './rules/character-configuration/character-configuration-form'
import { createIdentityFields, flavorFields } from './settings/campaign-profile-form-fields'
import {
  campaignCreateSchema,
  type CampaignCreateValues,
} from './settings/campaign-settings-form-values'
import { inviteMembersFields } from './forms/invite-members-form-fields'

export const campaignCreateResolverFields: FormItem[] = [
  ...createIdentityFields,
  ...createRulesFields,
  ...flavorFields,
  ...inviteMembersFields,
]

export type CampaignCreateValidationResult =
  | { kind: 'ok'; data: CampaignCreateValues }
  | { kind: 'invalid' }
  | { kind: 'operation-failure'; message: string }

/** Validates wizard accumulated values through runFormAction before create dispatch. */
export async function validateCampaignCreateValues(
  values: Record<string, unknown>,
): Promise<CampaignCreateValidationResult> {
  const attempt = { stamp: 0, attemptId: 1 }
  const readCurrent = () => attempt

  const action = await runFormAction({
    attempt,
    readCurrent,
    input: values,
    stages: [
      {
        id: 'form-evaluate',
        intent: 'form-evaluate',
        run: (input) => {
          const formValues =
            typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {}
          const evaluated = evaluateFormSchema(campaignCreateSchema, input, {
            items: campaignCreateResolverFields,
            formValues,
          })
          if (evaluated.kind === 'invalid') {
            return { kind: 'invalid', issues: evaluated.issues }
          }
          if (evaluated.kind === 'operation-failure') {
            return { kind: 'operation-failure', message: evaluated.message }
          }
          return { kind: 'parsed', data: evaluated.data }
        },
      },
    ],
  })

  if (action.kind === 'blocked') {
    if (action.stageId === 'form-evaluate' && action.issues?.length) {
      return { kind: 'invalid' }
    }
    return { kind: 'operation-failure', message: action.message ?? 'Validation failed.' }
  }

  return { kind: 'ok', data: action.data as CampaignCreateValues }
}
