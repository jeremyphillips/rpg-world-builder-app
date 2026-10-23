import { cva, type VariantProps } from 'class-variance-authority'

export const TABS_VARIANTS = ['line', 'pill', 'none'] as const

export type TabsVariant = (typeof TABS_VARIANTS)[number]

/** twMerge group — tabs list appearance modifiers. */
export const UI_TABS_LIST_APPEARANCE_CLASSES = [
  'ui-tabs__list--line',
  'ui-tabs__list--pill',
] as const

/** twMerge group — tabs trigger appearance modifiers. */
export const UI_TABS_TRIGGER_APPEARANCE_CLASSES = [
  'ui-tabs__trigger--line',
  'ui-tabs__trigger--pill',
] as const

export const tabsListVariants = cva('ui-tabs__list', {
  variants: {
    variant: {
      line: 'ui-tabs__list--line ui-border--default',
      pill: 'ui-tabs__list--pill',
      none: '',
    },
  },
  defaultVariants: {
    variant: 'line',
  },
})

export const tabsTriggerVariants = cva('ui-tabs__trigger ui-focus-ring', {
  variants: {
    variant: {
      line: 'ui-tabs__trigger--line',
      pill: 'ui-tabs__trigger--pill',
      none: '',
    },
  },
  defaultVariants: {
    variant: 'line',
  },
})

export const TABS_CLASS_SPECS = [
  {
    key: 'line',
    listClassName: tabsListVariants({ variant: 'line' }),
    triggerClassName: tabsTriggerVariants({ variant: 'line' }),
    keyValues: 'full-width rule, primary active indicator',
    useCase: 'Section navigation (detail, create modal)',
  },
  {
    key: 'pill',
    listClassName: tabsListVariants({ variant: 'pill' }),
    triggerClassName: tabsTriggerVariants({ variant: 'pill' }),
    keyValues: 'segmented track, raised active segment',
    useCase: 'Compact mode switching (markdown, link picker)',
  },
] as const

export type TabsListVariantProps = VariantProps<typeof tabsListVariants>
export type TabsTriggerVariantProps = VariantProps<typeof tabsTriggerVariants>
