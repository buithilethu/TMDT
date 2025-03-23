import { cartItemModel } from '~/models/cartItemModel'
import { StatusCodes } from 'http-status-codes'

const add = async (data) =>
{
  try {
    const cart = await cartItemModel.add(data)

    if (!cart) {
      throw new Error(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to add item to cart')
    }

    return cart
  } catch (error) {
    throw new Error(StatusCodes.INTERNAL_SERVER_ERROR, `Error adding to cart: ${error.message}`)
  }
}
const update = async (userId, variantId, quantity) => {
  try {
    const cart = await cartItemModel.update(userId, variantId, quantity)
    if (!cart) {
      throw new Error(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to add item to cart')
    }
    return cart
  } catch (error) {
    throw new Error(StatusCodes.INTERNAL_SERVER_ERROR, `Error updating to cart: ${error.message}`)
  }
}

const increase = async (userId, variantId) => {
  try {
    const cart = await cartItemModel.increase(userId, variantId)
    return cart
  } catch (error) {
    throw new Error(error)
  }
}

const decrease = async (userId, variantId) => {
  try {
    const cart = await cartItemModel.decrease(userId, variantId)
    return cart
  } catch (error) {
    throw new Error(error)
  }
}

const remove = async (variantId, userId) => {
  const cart = await cartItemModel.remove(variantId, userId)
  return cart
}

const getCart = async (userId) => {
  try {
    const cart = await cartItemModel.getCart(userId)
    return cart || []
  } catch (error) {
    throw new Error(StatusCodes.INTERNAL_SERVER_ERROR, `Error fetching cart: ${error.message}`)
  }
}

export const cartService = {
  add,
  update,
  remove,
  getCart,
  increase,
  decrease
}