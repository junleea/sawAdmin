export interface File {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string;
    UserFileName: string;
    UploadType: string;
    IsPrivate: boolean;
    file_store_name: string;
}

export const fileUrl ="https://pm.ljsea.top/tool/file/";