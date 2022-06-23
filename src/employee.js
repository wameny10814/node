const Person = require(__dirname + "/person");

class employee extends Person {
    gender = "male";
    constructor(name = "", age = 10, employee_id = "") {
        super(name,age)
        this.employee_id = employee_id;
    }

    toJSON() {
        const {name,age,employee_id} =this
        return {name,age,employee_id};
    }


}
module.exports = employee;