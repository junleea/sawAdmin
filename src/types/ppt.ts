

// 创建大纲响应内容
export interface SparkCreateOutlineResponse {
    flag: boolean;
    code: number;
    desc: string;
    count: number;
    data: SparkCreateOutlineResponseData;
}

// Data 定义响应中 data 字段的结构体
export interface SparkCreateOutlineResponseData {
    sid: string;
    outline: SparkCreateOutlineResponseOutline;
}

// Outline 定义大纲数据的结构体
export interface SparkCreateOutlineResponseOutline {
    title: string;
    subTitle: string;
    chapters: SparkCreateOutlineResponseChapter[];
}

// Chapter 定义章节数据的结构体
export interface SparkCreateOutlineResponseChapter {
    chapterTitle: string;
    chapterContents: SparkCreateOutlineResponseChapterContent[];
}

// 由于原代码中未定义 SparkCreateOutlineResponseChapterContent，这里假设一个简单结构
export interface SparkCreateOutlineResponseChapterContent {
    chapterTitle: string;
}
    

// SparkCreatePPTResponse 定义对应 JSON 数据的外层结构体
export interface SparkCreatePPTResponse {
    flag: boolean;
    code: number;
    desc: string;
    count: any;
    data: SparkCreatePPTData;
}

// SparkCreatePPTData 定义 JSON 中 data 字段对应的结构体
export interface SparkCreatePPTData {
    sid: string;
    coverImgSrc: string;
    title: string;
    subTitle: string;
    outline: any;
}    


// SparkCreatePPTByOutlineResponse 定义对应 JSON 数据的外层结构体
export interface SparkCreatePPTByOutlineResponse {
    flag: boolean;
    code: number;
    desc: string;
    count: any;
    data: SparkCreatePPTByOutlineData;
}

// SparkCreatePPTByOutlineData 定义 JSON 中 data 字段对应的结构体
export interface SparkCreatePPTByOutlineData {
    pptStatus: string;
    aiImageStatus: string;
    cardNoteStatus: string;
    pptUrl: string;
    errMsg: any;
    totalPages: number;
    donePages: number;
}    

export interface SparkCreateOutlineRequest {
    function: string; // 功能
    query: string; // 查询内容
    fileUrl: string; // 文件url
    fileName: string; // 文件名
}