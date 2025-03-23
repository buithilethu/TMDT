// service: thao tác với model, su li logic
import { slugify } from '~/utils/fommaters'
import { productModel } from '~/models/productModel'
import { createProductWithSKU, updateProductWithSKU } from '~/utils/generateSKU'
import { uploadImage } from '~/utils/ImageUploader'
import { ObjectId } from 'mongodb'
import { imageModel } from '~/models/imageModel'


const createNew = async (reqBody) =>
{

  try {
    const newProduct = {
      ...reqBody,
      slug:slugify(reqBody.name)
    }


    //create product
    const createdProduct = await productModel.createNew(newProduct)

    const getNewProduct = await productModel.findOneById(createdProduct.insertedId)

    return getNewProduct

  } catch (error) {

    throw new Error(error)
  }
}

const update = async (id, reqBody) =>{
  try {
    const product = {
      ...reqBody,
      slug:slugify(reqBody.name)
    }
    const updatedProduct = await productModel.update(id, product)

    return updatedProduct
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) =>
{
  try {
    const product = await productModel.findOneById(id)

    return product
  } catch (error) {
    throw new Error(error)
  }
}

const findOneBySlug = async (slug) =>{
  try {
    const product = await productModel.findOneBySlug(slug)

    return product
  } catch (error) {
    throw new Error(error)
  }
}

const findAll = async (search, page, limit, categorySlug, isDestroy) => {
  try {
    const products = await productModel.findAll(search, categorySlug, isDestroy)

    delete products['variants']

    for (let i = 0; i < products.length; i++) {
      const images = products[i].images[0]
      products[i].images = images
    }
    if (!limit)
    {
      return products
    }
    return products.slice((page - 1) * limit, page * limit)
  } catch (error) {
    throw new Error(error)
  }
}

const deleteProduct = async (id) => {
  try {
    await productModel.deleteProduct(id)
  } catch (error) {
    throw new Error(error)
  }
}

export const productService = {
  createNew,
  findOneById,
  findOneBySlug,
  findAll,
  update,
  deleteProduct
}