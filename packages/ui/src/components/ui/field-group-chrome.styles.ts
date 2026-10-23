export const FIELD_GROUP_CHROME_CLASS_SPECS = [
  {
    key: 'rail-comfortable',
    className: 'ui-field-group-chrome--rail-comfortable',
    keyValues: 'padding-inline-start 36px',
    useCase: 'Field stack inset beside offset rail (comfortable rhythm)',
  },
  {
    key: 'rail-compact',
    className: 'ui-field-group-chrome--rail-compact',
    keyValues: 'padding-inline-start 32px',
    useCase: 'Field stack inset beside offset rail (compact rhythm)',
  },
  {
    key: 'divider-top',
    className: 'ui-field-group-chrome--divider-top ui-border--default',
    keyValues: 'top border 1px, padding-top 28px',
    useCase: 'Fieldset section separator above fields',
  },
  {
    key: 'divider-bottom',
    className: 'ui-field-group-chrome--divider-bottom ui-border--default',
    keyValues: 'bottom border 1px, padding-bottom 28px',
    useCase: 'Fieldset section separator below legend',
  },
  {
    key: 'accent-top',
    className: 'ui-field-group-chrome--accent-top ui-border--default',
    keyValues: 'top border 2px, padding-top 16px',
    useCase: 'Light fieldset emphasis above fields',
  },
  {
    key: 'legend-rail',
    className:
      'ui-field-group-chrome__legend-rail ui-border--default ui-field-group-chrome__legend-rail--tone-neutral',
    keyValues: 'flush start rail, --ui-border-color fill',
    useCase: 'Legend-only accent rail',
  },
] as const
