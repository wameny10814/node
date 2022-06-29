//日期轉換格式模組化
const moment = require('moment-timezone');

const dateFormat = 'YYYY-MM-DD';
const datetimeFormat = 'YYYY-MM-DD HH:mm:ss';

const toDateString = (t)=> moment(t).format(dateFormat);
const toDatetimeString = (t)=> moment(t).format(datetimeFormat);

module.exports = {
    toDateString,
    toDatetimeString,
};