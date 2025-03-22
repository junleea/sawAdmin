import request from '@/utils/request2';

export const GetMessageService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/im/get_message', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}