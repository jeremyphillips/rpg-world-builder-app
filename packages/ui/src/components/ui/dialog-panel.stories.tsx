import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { borderStrength } from './border-strength'
import {
  DIALOG_PANEL_GEOMETRIES,
  dialogPanelFill,
  dialogPanelGeometry,
} from './dialog-panel.variants'

const meta = {
  title: 'Primitives/DialogPanel',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const FILL_USE: Record<string, string> = {
  background: 'Modal and background sheets',
  card: 'Default sheet surface',
  'surface-lift': 'Lifted sheet',
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  render: () => (
    <ClassReferenceTable
      rows={[
        ...(['background', 'card', 'surface-lift'] as const).map((fill) => ({
          key: `fill-${fill}`,
          sample: (
            <div
              data-semantic-class-target
              className={`ui-dialog-panel ${dialogPanelFill(fill)} ${dialogPanelGeometry('frame')} ${borderStrength()} h-16 w-40`}
            />
          ),
          propsLabel: fill,
          className: `${dialogPanelFill(fill)} ${borderStrength()}`,
          keyValues: 'fill, foreground, surface-current',
          useCase: FILL_USE[fill],
        })),
        ...DIALOG_PANEL_GEOMETRIES.map((geometry) => ({
          key: geometry,
          sample: (
            <div
              data-semantic-class-target
              className={`ui-dialog-panel ${dialogPanelFill('background')} ${dialogPanelGeometry(geometry)} ${borderStrength()} h-16 w-40`}
            />
          ),
          propsLabel: geometry,
          className: dialogPanelGeometry(geometry),
          keyValues: 'edge widths and radius',
          useCase: geometry === 'frame' ? 'Modal perimeter' : 'Sheet edge',
        })),
      ]}
    />
  ),
}
