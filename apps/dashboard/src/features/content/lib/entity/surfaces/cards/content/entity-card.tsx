import { EntityCardDisclosureRenderer } from '../disclosure/entity-card-disclosure-renderer'
import type { EntityCardDisclosureRendererProps } from '../disclosure/entity-card-disclosure-renderer'
import {
  EntityCardStaticRenderer,
  type EntityCardStaticInteractiveProps,
  type EntityCardStaticNavigableProps,
  type EntityCardStaticRendererProps,
} from './entity-card-static-renderer'

export type { EntityCardStaticInteractiveProps, EntityCardStaticNavigableProps }

export type EntityCardStaticProps = EntityCardStaticRendererProps & {
  variant?: 'static'
}

export type EntityCardDisclosureProps = EntityCardDisclosureRendererProps & {
  variant: 'disclosure'
}

export type EntityCardProps = EntityCardStaticProps | EntityCardDisclosureProps

/** Structured entity card — static by default; set `variant="disclosure"` for expandable body. */
export function EntityCard(props: EntityCardProps) {
  if (props.variant === 'disclosure') {
    const { variant: _variant, ...disclosureProps } = props
    return <EntityCardDisclosureRenderer {...disclosureProps} />
  }
  const { variant: _variant, ...staticProps } = props
  return <EntityCardStaticRenderer {...staticProps} />
}
