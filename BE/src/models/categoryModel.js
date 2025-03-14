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
      'string.empty': 'Tên sản phẩm không được để trống',
      'string.min': 'Tên sản phẩm phải có ít nhất 3 ký tự',
      'string.max': 'Tên sản phẩm không được vượt quá 100 ký tự',
      'any.required': 'Tên sản phẩm là bắt buộc'
    })
}).unknown(true)

const validateBeforeCreate = async (data) => {
  return await CATEGORIES_COLLECTION_SCHEMA.validateAsync(data)
}

const create = async (data) => {
  const value = await validateBeforeCreate(data)
  const result = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).insertOne(value)

  return result
}

const update = async (id, data) => {
  const result = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: data })

  return result
}

const remove = async (id) => {
  const result = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })

  return result
}

const findOneById = async (id) => {
  return await GET_DB().collection(CATEGORIES_COLLECTION_NAME).aggregate([
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
  ]).toArray()[0]
}

const findOneBySlug = async (slug) => {
  return await GET_DB().collection(CATEGORIES_COLLECTION_NAME).aggregate([
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
  ]).toArray()[0]
}

const findAll = async () => {
  return await GET_DB().collection(CATEGORIES_COLLECTION_NAME).aggregate([
    {
      $lookup: {
        from: 'images',
        localField: '_id',
        foreignField: 'product_id',
        as: 'image'
      }
    }
  ]).toArray()
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