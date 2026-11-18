// MÁSCARAS
// Máscara é só uma "fôrma": o usuário digita, e a gente
// reformata o texto na hora, a cada letra (evento oninput).

function mascararCelular(evento) {
  const numeros = evento.target.value.replace(/\D/g, "").slice(0, 11);

  let texto = numeros;
  if (numeros.length > 7) {
    texto = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  } else if (numeros.length > 2) {
    texto = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  } else if (numeros.length > 0) {
    texto = `(${numeros}`;
  }

  evento.target.value = texto;
}

function apenasNumeros(evento) {
  evento.target.value = evento.target.value.replace(/\D/g, "");
}

// MOSTRAR E LIMPAR ERROS
// Cada campo tem um <p id="erro-NOME"> escondido (classe "oculto").
// Para mostrar o erro, escrevemos a mensagem e tiramos o "oculto".

function mostrarErro(campo, mensagem) {
  const paragrafo = document.querySelector(`#erro-${campo}`);
  paragrafo.textContent = mensagem;
  paragrafo.classList.remove("oculto");

  const input = document.querySelector(`#${campo}`);
  if (input) {
    input.classList.add("invalido");
  }
}

function limparErros() {
  document.querySelectorAll(".erro").forEach((paragrafo) => {
    paragrafo.textContent = "";
    paragrafo.classList.add("oculto");
  });
  document.querySelectorAll(".invalido").forEach((input) => {
    input.classList.remove("invalido");
  });
}

// PEGAR OS DADOS DO FORMULÁRIO
// Junta tudo em um único objeto (uma "ficha" com um dado em cada linha).

function coletarDados() {
  const generos = [];
  document.querySelectorAll('input[name="generos"]:checked').forEach((item) => {
    generos.push(item.value);
  });

  const notaMarcada = document.querySelector('input[name="nota"]:checked');
  const recomendaMarcado = document.querySelector('input[name="recomenda"]:checked');

  let nota = "";
  if (notaMarcada) {
    nota = notaMarcada.value;
  }

  let recomenda = "";
  if (recomendaMarcado) {
    recomenda = recomendaMarcado.value;
  }

  return {
    apelido: document.querySelector("#apelido").value.trim(),
    email: document.querySelector("#email").value.trim(),
    celular: document.querySelector("#celular").value.trim(),
    titulo: document.querySelector("#titulo").value.trim(),
    tipo: document.querySelector("#tipo").value,
    ano: document.querySelector("#ano").value.trim(),
    data_termino: document.querySelector("#data").value,
    plataforma: document.querySelector("#plataforma").value,
    generos: generos,
    nota: nota,
    resenha: document.querySelector("#resenha").value.trim(),
    recomenda: recomenda,
  };
}

// VALIDAÇÃO
// Devolve um objeto só com os campos que deram problema.
// Se voltar vazio, está tudo certo.

function validar(dados) {
  const erros = {};

  if (dados.apelido.length < 2) {
    erros.apelido = "Informe um apelido com pelo menos 2 letras.";
  }

  // regex simples: texto + @ + texto + ponto + texto
  const modeloEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!modeloEmail.test(dados.email)) {
    erros.email = "Informe um email válido, como nome@email.com.";
  }

  // tira a máscara e confere: 11 dígitos e o terceiro dígito é 9
  const numerosCelular = dados.celular.replace(/\D/g, "");
  if (numerosCelular.length !== 11 || numerosCelular.slice(2, 3) !== "9") {
    erros.celular = "Informe um celular completo, como (43) 99999-9999.";
  }

  if (dados.titulo.length < 1) {
    erros.titulo = "Informe o título do filme ou da série.";
  }

  if (!dados.tipo) {
    erros.tipo = "Escolha se é filme ou série.";
  }

  const anoAtual = new Date().getFullYear();
  const ano = Number(dados.ano);
  if (dados.ano.length !== 4 || ano < 1888 || ano > anoAtual + 1) {
    erros.ano = `Informe um ano de 4 dígitos entre 1888 e ${anoAtual + 1}.`;
  }

  if (!dados.data_termino) {
    erros.data = "Informe a data em que terminou de assistir.";
  } else if (new Date(dados.data_termino + "T00:00:00") > new Date()) {
    erros.data = "A data não pode estar no futuro.";
  }

  if (!dados.plataforma) {
    erros.plataforma = "Escolha onde você assistiu.";
  }

  if (dados.generos.length === 0) {
    erros.generos = "Marque pelo menos um gênero.";
  }

  if (!dados.nota) {
    erros.nota = "Escolha uma nota de 1 a 5 estrelas.";
  }

  if (dados.resenha.length < 10) {
    erros.resenha = "Escreva uma opinião com pelo menos 10 caracteres.";
  }

  if (!dados.recomenda) {
    erros.recomenda = "Diga se você recomenda ou não.";
  }

  return erros;
}

// ENVIO PARA A API

async function enviarParaApi(dados) {
  const botao = document.querySelector("#enviar");
  botao.disabled = true;
  botao.textContent = "Enviando...";

  try {
    const resposta = await fetch("https://postman-echo.com/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}`);
    }

    const resultado = await resposta.json();

    
    alert(
      `Resposta da API (status ${resposta.status}):\n\n` +
        JSON.stringify(resultado.json, null, 2)
    );

    document.querySelector("#avaliacao").reset();
  } catch (erro) {
    alert("Falhou: " + erro.message);
  } finally {
    
    botao.disabled = false;
    botao.textContent = "Salvar avaliação";
  }
}

// MANIPULADOR DO ENVIO (onsubmit)

function executar(evento) {
  evento.preventDefault(); 
  limparErros();

  const dados = coletarDados();
  const erros = validar(dados);
  const camposComErro = Object.keys(erros); 

  if (camposComErro.length > 0) {
    camposComErro.forEach((campo) => {
      mostrarErro(campo, erros[campo]);
    });
    return; 
  }

  enviarParaApi(dados);
}