import { StatusCodes } from 'http-status-codes'
import { authService } from '~/services/authService'
import { userModel } from '~/models/userModel'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'

const registerUser = async (req, res, next) => {
  try {
    //(req.body) => {firstName: 'abc', lastName: 'abc', email: 'abc', password: 'abc'}
    const user = await userModel.findOne(req.body)
    if (user) {
      throw new Error('Email already exists')
    }

    const newUser = await authService.registerUser(req.body)
    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.message, isSuccess: false })
  }
}

const loginUser = async (req, res, next) => {
  try {
    //(req.body) => {email: 'abc', password: 'abc'}

    const { accessToken, isSuccess } = await authService.loginUser(req.body)
    const user = await userModel.findOne({ email: req.body.email })

    if (!user) {
      throw new Error('Email or password is not correct')
    }
    if (user.isAdmin) {
      throw new Error('Email or password is not correct')
    }
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin : user.isAdmin
    }



    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 604800000,
      path:'/'
    })
    res.status(StatusCodes.OK).json({ isSuccess: isSuccess, accessToken: accessToken, userData: userData })
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message, isSuccess: false })
  }
}

const loginAdmin = async (req, res, next) => {
try {
    //(req.body) => {email: 'abc', password: 'abc'}
    const { accessToken, isSuccess } = await authService.loginAdmin(req.body)
    const user = await userModel.findOne({ email: req.body.email })

    if (!user) {
      throw new Error('Email or password is not correct')
    }
    if (!user.isAdmin) {
      throw new Error('Email or password is not correct')
    }
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin : user.isAdmin
    }

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 604800000,
      path:'/'
    })
    res.status(StatusCodes.OK).json({ isSuccess: isSuccess, accessToken: accessToken, userData: userData })
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message, isSuccess: false })
  }
}


const logout = async (req, res, next) => {

  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  })
  res.status(StatusCodes.OK).json({ message: 'Logout successfully', isSuccess: true })
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body

    const decoded = jwt.verify(token, env.JWT_EMAIL_SECRET)
    const encryptedPassword = await bcrypt.hash(newPassword, 10)

    const user = await userModel.resetPassword(decoded.email, encryptedPassword)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message, isSuccess: false })
  }
}

export const authController = {
  registerUser,
  loginUser,
  logout,
  loginAdmin,
  resetPassword
}