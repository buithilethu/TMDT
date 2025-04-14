import PayOS from '@payos/node'

import { env } from '~/config/environment'
import { cartItemModel } from '~/models/cartItemModel'
import { orderModel } from '~/models/orderModel'
import { userModel } from '~/models/userModel'

const payos = new PayOS(
  env.PAYOS_CLIENT_ID,
  env.PAYOS_API_KEY,
  env.PAYOS_CHECKSUM_KEY
)


const createPaymentLink = async (req, res, next) => {
  //req.id
  //get cart item where user_id = req.id
  const userId = req.user.id
  //get user
  const user = await userModel.findOneById(userId)

  if (!user) {
    return res.status(404).json({ message: 'Người dùng chưa đăng nhập' })
  }

  //get cart item
  const cartItems = await cartItemModel.getCart(userId)

  if (!cartItems) {
    return res.status(404).json({ message: 'Giỏ hàng trống' })
  }

  const YOUR_DOMAIN = env.BASE_URL
  //get items for payos
  const items = cartItems.map((item) => ({
    name: `${item.product.name} - (${Object.values(item.variant.attributes).join(', ')})`,
    quantity: item.quantity,
    price: item.variant.price
  }))
  //get items for order
  const orderItems = cartItems.map((item) => ({
    productId: item.product._id.toString(),
    variantId: item.variant._id.toString(),
    quantity: item.quantity,
    price: item.variant.price
  }))

  //create order
  const amount = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const orderCode = Number(String(Date.now()).slice(-6))
  const order = {
    userId: userId,
    orderCode: orderCode,
    items: orderItems,
    status: 'pending',
    createdAt: Date.now()
  }


  const orderResult = await orderModel.createOrder(order)

  const body = {
    orderCode: orderCode,
    amount: amount,
    description: 'TDB Jewelry Shop',
    buyerEmail: user.email,
    items,
    returnUrl: `${YOUR_DOMAIN}/success.html`,
    cancelUrl: `${YOUR_DOMAIN}/cancel.html`
  }

  try {
    const paymentLinkResponse = await payos.createPaymentLink(body)

    res.json( { url : paymentLinkResponse.checkoutUrl } )
  } catch (error) {
    console.error('Checkout error:', error)
    return res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' })
  }
}

const webhook = async (req, res, next) => {
  const orderCode = req.body.data.orderCode
  const desc = req.body.desc
  const order = await orderModel.findOrderByOrderCode(orderCode)

  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
  }

  if (desc === 'success') {
    await orderModel.updateOrderInfo(orderCode, { status: 'paid' })
  }
  const cartItems = await cartItemModel.getCart(order.userId)

  const adjustVariantsQuantity = cartItems.map(async (item) => {
    await cartItemModel.decreaseVariantStock(item.variant._id.toString(), item.quantity)
  })

  cartItemModel.clearUserCart(order.userId)

  return res.json({ message: 'success' })
}


export const paymentController = {
  createPaymentLink,
  webhook
}