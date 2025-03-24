//Controller này sẽ xử lý các request liên quan đến board
import { StatusCodes } from 'http-status-codes'
import { categoryService } from '~/services/categoryService'
import { imageService } from '~/services/imageService'
import {OBJECT_ID_RULE} from '~/utils/validators'

const create = async (req, res, next) => {
  try {
    //(req.body) => {name: 'abc'}
    //req.file => {filename: imageFile}
    const host = req.protocol + '://' + req.get('host')
    const createCategory = await categoryService.create(req.body)
    await imageService.create(createCategory.insertedId.toString(), req.file, host)

    const result = await categoryService.findOneById(createCategory.insertedId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }

}
const update = async (req, res, next) => {
  try {
    //(id, req.body => {name: 'abc'} )
    const productId = req.params.id
    const updateCategory = await categoryService.update(productId, req.body)

    res.status(StatusCodes.CREATED).json(updateCategory)
  } catch (error) {

    next(error)

  }
}

const remove = async (req, res, next) => {
  try {
    //(id || slug)
    const idOrSlug = req.params.id
    await categoryService.remove(idOrSlug)

    res.status(StatusCodes.NO_CONTENT)
  } catch (error) {
    next(error)
  }
}

const findOneById = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    let validate = OBJECT_ID_RULE.test(categoryId)
    let category
    if (!validate) {
      category = await categoryService.findOneBySlug(categoryId)
    }
    else {
      category = await categoryService.findOneById(categoryId)
    }

    res.status(StatusCodes.OK).json(category)
  } catch (error) {

    next(error)

  }
}

const getAllCategory = async (req, res, next) => {
  try {
    //()
    const categories = await categoryService.findAll()

    res.status(StatusCodes.OK).json(categories)
  } catch (error) {

    next(error)

  }
}

export const categoryController = {
  create,
  update,
  remove,
  findOneById,
  getAllCategory

}