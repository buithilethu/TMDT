import { Router } from 'express'
import { emailHelperController } from '~/controllers/emailHelperController'

const router = Router()

router.post('/sendEmailVerify', emailHelperController.sendEmailVerify)
// router.post('/sendEmailResetPassword', emailHelperController.)
router.get('/verify-email', emailHelperController.verifyEmail)

router.post('/reset-password', emailHelperController.sendEmailResetPass)

export const EmailHellperRoute = router