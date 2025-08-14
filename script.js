document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Ajusta a altura do textarea dinamicamente
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    // Evento de envio do formulário
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();

        if (messageText) {
            addUserMessage(messageText);
            messageInput.value = '';
            messageInput.style.height = 'auto'; // Reseta a altura
            
            // Simula o "digitando..." e chama a IA
            showTypingIndicator();
            getAIResponse(messageText);
        }
    });

    // Botão de voltar ao topo
    scrollToTopBtn.addEventListener('click', () => {
        chatWindow.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function addUserMessage(message) {
        const messageElement = `
            <div class="message-wrapper">
                <div class="message user-message">
                    <p>${message}</p>
                </div>
            </div>
        `;
        chatWindow.innerHTML += messageElement;
        scrollToBottom();
    }

    function addAIMessage(message) {
        const messageId = `ai-msg-${Date.now()}`;
        const messageElement = `
            <div class="message-wrapper">
                <div class="message ai-message">
                    <p>${message}</p>
                </div>
                <div class="message-actions">
                    <button class="action-button like-btn" data-target="${messageId}" title="Gostei">
                        <img src="assets/like.svg" alt="Like">
                    </button>
                    <button class="action-button dislike-btn" data-target="${messageId}" title="Não gostei">
                        <img src="assets/like.svg" alt="Dislike" style="transform: rotate(180deg);">
                    </button>
                </div>
            </div>
        `;
        chatWindow.innerHTML += messageElement;
        
        // Adiciona os eventos de clique para os novos botões
        document.querySelector(`.like-btn[data-target="${messageId}"]`).addEventListener('click', handleFeedback);
        document.querySelector(`.dislike-btn[data-target="${messageId}"]`).addEventListener('click', handleFeedback);
        
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        const typingElement = `
            <div class="message-wrapper" id="typing-indicator">
                <div class="message ai-message">
                    <p>Digitando...</p>
                </div>
            </div>
        `;
        chatWindow.innerHTML += typingElement;
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function handleFeedback(event) {
        // Lógica para feedback - aqui você pode enviar para uma análise ou apenas dar um feedback visual
        const button = event.currentTarget;
        button.style.filter = 'invert(58%) sepia(98%) saturate(1031%) hue-rotate(222deg) brightness(101%) contrast(98%)'; // Torna o SVG roxo
        console.log(`Feedback recebido: ${button.title}`);
        
        // Desabilita os dois botões do par para evitar múltiplos cliques
        const wrapper = button.parentElement;
        wrapper.querySelectorAll('.action-button').forEach(btn => btn.disabled = true);
    }

    function scrollToBottom() {
        chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
    }

    // ===================================================================
    // AQUI VAI A MÁGICA: Conectando com o modelo de IA
    // ===================================================================
    async function getAIResponse(userMessage) {
        // Simulação de resposta da IA com um atraso
        // **SUBSTITUA ESTE BLOCO pelo código real de chamada da IA**
        setTimeout(() => {
            removeTypingIndicator();
            const DUMMY_RESPONSE = "Esta é uma resposta simulada. Para fazer isso funcionar de verdade, você precisa conectar esta interface a um backend que rode o modelo Mistral 7B. Veja as explicações na documentação do projeto.";
            addAIMessage(DUMMY_RESPONSE);
        }, 2000); // Atraso de 2 segundos para simular processamento
        
        /*
        // --- MÉTODO 1: CHAMADA DE API (RECOMENDADO) ---
        // Você precisaria de um servidor rodando o modelo
        
        try {
            const response = await fetch('URL_DA_SUA_API_DO_MISTRAL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userMessage })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            removeTypingIndicator();
            addAIMessage(data.response); // Supondo que a API retorne { "response": "texto..." }

        } catch (error) {
            console.error("Erro ao chamar a API:", error);
            removeTypingIndicator();
            addAIMessage("Desculpe, não consegui me conectar ao meu cérebro. Tente novamente mais tarde.");
        }
        */
        
        /*
        // --- MÉTODO 2: USANDO transformers.js (EXPERIMENTAL) ---
        // Exigiria configuração adicional e importação da biblioteca.
        // https://huggingface.co/docs/transformers.js/index
        
        // Exemplo hipotético (requer a importação da lib no seu HTML)
        import { pipeline } from '@xenova/transformers';

        // ... (código para carregar o modelo na primeira vez)
        
        let generator = await pipeline('text-generation', 'Xenova/mistral-7b-instruct-v0.2');
        let output = await generator(userMessage, {
             max_new_tokens: 256,
             // ... outros parâmetros
        });
        
        removeTypingIndicator();
        addAIMessage(output[0].generated_text);
        */
    }
});