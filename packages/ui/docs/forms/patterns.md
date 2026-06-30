# Form patterns

Composable layouts and chrome beyond a plain `<Form>` fields list.

## TabbedForm

Settings-style multi-tab form; single Save validates merged schema. All panels stay mounted.

**Validation gap:** errors on inactive tabs are not shown on tab triggers — if Save appears
to do nothing, check other tabs.

**Sticky chrome** (default `stickyChrome={true}`): tab list `sticky top-0`; `FormActionsBar`
sticky bottom with footer. Pass `stickyChrome={false}` for flat layout. Sheet pattern: use
`footerWrapper` / `contentWrapper` instead of sticky bar inside scroll content.

Presets: `formStickyTabsTransparentClasses`, `formStickyActionsBarTransparentClasses`.

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

`FormFooterActions` for multi-button footers. `<Form stickyFooter>` and `<TabbedForm>` wrap
footers in `FormActionsBar`.

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

| Recipe           | Storybook path                                                     |
| ---------------- | ------------------------------------------------------------------ |
| Multi-group form | `Forms/Form` — [form.stories.tsx](../../src/form/form.stories.tsx) |
| XdY dice         | `Recipes/DiceNotation`, `Forms/DiceFormulaField`                   |
| Input unit row   | `FieldRow/LabeledRowWithInputUnit`                                 |
| Input select row | `FieldRow/LabeledRowWithInputSelect`                               |
| Dice formula row | `FieldRow/LabeledRowWithDiceFormula`                               |
