import multer from 'multer'

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Lấy đuôi file gốc
    const ext = file.originalname.split('.').pop()
    console.log(`Processing file: ${file.originalname}, mimetype: ${file.mimetype}`)
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`)
  }
})

var fileFilter = (req, file, cb) => {
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
    console.log(`Rejected file: ${file.originalname}, invalid mimetype: ${file.mimetype}`)
    cb(new Error('Please upload only images'), false)
  }
}

// Thêm limits để kiểm soát upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // giới hạn 5MB mỗi file
    files: 10 // cho phép tối đa 10 files
  }
})

