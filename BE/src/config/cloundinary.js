import { v2 as cloudinary } from 'cloudinary'
import {env} from './environment'
// Configuration
cloudinary.config({
  cloud_name: 'dwhaahsak',
  api_key: '184887364541993',
  api_secret: env.CLOUNDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
})

export { cloudinary }