import request from '@/utils/request2';

export const FindSparkPPTThemeListService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/tool/spark_ppt_theme_list', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const CreateSparkPPTOutlineService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        if(typeof Data[key] === 'object'){
            params.append(key, JSON.stringify(Data[key]))
            continue
        }
        params.append(key, Data[key])
    }
    return request.post('/tool/spark_create_outline', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const CreateSparkPPTService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        if(typeof Data[key] === 'object'){
            params.append(key, JSON.stringify(Data[key]))
            continue
        }
        params.append(key, Data[key])
    }
    return request.post('/tool/spark_create_ppt', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}

export const GetSparkPPTStatusService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        if(typeof Data[key] === 'object'){
            params.append(key, JSON.stringify(Data[key]))
            continue
        }
        params.append(key, Data[key])
    }
    return request.post('/tool/spark_ppt_create_status', params,{
        headers: {
            'token': Data.token, //token
        }
    })
}