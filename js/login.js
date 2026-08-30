console.log("JavaScript do login carregado!");


// FUNÇÃO DE VER E DESVER SENHA
const passwordInput = document.getElementById("password"); // essa linha procura no HTML o input com id="password" e guarda em passwordInput
const togglePassword = document.getElementById("togglePassword"); // essa linha procura o elemento do olho
const loginForm = document.getElementById("loginForm");

togglePassword.addEventListener("click", function () { // essa linha diz que, quando houver um clique nesse elemento, ele executa essa função:
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (email === "" || password === "") {
    alert("Preencha o e-mail e a senha.");
    return;
  }

  console.log("E-mail:", email);
  console.log("Senha:", password);
});