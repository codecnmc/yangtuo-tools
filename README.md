<!--
 * @Author: 羊驼
 * @Date: 2025-08-28 13:52:50
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-28 14:05:53
 * @Description: file content
-->
# 羊驼的工具箱

[项目地址](https://github.com/codecnmc/yangtuo-tools)

推荐使用该版本 并且使用yarn进行安装

node版本:v22.16.0

技术栈：electron + vue3 + vite  + pinia  + vuetify3 + sequelize + sqlite

> Q:为什么vue3要用 vue2的写法 
> 
> A:其实是因为刚开始用vue3的写法感觉超级恶心 对属性的赋值和方法的管理可观性很差 用 options api 好管理  用composition api+hook的形式再去封装属性反而维护起来更难

> Q:为什么不用ts?
> 
> A:sorry 一个人写的东西 用ts反而是束缚

## 注意拉下来的代码 插件部分未安装依赖 请手动安装 插件目录下执行 yarn 或者 npm install

## Todo

 - [ ] 优化插件包体 node_modules问题 看能不能打成一个整体
 - [ ] 开放node_modules共享库 优化多个插件统一依赖重复存在的问题
 - [ ] 快捷插件创建功能
 - [ ] 软件自动更新功能
 - [ ] 插件更新检测功能

## 功能

### 支持自定义开发 内嵌页面 带开发控制台 自定义窗口  无需安装electron依赖 自带数据库支持

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/1355a75064624585bff86fc9f6932de2.png)

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e3fbee20004d4047a853652c14c1f57f.png)
### 支持热键唤醒 搜索栏 快速搜索插件 多语种设置
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/48ea8ef4122b49ff9484970802cb97ab.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e4a32ea12a254034a2d7aa8bbffd0377.png)
## 插件开发

### 示例插件：

 1. [Node版本管理插件](https://github.com/codecnmc/plugin-nvm)  直接在index.html + index.js开发 node_modules 安装依赖
 
 	![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/483f845ab0d84572bb1bb8e4bb090ab8.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e46df5cf85284daa84f94b58a6a044fc.png)

 2. [前端常用工具](https://github.com/codecnmc/plugin-frontend-tools) 豆包编程开发 index.html修改即用 无需任何node_modules 内嵌view页面 
 
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/fcf2a662b83e4c37bc3d3dc491ecf802.png) 
 3. [文件管理器](https://github.com/codecnmc/plugin-file-manager) 内嵌view+创建window 使用数据库 进行文件管理 使用vite开发页面
 ![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/be48681bcee949678423c3ae5503155e.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/63a599bfc28e4dca9e5ffb1aba3dce71.png)

 4. [脚本管理器](https://github.com/codecnmc/plugin-shell) 内嵌view+创建window 使用数据库 进行脚本管理 使用vite开发页面
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/6eaa8463246c49edbf798b3f2d892fed.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/acee378a542c4af2b442148193fb3972.png)

### [插件开发文档](https://github.com/codecnmc/yangtuo-tools/blob/latest/document.md)