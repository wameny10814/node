require("dotenv").config();
const express =require('express');

const app = express();
//設定
app.set("view engine","ejs")

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