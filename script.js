// ------------------ LOGIN ------------------
const loginBtn = document.getElementById("login-btn");
const loginScreen = document.getElementById("login-screen");
const app = document.getElementById("app");
const loginErrorMessage = document.getElementById("login-error-message");

loginBtn.addEventListener("click", () => {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  // Usuário fixo só para teste
  if (usuario === "garcom" && senha === "1234") {
    loginScreen.style.display = "none";
    app.style.display = "block";
    loginErrorMessage.style.display = "none"; // Hide error message on successful login
  } else {
    loginErrorMessage.textContent = "Usuário ou senha incorretos!";
    loginErrorMessage.style.display = "block";
  }
});

// ------------------ SISTEMA DE COMANDA ------------------
const produtosGrid = document.querySelector(".produtos .categorias-container"); // Changed to target the container
const listaPedidos = document.getElementById("lista-pedidos");
const valorSubtotalSpan = document.getElementById("valor-subtotal");
const valorTotalSpan = document.getElementById("valor-total");
const fecharContaBtn = document.getElementById("fechar-conta");
const logoffBtn = document.getElementById("logoff-btn");
const descontoAcrescimoInput = document.getElementById("desconto-acrescimo");
const aplicarAjusteBtn = document.getElementById("aplicar-ajuste");
const comandaVaziaMessage = document.getElementById("comanda-vazia-message");
const searchInput = document.getElementById("search-input");
const limparComandaBtn = document.getElementById("limpar-comanda-btn");


let pedidos = [];
let subtotal = 0;
let totalComAjuste = 0;
let ajusteValorFixo = 0; // Stores the current fixed discount/surcharge value

// Popup elements
const popupFinalizacao = document.getElementById("popup-finalizacao");
const closePopupBtn = document.querySelector(".close-popup-btn");
const popupMesa = document.getElementById("popup-mesa");
const popupListaPedidos = document.getElementById("popup-lista-pedidos");
const popupAjuste = document.getElementById("popup-ajuste");
const popupValorTotal = document.getElementById("popup-valor-total");
const imprimirComandaBtn = document.getElementById("imprimir-comanda-btn");


// Function to update the cart display and totals
function atualizarCarrinho() {
  listaPedidos.innerHTML = "";
  subtotal = 0; // Reset subtotal for recalculation

  pedidos.forEach((item, index) => {
    const li = document.createElement("li");
    const itemDetails = document.createElement("div");
    itemDetails.classList.add("item-details");

    const mainText = document.createElement("span");
    mainText.textContent = `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}`;
    itemDetails.appendChild(mainText);

    // Add input for observation
    const obsInput = document.createElement("input");
    obsInput.type = "text";
    obsInput.classList.add("observacao-input");
    obsInput.placeholder = "Observações (ex: sem cebola)";
    obsInput.value = item.observacao || "";
    obsInput.addEventListener("input", (event) => {
      pedidos[index].observacao = event.target.value;
    });
    itemDetails.appendChild(obsInput);

    li.appendChild(itemDetails);

    subtotal += item.preco * item.quantidade;

    const remover = document.createElement("button");
    remover.textContent = "x";
    remover.addEventListener("click", () => {
      pedidos.splice(index, 1);
      atualizarCarrinho(); // Recalculate everything after removal
    });

    li.appendChild(remover);
    listaPedidos.appendChild(li);
  });

  valorSubtotalSpan.textContent = subtotal.toFixed(2);
  calcularTotalComAjuste(); // Recalculate total with adjustment
  comandaVaziaMessage.style.display = "none"; // Hide empty cart message
}

// Function to calculate total with discount/surcharge
function calcularTotalComAjuste() {
  const valorAjuste = parseFloat(descontoAcrescimoInput.value) || 0;
  ajusteValorFixo = valorAjuste; // Store the applied fixed value

  totalComAjuste = subtotal + ajusteValorFixo; // Direct addition/subtraction
  valorTotalSpan.textContent = totalComAjuste.toFixed(2);
}

// Event listeners for adding products
// This now needs to be delegated or added to dynamically created elements
produtosGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName === "BUTTON" && target.textContent === "+") {
    const card = target.closest(".produto");
    const nome = card.getAttribute("data-nome");
    const preco = parseFloat(card.getAttribute("data-preco"));
    const quantidadeInput = card.querySelector(".quantidade-input");
    const quantidade = parseInt(quantidadeInput.value, 10);

    pedidos.push({ nome, preco, quantidade, observacao: "" });
    atualizarCarrinho();
  }
});

// Event listener for applying discount/surcharge
aplicarAjusteBtn.addEventListener("click", calcularTotalComAjuste);

// Event listener for closing the bill (Fechar Comanda)
fecharContaBtn.addEventListener("click", () => {
  if (pedidos.length === 0) {
    comandaVaziaMessage.textContent = "A comanda está vazia!";
    comandaVaziaMessage.style.display = "block";
    return;
  }

  const comandaNumero = document.getElementById("comanda").value || "N/A";

  // Populate popup with order details
  popupMesa.textContent = comandaNumero;
  popupListaPedidos.innerHTML = "";
  pedidos.forEach(item => {
    const li = document.createElement("li");
    const mainTextDiv = document.createElement("div");
    mainTextDiv.classList.add("popup-item-main");
    mainTextDiv.innerHTML = `<span>${item.quantidade}x ${item.nome}</span> <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>`;
    li.appendChild(mainTextDiv);

    if (item.observacao) {
      const obsText = document.createElement("span");
      obsText.classList.add("popup-item-obs");
      obsText.textContent = `Obs: ${item.observacao}`;
      li.appendChild(obsText);
    }
    popupListaPedidos.appendChild(li);
  });
  popupAjuste.textContent = `R$ ${ajusteValorFixo.toFixed(2)}`; // Updated to show fixed value
  popupValorTotal.textContent = totalComAjuste.toFixed(2);

  popupFinalizacao.classList.add("active"); // Show the popup
});

// Event listener for logoff button
logoffBtn.addEventListener("click", () => {
  // Clear all system state
  pedidos = [];
  subtotal = 0;
  totalComAjuste = 0;
  ajusteValorFixo = 0; // Reset fixed adjustment value
  descontoAcrescimoInput.value = "0.00"; // Reset input field
  document.getElementById("comanda").value = "";
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";
  atualizarCarrinho(); // Clear cart display

  app.style.display = "none";
  loginScreen.style.display = "flex";
  loginErrorMessage.style.display = "none"; // Hide login error on logoff
});

// Event listener for closing the popup
closePopupBtn.addEventListener("click", () => {
  popupFinalizacao.classList.remove("active");
  // Reset order after popup is closed
  pedidos = [];
  subtotal = 0;
  totalComAjuste = 0;
  ajusteValorFixo = 0; // Reset fixed adjustment value
  descontoAcrescimoInput.value = "0.00"; // Reset input field
  document.getElementById("comanda").value = "";
  atualizarCarrinho();
});

// Event listener for printing the order
imprimirComandaBtn.addEventListener("click", () => {
  const printContent = document.getElementById("detalhes-comanda").innerHTML;
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>Comanda para Impressão</title>
      <style>
        body { font-family: 'Trebuchet MS', sans-serif; margin: 20px; }
        h2 { color: #7c1818; text-align: center; margin-bottom: 20px; }
        h3 { color: #333; margin-top: 15px; margin-bottom: 10px; }
        p { margin-bottom: 5px; display: flex; justify-content: space-between; }
        strong { font-size: 1.1em; }
        ul { list-style: none; padding: 0; }
        li { padding: 5px 0; border-bottom: 1px dashed #eee; display: flex; flex-direction: column; }
        .popup-item-main { display: flex; justify-content: space-between; width: 100%; }
        .popup-item-obs { font-size: 0.9em; color: #666; margin-top: 3px; width: 100%; text-align: left; }
      </style>
    </head>
    <body>
      ${printContent}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
});

// Search functionality
searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();
  document.querySelectorAll(".categoria").forEach(categoria => {
    let hasVisibleProducts = false;
    categoria.querySelectorAll(".produto").forEach(produto => {
      const productName = produto.getAttribute("data-nome").toLowerCase();
      if (productName.includes(searchTerm)) {
        produto.style.display = "flex"; // Show product
        hasVisibleProducts = true;
      } else {
        produto.style.display = "none"; // Hide product
      }
    });
    // Hide category if no products are visible within it
    if (hasVisibleProducts) {
      categoria.style.display = "block"; // Show category
    } else {
      categoria.style.display = "none"; // Hide category
    }
  });
});

// Clear Comanda Button
limparComandaBtn.addEventListener("click", () => {
  pedidos = [];
  subtotal = 0;
  totalComAjuste = 0;
  ajusteValorFixo = 0; // Reset fixed adjustment value
  descontoAcrescimoInput.value = "0.00"; // Reset input field
  document.getElementById("comanda").value = "";
  atualizarCarrinho();
});


// Initial update to ensure correct display on load (even if empty)
atualizarCarrinho();