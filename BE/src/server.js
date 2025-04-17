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

  app.use(function(req, res, next) {
    // Thay '*' bằng domain của frontend để cho phép credentials
    res.header('Access-Control-Allow-Origin', 'https://tmdt-sxwh.vercel.app') // Thay thế với domain của bạn
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Credentials', 'true') // Quan trọng để cho phép credentials
    next()
  })

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

