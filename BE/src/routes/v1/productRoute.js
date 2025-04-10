import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'
import { upload } from '~/config/multer'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
import { resizeImages } from '~/middlewares/imageResize'

const Router = express.Router()

Router.route('/')
  .get(productController.getAllProducts)
  .post(authorizedMiddlewares.authorizedMiddlewareAdmin,
    upload.array('images', 10),
    resizeImages,
    productValidation.createNew,
    productController.createNew)
Router.route('/:id')
  .get(productController.getProduct)
  .put(authorizedMiddlewares.authorizedMiddlewareAdmin,
    upload.array('images', 10),
    resizeImages,
    productValidation.update,
    productController.update)
  .delete(authorizedMiddlewares.authorizedMiddlewareAdmin, productController.deleteProduct)

export const productRoute = Router