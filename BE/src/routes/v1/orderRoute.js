import express from 'express'
import { orderController } from '~/controllers/orderController'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
const router = express.Router()

router.get('/', authorizedMiddlewares.authorizedMiddleware, orderController.getOrders)

export const orderRoute = router