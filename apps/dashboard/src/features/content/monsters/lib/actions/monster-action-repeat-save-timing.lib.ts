import type { RepeatSaveTiming } from '@rpg/contracts'

type RepeatSaveTimingOption = {
  id: string
  label: string
  timing: RepeatSaveTiming
}

export const REPEAT_SAVE_TIMING_OPTIONS: readonly RepeatSaveTimingOption[] = [
  {
    id: 'target-start-next',
    label: "Start of the target's next turn",
    timing: { participant: 'target', boundary: 'start', which: 'next' },
  },
  {
    id: 'target-end-next',
    label: "End of the target's next turn",
    timing: { participant: 'target', boundary: 'end', which: 'next' },
  },
  {
    id: 'source-start-next',
    label: "Start of the creature's next turn",
    timing: { participant: 'source', boundary: 'start', which: 'next' },
  },
  {
    id: 'source-end-next',
    label: "End of the creature's next turn",
    timing: { participant: 'source', boundary: 'end', which: 'next' },
  },
] as const

export function repeatSaveTimingOptionId(timing: RepeatSaveTiming | undefined): string | undefined {
  if (!timing) return undefined
  return REPEAT_SAVE_TIMING_OPTIONS.find(
    (option) =>
      option.timing.participant === timing.participant &&
      option.timing.boundary === timing.boundary &&
      option.timing.which === timing.which,
  )?.id
}

export function repeatSaveTimingFromOptionId(id: string | undefined): RepeatSaveTiming | undefined {
  return REPEAT_SAVE_TIMING_OPTIONS.find((option) => option.id === id)?.timing
}
