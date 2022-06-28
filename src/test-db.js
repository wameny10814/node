const db = require(__dirname + '/../modules/mysql-connect');

(async()=>{

    // const [results, fields] = await db.query("SELECT * FROM address_book LIMIT 5");
    // const [results, fields] = await db.query("use mfee26");
    const [results, fields] = await db.query("show databases");

    console.log(results);
    // console.log(fields);
    // process.exit();  // 結束行程
})();

