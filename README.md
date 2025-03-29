# 《大学生学业作品AI生成工具》毕业设计前端
## 1.介绍
该项目是大学生学业作品AI生成工具毕业设计前端部分，该项目使用vue,typescript及其它库。实现大学生学业作品AI生成工具项目开发

## 2.功能介绍
### 2.1 基础功能
#### 2.1.1 登录
页面路径
```
sawadmin2\src\views\pages\login.vue
```
* 主要功能
登录，用户输入用户名或邮箱及密码，登录请求后返回的数据处理，成功则保存用户权限、用户token等信息，失败则提示
#### 2.1.2 注册
页面路径
```
sawadmin2\src\views\pages\register.vue
```
* 主要功能
注册，用户输入用户名、邮箱及密码，注册请求后返回的数据处理，成功则保存用户权限、用户token等信息，失败则提示
#### 2.1.3 找回密码
页面路径
```
sawadmin2\src\views\pages\ucenter.vue
```
* 主要功能
个人信息修改、头像修改、密码重置，用户统计信息显示

#### 2.1.4 个人中心
页面路径
```
sawadmin2\src\views\pages\register.vue
```
* 主要功能
注册，用户输入用户名、邮箱及密码，注册请求后返回的数据处理，成功则保存用户权限、用户token等信息，失败则提示

### 2.2 管理员（特有）
#### 2.2.1 用户管理功能
页面路径:
```
awadmin2\src\views\system\user.vue
```
* 主要功能：
对所有注册的用户进行删除、修改信息功能，以及查询（使用id或用户名或邮箱模糊查询）

#### 2.2.2 模型管理功能
页面路径:
```
sawadmin2\src\views\system\manage-model.vue
```
* 主要功能：
对该工程支持的模型进行增删查改，模型目前支持ollama本地、spark api、doubao api三种

#### 2.2.3 功能模型管理
页面路径:
```
sawadmin2\src\views\system\function.vue
```
* 主要功能：
该项目不同功能可以支持的模型的管理（该项目根据功能来选择模型），实现n个功能m个模型之间的任意搭配。

### 2.3 通用用户功能
#### 2.3.1 会话管理
页面路径:
```
sawadmin2\src\views\system\manage-session.vue
```
* 主要功能：
管理用户与人工智能的会话
#### 2.3.2 文件管理
页面路径:
```
sawadmin2\src\views\system\manage-file.vue
```
* 主要功能：
管理用户上传的所有文件。

#### 2.3.3 通用人工智能交互
页面路径:
```
sawadmin2\src\views\system\gen-chat.vue
```
* 主要功能：
用户 与人工智能交互页面，有会话选择，创建新会话，交互的所有对话渲染，目前支持对话消息的复制，对话消息中的代码高亮复制、数学公式渲染、mermaid图的渲染。
#### 2.3.4 提示词生成
页面路径:
```
sawadmin2\src\views\system\gen-prompt.vue
```
* 主要功能：
人工智能将用户的提示词优化或生成提示词。

## 3.技术实现简介


## 4.项目运行、部署
### 4.1 项目运行
需要克隆该项目到新目录，命令行执行:
```
npm install 
npm run dev
```

### 4.2 项目部署
需在该项目构建:
```
npm run build
```
后将项目下的dist目录下的所有文件，复制到域名的目录下。