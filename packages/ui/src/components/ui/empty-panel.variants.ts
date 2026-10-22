import { cva } from 'class-variance-authority'

export const emptyPanelVariants = cva('ui-empty-panel')

export const EMPTY_PANEL_CLASS_SPECS = [
  {
    key: 'default',
    className: emptyPanelVariants(),
    keyValues: 'sunken fill, muted italic xs copy, sunken shadow',
    useCase: 'Single passive empty message in choice sections and lists',
  },
] as const
