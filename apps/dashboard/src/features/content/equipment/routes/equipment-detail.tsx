import { useParams } from 'react-router-dom'
import type { Equipment } from '@rpg/contracts'
import {
  formatMoney,
  formatWeight,
  getEquipmentKindLabel,
  FOCUS_TYPE_LABELS,
  GEAR_CATEGORY_LABELS,
  TOOL_CATEGORY_LABELS,
  ABILITIES,
} from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useEquipment } from '../hooks/use-equipment'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

type StatRow = { label: string; value: string }

type GearItem = Extract<Equipment, { kind: 'gear' }>
type AmmunitionItem = Extract<Equipment, { kind: 'ammunition' }>
type FocusItem = Extract<Equipment, { kind: 'focus' }>
type ToolItem = Extract<Equipment, { kind: 'tool' }>
type MountItem = Extract<Equipment, { kind: 'mount' }>
type VehicleItem = Extract<Equipment, { kind: 'vehicle' }>
type ShipItem = Extract<Equipment, { kind: 'ship' }>
type MiscItem = Extract<Equipment, { kind: 'misc' }>

// fallow-ignore-next-line complexity
function getGearStatRows(item: GearItem): StatRow[] {
  return [
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
    ...(item.gearCategory
      ? [{ label: 'Category', value: GEAR_CATEGORY_LABELS[item.gearCategory] }]
      : []),
    ...(item.capacity ? [{ label: 'Capacity', value: item.capacity }] : []),
    ...(item.properties?.length
      ? [{ label: 'Properties', value: item.properties.join(', ') }]
      : []),
  ]
}

function getAmmunitionStatRows(item: AmmunitionItem): StatRow[] {
  return [
    { label: 'Bundle Size', value: String(item.bundleSize) },
    { label: 'Storage', value: item.storage },
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
  ]
}

function getFocusStatRows(item: FocusItem): StatRow[] {
  return [
    { label: 'Focus Type', value: FOCUS_TYPE_LABELS[item.focusType] },
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
  ]
}

function getToolStatRows(item: ToolItem): StatRow[] {
  return [
    { label: 'Category', value: TOOL_CATEGORY_LABELS[item.toolCategory] },
    ...(item.ability ? [{ label: 'Ability', value: ABILITIES[item.ability] }] : []),
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
  ]
}

function getMountStatRows(item: MountItem): StatRow[] {
  return [
    { label: 'Carrying Capacity', value: formatWeight(item.carryingCapacity) },
    ...(item.speed ? [{ label: 'Speed', value: item.speed }] : []),
  ]
}

function getVehicleStatRows(item: VehicleItem): StatRow[] {
  return [
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
    ...(item.capacity ? [{ label: 'Cargo Capacity', value: formatWeight(item.capacity) }] : []),
  ]
}

// fallow-ignore-next-line complexity
function getShipStatRows(item: ShipItem): StatRow[] {
  return [
    ...(item.speed ? [{ label: 'Speed', value: item.speed }] : []),
    ...(item.crew !== undefined ? [{ label: 'Crew', value: String(item.crew) }] : []),
    ...(item.passengers !== undefined
      ? [{ label: 'Passengers', value: String(item.passengers) }]
      : []),
    ...(item.cargoTons !== undefined ? [{ label: 'Cargo', value: `${item.cargoTons} tons` }] : []),
    ...(item.ac !== undefined ? [{ label: 'AC', value: String(item.ac) }] : []),
    ...(item.hp !== undefined ? [{ label: 'HP', value: String(item.hp) }] : []),
    ...(item.damageThreshold !== undefined
      ? [{ label: 'Damage Threshold', value: String(item.damageThreshold) }]
      : []),
  ]
}

function getMiscStatRows(item: MiscItem): StatRow[] {
  return [
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
    ...(item.notes ? [{ label: 'Notes', value: item.notes }] : []),
  ]
}

// fallow-ignore-next-line complexity
function getKindStatRows(item: Equipment): StatRow[] {
  switch (item.kind) {
    case 'gear':
      return getGearStatRows(item)
    case 'ammunition':
      return getAmmunitionStatRows(item)
    case 'focus':
      return getFocusStatRows(item)
    case 'tool':
      return getToolStatRows(item)
    case 'mount':
      return getMountStatRows(item)
    case 'vehicle':
      return getVehicleStatRows(item)
    case 'ship':
      return getShipStatRows(item)
    case 'misc':
      return getMiscStatRows(item)
  }
}

type EquipmentDetailContentProps = {
  item: Equipment
}

function EquipmentDetailContent({ item }: EquipmentDetailContentProps) {
  useSetBreadcrumbLabel(item.name)

  const kindRows = getKindStatRows(item)

  return (
    <ContentDetailLayout imageUrl={getContentImageUrl(item.imageKey)} imageName={item.name}>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">{item.name}</h2>
        <div className="space-y-3">
          <ContentStatRow label="Kind" value={getEquipmentKindLabel(item.kind)} />
          <ContentStatRow label="Cost" value={formatMoney(item.cost)} />
          {kindRows.map(({ label, value }) => (
            <ContentStatRow key={label} label={label} value={value} />
          ))}
        </div>
        {item.description && <p className="text-muted-foreground">{item.description}</p>}
      </div>
    </ContentDetailLayout>
  )
}

function findById(list: Equipment[], id: string): Equipment | undefined {
  return list.find((item) => item.id === id)
}

export function EquipmentDetail() {
  const { campaignId = '', equipmentId = '' } = useParams<{
    campaignId: string
    equipmentId: string
  }>()
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Could not load equipment.
      </p>
    )
  }

  const item = findById(equipment, equipmentId)

  if (!item) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Equipment not found.
      </p>
    )
  }

  return <EquipmentDetailContent item={item} />
}
