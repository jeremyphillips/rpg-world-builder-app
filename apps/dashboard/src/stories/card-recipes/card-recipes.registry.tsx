import { composeStories } from '@storybook/react-vite'
import { GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

import {
  ActionIcon,
  Badge,
  Button,
  ComboboxOptionRow,
  ContentCard,
  CollapsibleListItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Field,
  FieldLayout,
  IdentityRow,
  Input,
  InteractiveList,
  InteractiveListRow,
  MenuChoiceRow,
  NumberStepper,
  SelectionOptionCard,
  SelectionSummaryCard,
  SelectionSummaryChangeAction,
  Text,
  iconGhostControlVariants,
} from '@rpg/ui'
import { ArrayItemAnatomyGrid } from '@rpg/ui/form'

import {
  CatalogEntityRow,
  CatalogEntitySurfaceRow,
  ContentEntityCard,
  DetailRowLeadingMedia,
  DisclosureEntityCard,
  EntityAnatomyHost,
  EntityDisclosureArrayItemShell,
  EntityRowList,
  EntitySurfaceContentCard,
} from '@/features/content'
import { DetailEntityRow } from '@/features/content/lib/detail/row/entity/detail-entity-row'
import { DrawerEntityBlock } from '@/features/content/lib/entity/surfaces/drawer/drawer-entity-block'
import { ChoiceBlockRow } from '@/features/character/components/builder/steps/shared/choice-section/choice-block-row'
import { createProficienciesStepRogueFixture } from '@/features/character/lib/proficiencies/proficiencies-step.fixtures'
import { QuickNpcStartingChoiceSelectedRow } from '@/features/character/npc/components/quick-npc/quick-npc-starting-choice-selected-row'
import * as QuickNpcStartingChoicesStories from '@/features/character/npc/components/quick-npc/quick-npc-starting-choices.stories'

import type { CardRecipe, CardRecipeSection } from './card-recipes.types'

const { ClassedWithPackage: QuickNpcStartingChoicesDemo } = composeStories(
  QuickNpcStartingChoicesStories,
)

const mockDragHandleProps = {
  attributes: {
    role: 'button',
    tabIndex: 0,
    'aria-disabled': false,
    'aria-pressed': false,
    'aria-roledescription': 'draggable',
    'aria-describedby': 'dnd-kit-description',
  },
  listeners: {},
} as const

const noop = () => undefined

function RemoveUtility({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={iconGhostControlVariants({ hover: 'accent', layout: 'flex' })}
      aria-label={`Remove ${label}`}
    >
      <ActionIcon action="remove" step="md" />
    </button>
  )
}

function SelectAction() {
  return (
    <Button type="button" variant="text" size="sm" density="compact">
      Select
    </Button>
  )
}

function DisclosureEntityCardRecipe() {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <DisclosureEntityCard
      itemId="recipe-dec"
      toolbarAriaLabel="Harbor District"
      entity={{
        heading: 'Harbor District',
        classification: 'Settlement',
        description: 'Located in Grey Coast',
      }}
      density="compact"
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((current) => !current)}
      dragHandleProps={mockDragHandleProps}
      trailing={{ kind: 'utility', content: <RemoveUtility label="Harbor District" /> }}
    >
      <Text variant="muted">District notes live in the disclosed body.</Text>
    </DisclosureEntityCard>
  )
}

function ArrayItemShellRecipe() {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <EntityDisclosureArrayItemShell
      itemId="recipe-array-item"
      itemPrefix="grants.0"
      titleId="recipe-array-item-title"
      index={0}
      header={{
        primary: 'Speak with Animals',
        fallback: 'Spell grant',
        ariaLabel: 'Speak with Animals',
        showDivider: false,
        showFallbackInTitle: false,
        srOnly: false,
      }}
      itemValues={{}}
      classification="Spell"
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((current) => !current)}
      action={<RemoveUtility label="Speak with Animals" />}
    >
      <Text variant="muted">Registered item fields render here.</Text>
    </EntityDisclosureArrayItemShell>
  )
}

function CatalogEntityRowRecipe() {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <CatalogEntityRow
      toolbarLabel="Longsword"
      domIds={{ itemId: 'recipe-catalog', titleId: 'recipe-catalog-title', bodyId: 'recipe-catalog-body' }}
      collapsible
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((current) => !current)}
      entity={{ heading: 'Longsword', classification: 'Martial weapon', description: '1d8 slashing' }}
      trailing={{
        kind: 'group',
        primary: (
          <Button type="button" variant="text" size="sm" density="compact">
            Add
          </Button>
        ),
        secondary: { kind: 'price', label: '15 gp' },
      }}
      details={<Text variant="muted">Versatile (1d10).</Text>}
    />
  )
}

function CollapsibleListItemRecipe() {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <CollapsibleListItem
      itemId="recipe-cli"
      titleId="recipe-cli-title"
      toolbarAriaLabel="Battle Axe"
      collapsible
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((current) => !current)}
      header={
        <Text as="span" className="truncate text-sm font-medium">
          Battle Axe
        </Text>
      }
      actions={
        <Button type="button" size="sm" variant="outline">
          Add
        </Button>
      }
      body={<Text variant="muted">Detailed item body.</Text>}
    />
  )
}

function ArrayItemAnatomyGridRecipe() {
  return (
    <ArrayItemAnatomyGrid
      fieldWidths={['md', 'auto']}
      grip={
        <button type="button" aria-label="Drag to reorder">
          <GripVertical aria-hidden />
        </button>
      }
      actions={
        <button type="button" aria-label="Remove item">
          <Trash2 aria-hidden />
        </button>
      }
    >
      <Field.Root id="recipe-array-name" anatomy rowParticipation width="full">
        <FieldLayout
          label={<Field.Label>Name</Field.Label>}
          control={<Input id="recipe-array-name" defaultValue="Rope" />}
        />
      </Field.Root>
      <Field.Root id="recipe-array-qty" anatomy rowParticipation width="full">
        <FieldLayout
          label={<Field.Label>Qty</Field.Label>}
          control={<Input id="recipe-array-qty" defaultValue="2" />}
        />
      </Field.Root>
    </ArrayItemAnatomyGrid>
  )
}

function ChoiceBlockRowRecipe() {
  const { model } = createProficienciesStepRogueFixture()
  const block = model.sections.find((section) => section.kind === 'skills')!.choiceBlocks[0]!
  return (
    <ChoiceBlockRow
      block={block}
      selectedRows={[
        {
          optionId: 'stealth',
          label: 'Stealth',
          choiceSetId: block.choiceSet.id,
          isStale: false,
          isRemovable: true,
        },
      ]}
      overSelectionMessage="Too many skills selected."
      onOpenDrawer={noop}
      onRemoveChoice={noop}
    />
  )
}

function StepperRecipe() {
  const [quantity, setQuantity] = useState(2)
  return (
    <ContentEntityCard
      entity={{ heading: 'Javelin', classification: 'Simple weapon', description: '1d6 piercing' }}
      density="compact"
      trailing={{
        kind: 'utility',
        content: (
          <NumberStepper aria-label="Javelin quantity" value={quantity} onChange={setQuantity} />
        ),
      }}
    />
  )
}

export const CARD_RECIPE_SECTIONS: readonly { id: CardRecipeSection; title: string }[] = [
  { id: 'entity-surfaces', title: 'Entity surfaces' },
  { id: 'picker-rows', title: 'Picker rows' },
  { id: 'detail-rows', title: 'Detail / relationship rows' },
  { id: 'ui-list-rows', title: '@rpg/ui list and choice rows' },
  { id: 'ui-cards-form-rows', title: '@rpg/ui cards and form rows' },
  { id: 'feature-grids', title: 'Feature-local grids' },
]

const ENTITY_CHAIN = ['EntityCardFrame', 'EntityAnatomyHost', 'EntityAnatomy', 'RowAnatomyCell']

export const CARD_RECIPES: readonly CardRecipe[] = [
  {
    name: 'Content entity card — action',
    section: 'entity-surfaces',
    component: 'ContentEntityCard',
    chain: ['ContentEntityCard', ...ENTITY_CHAIN],
    useWhen: 'Standalone entity identity with one labeled commit control.',
    density: 'compact',
    leading: 'none',
    trailing: 'action (band)',
    anatomy: 'row-track',
    render: () => (
      <ContentEntityCard
        entity={{ heading: 'Harbor District', classification: 'Settlement', description: 'Located in Grey Coast' }}
        density="compact"
        trailing={{ kind: 'action', content: <SelectAction /> }}
      />
    ),
  },
  {
    name: 'Content entity card — media and status',
    section: 'entity-surfaces',
    component: 'ContentEntityCard',
    chain: ['ContentEntityCard', ...ENTITY_CHAIN],
    useWhen: 'Comfortable identity with leading media and a status lane.',
    density: 'comfortable',
    leading: 'none',
    trailing: 'indicator chevron (full)',
    anatomy: 'row-track',
    render: () => (
      <ContentEntityCard
        entity={{
          heading: 'Silver Circle',
          classification: 'Guild',
          description: 'Merchants of the Grey Coast',
          status: [{ kind: 'badge', label: 'Member', tone: 'success' }],
          media: (
            <DetailRowLeadingMedia size="sm">
              <span aria-hidden>SC</span>
            </DetailRowLeadingMedia>
          ),
        }}
        density="comfortable"
        trailing={{ kind: 'indicator', variant: 'chevron' }}
      />
    ),
  },
  {
    name: 'Content entity card — stepper utility',
    section: 'entity-surfaces',
    component: 'ContentEntityCard',
    chain: ['ContentEntityCard', ...ENTITY_CHAIN],
    useWhen: 'Quantity editing on an inventory-style row; the 36px stepper centers on the row.',
    density: 'compact',
    leading: 'none',
    trailing: 'utility stepper (full)',
    anatomy: 'row-track',
    render: () => <StepperRecipe />,
  },
  {
    name: 'Disclosure entity card — grip, caret, remove',
    section: 'entity-surfaces',
    component: 'DisclosureEntityCard',
    chain: ['DisclosureEntityCard', 'CollapsibleListItem', ...ENTITY_CHAIN],
    useWhen: 'Sortable, expandable entity rows with a trailing ghost utility.',
    density: 'compact',
    leading: 'grip + caret',
    trailing: 'utility remove (full)',
    anatomy: 'row-track',
    render: () => <DisclosureEntityCardRecipe />,
  },
  {
    name: 'Entity anatomy host — embedded',
    section: 'entity-surfaces',
    component: 'EntityAnatomyHost',
    chain: ['EntityAnatomyHost', 'EntityAnatomy', 'RowAnatomyCell'],
    useWhen: 'Identity embedded inside a host that already owns chrome and inset.',
    density: 'compact',
    leading: 'none',
    trailing: 'none',
    anatomy: 'row-track',
    render: () => (
      <EntityAnatomyHost entity={{ heading: 'Grey Coast', classification: 'Region' }} density="compact" />
    ),
  },
  {
    name: 'Entity surface content card — inline action',
    section: 'entity-surfaces',
    component: 'EntitySurfaceContentCard',
    chain: ['EntitySurfaceContentCard', 'ContentEntityCard', ...ENTITY_CHAIN],
    useWhen: 'Plain identity config (no JSX) projected onto a content card.',
    density: 'compact',
    leading: 'none',
    trailing: 'action (band)',
    anatomy: 'row-track',
    render: () => (
      <EntitySurfaceContentCard
        surface={{
          identity: {
            heading: 'Wizard',
            classification: 'Class',
            metadata: 'Intelligence spellcaster',
            fallback: 'class',
          },
          inlineAction: { label: 'Select', onClick: noop },
        }}
      />
    ),
  },
  {
    name: 'Entity disclosure array item shell',
    section: 'entity-surfaces',
    component: 'EntityDisclosureArrayItemShell',
    chain: ['EntityDisclosureArrayItemShell', 'DisclosureEntityCard', ...ENTITY_CHAIN],
    useWhen: 'Schema-driven form array items presented as entity disclosure cards.',
    density: 'compact',
    leading: 'caret',
    trailing: 'utility remove (full)',
    anatomy: 'row-track',
    render: () => <ArrayItemShellRecipe />,
  },
  {
    name: 'Catalog entity row — add with price',
    section: 'picker-rows',
    component: 'CatalogEntityRow',
    chain: ['CatalogEntityRow', 'CollapsibleListItem', ...ENTITY_CHAIN],
    useWhen: 'Catalog picker rows with a commit control and a secondary scalar.',
    density: 'compact',
    leading: 'caret',
    trailing: 'group: action (band) + price (meta)',
    anatomy: 'row-track',
    render: () => <CatalogEntityRowRecipe />,
  },
  {
    name: 'Catalog entity surface row',
    section: 'picker-rows',
    component: 'CatalogEntitySurfaceRow',
    chain: ['CatalogEntitySurfaceRow', 'CatalogEntityRow', ...ENTITY_CHAIN],
    useWhen: 'Catalog rows fed by plain identity config.',
    density: 'compact',
    leading: 'none',
    trailing: 'action (band)',
    anatomy: 'row-track',
    render: () => (
      <CatalogEntitySurfaceRow
        toolbarLabel="Fireball"
        domIds={{ itemId: 'recipe-surface-row', titleId: 'recipe-surface-row-title', bodyId: 'recipe-surface-row-body' }}
        surface={{
          identity: {
            heading: 'Fireball',
            classification: 'Spell',
            metadata: 'Level 3 · Evocation',
            fallback: 'spell',
          },
          inlineAction: { label: 'Add', onClick: noop },
        }}
      />
    ),
  },
  {
    name: 'Detail entity row — remove utility',
    section: 'detail-rows',
    component: 'DetailEntityRow',
    chain: ['DetailEntityRow', 'EntityAnatomyHost', 'EntityAnatomy', 'RowAnatomyCell'],
    useWhen: 'Relationship and collection rows on detail pages.',
    density: 'compact',
    leading: 'none',
    trailing: 'utility remove (full)',
    anatomy: 'row-track',
    render: () => (
      <DetailEntityRow
        heading="The Silver Eel"
        headingHref="/campaigns/demo/locations/silver-eel"
        classification="Building · Tavern"
        trailing={{ kind: 'utility', content: <RemoveUtility label="The Silver Eel" /> }}
      />
    ),
  },
  {
    name: 'Entity row list — overflow menu',
    section: 'detail-rows',
    component: 'EntityRowList',
    chain: ['EntityRowList.Row', 'DetailEntityRow', 'EntityAnatomy', 'RowAnatomyCell'],
    useWhen: 'Grouped detail collections with a per-row overflow menu.',
    density: 'compact',
    leading: 'media',
    trailing: 'utility overflow (full)',
    anatomy: 'row-track',
    render: () => (
      <EntityRowList.Root itemCount={2}>
        <EntityRowList.Group itemCount={2}>
          <EntityRowList.Row
            heading="Circle Envoy"
            headingHref="/npc/1"
            description="NPC · Human"
            leadingMedia={
              <DetailRowLeadingMedia shape="circle">
                <span aria-hidden>CE</span>
              </DetailRowLeadingMedia>
            }
            menu={{ items: [{ id: 'view', label: 'View', onSelect: noop }] }}
          />
          <EntityRowList.Row
            heading="Verna"
            headingHref="/pc/1"
            description="PC · Dwarf"
            menu={{ items: [{ id: 'view', label: 'View', onSelect: noop }] }}
          />
        </EntityRowList.Group>
      </EntityRowList.Root>
    ),
  },
  {
    name: 'Drawer entity block',
    section: 'detail-rows',
    component: 'DrawerEntityBlock',
    chain: ['DrawerEntityBlock', 'EntityAnatomy', 'RowAnatomyCell'],
    useWhen: 'Identity header inside drawers and replacement sections.',
    density: 'compact',
    leading: 'none',
    trailing: 'none',
    anatomy: 'row-track',
    render: () => (
      <DrawerEntityBlock
        heading="Harbor District"
        classification="Settlement"
        supportingText="Located in Grey Coast"
        href="/campaigns/demo/locations/harbor"
      />
    ),
  },
  {
    name: 'Interactive list row with identity row',
    section: 'ui-list-rows',
    component: 'InteractiveListRow',
    chain: ['InteractiveListRow', 'IdentityRow'],
    useWhen: 'Generic selectable list rows outside the entity family.',
    density: 'fixed',
    leading: 'startSlot',
    trailing: 'trailingAction sibling',
    anatomy: 'different',
    render: () => (
      <InteractiveList>
        <InteractiveListRow
          content={<IdentityRow heading="Fireball" classification="Spell" supporting="Level 3 · Evocation" />}
          trailingAction={<RemoveUtility label="Fireball" />}
        />
      </InteractiveList>
    ),
  },
  {
    name: 'Combobox option row',
    section: 'ui-list-rows',
    component: 'ComboboxOptionRow',
    chain: ['ComboboxOptionRow', 'InteractiveListRow', 'IdentityRow'],
    useWhen: 'Listbox options with truthful aria-selected.',
    density: 'fixed',
    leading: 'none',
    trailing: 'endSlot (decorative)',
    anatomy: 'different',
    render: () => (
      <InteractiveList role="listbox" aria-label="Spell options">
        <ComboboxOptionRow
          optionId="recipe-fireball"
          heading="Fireball"
          classification="Spell"
          supporting="Level 3 · Evocation"
          selected={false}
          onSelect={noop}
        />
      </InteractiveList>
    ),
  },
  {
    name: 'Menu choice row',
    section: 'ui-list-rows',
    component: 'MenuChoiceRow',
    chain: ['MenuChoiceRow', 'DropdownMenuItem', 'IdentityRow'],
    useWhen: 'Action menus — open the trigger to inspect the row.',
    density: 'fixed',
    leading: 'none',
    trailing: 'none',
    anatomy: 'different',
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Open menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <InteractiveList>
            <MenuChoiceRow heading="Fireball" supporting="Spell · Level 3" onSelect={noop} />
            <MenuChoiceRow heading="Shield" supporting="Spell · Level 1" onSelect={noop} />
          </InteractiveList>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    name: 'Collapsible list item — default header',
    section: 'ui-list-rows',
    component: 'CollapsibleListItem',
    chain: ['CollapsibleListItem', 'CollapsibleListItemToolbar'],
    useWhen: 'Generic disclosure rows whose header is a toolbar, not entity identity.',
    density: 'fixed',
    leading: 'caret',
    trailing: 'actions (toolbar row)',
    anatomy: 'different',
    render: () => <CollapsibleListItemRecipe />,
  },
  {
    name: 'Content card',
    section: 'ui-cards-form-rows',
    component: 'ContentCard',
    chain: ['ContentCard', 'ContentCardBody'],
    useWhen: '@rpg/ui consumers outside the dashboard entity family (e.g. public app).',
    density: 'comfortable',
    leading: 'media',
    trailing: 'endSlot',
    anatomy: 'different',
    render: () => (
      <ContentCard
        heading="Harbor District"
        subheading="Located in Grey Coast"
        metadata="Settlement"
        endSlot={<Badge tone="warning">Unavailable</Badge>}
      />
    ),
  },
  {
    name: 'Selection option card',
    section: 'ui-cards-form-rows',
    component: 'SelectionOptionCard',
    chain: ['SelectionOptionCard', 'SelectionOptionCardAnatomy'],
    useWhen: 'Choosing between packages or options with summaries.',
    density: 'compact',
    leading: 'header eyebrow',
    trailing: 'header end slot',
    anatomy: 'different',
    render: () => (
      <SelectionOptionCard
        selected
        density="compact"
        headerEyebrow="Selected package"
        label="Starting equipment package"
        description="Includes a martial weapon, shield, and explorer pack."
        summaryLines={['Gold remaining: 12 gp', 'Items selected: 4']}
      />
    ),
  },
  {
    name: 'Selection summary card',
    section: 'ui-cards-form-rows',
    component: 'SelectionSummaryCard',
    chain: ['SelectionSummaryCard', 'SelectionSummaryRow'],
    useWhen: 'Key/value readout of completed decisions.',
    density: 'fixed',
    leading: 'label column',
    trailing: 'action column',
    anatomy: 'different',
    render: () => (
      <SelectionSummaryCard
        eyebrow="Class"
        rows={[
          {
            label: 'Class',
            value: 'Fighter',
            action: (
              <SelectionSummaryChangeAction changeLabel="Change" ariaLabel="Change class" onChange={noop} />
            ),
          },
          { label: 'Subclass', value: 'Champion' },
        ]}
      />
    ),
  },
  {
    name: 'Array item anatomy grid',
    section: 'ui-cards-form-rows',
    component: 'ArrayItemAnatomyGrid',
    chain: ['ArrayItemAnatomyGrid', 'Field.Root (rowParticipation)'],
    useWhen: 'Compact inline form-array rows sharing label / control / message tracks.',
    density: 'fixed',
    leading: 'grip',
    trailing: 'actions',
    anatomy: 'different',
    render: () => <ArrayItemAnatomyGridRecipe />,
  },
  {
    name: 'Quick NPC starting choice selected row',
    section: 'feature-grids',
    component: 'QuickNpcStartingChoiceSelectedRow',
    chain: ['QuickNpcStartingChoiceSelectedRow', 'ContentEntityCard', ...ENTITY_CHAIN],
    useWhen: 'Selected starting choices with optional quantity and remove.',
    density: 'compact',
    leading: 'none',
    trailing: 'utility cluster (full)',
    anatomy: 'row-track',
    render: () => (
      <QuickNpcStartingChoiceSelectedRow
        label="Javelin"
        quantity={<span>×3</span>}
        onRemove={noop}
      />
    ),
  },
  {
    name: 'Quick NPC starting choices grid',
    section: 'feature-grids',
    component: 'QuickNpcStartingChoices',
    chain: ['QuickNpcStartingChoices', 'subgrid category rows'],
    useWhen: 'Category summary grid with shared label / value / action columns.',
    density: 'fixed',
    leading: 'category label column',
    trailing: 'action column',
    anatomy: 'different',
    render: () => <QuickNpcStartingChoicesDemo />,
  },
  {
    name: 'Choice block row',
    section: 'feature-grids',
    component: 'ChoiceBlockRow',
    chain: ['ChoiceBlockRow', 'ChoiceSelectedRow', 'ContentEntityCard'],
    useWhen: 'Builder choice section header with add action and selected rows.',
    density: 'fixed',
    leading: 'none',
    trailing: 'header add action',
    anatomy: 'different',
    render: () => <ChoiceBlockRowRecipe />,
  },
]
