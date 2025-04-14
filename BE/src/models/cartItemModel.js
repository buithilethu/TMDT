import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import ApiError from '~/utils/ApiError'

const CART_ITEM_COLLECTION_NAME = 'cartItems'
const CART_ITEM_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  variantId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  quantity: Joi.number().min(1).required(),
  addedAt: Joi.date().timestamp().default(Date.now())
}).unknown(true)

const validateBeforeCreate = async (data) => {
  return await CART_ITEM_COLLECTION_SCHEMA.validateAsync(data)
}
//add to cart
const add = async (data) => {
  try {
    const cartItem = {
      userId: data.userId,
      variantId: data.variantId,
      quantity: data.quantity
    }
    const value = await validateBeforeCreate(cartItem)

    const cartItemExist = await findUserCartItem(value.userId, value.variantId)
    let result
    if (cartItemExist) {
      const newQuantity = cartItemExist.quantity + value.quantity
      result = await update(cartItemExist.userId, cartItemExist.variantId, { quantity: newQuantity })
      return
    } else {
      value.userId = new ObjectId(value.userId)
      value.variantId = new ObjectId(value.variantId)
      result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).insertOne(value)
    }

    return result
  } catch (error) {
    throw new Error(error)
  }
}
//id == variant_id, userId == userId

const update = async (userId, variantId, data) => {
  try {
    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }

    const variant = await GET_DB().collection('variants').findOne({ _id: new ObjectId(variantId) })
    if (!variant) {
      throw new Error('Variant not found')
    } else if (variant.stock < data.quantity) {
      throw new Error('Not enough stock')
    } else {
      data.quantity = parseInt(data.quantity)
    }

    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).updateOne({ userId: new ObjectId(userId), variantId: new ObjectId(variantId) }, { $set: data })
    return result
  } catch (error) {
    throw new Error(error)
  }

}

const increase = async (userId, variantId) => {
  try {
    const cartItem = await findUserCartItem(userId, variantId)
    const newQuantity = cartItem.quantity + 1
    const result = await update(userId, variantId, { quantity: newQuantity })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const decrease = async (userId, variantId) => {
  try {
    const cartItem = await findUserCartItem(userId, variantId)
    const newQuantity = cartItem.quantity - 1

    if (newQuantity <= 0) {
      return remove(cartItem._id)
    } else {
      const result = await update(userId, variantId, { quantity: newQuantity })
      return result
    }
  } catch (error) {
    throw new Error(error)
  }
}

const remove = async (cartItemId, userId) => {
  try {
    // const cartItem = await findUserCartItem(userId, variantId)
    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).deleteOne({ _id: new ObjectId(cartItemId), userId: new ObjectId(userId) })

    return result
  } catch (error) {
    throw new ApiError(400, 'Cart item not found')
  }
}

const findUserCartItem = async (userId, variantId) => {
  const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).findOne({ userId: new ObjectId(userId), variantId: new ObjectId(variantId) })

  return result
}

const clearUserCart = async (userId) => {
  try {
    const result = await GET_DB().collection(CART_ITEM_COLLECTION_NAME).deleteMany({ userId: new ObjectId(userId) })

    return result
  } catch (error) {
    throw new Error(error)
  }
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
          preserveNullAndEmptyArrays: true
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
          preserveNullAndEmptyArrays: true
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
          variant: {
            _id: '$variant._id',
            price: '$variant.price',
            attributes: '$variant.attributes',
            size: '$variant.size',
            stock: '$variant.stock'
          },
          product: {
            _id: '$product._id',
            slug: '$product.slug',
            name: '$product.name',
            price: '$product.price'
          },
          images: {
            $map: {
              input: '$images',
              as: 'img',
              in: {
                url: '$$img.url'
              }
            }
          }
        }
      }
    ]).toArray();


    return result
  } catch (error) {
    throw new Error(error)
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
  decrease,
  clearUserCart
}