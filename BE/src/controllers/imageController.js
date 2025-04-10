import { imageService } from '~/services/imageService'
// productId, files, name

const create = async (req, res) => {
  const result = await imageService.createMany(req.body.product_id, req.files, req.body.name)
  // console.log(req.body)
  res.json(result)
}
const remove = async (req, res) => {
  const result = await imageService.remove(req.params.id)
  res.json(result)
}

export const imageController = {
  create,
  remove
}
