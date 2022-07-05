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
router.get('/add', async (req, res)=>{
    if(! req.session.admin){
        return res.redirect('/');
    }
    res.render('address-book/add');
});

//c
router.post('/add', upload.none(), async (req, res)=>{
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
    // 自訂訊息
    // https://stackoverflow.com/questions/48720942/node-js-joi-how-to-display-a-custom-error-messages

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

//u
router.put("/", async (req, res) => {
    // body: product_id, quantity
    const output = {
        success: false,
        error: "",
    };
    if (!req.body.product_id || !req.body.quantity) {
        output.error = "參數不足";
        return res.json(output);
    }

    if (+req.body.quantity < 1) {
        output.error = "數量不能小於 1";
        return res.json(output);
    }

    // 判斷該商品是否已經加入購物車
    const sql3 = `SELECT COUNT(1) num FROM carts WHERE product_id=? AND user_id=?`;
    const [[{ num }]] = await db.query(sql3, [req.body.product_id, fake_user]);
    if (num <= 0) {
        output.error = "購物車內沒有這項商品";
        return res.json(output);
    }


    const sql2 = "UPDATE `carts` SET `quantity`=? WHERE product_id=? AND user_id=?";
    const [r2] = await db.query(sql2, [
        req.body.quantity,
        req.body.product_id,
        fake_user,
    ]);
    output.r2 = r2;
    //影響行數 && 是否有更新
    if (r2.affectedRows && r2.changedRows) {
        output.success = true;
    }

    output.cart = await getUserCart(fake_user);
    res.json(output);
});
//d
router.delete("/", async (req, res) => {
    // product_id
    const sql = "DELETE FROM carts WHERE user_id=? AND product_id=?";
    await db.query(sql, [fake_user, req.body.product_id]);

    res.json(await getUserCart(fake_user));
});

router.get('/api', async (req, res)=>{
    const output = await getListHandler(req, res);
    res.json(output);
});

module.exports = router;