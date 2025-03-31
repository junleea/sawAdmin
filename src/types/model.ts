export interface Model{
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string;
    Name: string;
    Url: string;
    UserID: number;
    Type: string;
    Parameter: string;
    Description: string;
    token: number; //消耗大模型的token
}

export interface ModelParameter{
    Model: string;
    Url: string;
    APPID: string;
    APIKey: string;
    APISecret: string;
}

export interface ModelContent{
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string;
    Name: string;
    Url: string;
    UserID: number;
    Type: string;
    Parameter: string;
    Description: string;
    token: number; //消耗大模型的token
}