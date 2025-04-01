
export interface WSMessage {
    type: string;
    msg: AIQMessage;
    session_id: number;
    to_id: number;
}

export interface AIQMessage {
    type: string;
    id: number;
    msg: OllamaMessage;
}

export interface OllamaMessage {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    done_reason: string;
    //int数组
    context:  number[];
}

export interface OllamaRequest {
    model: string;
    request: string;
    system: string;
    prompt: string;
    context: number[];
}

// "ID": 488,
// "CreatedAt": "2025-04-01T13:52:56.887+08:00",
// "UpdatedAt": "2025-04-01T13:52:56.887+08:00",
// "DeletedAt": null,
// "Type": 3,
// "SessionID": 178,
// "FromID": 1,
// "ToID": 11,
// "Msg": "图片主要讲了什么",
// "FunctionID": 2,
// "Status": 3
export interface GenMessage {
    ID : number;
    CreatedAt : string;
    UpdatedAt : string;
    DeletedAt : string;
    Type : number;
    SessionID : number;
    FromID : number;
    ToID : number;
    Msg : string;
    FunctionID : number;
    Status : number;
}