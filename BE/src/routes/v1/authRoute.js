import express from 'express'
import { authController } from '~/controllers/authController'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
const Router = express.Router()

Router.post('/register', authController.registerUser)
Router.post('/login', authorizedMiddlewares.notAuthorizedMiddleware, authController.loginUser)
Router.post('/logout', authorizedMiddlewares.authorizedMiddleware, authController.logout)

export const authRoute = Router