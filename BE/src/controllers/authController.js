import { StatusCodes } from 'http-status-codes'
import { authService } from '~/services/authService'
import { userModel } from '~/models/userModel'

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
    const { accessToken, isSuccess } = await authService.loginUser(req.body, res)

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 3600000,
      path:'/'
    })
    res.status(StatusCodes.OK).json({ isSuccess: isSuccess, accessToken: accessToken })
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message, isSuccess: false })
  }
}


const logout = async (req, res, next) => {
  //()
  res.clearCookie('token')
  res.status(StatusCodes.OK).json({ message: 'Logout successfully', isSuccess: true })
}

export const authController = {
  registerUser,
  loginUser,
  logout
}