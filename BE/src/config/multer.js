import multer from 'multer'
import fs from 'fs'
import path from 'path'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/tiff',
    'image/svg+xml',
    'image/x-icon',
    'image/heic',
    'image/heif'
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb('Please upload only images', false)
  }
}

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

export const saveFilesToDisk = (files) => {
  const uploadDir = 'uploads/'
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  return files.map(file => {
    const filename = file.fieldname + '-' + Date.now() + '.jpg'
    const filepath = path.join(uploadDir, filename)
    fs.writeFileSync(filepath, file.buffer)
    return {
      filename,
      filepath,
      originalname: file.originalname
    }
  })
}

export const deleteFiles = (filepaths) => {
  filepaths.forEach(filepath => {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
  })
}

