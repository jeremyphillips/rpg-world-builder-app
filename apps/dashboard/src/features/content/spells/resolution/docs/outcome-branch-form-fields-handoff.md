# Handoff: Outcome branch `FormItems` group + `outcomeNoteFields()`

Use this prompt when handing off to an agent (or resuming work) to finish the outcome
branch form refactor started in the resolution outcomes editor.

## Goal

Extract **Additional behavior** (`resolution.outcomes[n].note`) into schema-driven
`outcomeNoteFields()`, render it via `FormItems`, and wrap **applications + add slot +
note** in a single `kind: 'group'` config so sibling spacing uses form rhythm tokens
(not ad-hoc `space-y-*`).

Remove hand-wired `useController` / `TextareaField` prop drilling for the note field.

## Background (already done)

Outcome **application rows** were migrated from an ad-hoc card to the array field system:

- `outcomeApplicationsArrayFields()` in
  `lib/form/resolution-outcome-form-fields.ts`
- `SpellResolutionOutcomeApplicationAddControl` (external add dropdown, mirrors effects)
- `FormItems` with `namePrefix={`resolution.outcomes.${outcomeIndex}`}` in
  `spell-resolution-outcome-group-body.tsx`
- `resolutionOutcomeApplicationsResolverFields()` wired on the spell Resolution tab
  (`spell-form-fields.ts`)

**Still hand-wired:** `note` via `useSpellResolutionOutcomeGroup` → props → `TextareaField`.

## Constraints (do not break)

1. **Empty applications array mount bug** — Do **not** mount the applications array
   `FormItems` when `applications.length === 0`. Mounting an empty nested field array at
   `resolution.outcomes[n].applications` corrupts `resolution.outcomes` (entire outcomes
   UI disappears). Keep conditional render for applications only.

2. **Add control stays external** — `SpellResolutionOutcomeApplicationAddControl` must
   remain a slot (dynamic menu from `resolution.effects`, `getArrayFieldMutators` with
   `appendOutcomeApplication` fallback for first append). Do not use `addActionMenu` on
   the array config.

3. **Note always visible when body is expanded** — Including empty miss branch after
   "Configure miss outcome". Tests depend on `hitNote` / "Additional behavior" label
   without any applications.

4. **Form rhythm** — Use `kind: 'group'` (or `fieldStackRhythmVariants` + inherited
   `rhythm` from `useFormSectionContext`) for spacing between applications / add / note.
   Do not use ad-hoc `space-y-3` between form siblings. Card chrome (`border`, `p-3`,
   heading) may stay on the outer `<section>`.

5. **Contracts-first** — `note` shape stays `resolutionOutcomeFormItemSchema.note`
   (optional string). No schema changes unless product requires validation.

## Implementation plan

### 1. `resolution-outcome-form-fields.ts`

Add:

```ts
export function outcomeNoteFields(): FormItem[] {
  return [
    {
      type: 'textarea',
      name: 'note',
      label: RESOLUTION_FIELD_LABELS.hitNote,
      rows: 3,
      width: 'full',
    },
  ]
}
```

Add a **factory** (needs `outcomeIndex` for the add slot):

```ts
export function outcomeBranchBodyFields(
  outcomeIndex: number,
  includeApplications: boolean,
): FormItem[] {
  return [
    {
      kind: 'group',
      legend: '', // no phantom legend spacing
      fields: [
        ...(includeApplications ? outcomeApplicationsArrayFields() : []),
        {
          kind: 'slot',
          name: '_outcomeApplicationAdd',
          render: () =>
            createElement(SpellResolutionOutcomeApplicationAddControl, { outcomeIndex }),
        },
        ...outcomeNoteFields(),
      ],
    },
  ]
}
```

Optional: extend `resolutionOutcomeApplicationsResolverFields()` (or add sibling helper)
with resolver-only leaf fields for `resolution.outcomes.{0,1,2}.note` so tier-1
validation copy uses "Additional behavior" if note validation is added later. Low
priority today (`note` is optional).

### 2. `spell-resolution-outcome-group-body.tsx`

Replace separate `FormItems` + add control + `TextareaField` with one call:

```tsx
const applications = readOutcomeApplications(outcome?.applications)

<FormItems
  items={outcomeBranchBodyFields(outcomeIndex, applications.length > 0)}
  idPrefix={`resolution-outcome-${outcomeIndex}`}
  namePrefix={`${RESOLUTION_FIELD_NAME}.outcomes.${outcomeIndex}`}
/>
```

Remove props: `noteId`, `noteValue`, `noteError`, `onNoteChange`, `onNoteBlur`.

Keep: `headingId`, `result`, `outcomeIndex`, outer `<section>` + `<Heading>`.

### 3. `use-spell-resolution-outcome-group.ts`

Remove:

- `noteId` (`useId`)
- `useController` for `outcomes[n].note`
- `noteValue`, `noteError`, `onNoteChange`, `onNoteBlur` from return value

Keep: `headingId`, `outcomeIndex`, `result`, collapse/expand miss logic.

### 4. `spell-resolution-outcome-group.tsx` / types

Update `SpellResolutionOutcomeGroupBodyProps` and spread from hook — drop note props.

### 5. Tests

Update / extend:

| File                                          | What to verify                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `resolution-outcome-form-fields.test.ts`      | `outcomeNoteFields()` shape; `outcomeBranchBodyFields()` group contains array (when included), slot, textarea                               |
| `spell-resolution-outcomes.test.tsx`          | Existing cases still pass — especially **collapses empty miss** (note visible after expand), **chill touch** note display value, axe checks |
| `resolution-outcome-applications.lib.test.ts` | Unchanged (append fallback still used)                                                                                                      |

Run:

```bash
pnpm exec vitest run apps/dashboard/src/features/content/spells/resolution
pnpm --filter @rpg/dashboard typecheck
```

Pre-commit affected gates per `AGENTS.md` before commit.

## Reference patterns

- **Effects add slot:** `resolution-form-slots.ts` → `hideAddAction: true` + `SpellResolutionEffectAddControl`
- **Embedded FormItems + namePrefix:** species heritage tab (`species-heritage-tab.tsx`)
- **Resolver fields:** `embeddedArrayResolverField` in `tabbed-form-resolver-fields.ts`; spell tab already has `errorPaths: ['resolution.outcomes']`
- **Form rhythm tokens:** `fieldStackRhythmVariants` / `kind: 'group'` — `packages/ui/docs/forms/sizing-and-spacing.md`

## Acceptance criteria

- [ ] No `TextareaField` / `useController` for outcome `note` in outcome group components
- [ ] `outcomeNoteFields()` exported and covered by unit test
- [ ] Single `FormItems` per outcome branch body via `outcomeBranchBodyFields()`
- [ ] Applications array still conditional (`includeApplications`)
- [ ] Add control rendered via group slot, not inside array config
- [ ] Spacing between applications / add / note matches compact form rhythm (`gap-2`)
- [ ] All `spell-resolution-outcomes.test.tsx` cases pass
- [ ] Typecheck clean

## Out of scope

- Moving outcome heading / miss collapse into form config
- Registering `resolution.outcomes` as a top-level field array in `resolution-form-slots.ts`
- Changing application row layout (detailed + summary header is intentional)
