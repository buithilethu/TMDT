import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

export const corsOptions = {
  origin: function (origin, callback) {
    // Cho tất cả các origin có giá trị (không phải undefined, như từ trình duyệt)
    if (origin) return callback(null, origin)

    // Cho phép postman (origin === undefined) trong môi trường dev
    if (!origin && env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    // Nếu không thì chặn
    return callback(new ApiError(StatusCodes.FORBIDDEN, 'CORS not allowed'))
  },
  credentials: true,
  optionsSuccessStatus: 200
}
