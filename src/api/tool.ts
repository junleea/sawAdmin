import request from '@/utils/request2'


export const GetRedisInfoService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    let request1 = getRequest();
    return request1.post('/tool/get_redis', params,{
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備礁鎼ú锔锯偓绗涘啰鏆﹂柛娆忣槺閳绘棃鏌ｉ幋鐏活亝绂嶉崼鏇熺厽闁靛ǹ鍎遍褔鏌熼煬鎻掆偓婵嬪箖瑜忔禒锔炬喆閿濆懍澹曢梺璺ㄥ櫐閹凤拷  
        }
    })
}
function getRequest() {
    let server = localStorage.getItem('cid_server');
    let request1 = null;
    if (server === "tx.ljsea.top") {
        request1 = request;
    }else{
        request1 = request;
    }
    return request1;
}

export const UploadFileService = (formData,token) => {
    //let request1 = getRequest();
    return request.post('/tool/upload', formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
            'token': token, 
        }
    })
}

export const GetFileInfoByMd5Service = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    //let request1 = getRequest();
    return request.post('/tool/file_list', params,{
        headers: {
            'token': Data.token, 
        }
    })
}