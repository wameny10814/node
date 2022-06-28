require("dotenv").config();
const express = require("express");
//multer處理檔案上傳
const multer = require("multer");
// const upload = multer({dest: 'tmp-uploads'});
const upload = require(__dirname + "/modules/upload-images");
const session = require('express-session');
const moment = require('moment-timezone');

const db = require(__dirname + '/modules/mysql-connect');
const MysqlStore = require('express-mysql-session')(session);
const sessionStore = new MysqlStore({}, db);

const app = express();
//設定
app.set("view engine", "ejs");
//toplevel mideeleware
//資料進來依照content type去做解析
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next)=>{
    res.locals.shinder = '哈囉';
    next();
});
//session設定
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'dkfdl85493igdfigj945739gfdgdfgdg4573irherer',
    store: sessionStore,
    cookie:{
        maxAge:1200000,//存活時間
    }
}));

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
app.post("/try-uploads", upload.array('photos'), (req, res) => {
    res.json(req.files);
});

//url以參數params設定
//定義越寬鬆放後面,越精確specific越前面
app.get('/try-params1/:action/:id?', (req, res)=>{
    res.json({code:2, params: req.params});
})
app.get('/try-params1/:action', (req, res)=>{
    res.json({code:3, params: req.params});
})
app.get('/try-params1/:action?/:id?', (req, res)=>{
    res.json({code:1, params: req.params});
});
//使用regular expression設定url
app.get(/^\/hi\/?/i, (req, res)=>{
    res.send({url: req.url});
});
//複數路由進到同一個處理器的場合
app.get(['/aaa', '/bbb'], (req, res)=>{
    res.send({url: req.url, code:'array'});
});


app.get('/try-json', (req, res)=>{
    const data = require(__dirname + '/data/data01');
    console.log(data);
    // res.json(data);
    res.locals.rows = data;
    res.render('try-json');
});


app.get('/try-moment', (req, res)=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const m1 = moment();
    const m2 = moment('2022-02-28');

    res.json({
        m1: m1.format(fm),
        m1a: m1.tz('Europe/London').format(fm),
        m2: m2.format(fm),
        m2a: m2.tz('Europe/London').format(fm),
    })
});

//路由模組化
const adminsRouter = require(__dirname + '/routes/admins');
// prefix 前綴路徑
app.use('/admins', adminsRouter);
app.use(adminsRouter);

//測試session
app.get('/try-session', (req, res)=>{
    //my_var為變數 不要設定為cookie
    req.session.my_var = req.session.my_var || 0;
    req.session.my_var++;
    res.json({
        my_var: req.session.my_var,
        session: req.session,
    });
})


app.use('/admins', require(__dirname + '/routes/admins'));

//use接受各種方式拜訪
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
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
