import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { imageController } from '~/controllers/imageController'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
import { upload } from '~/config/multer'
import { resizeImages } from '~/middlewares/imageResize'
const Router = express.Router()

Router.route('/')
  .post(authorizedMiddlewares.authorizedMiddlewareAdmin, upload.array('images', 1), resizeImages, imageController.create)

Router.route('/:id')
  .delete(authorizedMiddlewares.authorizedMiddlewareAdmin, imageController.remove)
export const imageRoute = Router