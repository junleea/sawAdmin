import request from '@/utils/request2';


export const FindSessionService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/session/find', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const AddSessionService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/session/create', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const UpdateSessionService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/session/update', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const DelSessionService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/session/delete', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}