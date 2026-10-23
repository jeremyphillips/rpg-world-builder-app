export const STATUS_ICON_CLASS_SPECS = [
  {
    key: 'disc-md-ready',
    className: 'ui-status-icon ui-status-icon--md ui-status-icon--ready',
    keyValues: '16px disc',
    useCase: 'Default ready tone',
  },
  {
    key: 'disc-sm-incomplete',
    className: 'ui-status-icon ui-status-icon--sm ui-status-icon--incomplete',
    keyValues: '12px disc',
    useCase: 'Compact incomplete tone',
  },
  {
    key: 'glyph-neutral',
    className: 'ui-status-icon__glyph ui-status-icon__glyph--neutral size-icon-glyph-xs',
    keyValues: '10px glyph on grey disc',
    useCase: 'Neutral glyph on idle/incomplete discs',
  },
] as const
