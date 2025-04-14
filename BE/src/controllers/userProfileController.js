import { userProfileModel } from '~/models/userProfileModel'

const create = async (req, res, next) => {
  try {
    const userId = req.user.id
    const data = req.body
    const userProfile = await userProfileModel.createUserProfile({ ...data, userId })

    return res.status(201).json({
      message: 'Create user profile successfully',
      result: userProfile
    })
  } catch (error) {
    next(error)
  }
}

const getProfileByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id
    const userProfile = await userProfileModel.getUserProfileByUserId(userId)

    if (!userProfile) {
      return res.status(404).json({
        message: 'User profile not found'
      })
    }

    return res.status(200).json({
      message: 'Get user profile successfully',
      result: userProfile
    })
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.user.id
    const data = req.body


    const userProfile = await userProfileModel.updateUserProfile(userId, data)

    if (!userProfile) {
      return res.status(404).json({
        message: 'User profile not found'
      })
    }

    return res.status(200).json({
      message: 'Update user profile successfully',
      result: userProfile
    })
  } catch (error) {
    next(error)
  }
}

export const userProfileController = {
  create,
  getProfileByUserId,
  update
}

