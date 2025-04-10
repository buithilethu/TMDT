import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
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
    .required()
    .messages({
      'string.min': 'Mô tả phải có ít nhất 10 ký tự',
      'any.required': 'Mô tả là bắt buộc'
    }),
  category_id: Joi.string()
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
  slug: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
}).unknown(true)

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const value = await validateBeforeCreate(data)
    value.category_id = new ObjectId(value.category_id)
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(value)
    return result
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`)
  }
}

const update = async (id, data) => {
  try {
    const value = await validateBeforeCreate(data)
    value.updatedAt = Date.now()
    value.category_id = new ObjectId(value.category_id)
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: value })
    return result
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(`Error finding product: ${error.message}`)
  }
}

const findOne = async (query) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'images',
          localField: '_id',
          foreignField: 'product_id',
          as: 'images'
        }
      },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'product_id',
          as: 'variants'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      }
    ]).toArray()

    return result[0] || {}
  } catch (error) {
    throw new Error(error)
  }
}


const findAll = async (search, categorySlug, isDestroy) => {
  try {
    const matchStage = { _destroy: isDestroy }
    if (search) {
      matchStage.name = { $regex: search, $options: 'i' }
    }

    if (categorySlug) {
      const category = await GET_DB().collection('categories').findOne({ slug: categorySlug })
      if (!category) return []
      matchStage.category_id = category._id
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'images',
          localField: '_id',
          foreignField: 'product_id',
          as: 'images'
        }
      }
    ]

    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate(pipeline).toArray()
  } catch (error) {
    throw new Error(`Error finding products: ${error.message}`)
  }
}

// const findAll = async (search, categorySlug, isDestroy) => {
//   try {
//     let result
    
//     if (!categorySlug && !search)
//     {
//       result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate([
//         {
//           $match: { _destroy: isDestroy }
//         },
//         {
//           $lookup: {
//             from: 'images',
//             localField: '_id',
//             foreignField: 'product_id',
//             as: 'images'
//           }
//         }
//       ]).toArray()
//     }

//     if (categorySlug && !search) {
//       const category = await GET_DB().collection('categories').findOne({ slug: categorySlug })
//       if(!category)
//       {
//         return []
//       }
//       result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate([
//         {
//           $match: { category_id: category._id, _destroy: isDestroy }
//         },
//         {
//           $lookup: {
//             from: 'images',
//             localField: '_id',
//             foreignField: 'product_id',
//             as: 'images'
//           }
//         }
//       ]).toArray()
//     }

//     if (!categorySlug && search) {
//       result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate([
//         {
//           $match: { name: { $regex: search, $options: 'i' }, _destroy: isDestroy }
//         },
//         {
//           $lookup: {
//             from: 'images',
//             localField: '_id',
//             foreignField: 'product_id',
//             as: 'images'
//           }
//         }
//       ]).toArray()
//     }

//     if (categorySlug && search) {
//       const category = await GET_DB().collection('categories').findOne({ slug: categorySlug })
//       result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate([
//         {
//           $match: { name: { $regex: search, $options: 'i' }, category_id: category._id, _destroy: isDestroy }
//         },
//         {
//           $lookup: {
//             from: 'images',
//             localField: '_id',
//             foreignField: 'product_id',
//             as: 'images'
//           }
//         }
//       ]).toArray()
//     }

//     return result
//   } catch (error) {
//     throw new Error(error)
//   }
// }

const deleteProduct = async (id) => {
  try {
    GET_DB().collection(PRODUCT_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: { _destroy: true, updatedAt: Date.now() } })
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`)
  }
}


export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  createNew,
  findOne,
  findAll,
  update,
  deleteProduct,
  findOneById
}