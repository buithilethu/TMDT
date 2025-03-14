import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
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
    }),
  description: Joi.string()
    .trim()
    .min(10)
    .required()
    .messages({
      'string.min': 'Mô tả phải có ít nhất 10 ký tự',
      'any.required': 'Mô tả là bắt buộc'
    }),
  category_id: Joi.string()
    .required()
    .messages({
      'any.required': 'Danh mục là bắt buộc'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Giá tham khảo phải lớn hơn hoặc bằng 0',
      'any.required': 'Giá tham khảo của sản phẩm là bắt buộc'
    }),
  slug: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
}).unknown(true)

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const value = await validateBeforeCreate(data)
    value.category_id = new ObjectId(value.category_id)
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(value)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const value = await validateBeforeCreate(data)
    value.updatedAt = Date.now()
    value.category_id = new ObjectId(value.category_id)
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: value })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'images',
          localField: '_id',
          foreignField: 'product_id',
          as: 'images'
        }
      },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'product_id',
          as: 'variants'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      }
    ]).toArray()
    return result[0] || {}
  } catch (error) {
    throw new Error(error)
  }
}

const findAll = async (search, categorySlug, isDestroy) => {
  try {
    let result
    if (search) {
      if (categorySlug) {
        const category = await GET_DB().collection('categories').findOne({ slug: categorySlug })

        result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find({
          $and: [
            { name: { $regex: search, $options: 'i' } },
            { category_id: category._id },
            { _destroy: isDestroy }
          ]
        }).toArray()
      }
      else {
        result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find({ name: { $regex: search, $options: 'i' }, _destroy:isDestroy }).toArray()
      }
    }
    else if (categorySlug) {
      const category = await GET_DB().collection('categories').findOne({ slug: categorySlug })
      result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find({ category_id: category._id, _destroy: isDestroy }).toArray()
    }
    else {
      result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find({ _destroy:isDestroy }).toArray()
    }

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteProduct = async (id) => {
  try {
    GET_DB().collection(PRODUCT_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: { _destroy: true } })
  } catch (error) {
    throw new Error(error)
  }
}

export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findAll,
  update,
  deleteProduct
}