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

const START_SERVER = () => {
  const app = express()
  app.use(cors(corsOptions))
  // app.use(cors())

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use('/uploads', express.static('uploads'))
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

