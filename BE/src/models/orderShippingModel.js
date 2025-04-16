const Joi = require('joi')
const { ObjectId } = require('mongodb')
const { GET_DB } = require('~/config/mongodb')

const ORDER_SHIPPING_NAME = 'order_shipping'

const ORDER_SHIPPING_SCHEMA = Joi.object({
  orderCode: Joi.number().required(),
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string()
    .pattern(/^0\d{9}$/) // Mẫu số điện thoại Việt Nam bắt đầu bằng 0, có 10 chữ số
    .required(),
  address: Joi.string().min(2).required(),
  status: Joi.string().valid('pending', 'success', 'delivering').default('pending'),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(null)
}).required()

const validateSchema = async (data) => {
  return await ORDER_SHIPPING_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (data) => {
  try {
    const value = await validateSchema(data)
    const result = await GET_DB()
      .collection(ORDER_SHIPPING_NAME)
      .insertOne(value)

    return result
  } catch (error) {
    throw new Error(error.message || 'Validation or insertion error')
  }
}

const findOneByOrderCode = async (orderCode) => {
  try {
    const result = await GET_DB()
      .collection(ORDER_SHIPPING_NAME)
      .findOne({ orderCode: Number(orderCode) })

    return result
  } catch (error) {
    throw new Error(error.message || 'Find error')
  }
}

const updateStatus = async (_id, status) => {
  try {
    const result = await GET_DB()
      .collection(ORDER_SHIPPING_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: { status: status } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error.message || 'Update error')
  }
}

const updateStatusByOrderCode = async (orderCode, status) => {
  try {
    const result = await GET_DB()
      .collection(ORDER_SHIPPING_NAME)
      .findOneAndUpdate(
        { orderCode: Number(orderCode) },
        { $set: { status: status } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error.message || 'Update error')
  }
}

export const orderShippingModel = {
  create,
  findOneByOrderCode,
  updateStatus,
  updateStatusByOrderCode,
  validateSchema
}