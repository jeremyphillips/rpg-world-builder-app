import {
  fixedCreateToInitialValues,
  type LocationCreateSessionParseResult,
} from '../location-create-shortcuts'
import type { LocationFixedCreateContext } from '../../location-form-ctx'

export function resolveLocationCreatePageModel(
  session: LocationCreateSessionParseResult,
  softParentLocationId: string | undefined,
  primaryWorldId: string | undefined,
): {
  fixedCreate?: LocationFixedCreateContext
  initialValues?: Record<string, unknown>
} {
  const defaultParentLocationId = softParentLocationId ?? primaryWorldId

  if (session.kind === 'ready') {
    return {
      fixedCreate: session.fixedCreate,
      initialValues: fixedCreateToInitialValues(session.fixedCreate, defaultParentLocationId),
    }
  }

  return {
    initialValues: defaultParentLocationId
      ? { parentLocationId: defaultParentLocationId }
      : undefined,
  }
}
