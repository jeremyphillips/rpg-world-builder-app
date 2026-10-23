export type RadioCardClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

export const RADIO_CARD_CLASS_SPECS: readonly RadioCardClassSpec[] = [
  {
    key: 'shell-comfortable',
    className: 'ui-radio-card ui-radio-card--comfortable',
    keyValues: 'gap: calc(var(--spacing) * 2) on shell',
    useCase: 'Card-style radio option shell at comfortable density',
  },
  {
    key: 'shell-compact',
    className: 'ui-radio-card ui-radio-card--compact',
    keyValues: 'gap: calc(var(--spacing) * 1) on shell',
    useCase: 'Card-style radio option shell at compact density',
  },
  {
    key: 'row',
    className: 'ui-radio-card ui-radio-card--row',
    keyValues: 'transparent row hit target; interactive row + focus on host',
    useCase: 'List-style radio option without card fill',
  },
  {
    key: 'body',
    className: 'ui-radio-card__body',
    keyValues: 'padding from --ui-card-inset-*; body gap from density',
    useCase: 'Primary content column inside the card shell',
  },
  {
    key: 'embedded-in-flow',
    className: 'ui-option-card__embedded--in-flow',
    keyValues: 'border-top; indent from control column + anatomy gap',
    useCase: 'Divider-tone nested region inside an option card',
  },
  {
    key: 'embedded-panel',
    className: 'ui-option-card__embedded--panel',
    keyValues: 'full-bleed breakout to card edge',
    useCase: 'Panel-tone nested region (embedded equipment rows)',
  },
]
