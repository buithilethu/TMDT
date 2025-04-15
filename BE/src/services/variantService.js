// service: thao tác với model, su li logic
import { variantModel } from '~/models/variantModel'
//(id, variant) => create new variant
const create = async (productId, variant) =>
{
  try {
    const newVariant = variantModel.create(productId, variant)

    return newVariant

  } catch (error) {
    throw new Error(error)
  }
}

//(id, variants) => create new variants
const createMany = async (productId, variants) =>
{
  try {

    const results = []

    for (let variant of variants) {
      const newVariant = await variantModel.create(productId, variant)
      const variantObject = await variantModel.findOneById(newVariant.insertedId)

      results.push(variantObject)
    }

    return results

  } catch (error) {
    throw new Error(error)
  }
}

//(id, variant) => update variant
const update = async (id, variant) => {
  try {
    const updatedVariant = variantModel.update(id, variant)

    return updatedVariant
  } catch (error) {
    throw new Error(error)
  }
}

const updateMany = async (productId, variants) => {
  try {
    for (let variant of variants) {
      variant.product_id = productId
      if (variant._id) {
        await variantModel.update(variant._id, variant)
      } else {
        await variantModel.create(productId, variant)
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

//(id) => find variant by id
const findOneById = async (id) =>
{
  try {
    const variant = await variantModel.findOneById(id)

    return variant
  } catch (error) {
    throw new Error(error)
  }
}
//() => find all variant
const findAll = async () => {
  try {
    const variants = await variantModel.findAll()
    return variants
  } catch (error) {
    throw new Error(error)
  }
}

const deleteMany = async (ids) => {
  try {
    for (let id of ids) {
      await variantModel.remove(id)
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateStock = async (variantId, quantity) => {
  try {
    const result = await variantModel.updateStock(variantId, quantity)
    return result
  } 
  catch (error) {
    throw new Error(error) 
  }
}

export const variantService = {
  create,
  update,
  createMany,
  updateMany,
  deleteMany,
  findOneById,
  findAll,
  updateStock
}