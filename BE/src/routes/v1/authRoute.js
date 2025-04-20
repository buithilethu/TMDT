import express from 'express'
import { authController } from '~/controllers/authController'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
const Router = express.Router()

Router.post('/register', authController.registerUser)
Router.post('/login', authorizedMiddlewares.notAuthorizedMiddleware, authController.loginUser)
Router.post('/logout', authorizedMiddlewares.authorizedMiddleware, authController.logout)
Router.post('/loginAdmin', authorizedMiddlewares.notAuthorizedMiddleware, authController.loginAdmin)
Router.post('/reset-password', authController.resetPassword)

export const authRoute = Router