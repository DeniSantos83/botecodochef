
// ------------------ LOGIN ------------------
const loginBtn = document.getElementById("login-btn");
const loginScreen = document.getElementById("login-screen");
const mesaScreen = document.getElementById("mesa-screen");
const app = document.getElementById("app");
const loginErrorMessage = document.getElementById("login-error-message");
const mesasGrid = document.getElementById("mesas-grid");
const mesaAtualSpan = document.getElementById("mesa-atual");

// Popup
const popupFinalizacao = document.getElementById("popup-finalizacao");
const closePopupBtn = document.querySelector(".close-popup-btn");
const popupMesa = document.getElementById("popup-mesa");
const popupListaPedidos = document.getElementById("popup-lista-pedidos");
const popupAjuste = document.getElementById("popup-ajuste");
const popupValorTotal = document.getElementById("popup-valor-total");
const imprimirComandaBtn = document.getElementById("imprimir-comanda-btn");

// Sidebar
const mesasSidebarList = document.getElementById("mesas-sidebar-list");

// Novos elementos para a funcionalidade mobile
const mobileMesasBtn = document.getElementById("mobile-mesas-btn");
const mobileMesasPopup = document.getElementById("mobile-mesas-popup");
const mobileMesasList = document.getElementById("mobile-mesas-list");

let pedidosPorMesa = JSON.parse(localStorage.getItem("pedidosPorMesa")) || {}; 
let mesaAtual = null;

loginBtn.addEventListener("click", () => {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  if (usuario === "garcom" && senha === "1234") {
    loginScreen.style.display = "none";
    mesaScreen.style.display = "block";
    loginErrorMessage.style.display = "none";
  } else {
    loginErrorMessage.textContent = "Usuário ou senha incorretos!";
    loginErrorMessage.style.display = "block";
  }
});

// Criar botões das mesas (tela inicial + sidebar + popup mobile)
for (let i = 1; i <= 15; i++) {
  const btnTela = document.createElement("button");
  btnTela.textContent = `Mesa ${i}`;
  btnTela.addEventListener("click", () => {
    selecionarMesa(i);
    mesaScreen.style.display = "none";
    app.style.display = "block";
  });
  mesasGrid.appendChild(btnTela);

  const btnSidebar = document.createElement("button");
  btnSidebar.textContent = `Mesa ${i}`;
  btnSidebar.addEventListener("click", () => {
    selecionarMesa(i);
    atualizarSidebarAtiva();
  });
  mesasSidebarList.appendChild(btnSidebar);

  // Adicionar botões ao novo popup de mesas
  const btnMobile = document.createElement("button");
  btnMobile.textContent = `Mesa ${i}`;
  btnMobile.addEventListener("click", () => {
    selecionarMesa(i);
    mobileMesasPopup.classList.remove("active");
  });
  mobileMesasList.appendChild(btnMobile);
}

// Selecionar mesa
function selecionarMesa(numero) {
  mesaAtual = numero;
  if (!pedidosPorMesa[mesaAtual]) pedidosPorMesa[mesaAtual] = [];
  pedidos = pedidosPorMesa[mesaAtual];
  mesaAtualSpan.textContent = mesaAtual;
  atualizarCarrinho();
  atualizarAtivos();
}

// Destacar mesa ativa
function atualizarAtivos() {
  document.querySelectorAll("#mesas-sidebar-list button, #mobile-mesas-list button").forEach(btn => {
    const numero = parseInt(btn.textContent.replace("Mesa ", ""), 10);
    btn.classList.toggle("active", numero === mesaAtual);
  });
}

// Abrir popup de mesas no mobile
mobileMesasBtn.addEventListener("click", () => {
  mobileMesasPopup.classList.add("active");
});

// Fechar popup de mesas no mobile
document.querySelector("#mobile-mesas-popup .close-popup-btn").addEventListener("click", () => {
  mobileMesasPopup.classList.remove("active");
});


// ------------------ SISTEMA DE COMANDA ------------------
const produtosGrid = document.querySelector(".produtos .categorias-container");
const listaPedidos = document.getElementById("lista-pedidos");
const valorSubtotalSpan = document.getElementById("valor-subtotal");
const valorTotalSpan = document.getElementById("valor-total");
const fecharContaBtn = document.getElementById("fechar-conta");
const descontoAcrescimoInput = document.getElementById("desconto-acrescimo");
const aplicarAjusteBtn = document.getElementById("aplicar-ajuste");
const comandaVaziaMessage = document.getElementById("comanda-vazia-message");
const searchInput = document.getElementById("search-input");
const limparComandaBtn = document.getElementById("limpar-comanda-btn");
const voltarMesasBtn = document.getElementById("voltar-mesas");

let pedidos = [];
let subtotal = 0;
let totalComAjuste = 0;
let ajusteValorFixo = 0;

// Atualizar carrinho
function atualizarCarrinho() {
  listaPedidos.innerHTML = "";
  subtotal = 0;

  pedidos.forEach((item, index) => {
    const li = document.createElement("li");
    const itemDetails = document.createElement("div");
    itemDetails.classList.add("item-details");

    const mainText = document.createElement("span");
    mainText.textContent = `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}`;
    itemDetails.appendChild(mainText);

    li.appendChild(itemDetails);
    subtotal += item.preco * item.quantidade;

    const remover = document.createElement("button");
    remover.textContent = "x";
    remover.addEventListener("click", () => {
      pedidos.splice(index, 1);
      pedidosPorMesa[mesaAtual] = pedidos;
      salvarLocalStorage();
      atualizarCarrinho();
    });

    li.appendChild(remover);
    listaPedidos.appendChild(li);
  });

  valorSubtotalSpan.textContent = subtotal.toFixed(2);
  calcularTotalComAjuste();
  comandaVaziaMessage.style.display = pedidos.length === 0 ? "block" : "none";
}

function salvarLocalStorage() {
  localStorage.setItem("pedidosPorMesa", JSON.stringify(pedidosPorMesa));
}

// Calcular total
function calcularTotalComAjuste() {
  const valorAjuste = parseFloat(descontoAcrescimoInput.value) || 0;
  ajusteValorFixo = valorAjuste;
  totalComAjuste = subtotal + ajusteValorFixo;
  valorTotalSpan.textContent = totalComAjuste.toFixed(2);
}

// Adicionar produto
produtosGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName === "BUTTON" && target.textContent === "+") {
    const card = target.closest(".produto");
    const nome = card.getAttribute("data-nome");
    const preco = parseFloat(card.getAttribute("data-preco"));
    const quantidadeInput = card.querySelector(".quantidade-input");
    const quantidade = parseInt(quantidadeInput.value, 10);

    pedidos.push({ nome, preco, quantidade });
    pedidosPorMesa[mesaAtual] = pedidos;
    salvarLocalStorage();
    atualizarCarrinho();
  }
});

aplicarAjusteBtn.addEventListener("click", calcularTotalComAjuste);

// Fechar Conta (abrir popup)
fecharContaBtn.addEventListener("click", () => {
  if (pedidos.length === 0) {
    comandaVaziaMessage.textContent = "A comanda está vazia!";
    comandaVaziaMessage.style.display = "block";
    return;
  }

  popupMesa.textContent = mesaAtual;
  popupListaPedidos.innerHTML = "";
  pedidos.forEach(item => {
    const li = document.createElement("li");
    const mainTextDiv = document.createElement("div");
    mainTextDiv.classList.add("popup-item-main");
    mainTextDiv.innerHTML = `<span>${item.quantidade}x ${item.nome}</span> <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>`;
    li.appendChild(mainTextDiv);
    popupListaPedidos.appendChild(li);
  });
  popupAjuste.textContent = `R$ ${ajusteValorFixo.toFixed(2)}`;
  popupValorTotal.textContent = totalComAjuste.toFixed(2);

  popupFinalizacao.classList.add("active");
});

// Fechar popup
closePopupBtn.addEventListener("click", () => {
  popupFinalizacao.classList.remove("active");
});

// Imprimir
imprimirComandaBtn.addEventListener("click", () => {
  const printContent = document.getElementById("detalhes-comanda").innerHTML;
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head><title>Imprimir Comanda</title></head>
      <body>${printContent}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
});

// Botão limpar comanda
limparComandaBtn.addEventListener("click", () => {
  pedidos = [];
  pedidosPorMesa[mesaAtual] = pedidos;
  salvarLocalStorage();
  atualizarCarrinho();
  comandaVaziaMessage.textContent = "A comanda está limpa!";
  comandaVaziaMessage.style.display = "block";
});

// Botão voltar mesas
voltarMesasBtn.addEventListener("click", () => {
  app.style.display = "none";
  mesaScreen.style.display = "block";
  pedidosPorMesa[mesaAtual] = pedidos;
  salvarLocalStorage();
});

// Botão logoff (não limpa as comandas salvas)
document.querySelectorAll("#logoff-btn, #logoff-btn2").forEach(btn => {
  btn.addEventListener("click", () => {
    pedidos = [];
    subtotal = 0;
    totalComAjuste = 0;
    ajusteValorFixo = 0;
    app.style.display = "none";
    mesaScreen.style.display = "none";
    loginScreen.style.display = "flex";
  });
});

// Inicializar
atualizarCarrinho();