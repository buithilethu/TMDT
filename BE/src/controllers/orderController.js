
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
    const query = req.query

    const data = await orderModel.getAllUserOrders({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
      sortBy: query.sortBy,
      order: query.order,
      shippingStatus: query.shippingStatus
    })

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: data.orders,
      pagination: data.pagination
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Lỗi server' })
  }
}

const updateOrderInfo = async (req, res) => {
  try {
    const _id = req.body._id
    const status = req.body.status
    const updatedOrder = await orderModel.updateOrderInfo(_id, status)
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin đơn hàng thành công',
      data: updatedOrder 
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Lỗi server' }) 
  }
}

export const orderController = {
  getOrders,
  getAllUserOrders,
  updateOrderInfo
}