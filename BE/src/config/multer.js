import multer from 'multer'

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Lấy đuôi file gốc
    const ext = file.originalname.split('.').pop()
    // Giữ nguyên định dạng file gốc thay vì ép sang .jpg
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
    cb('Please upload only images', false)
  }
}

export const upload = multer({ storage: storage, fileFilter: fileFilter })

