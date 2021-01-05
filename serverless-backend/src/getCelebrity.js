import { getResponse } from './utils/index'
import AWS from 'aws-sdk'

const rekognition = new AWS.Rekognition({
    httpOptions: {
        timeout: 10000,
        connectTimeout: 10000,
    }
})

export default async event => {
    try {
        const { guid, ext } = event.pathParameters || {pathParameters: {}}
        const { BUCKET_NAME } = process.env
        
        if(!guid || !ext){
            return getResponse(400, 'Invalid name to compare')
        }

        const params = {
            Image: {
                S3Object: {
                    Bucket: BUCKET_NAME,
                    Name: `${guid}.${ext}`,
                } 
            }
        }
        
        const res = await rekognition.recognizeCelebrities(params).promise()
        return getResponse(200, res.CelebrityFaces) 

    } catch(e){
        return getResponse(500, e.message)
    }
};
  