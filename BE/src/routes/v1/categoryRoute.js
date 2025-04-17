import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { categoryController } from '~/controllers/categoryController'
import { categoryValidation } from '~/validations/categoryValidation'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
import { upload } from '~/config/multer'
import { resizeImages } from '~/middlewares/imageResize'
const Router = express.Router()

Router.route('/')
  .get(categoryController.getAllCategory)
  .post(authorizedMiddlewares.authorizedMiddlewareAdmin, upload.single('images'), categoryValidation.create, categoryController.create)

Router.route('/:id')
  .get(categoryController.findOneById)
  .put(authorizedMiddlewares.authorizedMiddlewareAdmin, upload.single('images'), categoryValidation.update, categoryController.update)
  .delete(authorizedMiddlewares.authorizedMiddlewareAdmin, categoryController.remove)
export const categoryRoute = Router