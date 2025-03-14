
const generateSKU = (productName, attributes, index) => {
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key.toUpperCase()}-${value.toUpperCase()}`)
    .join('-')
  return `${productName.toUpperCase().replace(/\s+/g, '-')}-${attrString}-${index}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

const createProductWithSKU = (productData) => {
  const processedVariants = productData.variants.map((variant, index) => {
    if (!variant.sku) {
      variant.sku = generateSKU(productData.name, variant.attributes, index + 1)
    }
    return variant
  })

  const processedProduct = {
    ...productData,
    variants: processedVariants

  }

  return processedProduct
}

const updateProductWithSKU = (productData) => {
  const processedVariants = productData.variants.map((variant, index) => {
    variant.sku = generateSKU(productData.name, variant.attributes, index + 1)
    return variant
  })

  const processedProduct = {
    ...productData,
    variants: processedVariants
  }

  return processedProduct
}

export { createProductWithSKU, updateProductWithSKU }