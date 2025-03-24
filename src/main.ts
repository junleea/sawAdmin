import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { usePermissStore } from './store/permiss';
import globalData  from '@/utils/global'
import 'element-plus/dist/index.css';
import './assets/css/icon.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css' //样式



const app = createApp(App);
app.use(createPinia());
app.provide('globalData',globalData);
app.use(router);
//创建v-highlight全局指
app.directive('highlight',function (el) {
    let blocks = el.querySelectorAll('pre code');
    blocks.forEach((block)=>{
      hljs.highlightBlock(block)
    })
  })


// 注册elementplus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
// 自定义权限指令
const permiss = usePermissStore();
app.directive('permiss', {
    mounted(el, binding) {
        if (binding.value && !permiss.key.includes(String(binding.value))) {
            el['hidden'] = true;
        }
    },
});

app.mount('#app');
