// Carrega o histórico de imagens ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    atualizarHistorico();
});

document.addEventListener('backbutton', function() {
    window.location.href = 'editor.html';
}, false);

document.addEventListener('deviceready', function() {
    var permissions = cordova.plugins.permissions;
    
    permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, function(status) {
        if (status.hasPermission) {
            console.log("Permissão concedida para escrever no armazenamento.");
        } else {
            console.warn("Permissão negada para escrever no armazenamento.");
            alert("É necessário conceder permissão para salvar imagens.");
        }
    }, function(error) {
        console.error("Erro ao solicitar permissão: ", error);
        alert("Erro ao solicitar permissão!");
    });
});

// Caminhos para molduras padrão na pasta do aplicativo
let molduras = [
    'GD1.png',
    'GD2.png',
    'GD3.png',
]; 

let molduraIndex = 0;
let imgPrincipal = null;
let molduraAtual = null;

// Função para abrir links externos
function abrirLink(url) {
    window.open(url, '_blank');
}

// Função para exibir informações da campanha
function mostrarInformacoes() {
    window.location.href = 'informacoes.html';
}

// Função para navegar até a página de edição
function irParaEditor() {
    window.location.href = 'editor.html';
}

// Função para carregar uma imagem a partir da galeria
function carregarImagem() {
    document.getElementById('imagemInput').click();
}

// Função para inserir a imagem no canvas
function inserirImagem(event) {
    const img = new Image();
    img.src = URL.createObjectURL(event.target.files[0]);
    img.onload = () => {
        imgPrincipal = img;
        desenharCanvas();
    };
}

// Função para alternar entre as molduras
function trocarMoldura() {
    if (imgPrincipal) {
        const img = new Image();
        molduraIndex = (molduraIndex + 1) % molduras.length;
        img.src = 'img/' + molduras[molduraIndex];
        img.onload = () => {
            molduraAtual = img;
            desenharCanvas();
        };
    } else {
        alert('Insira uma imagem primeiro!');
    }
}

// Função para selecionar uma moldura da galeria
function selecionarMolduraGaleria() {
    document.getElementById('molduraInput').click();
}

// Função para adicionar a moldura selecionada no canvas
function adicionarMolduraGaleria(event) {
    const img = new Image();
    img.src = URL.createObjectURL(event.target.files[0]);
    img.onload = () => {
        molduraAtual = img;
        desenharCanvas();
    };
}

// Função para desenhar o canvas
function desenharCanvas() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imgPrincipal) {
        ctx.drawImage(imgPrincipal, 0, 0, canvas.width, canvas.height);
    }
    if (molduraAtual) {
        ctx.drawImage(molduraAtual, 0, 0, canvas.width, canvas.height);
    }
}

// Função para alterar a proporção do canvas
function alterarProporcao(proporcao) {
    const canvas = document.getElementById('canvas');
    if (proporcao === '1:1') {
        canvas.width = 400;
        canvas.height = 400;
        molduras = ['GD1.png', 'GD2.png', 'GD3.png'];
    } else if (proporcao === '9:16') {
        canvas.width = 400;
        canvas.height = 711;
        molduras = ['E1.png', 'E2.png', 'E3.png'];
    }
    desenharCanvas();
}
// Função para salvar a imagem e abrir a tela de opções
function forcarDownloadImagem() {
    if (imgPrincipal || molduraAtual) {
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        abrirTelaSalvar(dataURL);
    } else {
        alert('Nenhuma imagem para baixar!');
    }
}

// Função para abrir a tela de salvar e compartilhar
function abrirTelaSalvar(dataURL) {
    const novaJanela = window.open();
    const conteudo = `
        <html>
        <head>
            <title>Salvar e Compartilhar</title>
            <style>
                body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                img {
                    max-width: 100%;
                    height: auto;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .btn {
                    margin-top: 20px;
                    padding: 10px 20px;
                    font-size: 16px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                input[type="text"] {
                    padding: 10px;
                    font-size: 16px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    width: 100%;
                    max-width: 300px;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <img src="${dataURL}" alt="Imagem Editada" />
            <input type="text" id="nomeImagem" placeholder="Nome da Imagem">
            <button class="btn" onclick="salvarImagem()">Salvar</button>
            <button class="btn" onclick="compartilharImagem('${dataURL}')">Compartilhar</button>
            <button class="btn" onclick="window.location.href='editor.html'">Voltar ao Editor</button>
        </body>
        </html>
    `;
    novaJanela.document.write(conteudo);
    novaJanela.document.close();
}

// Função para salvar a imagem no Android ou Web
function salvarImagem() {
    const nomeImagem = document.getElementById('nomeImagem').value || 'imagem_sem_nome';
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    const fileName = `${nomeImagem}.jpg`;

    if (window.cordova) {
        // Salvando no Android
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
            dir.getFile(fileName, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        alert('Imagem salva com sucesso em ' + fileEntry.nativeURL);
                    };

                    fileWriter.onerror = function(e) {
                        alert('Erro ao salvar imagem: ' + e.toString());
                    };

                    const dataBlob = dataURLtoBlob(dataURL);
                    fileWriter.write(dataBlob);
                });
            }, function(error) {
                alert('Erro ao acessar diretório: ' + error.code);
            });
        });
    } else {
        // Salvando no Web (PC)
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = fileName;
        link.click();
    }
}

// Função para compartilhar a imagem via WhatsApp
function compartilharImagem(dataURL) {
    const link = `https://api.whatsapp.com/send?text=${encodeURIComponent('Confira esta imagem!')}&url=${dataURL}`;
    window.open(link, '_blank');
}


// Função para voltar para a tela inicial
function voltarParaHome() {
    window.location.href = 'index.html';
}
