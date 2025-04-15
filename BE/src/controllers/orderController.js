
import { orderModel } from '~/models/orderModel'

const getOrders = async (req, res) => {
  try {
    const userId = req.user.id
    const orders = await orderModel.getOrdersByUserId(userId)

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders
    })
  } catch (error) {
    throw new Error(error)
  }
}

const getAllUserOrders = async (req, res) => {
  try {
    const orders = await orderModel.getAllUserOrders()

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders
    })
  } catch (error) {
    throw new Error(error)
  }
}
{

}

export const orderController = {
  getOrders
}