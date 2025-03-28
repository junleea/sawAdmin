import request from '@/utils/request2';

export const FindUserFileService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/file/file_list', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const AddUserFileService = (Data) => {
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

export const UpdateUserFileService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/file/file_update', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const DelUserFileService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/file/file_delete', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}