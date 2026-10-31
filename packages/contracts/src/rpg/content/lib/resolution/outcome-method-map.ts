import type { ResolutionMethodKind, ResolutionOutcomeResult } from '../../../vocab/resolution'

type ResolutionMethodRef = { kind: ResolutionMethodKind }

/** Primary outcome remapping when resolution method kind changes. */
const OUTCOME_METHOD_KIND_CHANGE_MAP: Partial<
  Record<
    `${ResolutionMethodKind}:${ResolutionMethodKind}:${ResolutionOutcomeResult}`,
    ResolutionOutcomeResult
  >
> = {
  'saving-throw:attack:failed-save': 'hit',
  'attack:saving-throw:hit': 'failed-save',
  'automatic:attack:applied': 'hit',
  'attack:automatic:hit': 'applied',
  'automatic:saving-throw:applied': 'failed-save',
  'saving-throw:automatic:failed-save': 'applied',
}

export function mapOutcomeResultBetweenMethodKinds(
  fromMethod: ResolutionMethodRef,
  toMethod: ResolutionMethodRef,
  result: ResolutionOutcomeResult,
): ResolutionOutcomeResult | undefined {
  const key = `${fromMethod.kind}:${toMethod.kind}:${result}` as const
  return OUTCOME_METHOD_KIND_CHANGE_MAP[key]
}
