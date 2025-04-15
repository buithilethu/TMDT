import express from 'express'
const router = express.Router()
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
import { shippingController } from '~/controllers/shippingController'

router.put('/', authorizedMiddlewares.authorizedMiddlewareAdmin, shippingController.updateShippingStatus )

export const orderShippingRoute = router