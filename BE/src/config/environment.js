import 'dotenv/config'

export const env ={
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,

  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,

  BUILD_MODE: process.env.BUILD_MODE,

  CLOUNDINARY_API_SECRET: process.env.CLOUNDINARY_API_SECRET,

  BASE_URL: process.env.BASE_URL,

  JWT_ACCESS_KEY: process.env.JWT_ACCESS_KEY,

  JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY,

  PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
  PAYOS_API_KEY: process.env.PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY
}

//lưu trữ biến môi trường trong file .env