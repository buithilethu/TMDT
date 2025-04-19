import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

// Gửi email
export const sendEmail = async (data) => {
  // Cấu hình transporter (dùng Gmail SMTP + App Password)
  let mailOptions = {}
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'cfgamehay@gmail.com',         // Thay bằng Gmail của bạn
      pass: 'zuja neel fbns wiyg'            // Là App Password 16 ký tự, không phải mật khẩu thường
    }
  })
  const order = data.data

const grouped = {}

  for (const item of order) {
    if (!grouped[item.productId]) {
      grouped[item.productId] = {
        productName: item.productName,
        variants: []
      }
    }

    grouped[item.productId].variants.push({
      variantId: item.variantId,
      attributes: item.variantAttributes,
      quantity: item.quantity,
      price: item.price,
      stock: item.stock
    })
  }

  let html = `
  <table border="1" cellspacing="0" cellpadding="8" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th>Tên sản phẩm</th>
        <th>Thuộc tính</th>
        <th>Số lượng</th>
        <th>Giá</th>
        <th>Tổng</th>
      </tr>
    </thead>
    <tbody>
`

  let totalPrice = 0
  for (const productId in grouped) {
    const product = grouped[productId]
    const variantCount = product.variants.length
    product.variants.forEach((variant, index) => {
      const attrString = Object.entries(variant.attributes)
        .map(([key, value]) => `<p><strong>${key}</strong>: ${value}</p>`)
        .join('')

      html += '<tr>'

      // Chỉ thêm tên sản phẩm ở dòng đầu tiên và dùng rowspan
      if (index === 0) {
        html += `<td rowspan="${variantCount}">${product.productName}</td>`
      }

      html += `
        <td>${attrString}</td>
        <td style="text-align: center;">${variant.quantity}</td>
        <td style="text-align: right;">${variant.price.toLocaleString('vi-VN')}₫</td>
        <td style="text-align: center;">${(variant.quantity * variant.price).toLocaleString('vi-VN')}₫</td>
      </tr>
      `
      totalPrice += variant.quantity * variant.price
    })
  }

  html += `
  <tr>
    <td colspan="4" style="text-align: right;"><strong>Tổng cộng:</strong></td>
    <td style="text-align: center;">${totalPrice.toLocaleString('vi-VN')}₫</td>
  </tr>
      </tbody>
    </table>
  `
//data.emailTo
  mailOptions = {
    from: '"TDB JEWELRY" <yourgmail@gmail.com>', // Tên hiển thị + email gửi
    to: data.emailTo, // Email người nhận
    subject: `Xác nhận đơn hàng ${data.orderCode}`,
    html: `
    <h2>Cảm ơn bạn đã đặt hàng tại TDB JEWELRY!</h2>
    <p>Đơn hàng <strong>${data.orderCode}</strong> của bạn đã được ghi nhận.</p>
  ${html}
    <p>Chúng tôi sẽ giao hàng đến bạn trong 2-5 ngày làm việc.</p>
  ${data.paymentLink ? `<p>Nếu bạn đã thanh toán thì hãy bỏ qua email này, còn nếu bạn chưa thanh toán thì hãy bấm vào <a href="${data.paymentLink}">đây</a>. Để xử lý thanh toán nhé!</p>` : ''}
    <p>Xin cảm ơn!</p>
  `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email đã gửi thành công:', info.messageId)
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error)
  }
}

