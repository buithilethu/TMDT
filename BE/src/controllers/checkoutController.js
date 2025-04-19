import PayOS from '@payos/node'

import { env } from '~/config/environment'
import { cartItemModel } from '~/models/cartItemModel'
import { orderModel } from '~/models/orderModel'
import { userModel } from '~/models/userModel'
import { orderShippingModel } from '~/models/orderShippingModel'
import { GET_CLIENT } from '~/config/mongodb'
import { sendEmail } from '~/config/nodemailer'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const payos = new PayOS(
  env.PAYOS_CLIENT_ID,
  env.PAYOS_API_KEY,
  env.PAYOS_CHECKSUM_KEY
)


const createPaymentLink = async (req, res, next) => {
  const userId = req.user.id
  const { address, phone, fullName, paymentMethod } = req.body
  // Kiểm tra thông tin
  if (!address || !phone) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' })
  }

  const user = await userModel.findOneById(userId)
  if (!user) {
    return res.status(404).json({ message: 'Người dùng chưa đăng nhập' })
  }

  const cartItems = await cartItemModel.getCart(userId)
  if (!cartItems || cartItems.length === 0) {
    return res.status(404).json({ message: 'Giỏ hàng trống' })
  }


  //Tạo danh sách sản phẩm
  const items = cartItems.map(item => ({
    name: `${item.product.name} - (${Object.values(item.variant.attributes).join(', ')})`,
    quantity: item.quantity,
    price: item.variant.price
  }))

  const orderItems = cartItems.map(item => ({
    productId: item.product._id.toString(),
    variantId: item.variant._id.toString(),
    quantity: item.quantity,
    price: item.variant.price
  }))

  const amount = items.reduce((total, item) => total + item.price * item.quantity, 0)

  const orderCode = Number(String(Date.now()).slice(-8))
  // Tạo đơn hàng
  const order = {
    userId,
    orderCode,
    items: orderItems,
    status: 'pending',
    paymentMethod: paymentMethod,
    createdAt: Date.now()
  }

  const session = GET_CLIENT().startSession()
  session.startTransaction()

  try {
    // Tạo đơn hàng & thông tin giao hàng
    await orderModel.createOrder(order, { session })
    await orderShippingModel.create(
      {
        orderCode,
        fullName,
        phone,
        address,
        status: paymentMethod === 'Cash' ? 'delivering' : 'pending'
      },
      { session }
    )

    const itemsWithDetails = await Promise.all(orderItems.map(async item => {
      const variant = await GET_DB().collection('variants').findOne({ _id: new ObjectId(item.variantId) })
      const product = await GET_DB().collection('products').findOne({ _id: new ObjectId(item.productId) })

      return {
        ...item,
        productName: product?.name || 'Không rõ sản phẩm',
        variantAttributes: variant?.attributes || {},
        stock: variant?.stock ?? 0
      }
    }))

    if (paymentMethod === 'Cash') {
      // Xoá giỏ hàng
      await cartItemModel.clearUserCart(userId, { session })

      await session.commitTransaction()
      session.endSession()
      sendEmail( { method:paymentMethod, data: itemsWithDetails, emailTo: user.email, orderCode: orderCode } )
      return res.status(200).json({ message: 'Đặt hàng thành công với COD' })
    } else {
      await session.commitTransaction()
      session.endSession()
      // Nếu là thanh toán qua ngân hàng → tạo link
      const body = {
        orderCode,
        amount,
        description: 'TDB Jewelry Shop',
        buyerEmail: user.email,
        buyerPhone: phone,
        buyerAddress: address,
        items,
        returnUrl: `${env.BASE_URL}/orders`,
        cancelUrl: `${env.BASE_URL}/ThanhToan`
      }

      const paymentLinkResponse = await payos.createPaymentLink(body)

      sendEmail( { method:paymentMethod, data: itemsWithDetails, emailTo: user.email, orderCode: orderCode, paymentLink: paymentLinkResponse.checkoutUrl } )

      return res.json({ url: paymentLinkResponse.checkoutUrl })
    }
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json({ message: 'Lỗi khi xử lý đơn hàng' })
  }
}


const webhook = async (req, res, next) => {

  console.log(req.body)
  const session = GET_CLIENT().startSession()
  session.startTransaction()

  try {
    const orderCode = req.body.data.orderCode
    const paymentSuccess = req.body.success// Mô tả trạng thái thanh toán
    const paymentDesc = req.body.desc
    const order = await orderModel.findOrderByOrderCode(orderCode, { session })

    if (!order) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
    }

    if (paymentSuccess || paymentDesc == 'success') {
      await orderModel.updateOrderInfoByOrderCode(orderCode, { status: 'paid' }, { session })
    } else {
      await orderModel.updateOrderInfoByOrderCode(orderCode, { status: 'cancelled' }, { session })
      return res.status(400).json({ message: 'Thanh toán không thành công' })
    }


    const cartItems = await cartItemModel.getCart(order.userId, { session })

    // Giảm tồn kho sản phẩm
    for (const item of cartItems) {
      await cartItemModel.decreaseVariantStock(item.variant._id.toString(), item.quantity, { session })
    }

    // Cập nhật trạng thái giao hàng
    await orderShippingModel.updateStatusByOrderCode(orderCode, 'delivering', { session })

    // Xoá giỏ hàng
    if ( paymentDesc ) {
      await cartItemModel.clearUserCart(order.userId, { session } )
    }

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({ message: 'Thanh toán thành công' }) // Trả về trang chủ hoặc trang khác sau khi thanh toán thành công

  } catch (error) {
    console.error('Transaction failed:', error)
    await session.abortTransaction()
    session.endSession()

    return res.status(500).json({ message: 'Lỗi xử lý đơn hàng, đã rollback' })

  }
}


export const paymentController = {
  createPaymentLink,
  webhook
}