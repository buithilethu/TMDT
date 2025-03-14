import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'


const IMAGE_COLLECTION_NAME = 'images'
const IMAGE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string(),
  url: Joi.string().required(),
  product_id: Joi.string().required().messages({
    'string.empty': 'ID sản phẩm không được để trống',
    'any.required': 'ID sản phẩm là bắt buộc'
})
})

const validateBeforeCreate = async (data) => {
  return await IMAGE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const value = await validateBeforeCreate(data)
    value.product_id = new ObjectId(value.product_id)
    const result = await GET_DB().collection(IMAGE_COLLECTION_NAME).insertOne(value)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const value = await validateBeforeCreate(data)
    const result = await GET_DB().collection(IMAGE_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: value })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const removeUrl = async (url) => {
  try {
    const fileName = url.split('/').pop()
    const filePath = path.join(__dirname, `../../uploads/${fileName}`)
    fs.unlink(filePath)
    const result = await GET_DB().collection(IMAGE_COLLECTION_NAME).deleteOne({ url: url })

    // return result
  } catch (error) {
    throw new Error(error)
  }
}

const remove = async (id) => {
  try {
    const result = await GET_DB().collection(IMAGE_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const imageModel = {
  IMAGE_COLLECTION_NAME,
  IMAGE_COLLECTION_SCHEMA,
  createNew,
  update,
  removeUrl,
  remove
}