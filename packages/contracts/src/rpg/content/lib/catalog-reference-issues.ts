import type { ContentValidationIntent } from './content-validation-intent'
import type { ContentResolutionRow } from './content-resolution-policy'
import { isContentCampaignEligible, isContentReferenceable } from './content-resolution-policy'

/**
 * Wire codes for catalog-reference issues. One table owns the strings.
 * A subject can only index the checks that subject supports.
 */
export const CATALOG_REFERENCE_ISSUE_CODE = {
  spell: {
    unknown: 'unknown_spell',
    notReferenceable: 'spell_not_referenceable',
    catalogUnavailable: 'spell_catalog_unavailable',
  },
  skill: {
    unknown: 'unknown_skill',
    notReferenceable: 'skill_not_referenceable',
    notCampaignEligible: 'skill_not_campaign_eligible',
    catalogUnavailable: 'skill_catalog_unavailable',
  },
  equipment: {
    unknown: 'unknown_equipment',
    catalogUnavailable: 'equipment_catalog_unavailable',
  },
} as const

export type CatalogReferenceSubject = keyof typeof CATALOG_REFERENCE_ISSUE_CODE

export type CatalogReferenceCheck<S extends CatalogReferenceSubject> =
  keyof (typeof CATALOG_REFERENCE_ISSUE_CODE)[S] & string

export type CatalogReferenceIssueCode<S extends CatalogReferenceSubject> =
  (typeof CATALOG_REFERENCE_ISSUE_CODE)[S][CatalogReferenceCheck<S>]

export type CatalogReferenceIssue<S extends CatalogReferenceSubject> = {
  path: string
  message: string
  code: CatalogReferenceIssueCode<S>
}

/** Which checks run on which intent. No paths, messages, or host names. */
export type CatalogReferencePolicy<S extends CatalogReferenceSubject> = {
  subject: S
  checks: Partial<{
    [K in CatalogReferenceCheck<S>]: readonly ContentValidationIntent[]
  }>
}

export type CatalogReferenceMessages<P extends { checks: object }> = {
  [K in keyof P['checks'] & string]: string
}

export type CatalogReferenceUnavailablePlacement =
  | { kind: 'per-ref' }
  | { kind: 'aggregate'; path: string }

/** Subject `spell`. Unknown on draft and publish. Referenceable and catalog availability on publish only. */
export const spellReferencePolicy = {
  subject: 'spell',
  checks: {
    unknown: ['draft', 'publish'],
    notReferenceable: ['publish'],
    catalogUnavailable: ['publish'],
  },
} as const satisfies CatalogReferencePolicy<'spell'>

/** Subject `skill`. All four checks, publish only. */
export const skillReferencePolicy = {
  subject: 'skill',
  checks: {
    unknown: ['publish'],
    notReferenceable: ['publish'],
    notCampaignEligible: ['publish'],
    catalogUnavailable: ['publish'],
  },
} as const satisfies CatalogReferencePolicy<'skill'>

/** Subject `equipment`. Presence only: unknown on draft and publish, catalog availability on publish. */
export const equipmentPresencePolicy = {
  subject: 'equipment',
  checks: {
    unknown: ['draft', 'publish'],
    catalogUnavailable: ['publish'],
  },
} as const satisfies CatalogReferencePolicy<'equipment'>

/**
 * Authored spell ids. Key is a content id. Resolver is the spell map keyed by `spell.id`.
 * Class, subclass, and species share this edge through the authored-spell walker.
 */
export const authoredSpellIdsEdge = {
  policy: spellReferencePolicy,
  unavailablePlacement: { kind: 'per-ref' } as const satisfies CatalogReferenceUnavailablePlacement,
  messages: {
    unknown: 'Choose a spell from the catalog.',
    notReferenceable: 'Draft spells cannot be referenced on published content.',
    catalogUnavailable: 'The spell catalog is unavailable, so this reference cannot be checked.',
  },
}

/**
 * Monster skill proficiencies. Key is a skill slug. Resolver is `skillBySlug`.
 * One unavailable issue is attached at `proficiencies.skills`.
 */
export const monsterSkillProficienciesEdge = {
  policy: skillReferencePolicy,
  unavailablePlacement: {
    kind: 'aggregate',
    path: 'proficiencies.skills',
  } as const satisfies CatalogReferenceUnavailablePlacement,
  messages: {
    unknown: 'Unknown skill.',
    notReferenceable: 'Publish this skill before using it on a monster.',
    notCampaignEligible: 'This skill is not available in this campaign.',
    catalogUnavailable: 'Skills could not be loaded. Try again before publishing.',
  },
}

/**
 * Monster equipment rows. Key is an equipment content id. Resolver is `equipmentById`.
 * One unavailable issue is attached at `equipment`.
 */
export const monsterEquipmentEdge = {
  policy: equipmentPresencePolicy,
  unavailablePlacement: {
    kind: 'aggregate',
    path: 'equipment',
  } as const satisfies CatalogReferenceUnavailablePlacement,
  messages: {
    unknown: 'Unknown equipment.',
    catalogUnavailable: 'Equipment could not be loaded. Try again before publishing.',
  },
}

type CatalogReferenceCollectorArgs<
  S extends CatalogReferenceSubject,
  P extends CatalogReferencePolicy<S>,
> = {
  policy: P
  intent: ContentValidationIntent
  catalogStatus: 'ready' | 'unavailable'
  refs: readonly { path: string; key: string }[]
  resolve: (key: string) => ContentResolutionRow | undefined
  unavailablePlacement: CatalogReferenceUnavailablePlacement
  messages: CatalogReferenceMessages<P>
}

function checkApplies(checks: object, check: string, intent: ContentValidationIntent): boolean {
  if (!Object.hasOwn(checks, check)) return false
  const intents = (checks as Record<string, readonly ContentValidationIntent[] | undefined>)[check]
  return intents?.includes(intent) ?? false
}

function messageFor(messages: object, check: string): string | undefined {
  if (!Object.hasOwn(messages, check)) return undefined
  const message = (messages as Record<string, string | undefined>)[check]
  return message
}

function issueCode<S extends CatalogReferenceSubject>(
  subject: S,
  check: string,
): CatalogReferenceIssueCode<S> | undefined {
  const codes = CATALOG_REFERENCE_ISSUE_CODE[subject] as Partial<Record<string, string>>
  const code = codes[check]
  return code as CatalogReferenceIssueCode<S> | undefined
}

function pushCheckIssue<S extends CatalogReferenceSubject>(
  issues: CatalogReferenceIssue<S>[],
  subject: S,
  check: string,
  path: string,
  messages: object,
): void {
  const code = issueCode(subject, check)
  const message = messageFor(messages, check)
  if (!code || !message) return
  issues.push({ path, message, code })
}

/**
 * Emits at most one catalog-reference issue per stored key.
 * The resolver is the identity contract: this collector does not inspect the key.
 */
export function collectCatalogReferenceIssues<
  S extends CatalogReferenceSubject,
  const P extends CatalogReferencePolicy<S>,
>(args: CatalogReferenceCollectorArgs<S, P>): CatalogReferenceIssue<S>[] {
  const { policy, intent, messages } = args
  const subject = policy.subject

  if (args.catalogStatus === 'unavailable') {
    if (!checkApplies(policy.checks, 'catalogUnavailable', intent)) return []
    if (args.unavailablePlacement.kind === 'aggregate') {
      const issues: CatalogReferenceIssue<S>[] = []
      pushCheckIssue(
        issues,
        subject,
        'catalogUnavailable',
        args.unavailablePlacement.path,
        messages,
      )
      return issues
    }
    return args.refs.flatMap((ref) => {
      const issues: CatalogReferenceIssue<S>[] = []
      pushCheckIssue(issues, subject, 'catalogUnavailable', ref.path, messages)
      return issues
    })
  }

  const issues: CatalogReferenceIssue<S>[] = []
  for (const ref of args.refs) {
    const row = args.resolve(ref.key)
    if (!row) {
      if (checkApplies(policy.checks, 'unknown', intent)) {
        pushCheckIssue(issues, subject, 'unknown', ref.path, messages)
      }
      continue
    }
    if (checkApplies(policy.checks, 'notReferenceable', intent) && !isContentReferenceable(row)) {
      pushCheckIssue(issues, subject, 'notReferenceable', ref.path, messages)
      continue
    }
    if (
      checkApplies(policy.checks, 'notCampaignEligible', intent) &&
      !isContentCampaignEligible(row)
    ) {
      pushCheckIssue(issues, subject, 'notCampaignEligible', ref.path, messages)
    }
  }
  return issues
}
