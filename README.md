改进原作者的签到 
1、增加动态获取formhash （每个人的formhash不同）
2、优化判断cookie是否生效

原作者地址：https://github.com/ming917/hao4K-checkin


### 建议 cookie 用该浏览器插件直接复制   直接点copy all
https://chrome.google.com/webstore/detail/header-cookie-qrcode/echlhpliefhchnkmiomfpdnehakfmpfl/related?hl=zh-CN

### 高能预警~

hao4K自动签到来啦！！！

#### 脚本功能：

1、通过Github Action自动定时运行 app.js 脚本。

2、通过cookies自动登录（[https://www.hao4k.cn/](https://www.hao4k.cn/))，脚本会自动进行checkin。

3、然后通过“Server酱”（[http://sc.ftqq.com/3.version](http://sc.ftqq.com/3.version))，自动发通知到微信上。



#### 食用姿势：

1. 先“Fork”本仓库。（不需要修改任何文件！）

2. 注册hao4K

3. 登录hao4K后获取cookies。（简单获取方法：浏览器快捷键F12，打开调试窗口，点击“network”随便一个接口的请求头中获取）。cookie示例需要的关键信息：HxHg_2132_saltkey=xxx;HxHg_2132_auth=xxx;

4. 在自己的仓库“Settings”里创建3个“Secrets => Actions => New repository secret”，分别是：（不开启通知，只需要创建一个COOKIE即可）

   - COOKIE（**必填**）
   - SERVE（server酱开关，默认是off，填on的话，会同时开启cookie失效通知和签到成功通知）
   - SCKEY（填写server酱sckey，不开启server酱则不用填）

5. 以上设置完毕后，每天零点会自动触发，并会执行自动checkin，如果开启server酱，会自动发通知到微信上。

6. **如果以上都不会的话，注册hao4K后，每天勤奋点记得登录后手动进行checkin即可。**

