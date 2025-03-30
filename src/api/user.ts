import request from '@/utils/request2';
import md5 from 'js-md5';

export const loginService = (loginData) => {
    const params = new URLSearchParams();
    loginData = loginData._value;
    for (let key in loginData) {
        if (key === "username") {
            //婵犳鍠楃换鎰緤娴犲鍨傛い鏍ㄧ矋閸嬫﹢鏌曟繛鍨鐟滄妸鍛亾濞堝灝鏋涚紒缁樺姍瀹曡绂掔€ｎ亝顥濆銈嗘尪閸ㄨ绂掕箛鏇犵＜闁绘瑥鎳忕€氾拷
            if (RegExp(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/).test(loginData[key])) {
                loginData['email'] = loginData[key]
                loginData[key] = ''
            } 
        }
        // if (key === 'password') {
        //     loginData[key] = md5(loginData[key])
        // }
        params.append(key, loginData[key])
    }
    return request.post('/user/login', params)
}

export const registerService = (registerData) => {
    const params = new URLSearchParams();
    registerData = registerData._value;
    for (let key in registerData) {
        params.append(key, registerData[key])
    }
    console.log("registerdata:",registerData)
    return request.post('/user/register', params)
}



export const getUUIDService = (registerData) => {
    const params = new URLSearchParams();
    for (let key in registerData) {
        params.append(key, registerData[key])
    }
    return request.post('/user/uuid', params)
}

export const addGroupRequestService  = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/im/send_message', params,{
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備礁鎼ú锔锯偓绗涘啰鏆﹂柛娆忣槺閳绘棃鏌ｉ幋鐏活亝绂嶉崼鏇熺厽闁靛ǹ鍎遍褔鏌熼煬鎻掆偓婵嬪箖瑜忔禒锔炬喆閿濆懍澹曢梺璺ㄥ櫐閹凤拷  
        }
    })
}
export const getFriendReqService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/im/get_friend_request', params, {
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備礁鎼ú锔锯偓绗涘啰鏆﹂柛娆忣槺閳绘棃鏌ｉ幋鐏活亝绂嶉崼鏇熺厽闁靛ǹ鍎遍褔鏌熼煬鎻掆偓婵嬪箖瑜忔禒锔炬喆閿濆懍澹曢梺璺ㄥ櫐閹凤拷  
        }
    })
}

export const GetUserInfoService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/user/info', params, {
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備礁鎼ú锔锯偓绗涘啰鏆﹂柛娆忣槺閳绘棃鏌ｉ幋鐏活亝绂嶉崼鏇熺厽闁靛ǹ鍎遍褔鏌熼煬鎻掆偓婵嬪箖瑜忔禒锔炬喆閿濆懍澹曢梺璺ㄥ櫐閹凤拷  
        }
    })
}

//闂備礁鎲＄敮鐐寸箾閳ь剚绻涢崨顓烆劉缂佽桨绮欓幐濠冨緞婵犲倸娈ら梻浣烘嚀閻°劑鎮ч悙鍝勭劦妞ゆ巻鍋撻柟铏姍瀹曟濮€閵忋垻锛滈梺璺ㄥ櫐閹凤拷
export const DelFGService =(Data) =>{
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/im/del_friend_or_group', params, {
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備礁鎼ú锔锯偓绗涘啰鏆﹂柛娆忣槺閳绘棃鏌ｉ幋鐏活亝绂嶉崼鏇熺厽闁靛ǹ鍎遍褔鏌熼煬鎻掆偓婵嬪箖瑜忔禒锔炬喆閿濆懍澹曢梺璺ㄥ櫐閹凤拷  
        }
    })
}

export const updateUserInfoService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/user/update', params, {
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備浇娉曢崰鎰板几婵犳艾绠柣鎴ｆ缁犲弶銇勯顐㈠绩缂佲偓鐎ｎ喗鐓欐い鏂挎惈婵℃寧绻涢崼鐔风仸缂佸倹甯℃俊鍫曞炊瑜滈弶娲⒑缁嬪簱搴烽柟鍑ゆ嫹  
        }
    })
}

export const acceptInviteService =(Data)=> {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/im/accept_invite', params, {
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備礁鎼ú锔锯偓绗涘啰鏆﹂柛娆忣槺閳绘棃鏌ｉ幋鐏活亝绂嶉崼鏇熺厽闁靛ǹ鍎遍褔鏌熼煬鎻掆偓婵嬪箖瑜忔禒锔炬喆閿濆懍澹曢梺璺ㄥ櫐閹凤拷  
        }
    })
}
export const rejectInviteService =(Data)=> {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/im/reject_invite', params, {
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備礁鎼ú锔锯偓绗涘啰鏆﹂柛娆忣槺閳绘棃鏌ｉ幋鐏活亝绂嶉崼鏇熺厽闁靛ǹ鍎遍褔鏌熼煬鎻掆偓婵嬪箖瑜忔禒锔炬喆閿濆懍澹曢梺璺ㄥ櫐閹凤拷  
        }
    })
}

export const SearchUserService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/user/search', params,{
        headers: {
            'token': Data.token, // 闂佽绻愭蹇涘箯閿燂拷 token 闂備礁鎼ú锔锯偓绗涘啰鏆﹂柛娆忣槺閳绘棃鏌ｉ幋鐏活亝绂嶉崼鏇熺厽闁靛ǹ鍎遍褔鏌熼煬鎻掆偓婵嬪箖瑜忔禒锔炬喆閿濆懍澹曢梺璺ㄥ櫐閹凤拷  
        }
    })
}

export const GetUserStatisticService = (Data) => {
    const params = new URLSearchParams();
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/user/statistic', params,{
        headers: {
            'token': Data.token,   
        }
    })
}


export const getQRService = (qrData) => {
    const params = new URLSearchParams();
    //console.log("qrdata=",qrData);
    for (let key in qrData) {
        params.append(key, qrData[key])
    }
    return request.post('/user/gqr', params)
}

export const genResetPassword = (Data) => {
    const params = new URLSearchParams();
    //console.log("qrdata=",qrData);
    for (let key in Data) {
        params.append(key, Data[key])
    }
    return request.post('/user/reset', params)
}

export const fetchUserData = () => {
    return {
        "list": [
            {
                "id": 1,
                "name": "张三",
                "password": "123",
                "email": "123@qq.com",
                "phone": "12345678944",
                "date": "2024-01-01",
                "role": "管理员"
            },
            {
                "id": 2,
                "name": "李四",
                "password": "123",
                "email": "1234@qq.com",
                "phone": "12345678945",
                "date": "2024-01-01",
                "role": "普通用户"
            }
        ],
        "pageTotal": 2
    }
};