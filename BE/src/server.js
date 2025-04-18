/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { CONNECT_DB } from '~/config/mongodb.js'
import { env } from '~/config/environment.js'
import { errorHandlerMiddleware } from './middlewares/errorHandlerMiddleware'
import { corsOptions } from '~/config/cors'
import { APIsV1 } from '~/routes/v1/index'
import 'dotenv/config'
import path from 'path'

const START_SERVER = () => {
  const app = express()
  // Danh sách các origin được phép truy cập

  const allowedOrigins = [
    'https://thuonggia.ecotech2a.com',
    'https://tmdt-sxwh.vercel.app',
    'http://localhost:5173' // nếu đang test cục bộ
]

  app.use(cors({
    origin: (origin, callback) => {
      // Cho phép nếu không có origin (ví dụ Postman), hoặc origin nằm trong danh sách
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Cấu hình cors đang chặn truy cập từ : ' + origin))
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  }))

  // app.use(function(req, res, next) {
  //   res.header('Content-Type', 'application/json;charset=UTF-8')
  //   res.header('Access-Control-Allow-Origin', 'https://tmdt-sxwh.vercel.app')
  //   res.header('Access-Control-Allow-Credentials', 'true')
  //   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  //   res.header(
  //     'Access-Control-Allow-Headers',
  //     'Origin, X-Requested-With, Content-Type, Accept'
  //   )
  //   next()
  // })

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  const rootpath = path.resolve(__dirname, '..')
  app.use('/uploads', express.static(path.join(rootpath, 'uploads')))
  app.use('/v1', APIsV1)
  app.use(errorHandlerMiddleware)


  app.listen(process.env.PORT || 3000, () => {
    console.log(`Hello, I am running at ${ env.APP_HOST }:${process.env.PORT }`)
  })

}

CONNECT_DB()
  .then(() => {console.log('Connected to MongoDB')})
  .then(() => START_SERVER())
  .catch( error => {
    process.exit(1)
  })

