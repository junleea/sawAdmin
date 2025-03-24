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
}

export interface ModelParameter{
    Model: string;
    Url: string;
    APPID: string;
    APIKey: string;
    APISecret: string;
}