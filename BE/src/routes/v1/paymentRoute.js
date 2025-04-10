import express from 'express'
import { paymentController } from '~/controllers/paymentController'

const Router = express.Router()

Router.route('/')
  .post(paymentController.createPaymentLink)


export const paymentRoute = Router