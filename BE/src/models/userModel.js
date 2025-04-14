import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
  password: Joi.string().min(6).required(),
  isAdmin: Joi.boolean().default(false),
  created_at: Joi.date().default(new Date())
}).unknown(true)

const registerUser = async (userData) => {
  try {
    const value = await USER_COLLECTION_SCHEMA.validateAsync(userData, { abortEarly: false })
    const emailIsExist = await findOne({ email: value.email })

    if (emailIsExist) {
      throw new Error('Email already exists')
    }
    const user = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(value)

    return user
  } catch (error) {
    throw new Error(error)
  }
}

const findOne = async (userData) => {
  try {
    const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: userData.email })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (userId) => {
  try {
    const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return user
  } catch (error) {
    throw new Error(error)
  }
}
export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  registerUser,
  findOne,
  findOneById
}