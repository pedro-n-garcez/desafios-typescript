"use strict";
var Profissao;
(function (Profissao) {
    Profissao["atriz"] = "atriz";
    Profissao["padeiro"] = "padeiro";
})(Profissao || (Profissao = {}));
let pessoa1 = {
    nome: "Maria",
    idade: 29,
    profissao: Profissao.atriz
};
let pessoa2 = {
    nome: "Roberto",
    idade: 19,
    profissao: Profissao.padeiro
};
let pessoa3 = {
    nome: "Laura",
    idade: 32,
    profissao: Profissao.atriz
};
let pessoa4 = {
    nome: "Carlos",
    idade: 19,
    profissao: Profissao.padeiro
};
console.log(pessoa1.nome);
console.log(pessoa1.idade);
console.log(pessoa1.profissao);
