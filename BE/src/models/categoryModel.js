import e from 'express'
import Joi, { object } from 'joi'
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

    const result = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: data })
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const remove = async (idOrSlug) => {
  let category

  if (!OBJECT_ID_RULE.test(idOrSlug)) {
    category = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).findOne({ slug: idOrSlug })
  } else {
    category = await GET_DB().collection(CATEGORIES_COLLECTION_NAME).findOne({ _id: new ObjectId(idOrSlug) })
  }

  if (!category) {
    throw new Error('Category not found')
  }

  await GET_DB().collection(CATEGORIES_COLLECTION_NAME).deleteOne({ _id: category._id })

  return category._id.toString()
}

const findOneById = async (id) => {

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
}

const findOneBySlug = async (slug) => {
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
}

const findAll = async () => {
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