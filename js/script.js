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

// Função para compartilhar a imagem (abre as opções de compartilhamento no Android ou exibe opções de compartilhamento no navegador)
function compartilharImagem() {
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    
    // Se o dispositivo for Android (Cordova), usamos o plugin de compartilhamento social
    if (window.cordova) {
        const blob = dataURLtoBlob(dataURL);  // Converte a imagem para Blob
        const nomeImagem = 'imagem_compartilhada.jpg';  // Nome padrão da imagem a ser compartilhada
        
        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function(dir) {
            dir.getFile(nomeImagem, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        // Usa o plugin de compartilhamento para abrir as opções de compartilhamento
                        window.plugins.socialsharing.share(null, null, fileEntry.nativeURL);
                    };
                    fileWriter.onerror = function(e) {
                        alert('Erro ao preparar a imagem para compartilhamento: ' + e.toString());
                    };
                    
                    const blob = dataURLtoBlob(dataURL);
                    fileWriter.write(blob);  // Escreve a imagem no arquivo
                });
            });
        });
    } else {
        // Para navegadores web (PC), usa a API de compartilhamento do navegador
        if (navigator.share) {
            navigator.share({
                title: 'Compartilhar Imagem',
                text: 'Confira esta imagem que eu criei!',
                url: dataURL
            }).catch((error) => console.log('Erro ao compartilhar:', error));
        } else {
            alert('Compartilhamento não é suportado no seu navegador. Tente em um dispositivo móvel.');
        }
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


// Função para baixar a imagem diretamente
function forcarDownloadImagem() {
if (imgPrincipal || molduraAtual) {
const dataURL = canvas.toDataURL('image/jpeg', 0.8);
const link = document.createElement('a');
link.href = dataURL;
link.download = 'imagem_editada.jpg';
link.click();
} else {
alert('Nenhuma imagem para baixar!');
}
}

// Função para compartilhar a imagem (abre o WhatsApp com a URL da imagem gerada)
function compartilharImagem(dataURL) {
const nomeImagem = document.getElementById('nomeImagem').value || 'imagem_sem_nome';
const mensagem = encodeURIComponent(`Confira esta imagem: ${nomeImagem}`);
const linkWhatsApp = `https://api.whatsapp.com/send?text=${mensagem}`;
window.open(linkWhatsApp, '_blank');
}

// Função para salvar a imagem no navegador (para ambiente Web)
function salvarImagemWeb() {
const dataURL = canvas.toDataURL('image/jpeg', 0.8);
const nomeImagem = document.getElementById('nomeImagem').value || 'imagem_editada';
const link = document.createElement('a');
link.href = dataURL;
link.download = `${nomeImagem}.jpg`;
link.click();
}


// Função para voltar para a tela inicial
function voltarParaHome() {
    window.location.href = 'index.html';
}
