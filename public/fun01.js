const f = a=>a*a
const f3 = a=>a*a*a
console.log(f(10))

//拿多個使用物件方式exports
module.exports = {f, f3};