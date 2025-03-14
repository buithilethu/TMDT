import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'

const generateAccessToken = (user) => {
  const accessToken = jwt.sign({
    id: user._id,
    isAdmin: user.isAdmin
  }, env.JWT_ACCESS_KEY, { expiresIn: '2h' })
  return accessToken
}

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({
    id: user._id,
    isAdmin: user.isAdmin
  }, env.JWT_REFRESH_KEY, { expiresIn: '7d' })
  return refreshToken
}

export const generateJWT = {
  generateAccessToken,
  generateRefreshToken
}