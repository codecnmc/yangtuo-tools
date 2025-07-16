
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

## 功能

### 主页功能

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/6c872c730338436994a370ce96d2aac1.png)

### 脚本
1. 桌面工作区 打开脚本控制台窗口

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/1635f538e1ec49579400f0f54a92a647.png)


2.启动项添加仅支持exe bat cmd ps1 js(如有node环境) 

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/3b77b5ef53c14eafadf3bffb57347f13.png)

3.文件夹批量识别下面的可启动项

4.工作区如有设置快捷键 可快捷键唤出隐藏 并且查看输出日志

双击分组名称即可修改 允许拖拽更换位置
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e484775f0a3e4cedbdb6e4f8aa60ffd4.png)


### 文件管理器

1.文件夹管理功能
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/3675659818ca4b57b54bc2271593de84.png)
2.允许混合添加目录与文件
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/2e12ba4230174eb1b0516dc21100b39d.png)



3.桌面工作区 支持快捷键唤出 固定到最上层 双击打开文件 以及 右键菜单功能 (vscode打开 需要设置中 设置浏览器路径) 支持竖排 横排布局 支持拖动换组 更换位置

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/6bdff40453174ed687acc1b6e9317add.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/501fc9901f9948d9b3e343f637f9ba2c.png)

### 设置

1.系统配置

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/32d6a03c78bb45bcbea4bf36bc506684.png)


2.外观配置

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/8fd95c993f8445819659388ac9b38fe0.png)
