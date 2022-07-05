require("dotenv").config();
const express = require("express");
//multer處理檔案上傳
const multer = require("multer");
// const upload = multer({dest: 'tmp-uploads'});
const upload = require(__dirname + "/modules/upload-images");
const session = require("express-session");
const moment = require("moment-timezone");
const { toDateString, toDatetimeString } = require(__dirname +
    "/modules/date-tools");
const db = require(__dirname + "/modules/mysql-connect");
const MysqlStore = require("express-mysql-session")(session);
const sessionStore = new MysqlStore({}, db);
const axios = require("axios");
const bcrypt = require('bcryptjs');
const cors =require("cors");
const nodemailer = require('nodemailer');

const app = express();
//設定
app.set("view engine", "ejs");
// app.use(require("cors")());
const corsOptions = {
    credentials: true,
    origin: (origin, cb)=>{
        console.log({origin});
        cb(null, true);
    }
};
app.use(cors(corsOptions));

//toplevel mideeleware
//資料進來依照content type去做解析
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//try nodmailer
//宣告發信物件

// const transporter = nodemailer.createTransport({
//     service: 'OAuth2',
//     auth: {
//         user: 'sunnymail0705@gmail.com',
//         pass: 'earningto666'
//     }
// });

const transporter = nodemailer.createTransport({
    host: 'sunnymail0705@gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.ACCOUNT,
      clientId: process.env.CLINENTID,
      clientSecret: process.env.CLINENTSECRET,
      refreshToken: process.env.REFRESHTOKEN,
      accessToken: process.env.ACCESSTOKEN,
    }
  });

var options = {
    //寄件者
    from: 'sunnymail0705@gmail.com',
    //收件者
    to: 'wameny10814@gmail.com', 
    //副本
    // cc: 'account3@gmail.com',
    //密件副本
    // bcc: 'account4@gmail.com',
    //主旨
    subject: '這是 node.js 發送的測試信件', // Subject line
    //純文字
    text: 'Hello world2', // plaintext body
    //嵌入 html 的內文
    html: '<h2>Why and How</h2> <p>The <a href="http://en.wikipedia.org/wiki/Lorem_ipsum" title="Lorem ipsum - Wikipedia, the free encyclopedia">Lorem ipsum</a> text is typically composed of pseudo-Latin words. It is commonly used as placeholder text to examine or demonstrate the visual effects of various graphic design. Since the text itself is meaningless, the viewers are therefore able to focus on the overall layout without being attracted to the text.</p>', 
    //附件檔案
  
};


transporter.sendMail(options, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('訊息發送: ' + info.response);
    }
});

//session設定
app.use(
    session({
        saveUninitialized: false,
        resave: false,
        secret: "dkfdl85493igdfigj945739gfdgdfgdg4573irherer",
        store: sessionStore,
        cookie: {
            maxAge: 1200000, //存活時間
        },
    })
);

app.use((req, res, next) => {
    // res.locals.shinder = '哈囉';

    // template helper functions
    res.locals.toDateString = toDateString;
    res.locals.toDatetimeString = toDatetimeString;
    res.locals.session = req.session; //req session 設定進locals session 給前端使用
    next();
});

app.get("/yahoo", async (req, res) => {
    axios.get("https://tw.yahoo.com/").then(function (response) {
        // handle success
        console.log(response);
        res.send(response.data);
    });
});

//會員登入 使用bcryptjs加密
app.route('/login')
    .get(async (req, res)=>{
        res.render('login');
    })
    .post(async (req, res)=>{
        const output = {
            success: false,
            error: '',
            code: 0,
        };
        const sql = "SELECT * FROM admin WHERE account=?";
        const [r1] = await db.query(sql, [req.body.account]);

        if(! r1.length){
            // 帳號錯誤
            output.code = 401;
            output.error = '帳密錯誤'
            return res.json(output)
        }
        //const row = r1[0];

        output.success = await bcrypt.compare(req.body.password, r1[0].pass_hash);
        console.log(await bcrypt.compare(req.body.password, r1[0].pass_hash));
        if(! output.success){
            // 密碼錯誤
            output.code = 402;
            output.error = '帳密錯誤'
        }else {
            //帳密正確req 放進session
            req.session.admin = {
                sid: r1[0].sid,
                account: r1[0].account,
            };
        }


        res.json(output);
    });

//會員登出
//刪除locals session admin
app.get("/logout", (req, res) => {
    delete req.session.admin;
    res.redirect("/");
});

//middleware 中介軟體
//urlencoded 生成處理器
//請express 處理post body 資料
// const bodyparser = express.urlencoded({extended:false})
app.post("/try-post", function (req, res) {
    res.json(req.body);
});

app.get("/try-qs", function (req, res) {
    res.json(req.query);
});
//先設定路徑,再設定方法
app.route("/try-post-form")
    .get((req, res) => {
        res.render("try-post-form");
    })
    .post((req, res) => {
        const { email, password } = req.body;
        res.render("try-post-form", { email, password });
    });
//上傳檔案-單張
app.post("/try-upload", upload.single("avatar"), (req, res) => {
    res.json(req.file);
});
//上傳檔案-多張
app.post("/try-uploads", upload.array("photos"), (req, res) => {
    res.json(req.files);
});

//url以參數params設定
//定義越寬鬆放後面,越精確specific越前面
app.get("/try-params1/:action/:id?", (req, res) => {
    res.json({ code: 2, params: req.params });
});
app.get("/try-params1/:action", (req, res) => {
    res.json({ code: 3, params: req.params });
});
app.get("/try-params1/:action?/:id?", (req, res) => {
    res.json({ code: 1, params: req.params });
});
//使用regular expression設定url
app.get(/^\/hi\/?/i, (req, res) => {
    res.send({ url: req.url });
});
//複數路由進到同一個處理器的場合
app.get(["/aaa", "/bbb"], (req, res) => {
    res.send({ url: req.url, code: "array" });
});

app.get("/try-json", (req, res) => {
    const data = require(__dirname + "/data/data01");
    console.log(data);
    // res.json(data);
    res.locals.rows = data;
    res.render("try-json");
});

app.get("/try-moment", (req, res) => {
    const fm = "YYYY-MM-DD HH:mm:ss";
    const m1 = moment();
    const m2 = moment("2022-02-28");

    res.json({
        m1: m1.format(fm),
        m1a: m1.tz("Europe/London").format(fm),
        m2: m2.format(fm),
        m2a: m2.tz("Europe/London").format(fm),
    });
});

//路由模組化
const adminsRouter = require(__dirname + "/routes/admins");
// prefix 前綴路徑
app.use("/admins", adminsRouter);
app.use(adminsRouter);

//測試session
app.get("/try-session", (req, res) => {
    //my_var為變數 不要設定為cookie
    req.session.my_var = req.session.my_var || 0;
    req.session.my_var++;
    res.json({
        my_var: req.session.my_var,
        session: req.session,
    });
});

app.use("/admins", require(__dirname + "/routes/admins"));

//use接受各種方式拜訪
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
app.use("/joi", express.static("node_modules/joi/dist"));
//routers address-book
app.use("/address-book", require(__dirname + "/routes/address-book"));
app.use('/carts', require(__dirname + '/routes/carts'));

//get只接受用戶端用get拜訪
app.get("/", function (req, res) {
    res.render("main", { name: " shinder" });
});
//404頁面放在所有路由設定最後
app.use((req, res) => {
    res.send(
        `<h2>找不到頁面 404</h2> <img src="/imgs/pngtree-error-404-page-not-found-png-image_6681621.jpg"alt="" width="300px"  >`
    );
});

app.listen(process.env.PORT, function () {
    console.log(`server started: ${process.env.PORT}`);
});
