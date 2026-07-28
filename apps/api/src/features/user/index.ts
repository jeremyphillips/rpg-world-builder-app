export { userRouter } from './user.routes'
export { UserModel, type UserSchemaType } from './user.model'
export {
  createUser,
  findUserByEmail,
  findUserByEmailWithSecret,
  findSessionUserById,
  findUsersByIds,
  findUserWithActivityTimestampsById,
  countSuperadminsExcluding,
  recordUserLoginActivity,
  recordUserActivity,
  toSessionUser,
  toUserWithActivityTimestamps,
  updateLastSelectedCampaign,
  updateProfile,
  changePassword,
  type UserWithActivityTimestamps,
} from './user.service'
export { resolveActiveCampaignForUser } from './active-campaign'
