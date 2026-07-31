/**
 * One-time dev cleanup: delete direct Conversation rows with no latestMessage preview.
 *
 * Run from repo root:
 *   pnpm exec tsx tools/migrations/delete-empty-direct-conversations.ts
 *
 * Requires MONGODB_URI (defaults to mongodb://127.0.0.1:27017/rpg).
 */
import mongoose from 'mongoose'

import { ConversationParticipantStateModel } from '../../apps/api/src/features/conversation/conversation-participant-state.model'
import { ConversationModel } from '../../apps/api/src/features/conversation/conversation.model'
import { MessageModel } from '../../apps/api/src/features/conversation/message.model'

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/rpg'
  await mongoose.connect(uri)

  const emptyConversations = await ConversationModel.find({
    $or: [{ latestMessage: null }, { latestMessage: { $exists: false } }],
  })
    .select('_id')
    .lean<{ _id: unknown }[]>()

  if (emptyConversations.length === 0) {
    console.log('No empty direct conversations found.')
    await mongoose.disconnect()
    return
  }

  const conversationIds = emptyConversations.map((conversation) => String(conversation._id))

  const messageResult = await MessageModel.deleteMany({ conversationId: { $in: conversationIds } })
  const participantStateResult = await ConversationParticipantStateModel.deleteMany({
    conversationId: { $in: conversationIds },
  })
  const conversationResult = await ConversationModel.deleteMany({ _id: { $in: conversationIds } })

  console.log(
    `Deleted ${conversationResult.deletedCount} empty conversations, ` +
      `${messageResult.deletedCount} orphaned messages, ` +
      `${participantStateResult.deletedCount} participant states.`,
  )

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
