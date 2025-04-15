import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const VARIANT_COLLECTION_NAME = 'variants'
const VARIANT_COLLECTION_SCHEMA = Joi.object({
  product_id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    .required()
    .trim()
    .required()
    .messages({
      'string.empty': 'ID sản phẩm không được để trống',
      'any.required': 'ID sản phẩm là bắt buộc'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Giá của biến thể phải lớn hơn hoặc bằng 0',
      'any.required': 'Giá của biến thể là bắt buộc'
    }),
  stock: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.integer': 'Số lượng tồn kho của biến thể phải là số nguyên',
      'number.min': 'Số lượng tồn kho của biến thể phải lớn hơn hoặc bằng 0'
    }),
  attributes: Joi.object()
    .required()
    .messages({
      'object.base': 'Thuộc tính phải là một object',
      'any.required': 'Thuộc tính biến thể là bắt buộc'
    }).default([])

}).unknown(true)

const validateBeforeCreate = async (data) => {
  return await VARIANT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (productId, data) => {
  try {
    data.product_id = productId
    const value = await validateBeforeCreate(data)
    value.product_id = new ObjectId(value.product_id)
    const result = await GET_DB().collection(VARIANT_COLLECTION_NAME).insertOne(value)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    delete data['_id']
    const value = await validateBeforeCreate(data)
    value.product_id = new ObjectId(value.product_id)
    const result = await GET_DB().collection(VARIANT_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: value })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateStock = async (id, quantity) => {
  try {
    const result = await GET_DB().collection(VARIANT_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: { stock: quantity } })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const remove = async (id) => {
  try {
    const result = await GET_DB().collection(VARIANT_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const variant = await GET_DB().collection(VARIANT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })

    return variant
  } catch (error) {
    throw new Error(error)
  }
}

export const variantModel = {
  VARIANT_COLLECTION_NAME,
  VARIANT_COLLECTION_SCHEMA,
  create,
  update,
  remove,
  findOneById,
  updateStock
}