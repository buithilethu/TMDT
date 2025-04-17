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
    console.log(req.body)
    const { accessToken, isSuccess } = await authService.loginUser(req.body, res)
    const user = await userModel.findOne({ email: req.body.email })

    if (!user) {
      throw new Error('Email not found')
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
      maxAge: 3600000,
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

export const authController = {
  registerUser,
  loginUser,
  logout
}