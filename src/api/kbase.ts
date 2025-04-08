import request from '@/utils/request2';

export const FindKnowledgeBaseService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/knowledgeBase/list', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const AddKnowledgeBaseService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/knowledgeBase/create', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const UpdateKnowledgeBaseService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/knowledgeBase/update', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const DelKnowledgeBaseService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/knowledgeBase/delete', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}