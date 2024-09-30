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



// Caminhos para molduras padrão na pasta do aplicativo, com base nos nomes dos arquivos que você utilizou
let molduras = [
    'GD1.png',  // Primeiro grupo de molduras similares (1:1)
    'GD2.png',  // Primeiro grupo de molduras similares (2)
    'GD3.png',  // Primeiro grupo de molduras similares (3)
]; 

let molduraIndex = 0; // Índice atual da moldura
let imgPrincipal = null; // Armazena a imagem principal
let molduraAtual = null; // Armazena a moldura atual

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
        // Armazena a imagem principal
        imgPrincipal = img;
        desenharCanvas(); // Desenha o canvas com a nova imagem
    };
}

// Função para alternar entre as molduras padrão mantendo a transparência
function trocarMoldura() {
    if (imgPrincipal) { // Certifique-se de que a imagem foi inserida antes de aplicar a moldura
        const img = new Image();
        molduraIndex = (molduraIndex + 1) % molduras.length; // Alterna para a próxima moldura
        img.src = 'img/' + molduras[molduraIndex];
        img.onload = () => {
            molduraAtual = img; // Armazena a moldura atual
            desenharCanvas(); // Desenha o canvas com a nova moldura
        };
    } else {
        alert('Insira uma imagem primeiro!');
    }
}

// Função para selecionar uma moldura da galeria do dispositivo
function selecionarMolduraGaleria() {
    document.getElementById('molduraInput').click();
}

// Função para adicionar a moldura selecionada no canvas
function adicionarMolduraGaleria(event) {
    const img = new Image();
    img.src = URL.createObjectURL(event.target.files[0]);
    img.onload = () => {
        molduraAtual = img; // Armazena a moldura selecionada
        desenharCanvas(); // Desenha o canvas com a moldura da galeria
    };
}

// Função para desenhar o canvas
function desenharCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    if (imgPrincipal) {
        ctx.drawImage(imgPrincipal, 0, 0, canvas.width, canvas.height); // Desenha a imagem principal
    }
    if (molduraAtual) {
        ctx.drawImage(molduraAtual, 0, 0, canvas.width, canvas.height); // Desenha a moldura por cima
    }
}

// Função para alterar a proporção do canvas
function alterarProporcao(proporcao) {
    if (proporcao === '1:1') {
        canvas.width = 400;
        canvas.height = 400;
        molduras = ['GD1.png', 'GD2.png', 'GD3.png']; // Exemplo de molduras 1:1
    } else if (proporcao === '9:16') {
        canvas.width = 400;
        canvas.height = 711;
        molduras = ['E1.png', 'E2.png', 'E3.png']; // Exemplo de molduras 9:16
    }
    desenharCanvas(); // Re-desenhar o canvas com a nova proporção
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
                .instructions {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 20px;
                    text-align: center;
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



// Função para salvar a imagem no Android
function salvarImagem() {
    const nomeImagem = document.getElementById('nomeImagem').value || 'imagem_sem_nome';
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    const fileName = `${nomeImagem}.jpg`;

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
}

// Função para salvar imagem no PC
function salvarImagemWeb() {
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'imagem_editada.jpg';
    link.click();
}

// Função para detectar se está no Cordova (Android) ou no Web (PC)
function salvarImagemFinal() {
    if (window.cordova) {
        salvarImagem(); // Método Cordova (Android)
    } else {
        salvarImagemWeb(); // Método Web (PC)
    }
}

// Função auxiliar para converter DataURL para Blob
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Função para atualizar o histórico de imagens
function atualizarHistorico() {
    // Atualize esta função conforme necessário para exibir as imagens salvas no Android ou no Web
}


// Função para copiar o arquivo para um diretório público
function copiarParaDiretorioPublico(fileEntry, fileName) {
    const targetDir = cordova.file.externalRootDirectory + 'Pictures/'; // ou 'DCIM/'

    window.resolveLocalFileSystemURL(targetDir, function(directoryEntry) {
        fileEntry.copyTo(directoryEntry, fileName, function(newFileEntry) {
            alert('Imagem salva com sucesso em ' + newFileEntry.nativeURL);
        }, function(error) {
            alert('Erro ao copiar a imagem para o diretório público: ' + error.code);
        });
    }, function(error) {
        alert('Erro ao acessar o diretório público: ' + error.code);
    });
}




function compartilharImagem(dataURL) {
    const blob = dataURLtoBlob(dataURL);
    const fileName = 'imagem_para_compartilhar.jpg';
    const folderName = 'ImagensEditadas';

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
        dir.getDirectory(folderName, { create: true }, function(subDir) {
            subDir.getFile(fileName, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        window.plugins.socialsharing.share(null, null, fileEntry.nativeURL);
                    };
                    fileWriter.onerror = function(e) {
                        alert('Erro ao preparar imagem para compartilhamento: ' + e.toString());
                    };

                    fileWriter.write(blob);
                });
            });
        });
    });
}


// Função para voltar à página inicial
function voltarParaHome() {
    window.location.href = 'index.html';
}

// Referências ao canvas e contexto 2D
const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Array para armazenar o histórico de imagens criadas
let historicoImagens = [];

// Função para exibir a imagem em uma nova janela e salvar no histórico
function exibirImagem() {
    if (imgPrincipal || molduraAtual) {
        const dataURL = canvas.toDataURL('image/jpeg', 0.8); // Converte o canvas para uma URL de imagem (JPEG)
        const novaJanela = window.open(); // Abre uma nova janela ou aba

        // Cria o conteúdo da nova janela com a imagem, instruções e o botão de voltar
        const conteudo = `
            <html>
            <head>
                <title>Imagem Editada</title>
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
                    .instructions {
                        font-size: 16px;
                        color: #333;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <img src="${dataURL}" alt="Imagem Editada" />
                <div class="instructions">
                    Toque e segure na imagem para salvar no seu dispositivo ou usar as opções de compartilhamento.
                </div>
                <button class="btn" onclick="window.close()">Voltar</button>
            </body>
            </html>
        `;

        novaJanela.document.write(conteudo); // Escreve o conteúdo na nova janela
        novaJanela.document.close(); // Fecha o documento para finalizar o carregamento
    } else {
        alert('Nenhuma imagem para exibir!');
    }
}

// Função para atualizar a lista de histórico na tela inicial
function atualizarHistorico() {
    const listaHistorico = document.getElementById('listaHistorico');
    listaHistorico.innerHTML = ''; // Limpa a lista antes de atualizá-la

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
        dir.getDirectory('ImagensEditadas', { create: true }, function(subDir) {
            const directoryReader = subDir.createReader();
            directoryReader.readEntries(function(entries) {
                entries.forEach((entry) => {
                    if (entry.isFile) {
                        const li = document.createElement('li');
                        li.textContent = entry.name;
                        li.onclick = () => abrirImagemSalva(entry.nativeURL);
                        listaHistorico.appendChild(li);
                    }
                });
            });
        });
    });
}

function abrirImagemSalva(fileURL) {
    const novaJanela = window.open();
    const conteudo = `
        <html>
        <head>
            <title>Imagem Salva</title>
            <style>
                /* Estilos aqui para a nova tela */
            </style>
        </head>
        <body>
            <img src="${fileURL}" alt="Imagem Salva" />
            <button class="btn" onclick="window.plugins.socialsharing.share(null, null, '${fileURL}')">Compartilhar</button>
            <button class="btn" onclick="window.location.href='index.html'">Voltar</button>
        </body>
        </html>
    `;
    novaJanela.document.write(conteudo);
    novaJanela.document.close();
}


