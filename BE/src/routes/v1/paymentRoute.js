import express from 'express'
import { paymentController } from '~/controllers/checkoutController'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
const Router = express.Router()

Router.route('/checkout')
  .post(authorizedMiddlewares.authorizedMiddleware, paymentController.createPaymentLink)

Router.route('/receive-hook')
  .post(paymentController.webhook)


export const paymentRoute = Router