import { defineStore } from "pinia";

interface ObjectList {
  [key: string]: string[];
}

export const usePermissStore = defineStore("permiss", {
  state: () => {
    const keys = localStorage.getItem("ms_keys");
    return {
      key: keys ? JSON.parse(keys) : <string[]>[],
      defaultList: <ObjectList>{
        admin: [
          "0",
          "1", //系统管理
          "11", //用户管理
          "12",
          "13",
          // "2",  //组件
          // "21",
          // "22",
          // "23",
          // "24",
          // "25",
          // "26",
          // "27",
          // "28",
          // "29",
          // "291",
          // "292",
          // "3",  //表格
          // "31",
          // "32",
          // "33",
          // "34",
          // "4",  //图表
          // "41",
          // "42",
           // "5",  //图标
          "7",  //主题
          "6",  //附加页面
          "8", //个人中心
          "61",
          "62",
          "63",
          "64",
          "65",
          "66",
          "9",
          "51", //会话管理
          "52", //模型管理
          "53", //通用人机对话
          "54", //功能管理
          "55", //提示词生成
          "56", //文件管理
          "57", //智能ppt生成
          "58", //知识库管理
          "71", //用户功能管理
        ],
        user: ["0", "8", "7", "9",  "51" ,"53","55" ,"56", "57", "58", "61", "71"],
      },
    };
  },
  actions: {
    handleSet(val: string[]) {
      this.key = val;
    },
  },
});
