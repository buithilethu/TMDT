import express from 'express'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
import { cartController } from '~/controllers/cartController'
const Router = express.Router()

//get all cart
Router.get('/', authorizedMiddlewares.authorizedMiddleware, cartController.getCart)
//add to cart

Router.post('/add', authorizedMiddlewares.authorizedMiddleware, cartController.add)

//update cart item quantity
Router.put('/update', authorizedMiddlewares.authorizedMiddleware, cartController.update)

//increase cart item quantity
Router.put('/increase/:id', authorizedMiddlewares.authorizedMiddleware, cartController.increase)

//decrease cart item quantity
Router.put('/decrease/:id', authorizedMiddlewares.authorizedMiddleware, cartController.decrease)

//delete cart
Router.delete('/deleteItem/:id', authorizedMiddlewares.authorizedMiddleware, cartController.deleteItem)

export const cartRoute = Router