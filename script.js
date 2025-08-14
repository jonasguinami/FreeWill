document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Ajusta a altura do textarea dinamicamente
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        const scrollHeight = messageInput.scrollHeight;
        messageInput.style.height = `${scrollHeight}px`;
    });

    // Evento de envio do formulário
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();

        if (messageText) {
            addUserMessage(messageText);
            messageInput.value = '';
            messageInput.style.height = 'auto'; // Reseta a altura
            
            showTypingIndicator();
            getAIResponse(messageText);
        }
    });

    // Botão de voltar ao topo
    scrollToTopBtn.addEventListener('click', () => {
        chatWindow.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-wrapper');
        messageElement.innerHTML = `
            <div class="message user-message">
                <p>${escapeHTML(message)}</p>
            </div>
        `;
        chatWindow.appendChild(messageElement);
        scrollToBottom();
    }

    function addAIMessage(message) {
        const messageId = `ai-msg-${Date.now()}`;
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');

        // ADIÇÃO: Novos botões de copiar e compartilhar no template
        messageWrapper.innerHTML = `
            <div class="message ai-message">
                <p>${escapeHTML(message)}</p>
            </div>
            <div class="message-actions">
                <button class="action-button copy-btn" title="Copiar resposta">
                    <img src="assets/copy.svg" alt="Copiar">
                </button>
                <button class="action-button share-btn" title="Compartilhar">
                    <img src="assets/share.svg" alt="Compartilhar">
                </button>
                <button class="action-button like-btn" title="Gostei">
                    <img src="assets/like.svg" alt="Like">
                </button>
                <button class="action-button dislike-btn" title="Não gostei">
                    <img src="assets/like.svg" alt="Dislike" style="transform: rotate(180deg);">
                </button>
            </div>
        `;
        chatWindow.appendChild(messageWrapper);
        
        // Adiciona os eventos de clique para os novos botões
        messageWrapper.querySelector('.copy-btn').addEventListener('click', handleCopy);
        messageWrapper.querySelector('.share-btn').addEventListener('click', handleShare);
        messageWrapper.querySelector('.like-btn').addEventListener('click', handleFeedback);
        messageWrapper.querySelector('.dislike-btn').addEventListener('click', handleFeedback);
        
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('message-wrapper');
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="message ai-message">
                <p>Digitando...</p>
            </div>
        `;
        chatWindow.appendChild(typingElement);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // NOVA FUNÇÃO: Lida com o clique no botão de copiar
    function handleCopy(event) {
        const button = event.currentTarget;
        const messageWrapper = button.closest('.message-wrapper');
        const messageText = messageWrapper.querySelector('.ai-message p').innerText;

        navigator.clipboard.writeText(messageText).then(() => {
            // Feedback visual de sucesso
            button.innerHTML = '<img src="assets/like.svg" alt="Copiado!" style="filter: invert(1);">'; // Ícone temporário de "check"
            setTimeout(() => {
                button.innerHTML = '<img src="assets/copy.svg" alt="Copiar">';
            }, 1500);
        }).catch(err => {
            console.error('Falha ao copiar texto: ', err);
            alert("Não foi possível copiar o texto.");
        });
    }

    // NOVA FUNÇÃO: Lida com o clique no botão de compartilhar
    async function handleShare(event) {
        const button = event.currentTarget;
        const messageWrapper = button.closest('.message-wrapper');
        const messageText = messageWrapper.querySelector('.ai-message p').innerText;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Resposta do Assistente IA',
                    text: messageText,
                });
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
            }
        } else {
            // Fallback para navegadores que não suportam a Web Share API
            alert("Seu navegador não suporta compartilhamento. O texto foi copiado para a área de transferência.");
            handleCopy(event); // Reutiliza a função de cópia
        }
    }

    function handleFeedback(event) {
        const button = event.currentTarget;
        const wrapper = button.parentElement;
        
        // Desabilita todos os botões de feedback (like/dislike) para evitar cliques duplos
        wrapper.querySelectorAll('.like-btn, .dislike-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.3';
        });

        // Destaca o botão clicado
        button.style.opacity = '1';
        button.style.transform = 'scale(1.15)';
        console.log(`Feedback recebido: ${button.title}`);
    }

    function scrollToBottom() {
        chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
    }

    function escapeHTML(str) {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    // ATUALIZE ESTA FUNÇÃO NO SEU script.js

async function getAIResponse(userMessage) {
    // ATUALIZAÇÃO: Usando o IP da sua rede local
    const apiUrl = 'http://192.168.1.35:8080/completion';

    // Instrução para a IA
    const systemPrompt = "A seguir, uma conversa entre um usuário e um assistente de IA. O assistente é prestativo, criativo e responde sempre em português do Brasil.";
    
    // Montamos o prompt completo com a instrução.
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\nAI:`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Enviamos o prompt completo com a instrução
                prompt: fullPrompt,
                n_predict: 256, 
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }

        const data = await response.json();
        
        removeTypingIndicator();
        addAIMessage(data.content.trim()); 

    } catch (error) {
        console.error("Erro ao conectar com o servidor local:", error);
        removeTypingIndicator();
        addAIMessage("Oops! Não consegui me conectar ao servidor no seu PC. Verifique se o terminal com o `llama-server.exe` está aberto e rodando, e se o Firewall do Windows está permitindo a conexão.");
    }
}

    // Fim da atualização da função getAIResponse

});