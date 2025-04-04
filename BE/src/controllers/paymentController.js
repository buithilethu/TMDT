import PayOS from '@payos/node'
import { env } from '~/config/environment'

const payos = new PayOS(
  env.PAYOS_CLIENT_ID,
  env.PAYOS_API_KEY,
  env.PAYOS_CHECKSUM_KEY
)


const createPaymentLink = async (req, res, next) => {
  //req.id
  //get cart item where user_id = req.id


  const YOUR_DOMAIN = 'http://localhost:3000'
  const body = {
    orderCode: Number(String(Date.now()).slice(-6)),
    amount: 9999,
    description: 'Thanh toan don hang',
    buyerEmail: 'admin@gmail.com',
    items: [
      {
        name: 'Mì tôm Hảo Hảo ly',
        quantity: 1,
        price: 2000
      },
      {
        name: 'Mì tôm Hảo Hảo chua cay',
        quantity: 1,
        price: 2000
      }
    ],
    returnUrl: `${YOUR_DOMAIN}/success.html`,
    cancelUrl: `${YOUR_DOMAIN}/cancel.html`
  }

  try {
    const paymentLinkResponse = await payos.createPaymentLink(body);

    res.json( { url : paymentLinkResponse.checkoutUrl } )
  } catch (error) {
    res.send('Tạo link thanh toán thất bại')
  }
}

const webhook = async (req, res, next) => {
//xử lý thanh toán

}

export const paymentController = {
  createPaymentLink
}