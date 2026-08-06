# Testing in @rpg/dashboard

Dashboard tests are Vitest + Testing Library. Pure lib tests run in **node**;
component tests run in **jsdom**. Validation matrices belong to
[`@rpg/contracts`](../../../packages/contracts/docs/testing.md) — do not
duplicate schema edge-case tables here.

## Test pyramid

| Kind           | File pattern                | Environment | Scope                                                                 |
| -------------- | --------------------------- | ----------- | --------------------------------------------------------------------- |
| Pure lib       | `{module}.test.ts`          | node        | Form defs, value mapping, helpers — no DOM, no render                 |
| Component      | `{name}.test.tsx`           | jsdom       | Behavior + a11y of components/hooks (render, renderHook)              |
| Route          | `{route}.test.tsx`          | jsdom       | Route-level states: loading/error/permission/copy semantics           |
| Message sweeps | `*-form-validation.test.ts` | node        | Registry coverage + refined-copy checks via `@rpg/ui/form/test-utils` |

**The extension is the contract**: `.test.ts` runs in the `dashboard:node`
vitest project (no jsdom, no Testing Library setup — much faster). Anything
that renders, uses `renderHook`, or touches `document`/`window` must be
`.test.tsx` so it lands in `dashboard:jsdom`. Config lives in
`vitest.node.config.ts` / `vitest.jsdom.config.ts` (referenced by both the
package `vitest.config.ts` and the repo-root config).

## Shared scaffold

| Path                                                | Purpose                                                                                      |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/test/render.tsx`                               | `makeTestQueryClient()`, `renderWithProviders(ui, { queryClient?, initialEntries? })`        |
| `src/test/make-wrapper.tsx`                         | `makeQueryWrapper()` — `wrapper` option for `renderHook`                                     |
| `src/test/form-shell.tsx`                           | `TestFormShell` — MemoryRouter + react-hook-form `FormProvider`                              |
| `src/test/mocks/ui-form.tsx`                        | `stubUiFormItems(importOriginal, testId?)` — shared `@rpg/ui/form` mock                      |
| `src/test/fixtures/session.ts`                      | `makeSessionUser()`, `makeAuthMe()`                                                          |
| `src/test/fixtures/campaigns.ts`                    | `makeCampaignListItem()`                                                                     |
| `features/content/lib/fixtures/pick.ts`             | `pickEquipment()`, `pickClass()`, … (catalog-backed)                                         |
| `features/content/lib/fixtures/content-form-ctx.ts` | `makeContentFormCtx()`, `TEST_CAMPAIGN_ID`                                                   |
| `features/content/equipment/lib/test-utils/`        | `expectComposedKindGroups()`, `expectSeedRoundTrip()`, `seedEquipmentOfKind()`               |
| `@rpg/ui/test-utils`                                | `expectNoAxeViolations(container)` — axe with `color-contrast` off                           |
| `@rpg/ui/form/test-utils`                           | `assertRegistryCoverage`, `assertInvalidSubmitUsesRefinedMessages`, `submitAndExpectPayload` |

Never hand-roll `new QueryClient(...)`, MemoryRouter + QueryClientProvider
stacks, inline `SessionUser`/`CampaignListItem` objects, or `axe.run` +
violations assertions — use the scaffold. Fixture defaults are overridable;
pass overrides instead of redefining shapes.

### Standard harnesses

```tsx
// Component that fetches / links / navigates:
renderWithProviders(<DashboardHome />)

// Guard or param-dependent route (pass Routes yourself):
renderWithProviders(<Routes>…</Routes>, { initialEntries: ['/admin/users'] })

// Hook with TanStack Query:
renderHook(() => useCanManageCampaign('c1'), { wrapper: makeQueryWrapper() })

// Form tab/panel that expects RHF context:
render(
  <TestFormShell defaultValues={{ features }}>
    <ClassFeaturesTab formCtx={makeContentFormCtx()} />
  </TestFormShell>,
)
```

### Mocking `@rpg/ui/form`

`vi.mock` factories are hoisted, so consume the shared stub via dynamic import:

```ts
vi.mock('@rpg/ui/form', async (importOriginal) => {
  const { stubUiFormItems } = await import('@/test/mocks/ui-form')
  return stubUiFormItems(importOriginal) // optional 2nd arg: custom testid
})
```

## Accessibility

Interactive components get a Vitest axe test (repo-wide WCAG 2.2 AA policy).
**Axe runs in CI only** — local pre-commit skips it for speed; Storybook
axe-playwright and eslint jsx-a11y still gate PRs.

Dedicated axe-only blocks:

```ts
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

itAxe('has no axe accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  await expectNoAxeViolations(container)
})
```

Mixed behavior + axe in one block — keep `it` and call `expectNoAxeViolations`
(it no-ops locally, runs in CI):

```ts
it('shows recoverable state and has no axe violations', async () => {
  // behavior assertions…
  await expectNoAxeViolations(container)
})
```

Opt in locally: `FORCE_AXE=1 pnpm --filter @rpg/dashboard test`

Do not call `axe.run` directly — the helper disables `color-contrast` (jsdom
has no canvas; contrast runs in Storybook's addon-a11y instead).

## Fragile / low-value tests — do not write

- **No Tailwind/CSS class assertions** (`toHaveClass('flex', 'gap-8', …)`).
  Assert structure via roles/document order instead; visual styling belongs to
  Storybook.
- **No exact long microcopy strings** when the wording is incidental. Query by
  role and match a stable keyword: `getByText(/only campaign owners can edit/i)`.
  Exception: when the formatted string **is** the unit under test (e.g.
  `level-range-summary`, requirement summaries), assert it exactly.
- **No snapshot tests.**
- **No render-only tests** ("renders children" with no behavior) unless the
  file otherwise only holds the required axe check.
- **No schema edge-case matrices** — cross-field validation tables live in
  `@rpg/contracts`. Dashboard form tests cover _mapping_ (`toFormValues` /
  `toInput` round-trips, surface-specific field composition) and _message
  quality_ (the `*-form-validation.test.ts` sweeps), not raw Zod behavior.

## Performance rules

- Pure logic → `.test.ts` (node project). Don't pay for jsdom you don't use.
- `const user = userEvent.setup()` once per test; never the bare global
  `userEvent.click(...)`.
- Don't import feature barrels or the full content-form registry in a test
  that needs one module — imports dominate this suite's runtime.
- Keep `waitFor` bodies to a single assertion; no manual timeouts, no
  `setTimeout`, no fake timers unless the unit is time-based.
- Prefer the smallest harness that exercises the behavior: a tab component
  with `TestFormShell` beats mounting a whole route.

## Known coverage gaps (backlog, in priority order)

1. **`features/character`, `features/notification`, `features/message`** — no
   tests at all. Add route smoke + lib tests when these features stabilize.
2. **Route-level coverage** — only ~7 of ~55 route files are tested. Highest
   value: equipment hub/edit/detail, campaign create/detail, admin users.
3. **Mutation error paths** — most `use-content-mutations` coverage is
   success/invalidations; error alerts, rollback, and CSRF/session-expiry
   behavior are untested.
4. **Availability on edit surfaces** — availability lib + badges are covered,
   but not their integration on class/equipment edit routes.

## Scripts

```sh
pnpm --filter @rpg/dashboard test              # both projects
cd apps/dashboard && npx vitest run --project dashboard:node   # lib tests only
cd apps/dashboard && npx vitest run --project dashboard:jsdom  # component tests only
```
