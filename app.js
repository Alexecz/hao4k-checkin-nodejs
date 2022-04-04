import axios from "axios";
import qs from "qs";
import xmlJs from "xml-js";
import iconv from "iconv-lite";
import * as cheerio from 'cheerio';

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

// 填入Hao4k账号对应cookie
const cookie = process.env["COOKIE"];

const loginUrl =
    "https://www.hao4k.cn/qiandao/";

const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36 Edg/99.0.1150.39";

const headers = {
    cookie: cookie ?? "",
    "User-Agent": userAgent,
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
};

function getFormHash() {
    axios
        .get(loginUrl, {
            headers,
            responseType: "arraybuffer",
        })
        .then((response) => {
            const gb = iconv.decode(response.data, "gb2312");
            const $ = cheerio.load(gb);
            let formHash = '';
            // console.log($.html())
            const userName = $('#mumucms_username').text();
            if (userName === '') {
                console.log("cookie失效！");
                let message = "cookie失效！";
                pushNotice(message, message);
            } else {
                console.log("获取用户信息成功！")
                formHash = $('#scbar_form input').eq(1).val();
                checkin(formHash);
            }
        })
        .catch((error) => {
            console.log("hao4K:获取formhash出错" + error);
        });
}

function checkin(formHash) {
    const checkInUrl =
        "https://www.hao4k.cn//qiandao/?mod=sign&operation=qiandao&formhash=" + formHash + "&format=empty&inajax=1&ajaxtarget=";
    let message = "";
    axios
        .get(checkInUrl, {
            headers,
            responseType: "arraybuffer",
        })
        .then((response) => {
            const resUtf8 = iconv.decode(response.data, "GBK");
            const dataStr = xmlJs.xml2json(resUtf8, {
                compact: true,
                spaces: 4,
            });
            const data = JSON.parse(dataStr);
            const content = data?.root?._cdata;

            if (content) {
                if (content === "今日已签") {
                    message = "hao4K:今日已签！";
                    getCheckinInfo(message)
                }
            } else {
                message = "hao4K:签到成功!";
                getCheckinInfo(message)
            }

            // 解决 Request path contains unescaped characters
            // message = encodeURI(message);
            // pushNotice(message)
        })
        .catch((error) => {
            console.log("hao4K:签到出错或超时" + error);
            message = "hao4K:签到出错或超时" + error;
            pushNotice(message, message);
        });
}

function getCheckinInfo(status) {
    axios
        .get(loginUrl, {
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
            let info = " 本次签到K币奖励： " + reward + " 个； 已连续签到： " + days + " 天; 今日排名： " + rank + " 位； 签到总天数： " + allDays + " 天；";
            let message = status + info;
            console.log(message)
            pushNotice(status, info);
        })
        .catch((error) => {
            console.log("hao4K:获取签到信息出错！" + error);
        });
}

function pushNotice(status, info) {
    if (sckey) {
        sendSCMsg(status, info);
    }
    if (token) {
        sendPushPlusMsg(status, info);
    }
    if (pushDeer) {
        sendPushDeerMsg(status, info);
    }
    if (barkKey) {
        sendBarkMsg(status, info);
    }
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
    console.log(barkUrl);
    axios
        .get(barkUrl)
        .catch((e) => {
            console.log(e);
        })
}

getFormHash();