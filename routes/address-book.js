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

const getListHandler = async (req, res)=>{
    let output = {
        perPage: 10,
        page: 1,
        totalRows: 0,
        totalPages: 0,
        code: 0,  // 辨識狀態
        error: '',
        query: {},
        rows: []
    };
    let page = +req.query.page || 1;

    let search = req.query.search || '';
    let beginDate = req.query.beginDate || '';
    let endDate = req.query.endDate || '';
    let where = ' WHERE 1 ';
    if(search){
        where += ` AND name LIKE ${ db.escape('%'+search+'%') } `;
        output.query.search = search;
        
    }
    if(beginDate){
        const mo = moment(beginDate);
        if(mo.isValid()){
            where += ` AND birthday >= '${mo.format('YYYY-MM-DD')}' `;
            output.query.beginDate = mo.format('YYYY-MM-DD');
        }
    }
    if(endDate){
        const mo = moment(endDate);
        if(mo.isValid()){
            where += ` AND birthday <= '${mo.format('YYYY-MM-DD')}' `;
            output.query.endDate = mo.format('YYYY-MM-DD');
        }
    }
    output.showTest = where;

    if(page<1) {
        output.code = 410;
        output.error = '頁碼太小';
        return output;
    }

    const sql01 = `SELECT COUNT(1) totalRows FROM address_book ${where} `;
    const [[{totalRows}]] = await db.query(sql01);
    let totalPages = 0;
    if(totalRows) {
        totalPages = Math.ceil(totalRows/output.perPage);
        if(page>totalPages){
            output.totalPages = totalPages;
            output.code = 420;
            output.error = '頁碼太大';
            return output;
        }

        const sql02 = `SELECT * FROM address_book ${where} ORDER BY sid DESC LIMIT ${(page-1)*output.perPage}, ${output.perPage}`;
        const [r2] = await db.query(sql02);
        r2.forEach(el=> el.birthday = toDateString(el.birthday) );
        output.rows = r2;
    }
    output.code = 200;
    output = {...output, page, totalRows, totalPages};

    return output;
};

router.use((req, res, next)=>{
    /*
    if(! req.session.admin){
        return res.redirect('/');
    }
    */
    next();
});
router.get('/add', async (req, res)=>{
    if(! req.session.admin){
        return res.redirect('/');
    }
    res.render('address-book/add');
});

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

router.get('/', async (req, res)=>{
    const output = await getListHandler(req, res);
    switch(output.code){
        case 410:
            return res.redirect(`?page=1`);
            break;
        case 420:
            return res.redirect(`?page=${output.totalPages}`);
            break;
    }    if(! req.session.admin){
        res.render('address-book/main-noadmin', output);
    } else {
        res.render('address-book/main', output);
    }

});
router.get('/api', async (req, res)=>{
    const output = await getListHandler(req, res);
    res.json(output);
});

module.exports = router;