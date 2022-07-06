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

app.use('/member', require(__dirname + '/routes/member'));

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