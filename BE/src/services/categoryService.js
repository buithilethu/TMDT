// service: thao tác với model, su li logic
import { categoryModel } from '~/models/categoryModel'
import { imageService } from './imageService'
import { slugify } from '~/utils/fommaters'


const create = async (reqBody) =>
{
  try {
    reqBody.slug = slugify(reqBody.name)
    const newCategory = categoryModel.create(reqBody)

    return newCategory

  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, reqBody) => {
  try {
    const updatedCategory = categoryModel.update(id, reqBody)

    return updatedCategory
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) =>
{
  try {
    const category = await categoryModel.findOneById(id)

    return category
  } catch (error) {
    throw new Error(error)
  }
}

const findOneBySlug = async (slug) => {
  try {
    const category = await categoryModel.findOneBySlug(slug)

    return category
  } catch (error) {
    throw new Error(error)
  }
}

const findAll = async () => {
  try {
    const categories = await categoryModel.findAll()
    return categories
  } catch (error) {
    throw new Error(error)
  }
}


const remove = async (idOrSlug) => {
  try {
    const categoryId = await categoryModel.remove(idOrSlug)
    await imageService.remove(categoryId)
  } catch (error) {
    throw new Error(error)
  }
}


export const categoryService = {
  create,
  findOneById,
  findAll,
  update,
  findOneBySlug,
  remove
}