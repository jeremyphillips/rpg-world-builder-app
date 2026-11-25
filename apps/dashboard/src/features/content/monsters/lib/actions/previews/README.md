# Monster action previews

`MonsterActionDetail` supplies a draft action request to the master–detail
editor. `StructuredFacingHostPanel` renders the selected action above the
composer fields. Rules text comes from `resolveActionStatBlockRulesFacingForForm`
and the published rules composer. Attack metadata uses the selected draft
attack profile.

The summary builders in this directory serve action authoring and stat-block
facing. Registered per-kind form slots live under
`components/form/actions/`.

Multiattack spell options use the authoring catalog outcome for each exact
spell ID. Cast-level labels require a resolved spell. Unresolved spell and
attack references keep their stored option values and use shared display copy.
