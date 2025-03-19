
export interface User {
    id: number;
    name: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    date: string;
}

export interface Register {
    username: string;
    password: string;
    email: string;
}

/**
 * 
 *         "ID": 1,
        "CreatedAt": "2024-08-30T14:35:15.556734+08:00",
        "UpdatedAt": "2025-03-11T15:13:27.972681+08:00",
        "DeletedAt": null,
        "Name": "lijun",
        "Age": 24,
        "Email": "lijun@ljsea.top",
        "Password": "",
        "Gender": "男",
        "Role": "admin",
        "Redis": true,
        "Run": true,
        "Upload": true,
        "VideoFunc": true,
        "DeviceFunc": true,
        "CIDFunc": true,
        "Avatar": "https://gep.ljsea.top/tool/file/d5a17d88-1641-4666-a9e1-53fbb04a6abf.jpg",
        "CreateTime": "",
        "UpdateTime": ""
 */
export interface UserInfo {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string;
    Name: string;
    Password: string;
    Age: number;
    Email: string;
    Gender: string;
    Role: string;
    Avatar: string;
}