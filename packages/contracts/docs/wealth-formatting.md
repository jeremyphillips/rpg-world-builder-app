# Wealth formatting

Three primitives own every displayed amount. Domain helpers compose them. They do not introduce a second currency model.

## Primitives

- `formatMoney` — an authored denomination. Rope priced as 5 SP stays `5 SP`.
- `formatWealth` — exact normalized wealth with a comma join, for prose. `Take 75 GP, 5 SP instead of standard equipment.` `Remove 1 GP, 5 SP to continue.`
- `formatInlineWealth` — the same purse with a space join, for compact UI. `637 GP 5 SP`, `1 GP 5 SP value`, `73 GP remaining`.
- `formatCurrencyDiceFormula` — `1d10 × 250 GP`.
- `formatTierBonusGold` — `5,000 GP + 1d10 × 250 GP`. The rule is authored in GP. It is not a purse, and it does not go through `formatWealth`.

Zeros drop out. Platinum folds into GP, SP, and CP. All-zero wealth is `0 GP`. Do not add a copper-number overload: a bare number is easy to misread as GP. Callers that hold copper go through `copperToWealth` first.

## Which formatter

Do not change the monetary value to make the copy simpler. Formatting may change the separator only.

- Authored price → `formatMoney`.
- Exact purse or aggregate in a sentence → `formatWealth`.
- Compact UI wealth → `formatInlineWealth`.
- Integer quantity (`remaining / unitCost`) → `Math.floor` stays. That is a copy count.
- Whole-copper quantization inside `copperToWealth` / `copperToDisplayWealth` stays.

Name a wrapper for what it composes:

- Label — a short fragment: `5 SP`, `Total: 15 GP`.
- Line — one complete display line: `5 SP each · 1 GP 5 SP total`.
- Copy — structured fields or prose for a component.

Do not name a wrapper `Display`. Do not add `formatCharacterResourceWealth` or `formatInventoryResourceWealth`.

## Price versus spend

These are not the same amount. Price is the current catalog unit cost times quantity (`formatPurchaseLinePrice`). Spend is the copper stored on a purchase snapshot times quantity (`formatPurchaseSpend`, phrased `{coins} spent`). A later catalog edit must not rewrite what was spent.

`formatPurchaseContributionLabel` returns `{ quantityLabel, spendSuffix }` because the owned-source row renders those in different slots.
