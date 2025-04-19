import { userModel } from '~/models/userModel'
import bcrypt from 'bcrypt'
import { generateJWT } from '~/utils/generateJWT'

const registerUser = async (userData) => {
  try {
    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(userData.password, salt)
    userData.password = hashed

    //create new user
    const user = await userModel.registerUser(userData)
    return user

  } catch (error) {
    throw new Error(error)
  }
}

const loginUser = async (userData) => {
  try {
    const user = await userModel.findOne(userData)
    if (!user || user.isAdmin) {
      throw new Error('Sai email hoặc mật khẩu')
    }

    if (user.isEnabled === false) {
      throw new Error('Your email is not verified')
    }

    const validatePassword = await bcrypt.compare(userData.password, user.password)
    if (!validatePassword) {
      throw new Error('Sai email hoặc mật khẩu')
    }

    if (user && validatePassword) {
      const accessToken = generateJWT.generateAccessToken(user)

      return { accessToken: accessToken, isSuccess: true }
    }
    return { accessToken:'', isSuccess: false }
  }
  catch (error) {
    throw new Error(error)
  }
}

const loginAdmin = async (userData) => {
  try {
    const user = await userModel.findOne(userData)
    if (!user || !user.isAdmin) {
      throw new Error('Sai email hoặc mật khẩu')
    }

    const validatePassword = await bcrypt.compare(userData.password, user.password)
    if (!validatePassword) {
      throw new Error('Sai email hoặc mật khẩu')
    }

    if (user && validatePassword) {
      const accessToken = generateJWT.generateAccessToken(user)

      return { accessToken: accessToken, isSuccess: true }
    }
    return { accessToken:'', isSuccess: false }
  }
  catch (error) {
    throw new Error(error)
  }
}

export const authService = {
  registerUser,
  loginUser,
  loginAdmin
}