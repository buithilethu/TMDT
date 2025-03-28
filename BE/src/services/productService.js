// service: thao tác với model, su li logic
import { generateUniqueSlug, slugify } from '~/utils/fommaters'
import { productModel } from '~/models/productModel'
import { createProductWithSKU, updateProductWithSKU } from '~/utils/generateSKU'
import { uploadImage } from '~/utils/ImageUploader'
import { ObjectId } from 'mongodb'
import { imageModel } from '~/models/imageModel'
import path from 'path'


const createNew = async (reqBody) =>
{

  try {
    const slug = await generateUniqueSlug(reqBody.name, 'products')
    const newProduct = {
      ...reqBody,
      slug: slug
    }
    //create product
    const createdProduct = await productModel.createNew(newProduct)
    return createdProduct.insertedId
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, reqBody) => {
  try {
    const product = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }

    const updatedProduct = await productModel.update(id, product)

    return updatedProduct
  } catch (error) {
    throw new Error(error)
  }
}


const findOne = async (query, url) => {
  try {
    const product = await productModel.findOne(query)

    for (let i = 0; i < product.images.length; i++)
    {
      let image = product.images[i]
      image.url = `${url}/${product.images[i].url}`
      product.images[i] = image
    }


    return product
  } catch (error) {
    throw new Error(error)
  }
}

const findAll = async (search, page, limit, categorySlug, isDestroy, url) => {
  try {
    const products = await productModel.findAll(search, categorySlug, isDestroy)

    //remove variants
    delete products['variants']

    for (let i = 0; i < products.length; i++) {
      //host/uploads/abc.jpg
      if (products[i].images.length > 0)
      {
        let image = products[i].images[0]
        image.url = url + '/' + products[i].images[0].url
        products[i].images = image
      }
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
  findOne,
  findAll,
  update,
  deleteProduct
}