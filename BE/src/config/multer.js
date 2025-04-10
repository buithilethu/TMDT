// import multer from 'multer'

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     // Lấy đuôi file gốc
//     const ext = file.originalname.split('.').pop()
//     console.log(`Processing file: ${file.originalname}, mimetype: ${file.mimetype}`)
//     cb(null, `${file.fieldname}-${Date.now()}.${ext}`)
//   }
// })

// var fileFilter = (req, file, cb) => {
//   const allowedMimeTypes = [
//     'image/jpeg',
//     'image/png',
//     'image/gif',
//     'image/bmp',
//     'image/webp',
//     'image/tiff',
//     'image/svg+xml',
//     'image/x-icon',
//     'image/heic',
//     'image/heif'
//   ]

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true)
//   } else {
//     console.log(`Rejected file: ${file.originalname}, invalid mimetype: ${file.mimetype}`)
//     cb(new Error('Please upload only images'), false)
//   }
// }

// // Thêm limits để kiểm soát upload
// export const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // giới hạn 5MB mỗi file
//     files: 10 // cho phép tối đa 10 files
//   }
// })

import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`)
}
})

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'image/x-icon',
  'image/tiff',
  'image/heic',
  'image/heif'
]

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Vui lòng chỉ tải ảnh hợp lệ'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 5MB
    files: 30
  }
})
