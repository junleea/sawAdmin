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
          "2",
          "21",
          "22",
          "23",
          "24",
          "25",
          "26",
          "27",
          "28",
          "29",
          "291",
          "292",
          "3",
          "31",
          "32",
          "33",
          "34",
          "4",
          "41",
          "42",
          "5",
          "7",
          "6",
          "8",
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
          "71", //用户功能管理
        ],
        user: ["0", "71", "8", "7", "9", "61", "53", "51", "56"],
      },
    };
  },
  actions: {
    handleSet(val: string[]) {
      this.key = val;
    },
  },
});
