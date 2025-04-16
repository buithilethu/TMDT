import express from 'express'
import { variantController } from '~/controllers/variantController'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'

const router = express.Router()

router.put('/', authorizedMiddlewares.authorizedMiddlewareAdmin, variantController.update)
router.put('/decrease-stock', authorizedMiddlewares.authorizedMiddlewareAdmin, variantController.decreaseStock)

export const variantRoute = router