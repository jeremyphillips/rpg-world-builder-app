import type { FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import type { FormItem, TabbedFormTab } from '@rpg/ui/form'

import type { ContentSource, EquipmentKind, WeaponCategory } from '@rpg/contracts'
import type { ResolvedCampaignRules } from '@rpg/contracts'

import type {
  CreatureTypeVocabulary,
  DamageTypeVocabulary,
  LanguageVocabulary,
  SenseVocabulary,
  SpellSchoolVocabulary,
} from '@/features/homebrew'

import type { ContentListQueryResult } from '../list/content-client'
import type { ContentFormOptionSets } from '../form-options/content-form-options'

/**
 * Context passed to `buildFields` / `buildTabs`. Carries campaign-scoped catalog
 * options for combobox fields (weapons, equipment, spells, tools, magic-item base equipment).
 * valid in drift tests — combobox fields should fall back to `ctx.options?.weapons ?? []`.
 */
export type ContentFormCtx = {
  campaignId?: string
  entityId?: string
  mode?: 'create' | 'edit'
  /**
   * Ownership of the entity being authored: `'homebrew'` on create, the saved
   * entity's `source` on edit. Lets embedded master-detail editors derive
   * per-row delete-locking (system rows are protected) without a per-row
   * `source` field on the embedded element.
   */
  entitySource?: ContentSource
  /** Resolved campaign rule overrides (defaults when absent). */
  campaignRules?: ResolvedCampaignRules
  /** Campaign-resolved creature type labels and active ids. */
  creatureTypeVocabulary?: CreatureTypeVocabulary
  /** Campaign-resolved damage type labels and active ids (elemental + planar). */
  damageTypeVocabulary?: DamageTypeVocabulary
  /** Campaign-resolved sense labels and active ids. */
  senseVocabulary?: SenseVocabulary
  /** Campaign-resolved language labels and active ids. */
  languageVocabulary?: LanguageVocabulary
  /** Campaign-resolved spell school labels, descriptions, and active ids. */
  spellSchoolVocabulary?: SpellSchoolVocabulary
  options?: Partial<ContentFormOptionSets>
  /** Authoritative equipment kind on family create/edit routes (from route or entity). */
  equipmentKind?: EquipmentKind
  /** Equipment family URL segment for breadcrumbs and back links. */
  equipmentFamily?: string
  /**
   * Seed domain ids for embedded master-detail arrays on edit, keyed by field
   * path (e.g. `features`, `characterCreation.startingEquipment.options`).
   */
  embeddedSeedRowIds?: Readonly<Record<string, readonly string[]>>
}

/** Optional context for `toInput` — present on edit, omitted on create. */
export type ContentFormInputCtx<TEntity> = {
  entity?: TEntity
  weaponCategoryBySlug?: Readonly<Partial<Record<string, WeaponCategory>>>
  campaignRules?: ResolvedCampaignRules
  /** Injected on family routes when the Kind field is omitted from the form. */
  equipmentKind?: EquipmentKind
}

/**
 * The per-type definition that the content form registry holds. Each entry
 * describes how to:
 * - Render fields (`buildFields`)
 * - Seed the edit form from a stored entity (`toFormValues`)
 * - Map validated form values to the create API input (`toInput`)
 *
 * `toFormValues` and `toInput` are **pure functions** (no side effects, no
 * rendering) so the drift test suite can exercise them without mounting anything.
 */
export interface ContentFormDef<
  TEntity extends { id: string; name: string },
  TFormValues extends FieldValues,
  TCreateInput,
> {
  /** Kebab-case route key used in URLs and API paths (e.g. `'species'`). */
  routeKey: string
  /** Zod schema validated on submit. Must match `TFormValues`. */
  schema: ZodType<TFormValues>
  /** Campaign-aware schema when the default `schema` is not sufficient. */
  resolveSchema?: (ctx: ContentFormCtx) => ZodType<TFormValues>
  /** Returns the ordered `FormItem[]` for this type. */
  buildFields: (ctx: ContentFormCtx) => FormItem[]
  /**
   * When set, create/edit shells render a `<TabbedForm>` instead of `<Form>`.
   * Tab field lists are the source of truth; `buildFields` should delegate to
   * `contentFormFields(this, ctx)` for drift tests.
   */
  buildTabs?: (ctx: ContentFormCtx) => TabbedFormTab[]
  /**
   * Maps a stored entity to form defaults for the edit shell.
   * Partial so optional fields don't need explicit `undefined`.
   */
  toFormValues: (entity: TEntity) => Partial<TFormValues>
  /**
   * Initial values for the create shell. Merged over synthesized field defaults
   * from `buildFields` (e.g. nested `movement` rows need `{ movement: [{ mode, feet }] }`).
   */
  createDefaultValues?: Partial<TFormValues>
  /**
   * Maps validated form values to the API input shape.
   * Pass `{ entity }` on edit so slug and nested ids stay locked after create.
   * The type-level drift test asserts this matches the contract DTO.
   */
  toInput: (formValues: TFormValues, ctx?: ContentFormInputCtx<TEntity>) => TCreateInput
  /** List query hook; the edit shell uses it to seed the form from cache. */
  useListQuery: (campaignId: string | undefined) => ContentListQueryResult<TEntity>
  /** Query key factory; used to invalidate the list after a successful mutation. */
  queryKey: (campaignId: string) => readonly unknown[]
  /**
   * Additional query keys to invalidate after a successful create/update (e.g.
   * classes also refresh skill proficiencies when class names change).
   */
  invalidateQueryKeys?: (campaignId: string) => readonly (readonly unknown[])[]
  /**
   * Maps a saved entity to seed row domain ids for embedded master-detail
   * delete-lock and source badge derivation on edit.
   */
  extractEmbeddedSeedRowIds?: (entity: TEntity) => Readonly<Record<string, readonly string[]>>
  /**
   * Coverage mode for the drift test suite:
   * - `'roundtrip-only'` (default): verifies `toFormValues` → `toInput` →
   *   `schema.parse` round-trips against `@rpg/catalog` fixtures.
   * - `'structural'`: additionally compares Zod shape paths to
   *   `flattenFields(buildFields({}))` paths for flat types.
   */
  coverage?: 'structural' | 'roundtrip-only'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- all three params are erased at the registry boundary; each def is strongly typed internally
export type AnyContentFormDef = ContentFormDef<any, any, any>

/**
 * The global content form registry. Each content type that supports create/edit
 * registers one entry here. The key is the `routeKey`.
 *
 * Phase 3 registers `species`; subsequent phases register the remaining types.
 */
export const contentFormRegistry: Record<string, AnyContentFormDef> = {}

/** Flat field list for drift tests — tabs when present, else `buildFields`. */
export function contentFormFields(
  def: Pick<AnyContentFormDef, 'buildFields' | 'buildTabs'>,
  ctx: ContentFormCtx,
): FormItem[] {
  if (def.buildTabs) {
    return def.buildTabs(ctx).flatMap((tab) => [...tab.fields, ...(tab.resolverFields ?? [])])
  }
  return def.buildFields(ctx)
}
