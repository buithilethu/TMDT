//Controller này sẽ xử lý các request liên quan đến board
import { StatusCodes } from 'http-status-codes'
import { categoryService } from '~/services/categoryService'
import { imageService } from '~/services/imageService'
import { OBJECT_ID_RULE } from '~/utils/validators'

const create = async (req, res, next) => {
  try {
    //(req.body) => {name: 'abc'}
    //req.file => {filename: imageFile}

    console.log(req.files)
    const createCategory = await categoryService.create(req.body)
    if (!req.file) throw new Error('Danh mục không có hình ảnh')
    await imageService.create(createCategory.insertedId.toString(), req.file, req.body.name)


    const result = await categoryService.findOneById(createCategory.insertedId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {

    if (req.files && req.files.length > 0) {
      const host = req.protocol + '://' + req.get('host')
      await imageService.removeMany(req.files.map(file => `${host}/uploads/${file.filename}`))
    }

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
    const host = req.protocol + '://' + req.get('host')
    const categories = await categoryService.findAll(host)

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