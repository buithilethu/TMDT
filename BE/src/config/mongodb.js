import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment.js'

const MONGODB_URI = env.MONGODB_URI
const DATABASE_NAME = env.DATABASE_NAME

//tạo instance để kết nối với database
let databaseInstance = null
//serverApiVersion: dùng để chọn phiên bản api của mongodb và thông báo lỗi khi sử dụng api cũ
const mongoClientInstance = new MongoClient(MONGODB_URI, {
  serverApi:{
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  //gọi kết nối đến mongodb atlas
  await mongoClientInstance.connect()
  //chọn và trả về database cần sử dụng
  databaseInstance = mongoClientInstance.db(DATABASE_NAME)
  return databaseInstance
}

export const GET_DB = () => {
  //kiểm tra xem đã kết nối đến database chưa
  if (!databaseInstance) {
    throw new Error('Must connect to database first')
  }
  //trả về database đã kết nối
  return databaseInstance
}

//tận dụng mongoClientInstance để đóng kết nối

