import { getResponse, deserialize } from './utils/index'
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
    httpOptions: {
        timeout: 10000,
        connectTimeout: 10000,
    }
})

export default async event => {
    try {
      const { body, pathParameters: { ext } } = event || {pathParameters: {}}
      const { BUCKET_NAME } = process.env

      if(!body){
          return getResponse(400, 'Error: Body is missing')
      }
      if(!ext){
          return getResponse(400, 'Error: Invalid image format')
      }

      const {image} = deserialize(body)
      if(!image){
          return getResponse(400, 'Error: Image is missing')
      }

      const id = event.requestContext.requestId
      const params = {
          Bucket: BUCKET_NAME,
          Key: `${id}.${ext}`,
          Body: Buffer.from(image, 'base64'),
      }
      const {Location:href} = await s3.upload(params).promise()
      return getResponse(200, {ext, id, href})
  }catch(e){
      return getResponse(500, e.message)
  }
};