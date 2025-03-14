import { cartItemModel } from '~/models/cartItemModel'
import { imageModel } from '~/models/imageModel'
import { slugify } from '~/utils/fommaters'


const add = async (data) =>
{
  try {
    const cart = await cartItemModel.add(data)
    return cart
  } catch (error) {
    throw new Error(error)
  }
}
const update = async (userId, variantId, quantity) => {
  try {
    const cart = await cartItemModel.update(userId, variantId, quantity)
    return cart
  } catch (error) {
    throw new Error(error)
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
  const cart = await cartItemModel.getCart(userId)
  return cart
}

export const cartService = {
  add,
  update,
  remove,
  getCart,
  increase,
  decrease
}