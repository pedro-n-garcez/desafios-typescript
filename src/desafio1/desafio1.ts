interface Employee {
    code: number;
    name: string;
}

let employee1 : Employee = {
    code: 10,
    name: "John"
}

console.log("CODE: " + employee1.code);
console.log("NAME: " + employee1.name);