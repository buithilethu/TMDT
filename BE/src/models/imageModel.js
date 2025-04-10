import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import fs from 'fs/promises'
import path from 'path'
import { remove } from 'lodash'


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

const removeByUrl = async (url) => {
  try {
    const fileName = url.split('/').pop()
    const rootDir = path.resolve(__dirname, '../../') // thư mục BE
    const filePath = path.join(rootDir, 'uploads', fileName)
    const resizedFile = fileName.replace(/^images-/, 'resized-')


    // Check if file exists before attempting to delete
    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
      console.log('🗑️ Xoá file:', filePath)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('⚠️ Không thể xoá file:', filePath, err.message)
      }
    }
    let imagePath = `uploads/${fileName}`
    console.log(imagePath)
    // Delete from DB if exists, ignore if not
    await GET_DB().collection(IMAGE_COLLECTION_NAME).deleteOne({ url: imagePath })
  } catch (error) {
    throw new Error(error)
  }
}

const removeById = async (id) => {
  try {
    const image = await GET_DB().collection(IMAGE_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    if (image) {
      await removeByUrl(image.url)
    }
    // Silently ignore if image not found in DB
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByProductId = async (productId) => {
  try {
    const image = await GET_DB().collection(IMAGE_COLLECTION_NAME).findOne({ product_id: new ObjectId(productId) })
    return image
  } catch (error) {
    throw new Error(error)
  }
}

export const imageModel = {
  IMAGE_COLLECTION_NAME,
  IMAGE_COLLECTION_SCHEMA,
  createNew,
  update,
  removeByUrl,
  removeById,
  findOneByProductId
}