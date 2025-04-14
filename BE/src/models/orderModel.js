import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const ORDER_COLLECTION_NAME = 'orders'

const ORDER_ITEM_SCHEMA = Joi.object({
  variantId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  productId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().required()
})

const ORDER_COLLECTION_SCHEMA = Joi.object({
  orderCode: Joi.number().required(),
  userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  items: Joi.array().items(ORDER_ITEM_SCHEMA).min(1).required(),
  status: Joi.string().valid('pending', 'paid', 'cancelled').default('pending'),
  createdAt: Joi.date().timestamp().default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data)
}

const createOrder = async (data) => {
  const value = await validateBeforeCreate(data)

  value.userId = new ObjectId(value.userId)
  value.items = value.items.map(item => ({
    ...item,
    variantId: new ObjectId(item.variantId),
    productId: new ObjectId(item.productId)
  }))

  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).insertOne(value)
  return result
}

const findOrderByUserId = async (userId) => {
  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({
    userId: new ObjectId(userId)
  })
}

const findOrderByOrderCode = async (orderCode) => {
  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({
    orderCode: orderCode
  })
  return result
}

const updateOrderInfo = async (orderCode, data) => {
  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
    { orderCode: orderCode },
    { $set: data },
    { returnDocument: 'after' }

  )
}

export const orderModel = {
  ORDER_COLLECTION_NAME,
  ORDER_COLLECTION_SCHEMA,
  createOrder,
  findOrderByUserId,
  findOrderByOrderCode,
  updateOrderInfo
}
