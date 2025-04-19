import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
import { sendEmailVerifyAccount, sendEmailResetPassword } from '~/config/nodemailer'
import { userModel } from '~/models/userModel'
import bcrypt from 'bcrypt'

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query

    const decoded = jwt.verify(token, env.JWT_EMAIL_SECRET)
    const { email } = decoded

    const user = await userModel.activeUser(email)

    res.redirect(`${env.BASE_URL}/dangnhap?message=Tài khoản của bạn đã được kích hoạt thành công! Vui lòng đăng nhập!`)
  } catch (error) {
    next(error)
  }
}

const sendEmailVerify = async (req, res, next) => {
  try {
    const { email } = req.body

    const token = jwt.sign({ email }, env.JWT_EMAIL_SECRET, { expiresIn: '1h' })

    const verificationLink = `${env.API_URL}/v1/email/verify-email?token=${token}`

    // console.log(email ,verificationLink)

    await sendEmailVerifyAccount({ email, verificationLink })

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    next(error)
  }
}

const sendEmailResetPass = async (req, res, next) => {
  try {
    const { email } = req.body

    const token = jwt.sign({ email }, env.JWT_EMAIL_SECRET, { expiresIn: '1h' })

    const resetPasswordLink = `${env.BASE_URL}/reset-password?token=${token}`

    const user = await userModel.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendEmailResetPassword({ email, resetPasswordLink })

    res.status(200).json({ message: 'Reset password email sent', resetPasswordLink});
  }
  catch (error)
  {
    next(error)
  }
}


export const emailHelperController = {
  verifyEmail,
  sendEmailVerify,
  sendEmailResetPass
}