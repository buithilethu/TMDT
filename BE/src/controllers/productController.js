//Controller này sẽ xử lý các request liên quan đến board
import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'
import { variantService } from '~/services/variantService'
import { imageService } from '~/services/imageService'
import { OBJECT_ID_RULE } from '~/utils/validators'
const createNew = async (req, res, next) => {
  try {
    //create new product
    //use product's id to create new image
    //use product's id to create new category (vì product chưa id của category) nên không cần
    //use product's id to create variants
    const json = JSON.parse(req.body.data)
    //req
    const product ={
      name: json.name,
      description: json.description,
      category_id: json.category,
      price: json.price
    }

    const variants = json.variants
    //Create new product
    const createProduct = await productService.createNew(product)

    const product_id = createProduct._id.toString()
    //Create new variants
    await variantService.createMany(product_id, variants)
    //Create new images
    await imageService.createMany(product_id, req.files, json.name)


    const result = await productService.findOneById(product_id)

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }

}
const update = async (req, res, next) =>{
  try {

    const productId = req.params.id
    const json = JSON.parse(req.body.data)

    const product ={
      name: json.name,
      description: json.description,
      category_id: json.category,
      price: json.price
    }

    const variants = json.variants

    const deleteImagesUrl = json.delete.images

    const deleteVariants = json.delete.variants

    await productService.update(productId, product)
    await variantService.updateMany(productId, variants)// có id thì update, không có id thì tạo mới
    await variantService.deleteMany(deleteVariants)// xóa theo danh sach id
    await imageService.createMany(productId, req.files, json.name)
    await imageService.deleteMany(deleteImagesUrl)// xóa theo danh sach id

    const result = await productService.findOneById(productId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {

    next(error)

  }
}

const getProduct = async (req, res, next) => {
  try {
    //req.params => {id: 'abc'} -? productId
    const idOrSlug = req.params.id
    let product = {}
    if (OBJECT_ID_RULE.test(idOrSlug)) {
      product = await productService.findOneById(idOrSlug)
    } else {
      product = await productService.findOneBySlug(idOrSlug)
    }

    res.status(StatusCodes.OK).json(product)
  } catch (error) {

    next(error)

  }
}

const getAllProducts = async (req, res, next) => {
  try {
    //req.query => {search: 'abc', page: 1, limit: 10, category: 'abc-cde'}
    const search = req.query.search
    const page = req.query.page || 1
    const limit = req.query.limit
    const categorySlug = req.query.category
    const isDestroy = req.query.isdestroy === 'true' ? true : false
    const products = await productService.findAll(search, page, limit, categorySlug, isDestroy)

    res.status(StatusCodes.OK).json(products)
  } catch (error) {

    next(error)

  }
}

const deleteProduct = async (req, res, next) => {
  //req.params => {id: 'abc'} -? productId
  const productId = req.params.id
  try {
    await productService.deleteProduct(productId)
    res.status(StatusCodes.NO_CONTENT).send()
  } catch (error) {
    next(error)
  }
}

export const productController = {
  createNew,
  getProduct,
  getAllProducts,
  update,
  deleteProduct
}