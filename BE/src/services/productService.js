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
    const  { products, count } = await productModel.findAll(search, categorySlug, isDestroy);

    // Tổng số sản phẩm (trước khi phân trang)
    const size = products.length;

    // Xử lý từng sản phẩm
    for (let i = 0; i < products.length; i++) {
      // Xoá variants nếu có
      delete products[i].variants;

      // Xử lý ảnh
      if (Array.isArray(products[i].images) && products[i].images.length > 0) {
        products[i].images[0].url = url + '/' + products[i].images[0].url;
        products[i].images = [products[i].images[0]]; // giữ lại 1 ảnh đầu
      }
    }

    // Nếu không giới hạn, trả hết
    if (!limit) {
      return { products, size: count };
    }

    // Phân trang và trả về kèm size
    const paginatedProducts = products.slice((page - 1) * limit, page * limit);
    return { products: paginatedProducts, size };
  } catch (error) {
    throw new Error(error);
  }
};


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