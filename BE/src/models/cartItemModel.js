import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import ApiError from '~/utils/ApiError'

const CART_ITEM_COLLECTION_NAME = 'cartItems'
const CART_ITEM_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),
  variantId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),
  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 1'
    }),
  addedAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(null)
}).unknown(true)

const validateBeforeCreate = async (data) => {
  return await CART_ITEM_COLLECTION_SCHEMA.validateAsync(data)
}
//add to cart
const add = async (data) => {
  try {

    const value = await validateBeforeCreate(data)
    value.userId = new ObjectId(value.userId)
    value.variantId = new ObjectId(value.variantId)

    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).findOneAndUpdate(
      {
        userId: value.userId,
        variantId: value.variantId
      },
      {
        $inc: { quantity: value.quantity },
        $setOnInsert: { addedAt: Date.now() },
        $set: { updatedAt: Date.now() }
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    )

    if (!result) {
      throw new Error('Failed to add item to cart')
    }

    return result
  } catch (error) {
    throw new Error(`Error adding to cart: ${error.message}`)
  }
}
//id == variant_id, userId == userId

const update = async (data) => {
  try {
    const { userId, variantId, quantity } = data
    const parsedQuantity = parseInt(quantity)

    if (parsedQuantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }
    data.quantity = parseInt(data.quantity)
    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }
    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).findOneAndUpdate(
      {
        userId: new ObjectId(userId),
        variantId: new ObjectId(variantId)
      },
      {
        $set: {
          quantity: parsedQuantity,
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      throw new Error('Cart item not found')
    }

    return result
  } catch (error) {
    throw new Error(`Error updating cart: ${error.message}`)
  }

}

const increase = async (userId, variantId) => {
  try {
    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).findOneAndUpdate(
      { userId: new ObjectId(userId), variantId: new ObjectId(variantId) },
      { $inc: { quantity: 1 } },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new Error('Cart item not found')
    }
    return result
  } catch (error) {
    throw new Error(`Error increasing cart item quantity: ${error.message}`)
  }
}

const decrease = async (userId, variantId) => {
  try {
    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).findOneAndUpdate(
      { userId: new ObjectId(userId), variantId: new ObjectId(variantId) },
      { $inc: { quantity: -1 } },
      { returnDocument: 'after' }
    )

    if (!result)
    {
      throw new Error('Cart item not found')
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const remove = async (variantId, userId) => {
  try {
    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).findOneAndDelete({ userId: new ObjectId(userId), variantId: new ObjectId(variantId) })

    if (!result) {
      throw new Error('Cart item not found')
    }

    return result
  } catch (error) {
    throw new Error(`Error removing cart item: ${error.message}`)
  }
}

const findUserCartItem = async (userId, variantId) => {
  const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).findOne({ userId: new ObjectId(userId), variantId: new ObjectId(variantId) })

  if (!result) {
    throw new Error( 'Cart item not found')
  }

  return result
}

const getCart = async (userId) => {
  try {
    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).aggregate([
      {
        $match: {
          userId: new ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'variants',
          localField: 'variantId',
          foreignField: '_id',
          as: 'variant'
        }
      },
      {
        $unwind: {
          path: '$variant',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'variant.product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'product._id',
          foreignField: 'product_id',
          as: 'images'
        }
      },
      {
        $project: {
          _id: 1,
          quantity: 1,
          addedAt: 1,
          productName: '$product.name',
          variantPrice: '$variant.price',
          stock: '$variant.stock',
          attributes: {
            $map: {
              input: { $objectToArray: '$variant.attributes' },
              as: 'attr',
              in: {
                name: { $trim: { input: '$$attr.k' } },
                value: { $trim: { input: '$$attr.v' } }
              }
            }
          },
          imageUrl: { $arrayElemAt: ['$images.url', 0] }
        }
      }
    ]).toArray()

    return result || []
  } catch (error) {
    throw new ApiError(500, `Error fetching cart: ${error.message}`)
  }
}

export const cartItemModel = {
  CART_ITEM_COLLECTION_NAME,
  CART_ITEM_COLLECTION_SCHEMA,
  add,
  update,
  findUserCartItem,
  remove,
  getCart,
  increase,
  decrease
}