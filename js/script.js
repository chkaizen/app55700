// Variáveis para imagem principal e moldura
let imgPrincipal = null;
let moldura = null;

// Referência ao canvas e contexto
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Função para carregar a imagem do input
function carregarImagem() {
    document.getElementById('imagemInput').click();
}

// Função para inserir a imagem no canvas
function inserirImagem(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        imgPrincipal = new Image();
        imgPrincipal.crossOrigin = "anonymous"; // Aqui adicionamos CORS
        imgPrincipal.src = e.target.result;
        imgPrincipal.onload = () => {
            desenharCanvas();
        };
    };
    reader.readAsDataURL(file);
}


// Função para desenhar a imagem e a moldura no canvas
function desenharCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar a imagem principal
    if (imgPrincipal) {
        ctx.drawImage(imgPrincipal, 0, 0, canvas.width, canvas.height);
    }

    // Desenhar a moldura
    if (moldura) {
        ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
    }
}

function aplicarMoldura() {
    moldura = new Image();
    moldura.crossOrigin = "anonymous"; // Aqui adicionamos CORS
    moldura.src = 'img/moldura.png';  // Caminho da moldura
    moldura.onload = () => {
        desenharCanvas();
    };
}


// Função para salvar a imagem com moldura
function salvarImagem() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'imagem_editada.png';
    link.click();
}
