import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { productModel } from '~/models/productModel'
import { VARIANT_COLLECTION_SCHEMA } from '~/models/variantModel'
import Joi from 'joi'
import { json } from 'express'

const createNew = async (req, res, next) => {

  try {
    const correctBody = Joi.object({
      name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
          'string.empty': 'Tên sản phẩm không được để trống',
          'string.min': 'Tên sản phẩm phải có ít nhất 3 ký tự',
          'string.max': 'Tên sản phẩm không được vượt quá 100 ký tự',
          'any.required': 'Tên sản phẩm là bắt buộc'
        }),
      description: Joi.string()
        .trim()
        .min(10)
        .required()
        .messages({
          'string.min': 'Mô tả phải có ít nhất 10 ký tự',
          'any.required': 'Mô tả là bắt buộc'
        }),
      category: Joi.string()
        .trim()
        .required()
        .messages({
          'any.required': 'Danh mục là bắt buộc'
        }),
      price: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.min': 'Giá tham khảo phải lớn hơn hoặc bằng 0',
          'any.required': 'Giá tham khảo của sản phẩm là bắt buộc'
        }),
      createdAt: Joi.date().timestamp('javascript').default(Date.now),
      updatedAt: Joi.date().timestamp('javascript').default(null),
      _destroy: Joi.boolean().default(false)
    })
    const json = JSON.parse(req.body.data)

    const product ={
      name: json.name,
      description: json.description,
      category: json.category,
      price: json.price
    }

    await correctBody.validateAsync(product, { abortEarly: false })
    //validate xong thì cho req chạy tiếp qua controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const update = async (req, res, next) => {

  try {
    const correctBody = Joi.object({
      name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
          'string.empty': 'Tên sản phẩm không được để trống',
          'string.min': 'Tên sản phẩm phải có ít nhất 3 ký tự',
          'string.max': 'Tên sản phẩm không được vượt quá 100 ký tự',
          'any.required': 'Tên sản phẩm là bắt buộc'
        }),
      description: Joi.string()
        .trim()
        .min(10)
        .required()
        .messages({
          'string.min': 'Mô tả phải có ít nhất 10 ký tự',
          'any.required': 'Mô tả là bắt buộc'
        }),
      category: Joi.string()
        .trim()
        .required()
        .messages({
          'any.required': 'Danh mục là bắt buộc'
        }),
      price: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.min': 'Giá tham khảo phải lớn hơn hoặc bằng 0',
          'any.required': 'Giá tham khảo của sản phẩm là bắt buộc'
        }),
      createdAt: Joi.date().timestamp('javascript').default(Date.now),
      updatedAt: Joi.date().timestamp('javascript').default(null),
      _destroy: Joi.boolean().default(false)
    })
    const json = JSON.parse(req.body.data)

    const product ={
      name: json.name,
      description: json.description,
      category: json.category,
      price: json.price
    }

    await correctBody.validateAsync(product, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}


export const productValidation = {
  createNew,
  update
}