//đại diện cho tất cả các route của version 1
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { productRoute } from './productRoute'
import { categoryRoute } from './categoryRoute'
import { authRoute } from './authRoute'
import { cartRoute } from './cartRoute'
import { paymentRoute } from './paymentRoute'
import { imageRoute } from './imageRoute'
import { userProfileRoute } from './userProfileRoute'
import { orderRoute } from './orderRoute'
import { variantRoute } from './variantRoute'
const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API V1 are ready to use.' })

})

Router.use('/products', productRoute)
Router.use('/categories', categoryRoute)
Router.use('/auth', authRoute)
Router.use('/cart', cartRoute)
Router.use('/payment', paymentRoute)
Router.use('/images', imageRoute)
Router.use('/profile', userProfileRoute )
Router.use('/orders', orderRoute)
Router.use('/variants', variantRoute)

export const APIsV1 = Router

//200 OK
