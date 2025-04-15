import express from 'express'
import { orderController } from '~/controllers/orderController'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
const router = express.Router()

router.get('/', authorizedMiddlewares.authorizedMiddleware, orderController.getOrders)
router.get('/getAll', authorizedMiddlewares.authorizedMiddlewareAdmin, orderController.getAllUserOrders)
router.put('/', authorizedMiddlewares.authorizedMiddlewareAdmin, orderController.updateOrderInfo)
export const orderRoute = router