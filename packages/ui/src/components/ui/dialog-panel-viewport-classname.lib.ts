import { dialogPanelSectionInsetXClasses } from './dialog-panel.variants'

export type DialogPanelScrollInset = 'section' | 'inner' | 'innerLeading'

/** Horizontal padding / scroll-chrome tokens owned by the selected inset preset. */
const FORBIDDEN_HORIZONTAL_CLASS_PATTERN =
  /\b(?:p-\d+(?:\.\d+)?(?:\/\S+)?|px-\S+|ps-\S+|pe-\S+|pl-\S+|pr-\S+)\b/

/**
 * Ensures `viewportClassName` does not reintroduce horizontal inset or scroll chrome
 * owned by {@link DialogPanelScrollRegion} `inset` presets.
 */
export function assertDialogPanelViewportClassName(
  inset: DialogPanelScrollInset,
  viewportClassName: string | undefined,
): void {
  if (!viewportClassName) return

  for (const token of viewportClassName.split(/\s+/).filter(Boolean)) {
    if (token === dialogPanelSectionInsetXClasses) {
      throw new Error(
        `viewportClassName must not include ${token} — horizontal inset is owned by inset="${inset}"`,
      )
    }

    if (FORBIDDEN_HORIZONTAL_CLASS_PATTERN.test(token)) {
      throw new Error(
        `viewportClassName must not include horizontal inset/chrome class "${token}" — owned by inset="${inset}" preset`,
      )
    }
  }
}
