const {f, f3} =require('./fun01.js')
const {f:a1, f3:a2} =require('./fun01.js')

console.log(f(7))
console.log(f3(7))
console.log(a2(7))
//拿相同參照
console.log(f3===a2)