/**
 * Deletes every document in the `classpatches` collection (campaign class overlays).
 *
 * Dev-only cleanup when stale patches fail class catalog validation (e.g. starting
 * equipment items missing required `id` after schema changes).
 *
 * Usage (local docker mongo-rs from repo root):
 *
 *   docker exec rpg-world-builder-app-mongo-rs-1 mongosh \
 *     "mongodb://127.0.0.1:27017/rpg" \
 *     --file /path/in/container/or/paste --eval "$(cat tools/scripts/delete-all-class-patches.mjs)"
 *
 * Or pipe the script:
 *
 *   docker exec -i rpg-world-builder-app-mongo-rs-1 mongosh \
 *     "mongodb://127.0.0.1:27017/rpg?replicaSet=rs0" \
 *     --quiet < tools/scripts/delete-all-class-patches.mjs
 *
 * With mongosh on PATH (matches apps/api/.env MONGODB_URI):
 *
 *   mongosh "$MONGODB_URI" --quiet < tools/scripts/delete-all-class-patches.mjs
 */

const collectionName = 'classpatches'
const before = db.getCollection(collectionName).countDocuments({})

print(`[delete-all-class-patches] ${collectionName}: ${before} document(s) before delete`)

const result = db.getCollection(collectionName).deleteMany({})

print(`[delete-all-class-patches] deleted ${result.deletedCount} document(s)`)
printjson(result)
