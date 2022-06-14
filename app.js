import axios from "axios";
import qs from "qs";
import xmlJs from "xml-js";
import iconv from "iconv-lite";
import * as cheerio from 'cheerio';

axios.defaults.timeout = 10000;//设置超时时间，单位毫秒
axios.defaults.retry = 3; //设置全局请求次数
axios.defaults.retryDelay = 1000;//设置全局请求间隙

// 填写server酱sckey,不开启server酱则不用填
const sckey = process.env["SCKEY"];

// 填写pushplus的token,不开启pushplus则不用填
const token = process.env["PPTOKEN"];

// 填写PushDeer的key, 不开启不用填
const pushDeer = process.env["PDKEY"]

// 填写Bark的key, 不开启不用填
const barkKey = process.env["BARKKEY"]

// 填写Bark的服务器地址, 不开启不用填
const barkServer = process.env["BARKSERVER"]

//配置需要打开的服务信息,hao4k 和 4ksj，未配置只对hao4k
const needCheckHost = process.env["CHECKHOST"]

// 填入Hao4k账号对应cookie
const cookie = process.env["COOKIE"];

const sjUrl =
    "https://www.4ksj.com/qiandao/";
const hao4kUrl =
    "https://www.hao4k.cn/qiandao/";

const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36 Edg/99.0.1150.39";

const headers = {
    cookie: cookie ?? "",
    "User-Agent": userAgent,
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
};

class HostInfo {
    name;
    url;
    status;
    formHash;
    message;

    constructor(name, url) {
        this.name = name;
        this.url = url;
    }
}

async function getFormHash(host) {
    await axios
        .get(host.url, {
            headers,
            responseType: "arraybuffer",
        })
        .then(async (response) => {
            const gb = iconv.decode(response.data, "gb2312");
            const $ = cheerio.load(gb);
            let formHash = '';
            const userName = $('#mumucms_username').text();
            if (userName === '') {
                console.log("cookie失效！");
                host.status = false;
                host.message = "cookie失效！";
            } else {
                console.log(host.name, "获取用户信息成功！");
                formHash = $('#scbar_form input').eq(1).val();
                host.status = true;
                host.formHash = formHash;
                await checkin(host);
            }
        })
        .catch((error) => {
            host.status = false;
            host.message = "获取formhash出错" + error;
            console.log(host.name, error);
        });
}

async function checkin(host) {
    const checkInUrl =
        host.url + "?mod=sign&operation=qiandao&formhash=" + host.formHash + "&format=empty&inajax=1&ajaxtarget=";
    await axios
        .get(checkInUrl, {
            headers,
            responseType: "arraybuffer",
        })
        .then(async (response) => {
            const resUtf8 = iconv.decode(response.data, "GBK");
            const dataStr = xmlJs.xml2json(resUtf8, {
                compact: true,
                spaces: 4,
            });
            const data = JSON.parse(dataStr);
            const content = data?.root?._cdata;

            if (content) {
                host.status = true;
                if (content === "今日已签") {
                    host.message = "今日已签！";
                }
            } else {
                host.message = "签到成功!";
            }
            await getCheckinInfo(host);
        })
        .catch((error) => {
            console.log(host.name, "签到出错或超时" + error);
            host.status = false;
            host.message = "签到出错或超时" + error;
        });
}

async function getCheckinInfo(host) {
    await axios
        .get(host.url, {
            headers,
            responseType: "arraybuffer",
        })
        .then((response) => {
            const gb = iconv.decode(response.data, "gb2312");
            const $ = cheerio.load(gb);
            let days = $('#lxdays').val(); //连续签到天数
            let reward = $('#lxreward').val(); // 签到奖励
            let allDays = $('#lxtdays').val(); // 签到总天数
            let rank = $('#qiandaobtnnum').val();// 签到排名
            let info = " 本次签到奖励： " + reward + " 个币； 已连续签到： " + days + " 天; 今日排名： " + rank + " 位； 签到总天数： " + allDays + " 天；";
            host.message = host.message + info;
            console.log(host.name, info)
        })
        .catch((error) => {
            host.message = "获取签到信息出错！" + error;
            console.log(host.name, "获取签到信息出错！" + error);
        });
}

function pushNotice(status, message) {
    console.log("开始推送消息")
    if (sckey) {
        console.log("通过server酱推送消息");
        sendSCMsg(status, message);
    }
    if (token) {
        console.log("通过pushPlus推送消息");
        sendPushPlusMsg(status, message);
    }
    if (pushDeer) {
        console.log("通过pushDeer推送消息");
        sendPushDeerMsg(status, message);
    }
    if (barkKey) {
        console.log("通过bark推送消息");
        sendBarkMsg(status, message);
    }
    console.log("结束推送消息")
}

function sendSCMsg(status, info) {
    let serverUrl = "https://sctapi.ftqq.com/" + sckey + ".send";
    axios.post(serverUrl, qs.stringify({
        "title": status,
        "desp": info
    }))
        .catch((e) => {
            console.log(e);
        })
}

function sendPushPlusMsg(status, info) {
    axios
        .post("http://www.pushplus.plus/send", {
            'token': token,
            'title': status,
            'content': info
        })
        .catch((e) => {
            console.log(e);
        });
}

function sendPushDeerMsg(status, info) {
    let message = status + info;
    axios
        .post("https://api2.pushdeer.com/message/push", {
            'pushkey': pushDeer,
            'type': 'text',
            'text': message
        })
        .catch((e) => {
            console.log(e);
        });
}

function sendBarkMsg(status, info) {
    let title = encodeURI(status);
    let message = encodeURI(info);
    let barkRealServer = barkServer ? barkServer : "https://api.day.app";
    let barkUrl = barkRealServer + "/" + barkKey + "/" + title + "/" + message;
    axios
        .get(barkUrl)
        .catch((e) => {
            console.log(e);
        })
}

async function start() {
    let status = "未配置";
    let message = "未配置";
    let checkIn = false;
    console.log("配置的打卡的服务", needCheckHost);
    const needCheck = needCheckHost ? needCheckHost : "hao4k";
    if (needCheck.indexOf("4ksj") > -1) {
        if (!checkIn) {
            checkIn = true;
            status = "";
            message = "";
        }
        let sj = new HostInfo("4K视界", sjUrl);
        await getFormHash(sj);
        status += sj.name + ": ";
        if (sj.status) {
            status += "签到成功！";
        } else {
            status += "签到失败！";
        }
        message += "* " + sj.name + ": " + sj.message;
    }
    if (needCheck.indexOf("hao4k") > -1) {
        if (!checkIn) {
            checkIn = true;
            status = "";
            message = "";
        }
        let hao4k = new HostInfo("hao4K", hao4kUrl);
        await getFormHash(hao4k);
        status += hao4k.name + ": ";
        if (hao4k.status) {
            status += "签到成功！";
        } else {
            status += "签到失败！";
        }
        message += "* " + hao4k.name + ": " + hao4k.message;
    }
    console.log(status, message);
    pushNotice(status, message);
}

await start()