require("dotenv").config();
const express =require('express');
//multer處理檔案上傳
const multer = require('multer');
const upload = multer({dest: 'tmp-uploads'});
const app = express();
//設定
app.set("view engine","ejs")
//toplevel mideeleware
//資料進來依照content type去做解析
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//middleware 中介軟體
//urlencoded 生成處理器
//請express 處理post body 資料
// const bodyparser = express.urlencoded({extended:false})
app.post('/try-post', function(req,res){
    res.json(req.body);
})

app.get('/try-qs',function(req,res){
    res.json(req.query);
})
//先設定路徑,再設定方法
app.route('/try-post-form')
    .get((req, res)=>{
        res.render('try-post-form');
    })
    .post((req, res)=>{
        const {email, password} = req.body;
        res.render('try-post-form', {email, password});
    });
//上傳檔案
app.post('/try-upload', upload.single('avatar'), (req, res)=>{
    res.json(req.file);
    });

//use接受各種方式拜訪
app.use(express.static('public'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
//get只接受用戶端用get拜訪
app.get('/',function(req,res){
    res.render("main",{ name:" shinder"});
})
//404頁面放在所有路由設定最後
app.use((req,res)=>{
    res.send(`<h2>找不到頁面 404</h2> <img src="/imgs/pngtree-error-404-page-not-found-png-image_6681621.jpg"alt="" width="300px"  >`);
})

app.listen(process.env.PORT,function(){
    console.log(`server started: ${process.env.PORT}`);
});