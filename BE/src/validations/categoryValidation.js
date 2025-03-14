import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { categoryModel } from '~/models/categoryModel'

const create = async (req, res, next) => {

  try {
    await categoryModel.CATEGORIES_COLLECTION_SCHEMA.validateAsync(req.body, { abortEarly: false })
    //validate xong thì cho req chạy tiếp qua controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const update = async (req, res, next) => {

  try {
    await categoryModel.CATEGORIES_COLLECTION_SCHEMA.validateAsync(req.body, { abortEarly: false })

    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}


export const categoryValidation = {
  create,
  update
}