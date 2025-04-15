import { orderShippingModel } from '~/models/orderShippingModel'
const updateShippingStatus = async (req, res) => {
  try {
    const { _id, status } = req.body

    // Validate cơ bản
    if (!_id || !status) {
      return res.status(400).json({ message: 'Missing _id or status' })
    }

    const result = await orderShippingModel.updateStatus(_id, status)

    return res.status(200).json({
      message: 'Shipping status updated successfully',
      data: result
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

export const shippingController = {
  updateShippingStatus 
}
