import axios from "axios";
import xmlJs from "xml-js";
import iconv from "iconv-lite";
import * as cheerio from 'cheerio';

// 填写server酱sckey,不开启server酱则不用填
const sckey = process.env["SCKEY"];

// 填入glados账号对应cookie
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
      if (userName == '') {
        console.log("cookie失效！");
        let message = "cookie失效！";
        pushNotice(message);
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
    "https://www.hao4k.cn//qiandao/?mod=sign&operation=qiandao&formhash="+ formHash +"&format=empty&inajax=1&ajaxtarget=";
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
      console.log(data);
      const content = data?.root?._cdata;
      let message = "";
      if (content) {
        if (content === "今日已签") {
          message = "hao4K:今日已签";
          console.log(message);
        }
      } else {
        message = "hao4K:签到成功!";
        console.log(message);
      }

      // 解决 Request path contains unescaped characters
      message = encodeURI(message);
      pushNotice(message)
    })
    .catch((error) => {
      console.log("hao4K:签到出错或超时" + error);
      message = "hao4K:签到出错或超时" + error;
      message = encodeURI(message);
      pushNotice(message);
    });
}

function pushNotice(message) {
  if (sckey) {
    axios
      .get("https://sc.ftqq.com/" + sckey + ".send?text=" + message)
      // 解决 UnhandledPromiseRejectionWarning
      .catch((e) => {
        console.log(e);
      });
  }
}


getFormHash();