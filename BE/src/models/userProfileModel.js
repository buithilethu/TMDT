import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import Joi from 'joi'
const USER_PROFILE_COLECTION_SCHEMA = 'user_profiles'

const userProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
  address: Joi.string().min(5).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  dob: Joi.date().iso().required(),
  userId: Joi.string()// optional nếu tự lấy từ req.user
})



const createUserProfile = async (data) => {
  //{userId, fullName, phone, address, gender, dob}
  const value = await userProfileSchema.validateAsync(data, { abortEarly: false })

  value.userId = new ObjectId(value.userId)
  value.createdAt = Date.now()
  value.updatedAt = Date.now()
  value.dob = new Date(value.dob)


  const result = await GET_DB().collection(USER_PROFILE_COLECTION_SCHEMA).insertOne(value)
  return result
}

const getUserProfileByUserId = async (userId) => {
  return await GET_DB().collection(USER_PROFILE_COLECTION_SCHEMA).findOne({ userId: new ObjectId(userId) })
}

const updateUserProfile = async (userId, data) => {
  const value = await userProfileSchema.validateAsync(data, { abortEarly: false })

  value.updatedAt = Date.now()
  value.dob = new Date(value.dob)
  value.userId = new ObjectId(userId)


  await GET_DB().collection(USER_PROFILE_COLECTION_SCHEMA).updateOne(
    { userId: new ObjectId(userId) },
    { $set: value },
    { upsert: true }
  )

  return await getUserProfileByUserId(userId)
}


export const userProfileModel = {
  USER_PROFILE_COLECTION_SCHEMA,
  userProfileSchema,
  createUserProfile,
  getUserProfileByUserId,
  updateUserProfile
}