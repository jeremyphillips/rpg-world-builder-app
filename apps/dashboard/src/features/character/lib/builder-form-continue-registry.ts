import type { CharacterBuilderStepId } from '@rpg/contracts'

export type BuilderFormContinueHandler = () => void | Promise<void>

const handlers = new Map<CharacterBuilderStepId, BuilderFormContinueHandler>()

export function registerBuilderFormContinueHandler(
  stepId: CharacterBuilderStepId,
  handler: BuilderFormContinueHandler,
): () => void {
  handlers.set(stepId, handler)
  return () => {
    if (handlers.get(stepId) === handler) {
      handlers.delete(stepId)
    }
  }
}

export function runBuilderFormContinueHandler(
  stepId: CharacterBuilderStepId,
): BuilderFormContinueHandler | undefined {
  return handlers.get(stepId)
}

/** Test-only reset. */
export function clearBuilderFormContinueHandlersForTests(): void {
  handlers.clear()
}
