const express = require('express');
const db = require(__dirname + '/../modules/mysql-connect');
const {
    toDateString,
    toDatetimeString,
} = require(__dirname + '/../modules/date-tools');
const moment = require('moment-timezone');
const Joi = require('joi');
const upload = require(__dirname + '/../modules/upload-images')

const router = express.Router(); // 建立 router 物件



//r
router.get('/member_add', async (req, res)=>{
    // if(! req.session.admin){
    //     return res.redirect('/');
    // }
    res.render('member/member_add');
});



router.get('/r3/:action?/:id?', (req, res)=>{
    res.json({
        url: req.url,
        params: req.params,
        code: 'member.js',
    });
});
//c
router.post('/member_add', upload.none(), async (req, res)=>{
    if(! req.session.admin){
        return res.redirect('/');
    }
    const schema = Joi.object({
        name: Joi.string()
            .min(3)
            .required()
            .label('姓名必填'),
        email: Joi.string()
            .email()
            .required(),
        mobile: Joi.string(),
        birthday: Joi.any(),
        address: Joi.string(),
    });
    console.log( schema.validate(req.body, {abortEarly: false}) );
    /*
    const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())";
    const {name, email, mobile, birthday, address} = req.body;
    const [result] = await db.query(sql, [name, email, mobile, birthday, address]);

    // {"fieldCount":0,"affectedRows":1,"insertId":1113,"info":"","serverStatus":2,"warningStatus":0}
    res.json(result);
    */
    const sql = "INSERT INTO `address_book` SET ?";
    const birthday = req.body.birthday || null;
    const insertData = {...req.body, birthday, created_at: new Date()};
    const [result] = await db.query(sql, [insertData]);

    // {"fieldCount":0,"affectedRows":1,"insertId":1113,"info":"","serverStatus":2,"warningStatus":0}
    res.json(result);

});





module.exports = router;