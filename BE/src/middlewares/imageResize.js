import sharp from 'sharp'
import fs from 'fs/promises' // Dùng promises API
import path from 'path'

const safeUnlink = async (path, retries = 5, delay = 100) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.unlink(path)
      console.log('🗑️ Đã xoá ảnh:', path)
      return
    } catch (err) {
      if (i === retries - 1) {
        console.warn(`❌ Không thể xoá file sau ${retries} lần: ${path}`, err.message)
        return
      }
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export const resizeImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next()

  try {
    const resizedFiles = []

    await Promise.all(req.files.map(async (file) => {
      const ext = path.extname(file.filename)
      const resizedFilename = file.filename.replace(ext, `-resized${ext}`)
      const outputPath = path.join(file.destination, resizedFilename)

      await sharp(file.path)
        .resize({ width: 1024 }) // resize chiều rộng
        .toFile(outputPath)

      await safeUnlink(file.path)

      resizedFiles.push({
        ...file,
        filename: resizedFilename,
        path: outputPath
      })
    }))

    req.files = resizedFiles
    next()
  } catch (err) {
    console.error('❌ Resize lỗi:', err)
    return res.status(500).json({ message: 'Lỗi xử lý ảnh' })
  }
}
