# Breakpoints

Viewport steps and container steps are separate Tailwind scales. The same label, or the same length, is not the same query.

`rem` inside a media or container query is the **initial font size**, not the computed `html` font-size. `html { font-size: 18px }` does not move these thresholds. A browser font-size preference can, because it changes the initial value. At the usual 16px initial size, `48rem` is 768px.

Viewport declarations live only in [`src/styles/breakpoints.css`](../src/styles/breakpoints.css), imported from `globals.css` immediately after `tailwindcss`. That file resets `--breakpoint-*` and redeclares the five steps below. It does not touch `--container-*`.

Semantic CSS that uses `@variant` has to enter through an approved stylesheet entry (`globals.css` for `@rpg/ui`, or the app `index.css` / `globals.css` that imports it). See [css layer ownership](../src/styles/css-layer-ownership.test.ts).

## Viewport scale

Measured on the viewport. Utilities are `sm:`, `md:`, `lg:`, `xl:`, `2xl:`. There is no viewport `xs`.

| Name  | Token              | Min-width | Role                                                                                      |
| ----- | ------------------ | --------- | ----------------------------------------------------------------------------------------- |
| `sm`  | `--breakpoint-sm`  | 40rem     | Padding, stacking, and chrome past a phone                                                |
| `md`  | `--breakpoint-md`  | 48rem     | Sidebar, two-column catalogs, form stacks, search label, dialog title, preview sheet side |
| `lg`  | `--breakpoint-lg`  | 64rem     | Table density and section nav                                                             |
| `xl`  | `--breakpoint-xl`  | 80rem     | Persistent preview rail                                                                   |
| `2xl` | `--breakpoint-2xl` | 96rem     | Wider preview column and the rare six-column grid                                         |

Base styles are the smallest supported viewport. Prefer these min-width steps. `max-sm` through `max-2xl` are the downward form of the same tokens (`width <`). Modal sizes `media` and `xl` use `max-md:` so the panel is a full-viewport sheet below `md`. That stays a class string. Do not retarget the preview rail (viewport `xl`) or the preview sheet side (viewport `md`).

These lengths are not breakpoints, even when the number matches:

- `--max-width-page-wide` (80rem) and `--max-width-page-narrow` (56rem) are page caps.
- Dialog heights, the sidebar width, preview column tracks, and the master-detail list cap are component geometry.
- `100dvh` / `100cqh` math stays on its own tokens.

## Container scale

Measured on the nearest container (`@container` or `container-type`). Tailwind's installed `--container-*` scale is unchanged:

| Variant | Min-width | Collides with                                                                |
| ------- | --------- | ---------------------------------------------------------------------------- |
| `@3xs`  | 16rem     |                                                                              |
| `@2xs`  | 18rem     |                                                                              |
| `@xs`   | 20rem     |                                                                              |
| `@sm`   | 24rem     | Not viewport `sm` (40rem)                                                    |
| `@md`   | 28rem     | Not viewport `md` (48rem). The master-detail 28rem list cap is not this step |
| `@lg`   | 32rem     | Not viewport `lg` (64rem). Radio-card group: one column to two               |
| `@xl`   | 36rem     |                                                                              |
| `@2xl`  | 42rem     | Not viewport `2xl` (96rem)                                                   |
| `@3xl`  | 48rem     | Same length as viewport `md`. Radio-card group: two columns to three         |
| `@4xl`  | 56rem     | Same length as `--max-width-page-narrow`, which is still a page cap          |
| `@5xl`  | 64rem     | Same length as viewport `lg`                                                 |
| `@6xl`  | 72rem     |                                                                              |
| `@7xl`  | 80rem     | Same length as viewport `xl` and the wide page cap                           |

`@variant lg` is the viewport at 64rem. `@variant @lg` is the container at 32rem.

## `@variant`

Apply a named variant in CSS that Tailwind is already processing. Do not write a raw `@media` width query, a viewport `min-[…]` / `max-[…]` utility, or a `breakpointUp()` helper.

### Min-width

`@variant sm`, `@variant md`, `@variant lg`, `@variant xl`, `@variant 2xl` compile to `@media (width >= …)` at the token above.

### Max-width

`@variant max-sm`, `@variant max-md`, `@variant max-lg`, `@variant max-xl`, `@variant max-2xl` compile to `@media (width < …)` at the same token. JSX uses the same names: `max-md:hidden`.

### Container

Prefix the container name: `@variant @lg` compiles to `@container (width >= 32rem)`. `@variant @3xl` compiles to `@container (width >= 48rem)`. JSX uses `@lg:grid-cols-2` and `@3xl:grid-cols-3`. The element still needs a container ancestor.

### Where to put it

Nest it on the selector that changes:

```css
.dash-character-builder__preview {
  display: none;
  @variant xl {
    display: flex;
  }
}
```

Or wrap several selectors that share one step, at the root of a file already in the Tailwind entry:

```css
@variant lg {
  .ui-data-table__image {
    width: 2rem;
    height: 2rem;
  }
}
```

JSX for the same viewport step stays `hidden xl:flex` or `md:flex`.

### Stacking

Stack the same way as a class string. Both of these compile:

```css
.example {
  @variant md:hover {
    color: var(--foreground);
  }
}
```

```css
.example {
  @variant md {
    @variant hover {
      color: var(--foreground);
    }
  }
}
```

The colon form matches `md:hover:…` in JSX.

## JavaScript

There is no JavaScript copy of the scale. The one runtime query is `VIEWPORT_MD_MIN_QUERY` (`(width >= 48rem)`), and it must match the compiled `md:` condition. `matchMedia` uses the same initial font size as CSS. Do not add `sm` / `lg` / `xl` / `2xl` query constants until a runtime consumer exists.
