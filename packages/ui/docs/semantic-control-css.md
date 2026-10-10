# Semantic control CSS

Interactive controls and buttons emit BEM-style classes (`ui-button ui-button--outline ui-button--sm`) instead of long Tailwind utility lists in CVA output. CVA remains the public API; only the emitted class strings change.

## Naming

| Pattern  | Example                               |
| -------- | ------------------------------------- |
| Block    | `ui-button`                           |
| Modifier | `ui-button--sm`, `ui-button--outline` |
| Element  | `ui-floating-label-field__label`      |

## Declaration styles

1. **Size / geometry** — direct declarations in size modifiers (`height`, `padding-inline`, `gap`, `font-size`, …) using shared tokens (`--control-height-*`, `--control-gap-*`, `--field-padding-*`).
2. **Color / interaction** — component-local custom properties (`--ui-button-bg`, `--ui-button-fg`, …) set by appearance modifiers; the block class writes `:hover`, `:active`, `:focus-visible`, `:disabled`, and `[aria-expanded='true']` once.
3. **Composites** — shell sets inherited measurements (`--ui-field-slot-ps`, `--floating-label-control-h`); parts read them. Shell height stays a direct declaration on the size modifier.

## Mutually exclusive modifiers

Within one dimension (size, appearance), every modifier declares the **same** property list. Source order in each `*.css` file is fixed; when two modifiers from the same dimension are present, the later rule wins. Geometry families at `(0,2,0)` (e.g. `.ui-button.ui-button--text`) win over chrome appearances as documented per file.

`cn()` registers twMerge groups (`ui-button-size`, `ui-button-appearance`, …) so React composition matches DevTools.

## Inspector acceptance

For each migrated primitive, verify in Storybook DevTools:

1. Swap size — one class edit; no leftover geometry from the old size.
2. Swap density (Button only) — one resolved class (`ui-button--md-compact`).
3. Swap appearance or field invalid/disabled state; exercise `:hover`, `:active`, `:focus-visible`.
4. Add a second modifier from the same dimension — result is wholly one modifier, never a blend.
5. Untick one declaration in a size block — only that property changes.
6. No Tailwind utility edits required for 1–3.
7. Storybook `ClassReference` + live caption match DevTools; utility side of caption is empty (layout-only utilities documented).

## Field control width and trigger flow

- **`ui-field-control--width-*`** — exactly one width modifier per control composition (typically `Field.Root`, filter chrome wrapper, or standalone trigger when no outer owner exists). Fractions and intrinsic caps live in `field-control.css`; twMerge group `ui-field-control-width`.
- **`ui-field-control--trigger-{fill|fit|segment}`** — mutually exclusive horizontal flow on select/combobox triggers only; twMerge group `ui-field-control-trigger-flow`. Width tokens do not belong on the trigger when an ancestor already owns `--width-*`.

## When CVA vs CSS

- **CVA** — prop mapping, compound logic (Button size × density lookup), and non-visual layout utilities where documented.
- **CSS** — all repeatable size, appearance, and state presentation.

Storybook helpers live in `src/stories/semantic-classes/` (`ClassReferenceTable`, `SemanticClassCaption`, `semanticClassArgTypes`).
