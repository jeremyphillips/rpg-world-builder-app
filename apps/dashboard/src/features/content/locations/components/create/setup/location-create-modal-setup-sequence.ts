import {
  notifyCreateSetupValueChangeCompletion,
  useCreateSetupSequence,
  type CreateSetupExternalDecision,
  type CreateSetupSequenceModel,
  type CreateSetupSet,
} from '@/lib/create-setup'

export function useLocationCreateModalSetupSequence(args: {
  sets: CreateSetupSet[]
  onSetupComplete?: () => void
}): CreateSetupSequenceModel {
  return useCreateSetupSequence(args.sets, {
    onSetupComplete: args.onSetupComplete,
  })
}

export function notifyLocationCreateModalSetupValueChangeCompletion(args: {
  previousSets: CreateSetupSet[]
  nextSets: CreateSetupSet[]
  onSetupComplete?: () => void
  externalDecisions?: readonly CreateSetupExternalDecision[]
}): void {
  notifyCreateSetupValueChangeCompletion(args)
}
