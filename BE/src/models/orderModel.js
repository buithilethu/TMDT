import Joi from 'joi'
import { update } from 'lodash'
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
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(null),
  paymentMethod: Joi.string().valid('Cash', 'Banking').required()
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
const getOrdersByUserId = async (userId) => {
  const ordersWithShippingAndProductDetails = await GET_DB().collection('orders').aggregate([
    {
      $match: {
        userId: new ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: 'order_shipping',
        localField: 'orderCode',
        foreignField: 'orderCode',
        as: 'shipping'
      }
    },
    {
      $unwind: {
        path: '$shipping',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$items',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'products',
        let: { productId: '$items.productId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$productId'] }
            }
          },
          {
            $project: {
              name: 1,
              price: 1,
              images: 1,
              description: 1
            }
          }
        ],
        as: 'product'
      }
    },
    {
      $unwind: {
        path: '$product',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'variants',
        let: { variantId: '$items.variantId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$variantId'] }
            }
          }
        ],
        as: 'variant'
      }
    },
    {
      $unwind: {
        path: '$variant',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$_id',
        userId: { $first: '$userId' },
        orderCode: { $first: '$orderCode' },
        status: { $first: '$status' },
        createdAt: { $first: '$createdAt' },
        shipping: { $first: '$shipping' },
        items: {
          $push: {
            product: '$product',
            variant: '$variant',
            quantity: '$items.quantity',
            price: '$items.price',
            totalPrice: { $multiply: ['$items.quantity', '$items.price'] }
          }
        }
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]).toArray()

  return ordersWithShippingAndProductDetails
}



const findOrderByOrderCode = async (orderCode) => {
  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({
    orderCode: orderCode
  })
  return result
}

const updateOrderInfo = async (_id, status) => {
  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(_id) },
    { $set: { status: status } },
    { returnDocument: 'after' }
  )
  return result
}

const updateOrderInfoByOrderCode = async (orderCode, status) => {
  const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
    { orderCode: orderCode },
    { $set: status },
    { returnDocument: 'after' }
  )
  return result
}

const getAllUserOrders = async ({ page = 1, limit = 10, status, shippingStatus, search, sortBy = 'createdAt', order = 'desc' }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortOrder = order === 'asc' ? 1 : -1

  const baseMatch = {}
  if (status) baseMatch.status = status

  const pipeline = [
    // Join shipping
    {
      $lookup: {
        from: 'order_shipping',
        localField: 'orderCode',
        foreignField: 'orderCode',
        as: 'shipping'
      }
    },
    { $unwind: { path: '$shipping', preserveNullAndEmptyArrays: true } },

    // Điều kiện lọc sau khi đã join shipping
    {
      $match: {
        ...baseMatch,
        ...(shippingStatus ? { 'shipping.status': shippingStatus } : {}),
        ...(search ? {
          $or: [
            { orderCode: { $regex: search, $options: 'i' } },
            { 'shipping.fullName': { $regex: search, $options: 'i' } },
            { 'shipping.phoneNumber': { $regex: search, $options: 'i' } }
          ]
        } : {})
      }
    },

    { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'products',
        let: { productId: '$items.productId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
          { $project: { name: 1, price: 1, images: 1, description: 1 } }
        ],
        as: 'product'
      }
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'variants',
        let: { variantId: '$items.variantId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$variantId'] } } }
        ],
        as: 'variant'
      }
    },
    { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },

    {
      $group: {
        _id: '$_id',
        userId: { $first: '$userId' },
        orderCode: { $first: '$orderCode' },
        status: { $first: '$status' },
        paymentMethod: { $first: '$paymentMethod' },
        createdAt: { $first: '$createdAt' },
        shipping: { $first: '$shipping' },
        image: { $first: '$product.images' },
        items: {
          $push: {
            product: '$product',
            variant: '$variant',
            quantity: '$items.quantity',
            price: '$items.price',
            totalPrice: { $multiply: ['$items.quantity', '$items.price'] }
          }
        }
      }
    },

    { $sort: { [sortBy]: sortOrder } },
    { $skip: skip },
    { $limit: parseInt(limit) }
  ]

  const orders = await GET_DB().collection(ORDER_COLLECTION_NAME).aggregate(pipeline).toArray()

  // Count
  const countPipeline = [
    {
      $lookup: {
        from: 'order_shipping',
        localField: 'orderCode',
        foreignField: 'orderCode',
        as: 'shipping'
      }
    },
    { $unwind: { path: '$shipping', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        ...baseMatch,
        ...(shippingStatus ? { 'shipping.status': shippingStatus } : {}),
        ...(search ? {
          $or: [
            { orderCode: { $regex: search, $options: 'i' } },
            { 'shipping.fullName': { $regex: search, $options: 'i' } },
            { 'shipping.phoneNumber': { $regex: search, $options: 'i' } }
          ]
        } : {})
      }
    },
    { $count: 'total' }
  ]

  const countResult = await GET_DB().collection(ORDER_COLLECTION_NAME).aggregate(countPipeline).toArray()
  const total = countResult[0]?.total || 0

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }
  }
}


export const orderModel = {
  ORDER_COLLECTION_NAME,
  ORDER_COLLECTION_SCHEMA,
  createOrder,
  getOrdersByUserId,
  findOrderByOrderCode,
  updateOrderInfo,
  getAllUserOrders,
  updateOrderInfoByOrderCode
}
