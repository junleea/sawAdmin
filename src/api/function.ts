import request from '@/utils/request2';

export const FindFunctionService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/func/find', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const AddFunctionService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/func/create', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const UpdateFunctionService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/func/update', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const DelFunctionService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/func/delete', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const FindModelListByFunctionName= (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/func/find_models_by_function', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}