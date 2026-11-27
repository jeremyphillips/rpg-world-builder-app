import { buildFieldControlId } from '@rpg/ui/form'

import type { ContentFormInvalidPresentation } from './content-form-submit-types.lib'

/** Non-validation editor selection: activate the view that owns `path`, then focus the control. */
export function focusFormPath(
  path: string,
  presentation: Pick<
    ContentFormInvalidPresentation,
    'formId' | 'resolveViewForPath' | 'activateView'
  >,
): void {
  const viewId = presentation.resolveViewForPath?.(path)
  if (viewId) presentation.activateView?.(viewId)
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const control = document.getElementById(
        buildFieldControlId(presentation.formId, undefined, path),
      )
      const marked = document.querySelector(`[data-form-focus="${path}"]`)
      const element = control ?? marked
      if (!(element instanceof HTMLElement)) return
      element.scrollIntoView({ block: 'center' })
      const focusable = element.matches('button, input, select, textarea, [tabindex]')
        ? element
        : element.querySelector<HTMLElement>('button, input, select, textarea, [tabindex]')
      focusable?.focus()
    })
  })
}
