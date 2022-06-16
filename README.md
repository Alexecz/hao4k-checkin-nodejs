# hao4k-checkin-nodejs
![签到](https://github.com/Alexecz/hao4k-checkin-nodejs/actions/workflows/checkin.yml/badge.svg)

### 改进原作者的签到 
1、修复签到失败。

2、优化判断cookie是否生效

3、新增签到结果的提示和推送。

4、新增2个推送平台。

5、增加4k视界打卡支持，通过CHECKHOST配置

6、增加独立设置Hao4K和4K视界的cookie。


原作者地址：https://github.com/ming917/hao4K-checkin


### 建议提取 cookie 用该浏览器插件复制  把cookie列表勾上 然后点cookie列表 直接点copy all  （自己复制cookie会有问题！）
https://chrome.google.com/webstore/detail/header-cookie-qrcode/echlhpliefhchnkmiomfpdnehakfmpfl/related?hl=zh-CN


#### 脚本功能：

1、通过Github Action自动定时运行 app.js 脚本。

2、通过cookies自动登录（[https://www.hao4k.cn/](https://www.hao4k.cn/))，脚本会自动进行checkin。

3、可以通过“推送加” （[http://www.pushplus.plus](http://www.pushplus.plus))，自动发通知到微信上。

4、可以通过“PushDeer” （[http://www.pushdeer.com](http://www.pushdeer.com))，自动推送到**手机通知**上。 请使用**官方在线版**。 （推荐**IOS**使用！**无需下载APP**）

5、可以通过“Server酱”（[http://sc.ftqq.com/3.version](http://sc.ftqq.com/3.version))，自动发通知到微信上。(不建议使用Server酱)

6、可以通过“bark”（[https://github.com/Finb/Bark](https://github.com/Finb/Bark))，自动发通知到ios上。

7、通过Secrets配置需要进行打卡的服务信息，支持hao4k和4k视界，如果需要同时打卡使用逗号分隔


#### 食用姿势：

1. 先“Fork”本仓库。（不需要修改任何文件！）

2. 注册hao4K

3. 登录hao4K后获取cookies。（简单获取方法：浏览器快捷键F12，打开调试窗口，点击“network”随便一个接口的请求头中获取）。cookie示例需要的关键信息：HxHg_2132_saltkey=xxx;HxHg_2132_auth=xxx; 也可用浏览器插件直接获取。

4. 在自己的仓库“Settings”里根据需要创建“Secrets => Actions => New repository secret”，分别是：（不开启通知，只需要创建一个COOKIE即可）

   - COOKIE （**必填**； **填写Hao4K的cookie**）
   - 4KSJCOOKIE （**选填**； **填写4K视界的cookie**；不设置会尝试用Hao4K的cookie签到）
   - PPTOKEN （填写推送加的token, 不开启不用填）
   - PDKEY （填写PushDeer的key, 不开启不用填）
   - SCKEY （填写server酱sckey，不开启server酱则不用填）
   - BARKKEY (填写bark的key，不开启bark推送则不用填，默认使用官方服务器发送，如需自定义请通过BARKSERVER配置)
   - BARKSERVER (填写bark的服务器地址，不开启bark推送则不用填)
   - CHECKHOST (填写需要进行打卡的服务，hao4k,4ksj，未配置默认只打卡hao4k)

5. 以上设置完毕后，每天零点会自动触发，并会执行自动签到（0点有失败率，后期可能会改为1点）。

6. **如果以上都不会的话，注册hao4K后，每天勤奋点记得登录后手动进行签到即可。**

