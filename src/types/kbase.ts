export interface KBase {
    ID: number;
    Name: string;
    Description: string;
    UUID: string;
    SessionID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string;
    AuthID: number;
    FileNameList: string;
    FileIDs: string | Object | Array<any> | any;
}