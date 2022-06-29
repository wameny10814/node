const express = require("express");
const db = require(__dirname + "/../modules/mysql-connect");
const { toDateString, toDatetimeString } = require(__dirname +
    "/../modules/date-tools");
const moment = require("moment-timezone");
const upload = require(__dirname + "/../modules/upload-images");

const router = express.Router(); // 建立 router 物件

const getListHandler = async (req, res) => {
    let output = {
        perPage: 10,
        page: 1,
        totalRows: 0,
        totalPages: 0,
        code: 0, // 辨識狀態
        error: "",
        query: {},
        rows: [],
    };
    let page = +req.query.page || 1;

    let search = req.query.search || "";
    let beginDate = req.query.beginDate || "";
    let endDate = req.query.endDate || "";
    let where = " WHERE 1 ";
    if (search) {
        where += ` AND name LIKE ${db.escape("%" + search + "%")} `;
        output.query.search = search;
        output.showTest = db.escape("%" + search + "%"); // 測試, 查看
    }

    if (beginDate) {
        const mo = moment(beginDate);
        if (mo.isValid()) {
            where += ` AND birthday >= '${mo.format("YYYY-MM-DD")}' `;
            output.query.beginDate = mo.format("YYYY-MM-DD");
        }
    }
    if (endDate) {
        const mo = moment(endDate);
        if (mo.isValid()) {
            where += ` AND birthday <= '${mo.format("YYYY-MM-DD")}' `;
            output.query.endDate = mo.format("YYYY-MM-DD");
        }
    }

    output.showTest = where;

    if (page < 1) {
        output.code = 410;
        output.error = "頁碼太小";
        return output;
    }

    const sql01 = `SELECT COUNT(1) totalRows FROM address_book ${where} `;
    const [[{ totalRows }]] = await db.query(sql01);
    let totalPages = 0;
    if (totalRows) {
        totalPages = Math.ceil(totalRows / output.perPage);
        if (page > totalPages) {
            output.totalPages = totalPages;
            output.code = 420;
            output.error = "頁碼太大";
            return output;
        }

        const sql02 = `SELECT * FROM address_book ${where} ORDER BY sid DESC LIMIT ${
            (page - 1) * output.perPage
        }, ${output.perPage}`;
        const [r2] = await db.query(sql02);
        r2.forEach((el) => (el.birthday = toDateString(el.birthday)));
        output.rows = r2;
    }
    output.code = 200;
    output = { ...output, page, totalRows, totalPages };

    return output;
};

router.get("/add", async (req, res) => {
    res.render("address-book/add");
});
//upload.none() 只做解析不做回傳
//使用middleware 解析ajax fetch 資料
router.post("/add", upload.none(), async (req, res) => {
    res.json(req.body);
});

router.get("/", async (req, res) => {
    const output = await getListHandler(req, res);
    switch (output.code) {
        case 410:
            return res.redirect(`?page=1`);
            break;
        case 420:
            return res.redirect(`?page=${output.totalPages}`);
            break;
    }
    res.render("address-book/main", output);
});
router.get("/api", async (req, res) => {
    const output = await getListHandler(req, res);
    res.json(output);
});

module.exports = router;
