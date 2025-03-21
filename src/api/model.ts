import request from '@/utils/request2';

export const FindModelService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/model/find', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const AddModelService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/model/create', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const UpdateModelService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/model/update', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const DelModelService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/model/delete', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}