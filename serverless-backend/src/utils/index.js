export const serialize = obj => JSON.stringify(obj)

export const deserialize = str => JSON.parse(str)

const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type: application/json',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json',
}

export const getResponse = (status, data, headers = defaultHeaders) => {
    switch(status){
        case 200:
            return {
                statusCode: status,
                headers,
                body: serialize({
                    status,
                    success: true,
                    data,
                })
            }
        default:
            return {
                statusCode: status,
                headers,
                body: serialize({
                    status,
                    success: true,
                    data,
                })
            }
    
    }
}