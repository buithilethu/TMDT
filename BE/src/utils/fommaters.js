import { productModel } from '~/models/productModel'
export const slugify = (val) => {
  if (!val) return ''
  return String(val)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
}

export const generateUniqueSlug = async (name, existingId = null) => {
  let slug = slugify(name)
  let counter = 1
  let uniqueSlug = slug
  const maxIterations = 99999 // Set a maximum number of iterations to avoid infinite loop
  while (maxIterations > 0 && counter <= maxIterations) {
    const existingProduct = await productModel.findOneBySlug(uniqueSlug)
    if (!existingProduct || (existingProduct && existingProduct._id.toString() === existingId)) {
      break
    }
    uniqueSlug = `${slug}-${counter}`
    counter++
  }

  return uniqueSlug
}