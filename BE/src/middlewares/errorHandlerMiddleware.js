import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment.js'

export const errorHandlerMiddleware = (error, req, res, next) => {
  if (!error.statusCode) error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  const response = {
    statusCode: error.statusCode,
    message: error.message || StatusCodes[error.statusCode],
    stack: error.stack
  }

  // bao mật thông tin khi ở môi trường production
  if (env.BUILD_MODE !== 'dev') {
    delete response.stack
  }

  res.status(error.statusCode).json(response)
}
