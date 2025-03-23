import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const CATEGORIES_COLLECTION_NAME = 'categories'
const CATEGORIES_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Tên danh mục không được để trống',
      'string.min': 'Tên danh mục phải có ít nhất 3 ký tự',
      'string.max': 'Tên danh mục không được vượt quá 100 ký tự',
      'any.required': 'Tên danh mục là bắt buộc'
    }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
}).unknown(true)

const validateBeforeCreate = async (data) => {
  return await CATEGORIES_COLLECTION_SCHEMA.validateAsync(data)
}

const create = async (data) => {
  try {
    const value = await validateBeforeCreate(data)
    const result = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).insertOne(value)
    return result
  } catch (error) {
    throw new Error(error)
  }

}

const update = async (id, data) => {
  try {
    let category = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })

    if (!category) {
      throw new Error('Category not found')
    }
    data.updatedAt = Date.now()
    const result = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: data })
    return result

  } catch (error) {
    throw new Error(`Error updating category: ${error.message}`)
  }
}

const remove = async (idOrSlug) => {
  try {
    let query = !OBJECT_ID_RULE.test(idOrSlug) ? { slug: idOrSlug } : { _id: new ObjectId(idOrSlug) }
    let result = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).findOneAndDelete(query)

    if (!result.value) {
      throw new Error('Category not found')
    }

    return result._id.toString()
  } catch (error) {
    throw new Error(`Error removing category: ${error.message}`)
  }
}

const findOneById = async (id) => {
  try {
    const category = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).aggregate([
      {
        $match: {
          _id: new ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: '_id',
          foreignField: 'product_id',
          as: 'image'
        }
      }
    ]).toArray()

    return category[0] || {}
  } catch (error) {
    throw new Error(`Error finding category by Id: ${error.message}`)
  }

}

const findOneBySlug = async (slug) => {
  try {
    const category = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).aggregate([
      {
        $match: {
          slug: slug
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: '_id',
          foreignField: 'product_id',
          as: 'image'
        }
      }
    ]).toArray()
    return category[0] || {}
  } catch (error) {
    throw new Error(`Error finding category by slug: ${error.message}`)
  }
}

const findAll = async () => {
  try {
    const products = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).aggregate([
      {
        $lookup: {
          from: 'images',
          localField: '_id',
          foreignField: 'product_id',
          as: 'image'
        }
      }
    ]).toArray()

    return products
  } catch (error) {
    throw new Error(`Error finding categories: ${error.message}`)
  }
}

export const categoryModel = {
  CATEGORIES_COLLECTION_NAME,
  CATEGORIES_COLLECTION_SCHEMA,
  create,
  update,
  remove,
  findOneById,
  findAll,
  findOneBySlug

}