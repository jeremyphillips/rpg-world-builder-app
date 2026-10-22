import { cardSurfaceVariants, cn } from '@rpg/ui'

import { ENTITY_SURFACE_DEFAULT_EDGES } from '../anatomy/entity-surface-edges.lib'
import { entityCardFrameClassName } from './cards/content/entity-card-frame.lib'
import {
  DASH_ENTITY_CARD_BODY_CLASS,
  DASH_ENTITY_SURFACE_BLOCK,
  entitySurfaceVariants,
} from './dash-entity-surface.variants'

export type DashEntitySurfaceClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

export const DASH_ENTITY_SURFACE_CLASS_SPECS: readonly DashEntitySurfaceClassSpec[] = [
  {
    key: 'surface-compact-default',
    className: entitySurfaceVariants({
      density: 'compact',
      edges: ENTITY_SURFACE_DEFAULT_EDGES,
      leadingUtilityCount: 0,
    }),
    keyValues: 'inset 16px; utility inset 4px; content offset 0',
    useCase: 'Flat EntityCard static / catalog row without leading utility',
  },
  {
    key: 'surface-compact-disclosure',
    className: entitySurfaceVariants({
      density: 'compact',
      edges: { start: 'utility', end: 'default' },
      leadingUtilityCount: 1,
    }),
    keyValues: 'start utility inset; offset = chrome + gap',
    useCase: 'EntityCard disclosure / catalog disclosure with one caret',
  },
  {
    key: 'surface-compact-two-leading',
    className: entitySurfaceVariants({
      density: 'compact',
      edges: { start: 'utility', end: 'default' },
      leadingUtilityCount: 2,
    }),
    keyValues: 'offset = 2× chrome + gap',
    useCase: 'EntityCard disclosure with grip + caret',
  },
  {
    key: 'surface-end-utility',
    className: entitySurfaceVariants({
      density: 'compact',
      edges: { start: 'default', end: 'utility' },
      leadingUtilityCount: 0,
    }),
    keyValues: 'end inset = utility inset (4px compact)',
    useCase: 'Ghost remove / chevron trailing edge',
  },
  {
    key: 'frame-quiet-compact',
    className: cn(
      cardSurfaceVariants({ tone: 'quiet', interactive: false }),
      entityCardFrameClassName({
        density: 'compact',
        edges: { start: 'utility', end: 'default' },
        leadingUtilityCount: 1,
      }),
    ),
    keyValues: 'ui-card quiet + dash-entity-card + dash-entity-surface',
    useCase: 'Typical compact disclosure article',
  },
  {
    key: 'body-wash',
    className: DASH_ENTITY_CARD_BODY_CLASS,
    keyValues: 'padding-inline-start: start + content-offset; end: base inset',
    useCase: 'Expanded disclosure body wash (EntityCard / catalog)',
  },
  {
    key: 'surface-block',
    className: DASH_ENTITY_SURFACE_BLOCK,
    keyValues: '--leading-chrome-size; default inline edges',
    useCase: 'Token block before density / edge modifiers',
  },
]
