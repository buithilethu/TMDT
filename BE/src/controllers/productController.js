//Controller này sẽ xử lý các request liên quan đến board
import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'
import { variantService } from '~/services/variantService'
import { imageService } from '~/services/imageService'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import sharp from 'sharp'

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
      category_id: json.category_id,
      price: json.price
    }

    const variants = json.variants
    //Create new product
    const createProductId = await productService.createNew(product)

    const product_id = createProductId.toString()
    //Create new variants
    await variantService.createMany(product_id, variants)
    //Create new images
    await imageService.createMany(product_id, req.files, json.name)
    const result = await productService.findOne({ _id: new ObjectId(product_id) })

//resize images
// const files = req.files// Danh sách các file đã upload

//     if (!files || files.length === 0) {
//       return res.status(400).send('Không có file nào được upload')
//     }

//     // Duyệt qua từng file và resize
//     const resizePromises = files.map(async (file) => {
//       const outputPath = `uploads/resized-${file.filename}`
//       const filePath = file.path// Đường dẫn file gốc
//       await sharp(filePath)
//         .withMetadata({ density: 72 })
//         .toFile(outputPath) // Ghi đè lên file gốc
//       return filePath
//     })

//     const resizedFiles = await Promise.all(resizePromises)

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {

    // Delete uploaded images if error occurs
    if (req.files && req.files.length > 0) {
      const host = req.protocol + '://' + req.get('host')
      await imageService.removeMany(req.files.map(file => `${host}/uploads/${file.filename}`))
    }
    next(error)
  }

}
const update = async (req, res, next) => {
  try {
    //req.params => {id: 'abc'} -? productId
    //req.body => {name: 'abc', description: 'abc', category: 'abc', price: 123}
    //req.file
    const productId = req.params.id
    const json = JSON.parse(req.body.data)
    const product ={
      name: json.name,
      description: json.description,
      category_id: json.category_id,
      price: json.price
    }

    const variants = json.variants
    const deleteImagesUrl = json.delete.images
    const deleteVariants = json.delete.variants

    await productService.update(productId, product)
    await variantService.updateMany(productId, variants)// có id thì update, không có id thì tạo mới
    await variantService.deleteMany(deleteVariants)// xóa theo danh sach id
    await imageService.createMany(productId, req.files, json.name)
    await imageService.removeMany(deleteImagesUrl)// xóa theo danh sach id

    const result = await productService.findOne({ _id: new ObjectId(productId) })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    // Delete uploaded images if error occurs
    if (req.files && req.files.length > 0) {
      const host = req.protocol + '://' + req.get('host')
      await imageService.removeMany(req.files.map(file => `${host}/uploads/${file.filename}`))
    }
    next(error)

  }
}

const getProduct = async (req, res, next) => {
  try {
    //req.params => {id: 'abc'} -? productId
    const host = req.protocol + '://' + req.get('host')
    const idOrSlug = req.params.id
    let product = {}
    let query = {}
    if (OBJECT_ID_RULE.test(idOrSlug)) {
      query = { _id: new ObjectId(idOrSlug) }
    } else
    {
      query = { slug: idOrSlug }
    }

    product = await productService.findOne(query, host)

    res.status(StatusCodes.OK).json(product)
  } catch (error) {

    next(error)

  }
}

const getAllProducts = async (req, res, next) => {
  try {
    //req.query => {search: 'abc', page: 1, limit: 10, category: 'abc-cde'}
    const currentUrl = req.protocol + '://' + req.get('host')
    const search = req.query.search
    const page = req.query.page || 1
    const limit = req.query.limit
    const categorySlug = req.query.category
    const isDestroy = req.query.isdestroy === 'true' ? true : false
    const products = await productService.findAll(search, page, limit, categorySlug, isDestroy, currentUrl)

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