import type { DrawerEntityBlockModel } from '../../entity/surfaces/drawer/drawer-entity.types'

export type DrawerContextProps = {
  entities: readonly DrawerEntityBlockModel[]
  className?: string
}
