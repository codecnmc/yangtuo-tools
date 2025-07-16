# 羊驼的工具箱

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

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/a2eac14fe1414a468f5dd76a7e32bdf0~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752733665&x-orig-sign=s4UGIbqpo7Twd7nxq%2FRr5vTqzy4%3D)
### 脚本
1. 桌面工作区 打开脚本控制台窗口

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/091e604a3f674385ba9775f4d561254c~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752733715&x-orig-sign=2wq6F4tS2tUi2M%2Fdh%2FItt1bP%2FWs%3D)

2.启动项添加仅支持exe bat cmd ps1 js(如有node环境) 

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/4cbdc22f98a441a6849c3254ef550d19~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752733853&x-orig-sign=APifAW06TjIhwpL%2Bt5YJ0AX9D0M%3D)

3.文件夹批量识别下面的可启动项

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d8fc1b169f054c8894ab878491c91904~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752733943&x-orig-sign=8ECd5WGZ55hMTfai2LHbPFz5s8o%3D)

4.工作区如有设置快捷键 可快捷键唤出隐藏 并且查看输出日志

双击分组名称即可修改 允许拖拽更换位置

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d203b595a0be457eb853fb76d6caaba6~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752734338&x-orig-sign=HrDQ3wALXR1ytvJrxK6i85w%2FnRQ%3D)

### 文件管理器

1.文件夹管理功能

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/052866a657e94e588cc16a469292deb7~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752734644&x-orig-sign=ClH0VgSkPlAxLy2XenGgGiWCAhc%3D)

2.允许混合添加目录与文件

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/5ccdb23187f24e2ba480c099ae6fc0ed~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752734676&x-orig-sign=AwNmHhRzGtyaK9E%2F%2Fh2NtAniXIQ%3D)

3.桌面工作区 支持快捷键唤出 固定到最上层 双击打开文件 以及 右键菜单功能 (vscode打开 需要设置中 设置浏览器路径) 支持竖排 横排布局 支持拖动换组 更换位置

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/2cb3b9af9116460b9d4e2ecb6866c342~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752734760&x-orig-sign=upMD8GDZM0hUxukSZuYQxAwltTE%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/2c687aa5ba4e4af692d967174aad0b39~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752734809&x-orig-sign=ytwT3eOJ6gR53w9SlCzpedwYl%2BA%3D)

### 设置

1.系统配置

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/66159b2a84474b4aaf700e3b8a35b026~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752734911&x-orig-sign=alrnvbjv%2By0FUBb5LWDwRT10KY8%3D)

2.外观配置

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/1c62b7fc14e7407980940727e143ec7a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg54mb6ams5Zac5Zac:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzkyMTMxOTQ0ODI4NzU2MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1752734941&x-orig-sign=30vq5Vgq4CNZywUyvB%2FNQ%2FlQtT4%3D)

