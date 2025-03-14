import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
//xác thực người dùng
const authorizedMiddleware = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: 'Please login!', isSuccess: false })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_KEY)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', isSuccess: false })
  }
}
//xác thực người dùng có quyền admin
const authorizedMiddlewareAdmin = (req, res, next) => {
  authorizedMiddleware(req, res, () => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'you are not allow', isSuccess: false })
    }
    next()
  })
}

//chưa đăng nhập
const notAuthorizedMiddleware = (req, res, next) => {
  const token = req.cookies.token
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_KEY)
      req.user = decoded
      if (req.user) {
        return res.status(403).json({ message: 'You are already logged in', isSuccess: false })
      }
    } catch (error) {
      return next()
    }
  }

  next()
}


export const authorizedMiddlewares = {
  authorizedMiddleware,
  authorizedMiddlewareAdmin,
  notAuthorizedMiddleware
}