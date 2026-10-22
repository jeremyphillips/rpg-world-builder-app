export const WIZARD_CLASS_SPECS = [
  {
    key: 'bubble-idle',
    className: 'ui-wizard__bubble ui-wizard__bubble--idle ui-border--default',
    keyValues: '2rem circle, neutral border',
    useCase: 'Upcoming step',
  },
  {
    key: 'bubble-active',
    className: 'ui-wizard__bubble ui-wizard__bubble--active',
    keyValues: 'primary fill',
    useCase: 'Current step',
  },
  {
    key: 'label-active',
    className: 'ui-wizard__label ui-wizard__label--active text-style-label',
    keyValues: 'text-style-label',
    useCase: 'Current step title (sm+)',
  },
  {
    key: 'connector-complete',
    className: 'ui-wizard__connector ui-wizard__connector--complete',
    keyValues: '1px track',
    useCase: 'Completed segment',
  },
] as const
