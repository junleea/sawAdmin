import axios from "axios";
import router from "@/router/index.js";
import { ElMessage } from 'element-plus';
//const baseURL = "https://gep.ljsea.top/";
const baseURL = "https://tx.ljsea.top/";
//const baseURL= "http://localhost:8083";
//const baseURL="https://pm.ljsea.top";
//const baseURL = "https://gep.ljsea.xyz/";
const request = axios.create({
  baseURL: baseURL,
});

request.interceptors.response.use(
    result => {
        if(result.status!==200 ){
            router.push("/login")
        }
        if(result.data.message==="NOT_LOGIN"|| [2, 3, 4].includes(result.data.code)){
            //alert("登录失效，请重新登录！")
            ElMessage.error('登录失效，请重新登录！');
            localStorage.removeItem("token");
            router.push("/login")
            return
        }
        if(result.data.code == 7){
            //alert("该用户已存在，请重新输入！");
            ElMessage.error('该用户已存在，请重新输入！');
            return null
        }

        if(result.data.code == 1){
            //alert("请求失败，请稍后重试！");
            ElMessage.error('请求失败，请稍后重试！');
        }else{
            return result.data
        }
    },
    error => {
        //alert("请求失败，请稍后重试！");
        ElMessage.error('请求失败，请稍后重试！');
      return Promise.reject(error);
    }
)
request.interceptors.request.use(

)
export default request;