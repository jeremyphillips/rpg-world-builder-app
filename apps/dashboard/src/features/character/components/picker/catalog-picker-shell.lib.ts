import { catalogPickerHeadlineClasses } from './catalog-picker-shell.variants'

/** Shared CatalogPickerSheet shell props for character builder pickers. */
export function catalogPickerShellProps() {
  return {
    headlineClassName: catalogPickerHeadlineClasses,
    rowPreset: 'catalog' as const,
    toolbarCompact: true,
  }
}
