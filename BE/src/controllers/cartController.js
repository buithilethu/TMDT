//Controller này sẽ xử lý các request liên quan đến board
import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'

const add = async (req, res, next) => {
  try {
    //req.body => {variantId: 'abc', quantity: 1}
    const { variantId, quantity } = req.body
    const userId = req.user.id
    const cart = await cartService.add({ userId, variantId, quantity })

    return res.status(StatusCodes.OK).json(cart)
  } catch (error) {
    next(error)
  }
}
//usuallly update quantity
const update = async (req, res, next) => {
  try {
    //req.body => {variantId: 'abc', quantity: 1}
    const { variantId, quantity } = req.body
    const userId = req.user.id
    const cart = await cartService.update(userId, variantId, { quantity : quantity})

    return res.status(StatusCodes.OK).json(cart)
  } catch (error) {
    next(error)
  }
}

const increase = async (req, res, next) => {
  try {
    //req.params => {id: 'abc'} -? variantId
    const { id } = req.params
    const userId = req.user.id
    const cart = await cartService.increase(userId, id)

    return res.status(StatusCodes.OK).json(cart)
  } catch (error) {
    next(error)
  }
}

const decrease = async (req, res, next) => {
  try {
    //req.params => {id: 'abc'} -? variant
    const { id } = req.params
    const userId = req.user.id
    const cart = await cartService.decrease(userId, id)

    return res.status(StatusCodes.OK).json(cart)
  } catch (error) {
    next(error)
  }
}

const deleteItem = async (req, res, next) => {
  try {
    //req.params => {id: 'abc'} -? variantId
    const variantId = req.params.id
    const userId = req.user.id

    const cart = await cartService.remove(variantId, userId)

    return res.status(StatusCodes.OK).json(cart)
  } catch (error) {
    next(new Error(error))
  }
}

const getCart = async (req, res, next) => {
  //()
  const userId = req.user.id
  const cart = await cartService.getCart(userId)

  return res.status(StatusCodes.OK).json(cart)
}


export const cartController = {
  add,
  update,
  deleteItem,
  getCart,
  increase,
  decrease

}