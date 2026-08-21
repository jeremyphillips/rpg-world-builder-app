# Create flow

Shared dashboard create-flow infrastructure.

| Prefix                                   | Owns                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `create-modal-*`                         | Create modal shell and chrome                                                                  |
| `create-flow-form-density*`              | Compact form density for create workflows                                                      |
| `create-tab-content.*`                   | Tab panel spacing tokens                                                                       |
| `create-composition-*`                   | Nested composition presentation                                                                |
| `add-pending-*`                          | Resting/composing child workflows                                                              |
| `content-create-*` / `created-content-*` | Create context and generic post-persist handoff                                                |
| `nested-create-handoff.*`                | Handoff failure copy for post-persist selection wiring — not relationship-picker orchestration |

Domain forms, relationship vocabulary, and picker eligibility remain feature-owned.
Setup sequencing lives in `@/lib/create-setup`.
Nested acquisition orchestration lives in `features/content/lib/relationship/picker/`.

Detail: [create-flow.md](../../../docs/create-flow.md)
