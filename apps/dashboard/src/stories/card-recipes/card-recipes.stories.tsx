import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { Badge, Heading, Text, type BadgeTone } from '@rpg/ui'
import {
  expectRowAnatomyAligned,
  waitForRowAnatomyLayout,
} from '@rpg/ui/storybook/row-anatomy-geometry'

import { withDashboardProviders } from '../../../.storybook/decorators'
import { CARD_RECIPES, CARD_RECIPE_SECTIONS } from './card-recipes.registry'
import type { CardRecipe, CardRecipeAnatomy, CardRecipeDensity } from './card-recipes.types'
import {
  cardRecipeTileChainClasses,
  cardRecipeTileClasses,
  cardRecipeTileHeaderClasses,
  cardRecipeTileMetaListClasses,
  cardRecipeTileMetaTermClasses,
  cardRecipeTilePreviewClasses,
  cardRecipesGridClasses,
  cardRecipesPageClasses,
  cardRecipesSectionClasses,
} from './card-recipes.variants'

const ANATOMY_BADGE: Record<CardRecipeAnatomy, { label: string; tone: BadgeTone }> = {
  'row-track': { label: 'Row track', tone: 'success' },
  different: { label: 'Different anatomy', tone: 'neutral' },
  unclassified: { label: 'Unclassified', tone: 'warning' },
}

const DENSITY_GROUPS: readonly { id: CardRecipeDensity; title: string }[] = [
  { id: 'compact', title: 'Compact' },
  { id: 'comfortable', title: 'Comfortable' },
  { id: 'fixed', title: 'Fixed density' },
]

function CardRecipeTile({ recipe }: { recipe: CardRecipe }) {
  const badge = ANATOMY_BADGE[recipe.anatomy]
  return (
    <article
      className={cardRecipeTileClasses}
      data-recipe-name={recipe.name}
      data-recipe-anatomy={recipe.anatomy}
      aria-label={recipe.name}
    >
      <div className={cardRecipeTileHeaderClasses}>
        <Heading as="h3" variant="card">
          {recipe.name}
        </Heading>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      <Text variant="muted">{recipe.useWhen}</Text>
      <dl className={cardRecipeTileMetaListClasses}>
        <dt className={cardRecipeTileMetaTermClasses}>Chain</dt>
        <dd className={cardRecipeTileChainClasses}>
          {recipe.chain.map((step, index) => (
            <code key={`${step}-${index}`}>{step}</code>
          ))}
        </dd>
        <dt className={cardRecipeTileMetaTermClasses}>Density</dt>
        <dd>{recipe.density}</dd>
        <dt className={cardRecipeTileMetaTermClasses}>Leading</dt>
        <dd>{recipe.leading}</dd>
        <dt className={cardRecipeTileMetaTermClasses}>Trailing</dt>
        <dd>{recipe.trailing}</dd>
      </dl>
      <div className={cardRecipeTilePreviewClasses}>{recipe.render()}</div>
    </article>
  )
}

function RecipeGroup({ title, recipes }: { title: string; recipes: readonly CardRecipe[] }) {
  if (recipes.length === 0) return null
  return (
    <section className={cardRecipesSectionClasses} aria-label={title}>
      <Heading as="h2" variant="section">
        {title}
      </Heading>
      <div className={cardRecipesGridClasses}>
        {recipes.map((recipe) => (
          <CardRecipeTile key={recipe.name} recipe={recipe} />
        ))}
      </div>
    </section>
  )
}

const meta = {
  title: 'Recipes/Cards and Rows',
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Every card and row surface, grouped by family. Row-track tiles are measured in the
 * play function — a recipe that drifts off the shared tracks fails here.
 */
export const AllRecipes: Story = {
  render: () => (
    <div className={cardRecipesPageClasses}>
      {CARD_RECIPE_SECTIONS.map((section) => (
        <RecipeGroup
          key={section.id}
          title={section.title}
          recipes={CARD_RECIPES.filter((recipe) => recipe.section === section.id)}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitForRowAnatomyLayout()
    const tiles = canvasElement.querySelectorAll<HTMLElement>('[data-recipe-name]')
    await expect(tiles).toHaveLength(CARD_RECIPES.length)

    for (const tile of tiles) {
      if (tile.dataset.recipeAnatomy !== 'row-track') continue
      await expectRowAnatomyAligned(tile, { minGrids: 1 })
    }
  },
}

export const ByDensity: Story = {
  render: () => (
    <div className={cardRecipesPageClasses}>
      {DENSITY_GROUPS.map((group) => (
        <RecipeGroup
          key={group.id}
          title={group.title}
          recipes={CARD_RECIPES.filter((recipe) => recipe.density === group.id)}
        />
      ))}
    </div>
  ),
}
