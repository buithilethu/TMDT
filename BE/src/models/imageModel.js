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
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
  return await IMAGE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const value = await validateBeforeCreate(data)
    value.product_id = new ObjectId(value.product_id)
    const result = await GET_DB().collection(IMAGE_COLLECTION_NAME)
      .insertOne(value)

    if (!result.insertedId) {
      throw new Error('Failed to create image')
    }

    return result
  } catch (error) {
    throw new Error(`Error creating image: ${error.message}`)
  }
}

const update = async (id, data) => {
  try {
    const value = await validateBeforeCreate(data)
    value.updatedAt = Date.now()
    const result = await GET_DB().collection(IMAGE_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: value })

    if (!result.matchedCount) {
      throw new Error('Image not found')
    }

    return result
  } catch (error) {
    throw new Error(`Error updating image: ${error.message}`)
  }
}

const removeByUrl = async (url) => {
  try {
    const fileName = url.split('/').pop()
    const filePath = path.join(__dirname, `../../uploads/${fileName}`)

    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
    } catch (error) {
      console.warn(`File not found: ${filePath}`)
    }

    const result = await GET_DB().collection(IMAGE_COLLECTION_NAME).deleteOne({ url })

    if (!result.deletedCount) {
      throw new Error('Image not found in database')
    }

    return result
  } catch (error) {
    throw new Error(`Error removing image by URL: ${error.message}`)
  }
}

const removeById = async (id) => {
  try {
    const image = await GET_DB().collection(IMAGE_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return await removeByUrl(image.url)
  } catch (error) {
    throw new Error(`Error removing image by ID: ${error.message}`)
  }
}

const findOneByProductId = async (productId) => {
  try {
    const image = await GET_DB().collection(IMAGE_COLLECTION_NAME).findOne({ product_id: new ObjectId(productId) })

    if (!image) {
      throw new Error('Image not found')
    }

    return image
  } catch (error) {
    throw new Error(`Error finding image: ${error.message}`)
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