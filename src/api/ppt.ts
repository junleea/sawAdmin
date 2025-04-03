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
