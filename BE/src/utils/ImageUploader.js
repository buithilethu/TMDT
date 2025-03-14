import { cloudinary } from '~/config/cloundinary'
import { imageModel } from '~/models/imageModel'

export const uploadImage = async (files) => {
  try {
    const images = files.map(file => file.path)
    const imageIds = []

    for ( let image of images) {
      const results = await cloudinary.uploader.upload(image)
      let imageObj = await imageModel.createNew(
        {
          url: results.secure_url,
          public_id: results.public_id
        }
      )

      imageIds.push(imageObj.insertedId.toString())
    }

    return imageIds
  } catch (error) {
    throw new error
  }
}

export const updateImages = async (currentImagesObj, keptImages, newImages) => {
  try {
    // xóa ảnh cũ
    const currentImages = currentImagesObj.map(image => image.public_id)
    const imagesToDelete = currentImages.filter(image => !keptImages.includes(image.public_id))
    // xóa khỏi cloudinary
    for (let image of imagesToDelete) {
      await deleteImage(image.public_id)
    }
    // thêm ảnh mới
    let images = keptImages.length > 0 ? keptImages : []
    // thêm vào cloudinary
    if (newImages.length > 0) {
      const uploadedImages = await uploadImage(newImages)
      //trả về mảng mới
      images = [...images, ...uploadedImages]
    }

    return images
  } catch (error) {
    throw new error
  }
}

export const deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id)
  } catch (error) {
    throw new error
  }
}