"use strict";
// DECLARAÇÕES DE VARIÁVEIS
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let apiKey = "";
let requestToken = "";
let username = "";
let password = "";
let sessionId = "";
let listId = "";
let query = "";
let loginButton = document.getElementById('login-button');
let searchButton = document.getElementById('search-button');
let searchContainer = document.getElementById('search-container');
let getList = document.getElementById('get-list');
let addFilmList = document.getElementById('add-film-list');
let getListInput = document.getElementById('get-list-input');
let addFilmListInput = document.getElementById('add-film-list-input');
let createList = document.getElementById('create-list');
let listNameInput = document.getElementById('list-name-input');
let listDescriptionInput = document.getElementById('list-description-input');
// FUNÇÕES DE AUTENTICAÇÃO DO USUÁRIO
function preencherSenha() {
    let passwordInput = document.getElementById('senha');
    password = passwordInput.value;
    validateLoginButton();
}
function preencherLogin() {
    let usernameInput = document.getElementById('login');
    username = usernameInput.value;
    validateLoginButton();
}
function preencherApi() {
    let apiKeyInput = document.getElementById('api-key');
    apiKey = apiKeyInput.value;
    validateLoginButton();
}
function validateLoginButton() {
    if (password && username && apiKey) {
        loginButton.disabled = false;
    }
    else {
        loginButton.disabled = true;
    }
}
class HttpClient {
    static get({ url, method, body = null }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let request = new XMLHttpRequest();
                request.open(method, url, true);
                request.onload = () => {
                    if (request.status >= 200 && request.status < 300) {
                        resolve(JSON.parse(request.responseText));
                    }
                    else {
                        reject({
                            status: request.status,
                            statusText: request.statusText
                        });
                    }
                };
                request.onerror = () => {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                };
                if (body) {
                    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    body = JSON.stringify(body);
                }
                request.send(body);
            });
        });
    }
}
function criarRequestToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
            method: "GET"
        });
        requestToken = result.request_token;
    });
}
function logar() {
    return __awaiter(this, void 0, void 0, function* () {
        yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
            method: "POST",
            body: {
                username: `${username}`,
                password: `${password}`,
                request_token: `${requestToken}`
            }
        });
    });
}
function criarSessao() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
            method: "GET"
        });
        sessionId = result.session_id;
    });
}
// EVENTLISTENERS
loginButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    let loginConfirmation = document.getElementById("login-confirmation");
    try {
        yield criarRequestToken();
        yield logar();
        yield criarSessao();
        loginConfirmation.textContent = `Você está logado como ${username}.`;
        searchButton.disabled = false;
        getList.disabled = false;
        addFilmList.disabled = false;
        createList.disabled = false;
    }
    catch (e) {
        loginConfirmation.textContent = "Erro de login. Username, senha ou API key incorreto(s).";
    }
}));
searchButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    let queryInput = document.getElementById('search');
    query = queryInput.value;
    let listaDeFilmes = yield procurarFilme(query);
    mostrarFilmes(listaDeFilmes.results);
}));
createList.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    if (listNameInput.value) {
        yield criarLista(listNameInput.value, listDescriptionInput.value);
    }
    updateCurrentListId();
}));
getList.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    listId = getListInput.value;
    yield pegarLista();
    updateCurrentListId();
}));
addFilmList.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield adicionarFilmeNaLista(addFilmListInput.value, listId);
}));
//FUNÇÕES DE DISPLAY DE FILMES
function criarCaixaFilme(item) {
    let filmInfo = document.createElement('div');
    filmInfo.style.cssText += "display: flex; width: 300px; justify-content: center; flex-direction: column; border: 1px solid gray; background-color: rgb(245,245,245); margin: 15px";
    let posterImg = document.createElement('img');
    if (item.poster_path) {
        posterImg.src = "https://image.tmdb.org/t/p/w200/" + item.poster_path;
        posterImg.style.cssText += "width: 100px";
        filmInfo.style.cssText += "height: 320px";
    }
    else {
        filmInfo.style.cssText += "height: 170px";
    }
    let title = document.createElement('p');
    let releaseDate = document.createElement('p');
    let id = document.createElement('p');
    let addFilmButton = document.createElement('button');
    addFilmButton.textContent = "Adicionar Filme";
    title.appendChild(document.createTextNode(`Título: ${item.original_title}`));
    releaseDate.appendChild(document.createTextNode(`Data de lançamento: ${item.release_date}`));
    id.appendChild(document.createTextNode(`ID: ${item.id}`));
    filmInfo.appendChild(posterImg);
    filmInfo.appendChild(title);
    filmInfo.appendChild(releaseDate);
    filmInfo.appendChild(id);
    return filmInfo;
}
function mostrarFilmes(lista) {
    let listaHTML = document.getElementById("lista");
    if (listaHTML) {
        listaHTML.outerHTML = "";
    }
    let ul = document.createElement('ul');
    ul.id = "lista";
    for (const item of lista) {
        let li = document.createElement('li');
        li.appendChild(criarCaixaFilme(item));
        ul.appendChild(li);
    }
    console.log(lista);
    searchContainer.appendChild(ul);
}
function updateCurrentListId() {
    let currentListId = document.getElementById('current-list-id');
    currentListId.textContent = "Current List ID: " + listId;
}
// FUNÇÕES DE MANIPULAÇÃO DA BASE DE DADOS
function procurarFilme(query) {
    return __awaiter(this, void 0, void 0, function* () {
        query = encodeURI(query);
        console.log(query);
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
            method: "GET"
        });
        return result;
    });
}
function adicionarFilme(filmeId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
            method: "GET"
        });
        console.log(result);
    });
}
function criarLista(nomeDaLista, descricao) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                name: nomeDaLista,
                description: descricao,
                language: "pt-br"
            }
        });
        listId = result.list_id;
        mostrarFilmes(result.items);
        console.log(result);
    });
}
function adicionarFilmeNaLista(filmeId, listaId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                media_id: filmeId
            }
        });
        mostrarFilmes(result.items);
        console.log(result);
    });
}
function pegarLista() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
            method: "GET"
        });
        mostrarFilmes(result.items);
        console.log(result);
    });
}
