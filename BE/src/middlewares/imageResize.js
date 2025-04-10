import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const safeUnlink = async (filepath, retries = 5, delay = 10) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.unlink(filepath)
      console.log('🗑️ Đã xoá ảnh:', filepath)
      return
    } catch (err) {
      if (i === retries - 1) {
        console.warn(`❌ Không thể xoá file sau ${retries} lần: ${filepath}`, err.message)
        return
      }
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export const resizeImages = async (req, res, next) => {
console.log('🚀 ~ file: imageResize.js:51 ~ resizeImages ~ req:', req.files.length)


  if (!req.files || req.files.length === 0) return next();

  try {
    const resizedFiles = [];

    for (const file of req.files) {
      // Đợi file được ghi xong trước khi xử lý
      let retries = 0;
      while (retries < 5) {
        try {
          await fs.access(file.path); // check file tồn tại
          break;
        } catch {
          await new Promise(r => setTimeout(r, 100)); // chờ 100ms
          retries++;
        }
      }

      const ext = path.extname(file.filename);
      const resizedFilename = file.filename.replace(ext, `-resized${ext}`);
      const outputPath = path.join(file.destination, resizedFilename);

      try {
        await sharp(file.path)
          .resize({ width: 1024 })
          .toFile(outputPath);
      } catch (resizeError) {
        console.warn(`⚠️ Bỏ qua ảnh lỗi ${file.originalname}:`, resizeError.message);
        continue; // skip file lỗi
      }

      try {
        await safeUnlink(file.path); // xoá file gốc
      } catch (e) {
        console.warn(`❌ Không thể xoá file: ${file.path}`, e.message);
      }

      resizedFiles.push({
        ...file,
        filename: resizedFilename,
        path: outputPath
      });
    }
    
    req.files = resizedFiles
    next();
  } catch (err) {
    console.error('❌ Resize lỗi:', err);
    return res.status(500).json({ message: 'Lỗi xử lý ảnh' });
  }
}