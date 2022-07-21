// DECLARAÇÕES DE VARIÁVEIS

let apiKey: string = "";
let requestToken: string = "";
let username: string = "";
let password: string = "";
let sessionId: string = "";
let listId: string = "";
let query: string = "";

let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button') as HTMLButtonElement;
let searchContainer = document.getElementById('search-container') as HTMLElement;
let getList = document.getElementById('get-list') as HTMLButtonElement;
let addFilmList = document.getElementById('add-film-list') as HTMLButtonElement;
let getListInput = document.getElementById('get-list-input') as HTMLInputElement;
let addFilmListInput = document.getElementById('add-film-list-input') as HTMLInputElement;
let createList = document.getElementById('create-list') as HTMLButtonElement;
let listNameInput = document.getElementById('list-name-input') as HTMLInputElement;
let listDescriptionInput = document.getElementById('list-description-input') as HTMLInputElement;

// FUNÇÕES DE AUTENTICAÇÃO DO USUÁRIO

function preencherSenha() {
  let passwordInput = document.getElementById('senha') as HTMLInputElement;
  password = passwordInput.value;
  validateLoginButton();
}

function preencherLogin() {
  let usernameInput = document.getElementById('login') as HTMLInputElement; 
  username = usernameInput.value;
  validateLoginButton();
}

function preencherApi() {
  let apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
  apiKey = apiKeyInput.value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

class HttpClient {
  static async get({url, method, body = null}:{url: string, method: string, body?: any}) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  }) as {request_token: string}
  requestToken = result.request_token;
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  }) as {session_id: string}
  sessionId = result.session_id;
}

// EVENTLISTENERS

loginButton.addEventListener('click', async () => {
  let loginConfirmation = document.getElementById("login-confirmation") as HTMLSpanElement;
  try {
    await criarRequestToken();
    await logar();
    await criarSessao();
    loginConfirmation.textContent = `Você está logado como ${username}.`;
    searchButton.disabled = false;
    getList.disabled = false;
    addFilmList.disabled = false;
    createList.disabled = false;
  } catch (e) {
    loginConfirmation.textContent = "Erro de login. Username, senha ou API key incorreto(s).";
  }
})

searchButton.addEventListener('click', async () => {
  let queryInput = document.getElementById('search') as HTMLInputElement;
  query = queryInput.value;
  let listaDeFilmes = await procurarFilme(query) as {results: any};
  mostrarFilmes(listaDeFilmes.results);
})

createList.addEventListener('click', async () => {
  if (listNameInput.value){
    await criarLista(listNameInput.value,listDescriptionInput.value)
  }
  updateCurrentListId()
})

getList.addEventListener('click', async () => {
  listId = getListInput.value;
  await pegarLista()
  updateCurrentListId()
})

addFilmList.addEventListener('click', async () => {
  await adicionarFilmeNaLista(addFilmListInput.value,listId);
})

//FUNÇÕES DE DISPLAY DE FILMES

function criarCaixaFilme(item) : HTMLDivElement {
  let filmInfo = document.createElement('div');
  filmInfo.style.cssText += "display: flex; width: 300px; justify-content: center; flex-direction: column; border: 1px solid gray; background-color: rgb(245,245,245); margin: 15px";
  
  let posterImg = document.createElement('img');
  if (item.poster_path){
    posterImg.src = "https://image.tmdb.org/t/p/w200/" + item.poster_path;
    posterImg.style.cssText += "width: 100px"
    filmInfo.style.cssText += "height: 320px";
  } else {
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

function mostrarFilmes(lista: Array<any>) {
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

function updateCurrentListId(){
  let currentListId = document.getElementById('current-list-id') as HTMLInputElement;
  currentListId.textContent = "Current List ID: " + listId;
}

// FUNÇÕES DE MANIPULAÇÃO DA BASE DE DADOS

async function procurarFilme(query) {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return result;
}

async function adicionarFilme(filmeId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarLista(nomeDaLista, descricao) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  }) as {list_id: string, items: Array<any>}
  listId = result.list_id
  mostrarFilmes(result.items)
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId, listaId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  }) as {items: Array<any>}
  mostrarFilmes(result.items)
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  }) as {items: Array<any>}
  mostrarFilmes(result.items)
  console.log(result);
}