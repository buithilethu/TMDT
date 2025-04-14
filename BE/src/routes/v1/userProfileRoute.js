import express from 'express'
import { userProfileController } from '~/controllers/userProfileController'
import { authorizedMiddlewares } from '~/middlewares/authorizedMiddleware'
const router = express.Router()

router.post('/create', authorizedMiddlewares.authorizedMiddleware, userProfileController.create)
router.get('/', authorizedMiddlewares.authorizedMiddleware, userProfileController.getProfileByUserId)
router.put('/update', authorizedMiddlewares.authorizedMiddleware, userProfileController.update)

export const userProfileRoute = router