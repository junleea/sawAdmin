export interface Function{
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string;
    Name: string;
    Info: string;
    UserID: number;
    ModelID: number | Object | Array<any>;
    ModelIDS: string| Object | Array<any> | any;
    Function: string;
}