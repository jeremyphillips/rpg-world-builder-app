# Form patterns

Composable layouts and chrome beyond a plain `<Form>` fields list.

## TabbedForm

Settings-style multi-tab form; single Save validates merged schema. All panels stay mounted.

After the first failed submit: tab triggers show error counts, Save switches to the first invalid
tab and focuses its control, and the sticky footer shows a summary with **Review {tab}** links.
Inactive panels suppress per-field error text until their tab is active.

**Sticky chrome** (default `stickyChrome={true}`): section control `sticky top-0` in the field
column; `FormActionsBar` docks below a bounded scroll body (`formStickyScrollShellClasses` +
`formStickyScrollBodyClasses`) so save actions stay at the bottom of the viewport on long page
forms. Pass `stickyChrome={false}` for flat layout. Dashboard content create/edit routes mount
`ContentFormPageShell` with `scroll="viewport" spacing="none"` so the page shell fills the app
main column without page-level scroll; TabbedForm owns the bounded scroll body and docked footer
(flush to the viewport bottom). Top inset scrolls away via `scrollBodyClassName` (typically
`formViewportScrollBodyTopInsetClasses`) as the first child inside the scroll region — not as
padding on the scroll container — so sticky tabs can reach `top-0`; preview-rail vertical gutter
lives on `formTabbedAsideSlotTopInsetClasses` / `formTabbedAsideSlotBottomInsetClasses`.
Inner scroll regions compose [`boundedScrollRegionClasses`](../bounded-scroll-region.md) for
reserved scrollbar gutters. Overlay pattern: use `externalFooter` with
`FormShellFooterScope` / `FormShellFooterSlot` instead of sticky bar inside scroll content.
Overlay owners render shell chrome (`Modal.Footer`, `Sheet.Footer`, `DrawerShell.Footer`) and
place `<FormShellFooterSlot />` inside for semantic footer content. Use `FormShellSubmitButton`
for submit actions rendered outside the `<form>` element.

Presets: `formStickyTabsTransparentClasses`, `formStickyActionsBarTransparentClasses`.

Optional `aside` (inside `FormProvider`) + `tabRowTrailing` for a compact tab-row action. At `2xl`
the body is a two-column grid (form `minmax(0, 56rem)` + aside `21rem`); the footer stays in the
form column below the scroll body (not a separate grid row). `activeTabId` is on
`TabbedFormChromeContext`.

Non-field tab intro copy: `TabbedFormTab.header`. Omit `fields` for content-only panels.

See [forms hub — TabbedForm](../forms.md#tabbedform).

## FormSaveFooter & actions

```tsx
footer={(form) => (
  <FormSaveFooter
    pending={mutation.isPending || form.formState.isSubmitting}
    isSuccess={mutation.isSuccess}
    submitLabel="Save changes"
    successMessage="Changes saved."
  />
)}
```

`FormFooterActions` for multi-button footers — pass `submitDisabled` when validity or dirty
state should block submit, and `secondaryDisabled` to disable Cancel/Discard (defaults to
`pending` so secondaries disable during submit):

```tsx
footer={(form) => (
  <FormFooterActions
    pending={mutation.isPending || form.formState.isSubmitting}
    submitDisabled={!form.formState.isDirty || !form.formState.isValid}
    secondary={
      <Button type="button" variant="outline" onClick={() => form.reset()}>
        Discard changes
      </Button>
    }
    submitLabel="Save changes"
  />
)}
```

`<Form stickyFooter>` and `<TabbedForm>` wrap footers in `FormActionsBar`.

## Wizard steps

Use `<WizardStepForm>` inside `<Wizard>` — `mode="onChange"`, Back-restore from accumulated
values, submit via `completeStep`.

```tsx
<Wizard steps={STEPS} onComplete={onComplete}>
  <WizardStepForm schema={identitySchema} fields={identityFields} />
  <WizardStepForm schema={rulesSchema} fields={rulesFields} />
  <ReviewStep />
</Wizard>
```

Keep step values **flat**; map to API shape in `onComplete`. Review step: plain `<form>` +
`useWizard().complete()`. See [package README — Wizard pattern](../../README.md#wizard-pattern).

## FormCard + Form

`FormCard` is card chrome only — render one `<Form>` child for a single RHF surface.

```tsx
<FormCard title="Log in" description="Welcome back." className="w-full max-w-sm">
  <Form
    schema={loginInputSchema}
    fields={fields}
    onSubmit={onSubmit}
    formError={formError}
    contentClassName={formCardContentClass}
    footer={(form) => (
      <CardFooter className="flex-col items-stretch gap-3">
        <SubmitButton pending={form.formState.isSubmitting}>Log in</SubmitButton>
      </CardFooter>
    )}
  />
</FormCard>
```

- Pass `contentClassName={formCardContentClass}` — `<Form>` fields are padding-free.
- Use footer **function** when pending comes from `form.formState.isSubmitting`.

## Storybook recipes

Copy runnable examples from Storybook rather than docs:

| Recipe           | Storybook path                                                            |
| ---------------- | ------------------------------------------------------------------------- |
| Multi-group form | `Forms/Form` — [form.stories.tsx](../../src/form/shells/form.stories.tsx) |
| XdY dice         | `Recipes/DiceNotation`, `Forms/DiceFormulaField`                          |
| Input unit row   | `FieldRow/LabeledRowWithInputUnit`                                        |
| Input select row | `FieldRow/LabeledRowWithInputSelect`                                      |
| Dice formula row | `FieldRow/LabeledRowWithDiceFormula`                                      |
