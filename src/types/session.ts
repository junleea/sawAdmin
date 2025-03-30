export interface Session {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string;
    MsgCount: number;
    Countext: any;
    Name: string;
    UserID: number;
    TokenUsage: number; //消耗大模型的token
}