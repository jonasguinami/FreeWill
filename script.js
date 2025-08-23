document.addEventListener('DOMContentLoaded', () => {
    // Seletores de elementos existentes
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollToDownBtn = document.getElementById('scrollToDownBtn');

    // NOVOS SELETORES PARA A INTERFACE
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatList = document.getElementById('chat-list');
    const uploadFileBtn = document.getElementById('upload-file-btn');
    const fileInput = document.getElementById('file-input');

    // ESTADO DA APLICAÇÃO
    let allChats = [];
    let activeChatId = null;

    // ===================================================================
    // FUNÇÕES DE GERENCIAMENTO DE CONVERSAS
    // ===================================================================
    
    function getSystemPrompt() {
        // Retorna um novo objeto de system prompt para cada nova conversa
        return {
            role: 'system',
            content: `Você é uma assistente de IA prática e eficiente. Sua missão é fornecer respostas diretas, corretas e úteis às perguntas dos usuários, com foco na clareza e precisão. Você deve evitar respostas vagas ou excessivamente detalhadas, a menos que solicitado. Você é adaptável e pode lidar com uma variedade de tarefas, desde correção gramatical até explicações técnicas, sempre mantendo a objetividade. **DIRETIVA PRIMÁRIA:** Sua prioridade é a precisão e a clareza. Responda à pergunta do usuário de forma concisa e factual sempre que possível. **DIRETIVA SECUNDÁRIA** Se a pergunta for ambígua ou aberta, peça esclarecimentos ao usuário antes de responder ou forneça uma resposta que aborde múltiplas interpretações, se apropriado. **FUNÇÕES PRINCIPAIS:** 1.  **Corretor:** Corrija a gramática e a ortografia de textos. 2.  **Tradutor:** Traduza textos entre diferentes idiomas de forma precisa. 3.  **Dicionário:** Forneça definições claras e os coletivos corretos para as palavras. 4.  **Assistente Geral:** Responda a perguntas factuais de conhecimento geral. 5.  **Resumidor:** Resuma textos longos em pontos principais. 6.  **Analisador de Sentimento:** Identifique o tom emocional de textos. 7.  **Gerador de Ideias:** Sugira ideias criativas para projetos ou problemas. 8.  **Consultor Técnico:** Forneça explicações técnicas simples para conceitos complexos 9.  **Planejador:** Ajude a organizar tarefas e criar listas de afazeres. 10. **Pesquisador:** Forneça informações baseadas em fatos e dados confiáveis. 11. **Tutor:** Explique conceitos educacionais de forma clara e acessível. 12. **Conselheiro de Estilo:** Dê dicas de escrita para melhorar a clareza e o impacto. 13. **Facilitador de Decisão:** Ajude a pesar prós e contras 14. **Narrador:** Crie histórias curtas ou roteiros com base em temas fornecidos. 15. **Editor de Texto:** Melhore a fluidez e a coerência de textos escritos **REGRAS DE COMPORTAMENTO:** - **Seja Concisa:** Responda de forma direta e objetiva, evitando rodeios. - **Peça Esclarecimentos:** Se a pergunta for vaga, peça mais detalhes antes de responder. - **Use Fontes Confiáveis:** Baseie suas respostas em informações verificadas e confiáveis. - **Fale a Verdade:** Se você não tem 100% de certeza sobre uma informação, admita que não sabe em vez de inventar uma resposta. - **Linguagem Natural:** Use português do Brasil de forma clara e natural. - **Foco na Tarefa:** Mantenha-se focado na tarefa solicitada pelo usuário sem desviar do assunto.`
        };
    }

    function saveChats() {
        localStorage.setItem('allUserChats', JSON.stringify(allChats));
        localStorage.setItem('activeUserChatId', activeChatId);
    }

    function loadChats() {
        const savedChats = localStorage.getItem('allUserChats');
        const savedActiveId = localStorage.getItem('activeUserChatId');
        
        if (savedChats) {
            allChats = JSON.parse(savedChats);
            activeChatId = savedActiveId;
        }

        if (!allChats.length || !allChats.find(chat => chat.id === activeChatId)) {
            createNewChat();
        } else {
            renderChatList();
            renderActiveChat();
        }
    }

    function createNewChat() {
        const newChat = {
            id: `chat_${Date.now()}`,
            title: 'Nova Conversa',
            messages: [getSystemPrompt()]
        };
        allChats.unshift(newChat);
        activeChatId = newChat.id;
        saveChats();
        renderChatList();
        renderActiveChat();
    }

    function switchChat(chatId) {
        activeChatId = chatId;
        saveChats();
        renderChatList();
        renderActiveChat();
    }

    function renderChatList() {
    chatList.innerHTML = '';
    allChats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-list-item';
        if (chat.id === activeChatId) {
            item.classList.add('active');
        }
        item.innerHTML = `<span class="chat-title">${escapeHTML(chat.title)}</span>
                          <button class="chat-options-btn" data-chat-id="${chat.id}">
                              <img src="assets/options.svg" alt="Opções">
                          </button>`;
        
        item.querySelector('.chat-title').addEventListener('click', () => switchChat(chat.id));
        // Adicionado o evento para o botão de opções
        item.querySelector('.chat-options-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o chat seja selecionado ao clicar no botão
            showOptionsMenu(chat.id, e.currentTarget);
        });
        
        chatList.appendChild(item);
        });
    }

    function renderActiveChat() {
        chatWindow.innerHTML = '';
        const activeChat = allChats.find(chat => chat.id === activeChatId);
        if (!activeChat) return;

        activeChat.messages.forEach(msg => {
            if (msg.role === 'user') {
                addUserMessage(msg.content, false);
            } else if (msg.role === 'assistant') {
                addAIMessage(msg.content, false);
            }
        });
    }

    // ===================================================================
    // FUNÇÕES DE EXIBIÇÃO DE MENSAGENS
    // ===================================================================

    function addUserMessage(message, save = true) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-wrapper');
        messageElement.innerHTML = `<div class="message user-message"><p>${escapeHTML(message)}</p></div>`;
        chatWindow.appendChild(messageElement);
        
        if (save) {
            const activeChat = allChats.find(chat => chat.id === activeChatId);
            activeChat.messages.push({ role: 'user', content: message });
            saveChats();
        }
        scrollToBottom();
    }

    function addAIMessage(message, save = true) {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');
    // Adicionados os novos botões regenerate-btn e flag-btn
    messageWrapper.innerHTML = `
        <div class="message ai-message">${marked.parse(message)}</div>
        <div class="message-actions">
            <button class="action-button copy-btn" title="Copiar"><img src="assets/copy.svg" alt="Copiar"></button>
            <button class="action-button share-btn" title="Compartilhar"><img src="assets/share.svg" alt="Compartilhar"></button>
            <button class="action-button like-btn" title="Gostei"><img src="assets/like.svg" alt="Like"></button>
            <button class="action-button dislike-btn" title="Não gostei"><img src="assets/like.svg" alt="Dislike" style="transform: rotate(180deg);"></button>
            <button class="action-button regenerate-btn" title="Refazer resposta"><img src="assets/rotate.svg" alt="Refazer"></button>
            <button class="action-button flag-btn" title="Apagar última mensagem"><img src="assets/flag.svg" alt="Apagar"></button>
        </div>`;
    
    chatWindow.appendChild(messageWrapper);
    
    // Adicionados os eventos para os novos botões
    messageWrapper.querySelector('.copy-btn').addEventListener('click', handleCopy);
    messageWrapper.querySelector('.share-btn').addEventListener('click', handleShare);
    messageWrapper.querySelector('.like-btn').addEventListener('click', handleFeedback);
    messageWrapper.querySelector('.dislike-btn').addEventListener('click', handleFeedback);
    messageWrapper.querySelector('.regenerate-btn').addEventListener('click', regenerateLastResponse);
    messageWrapper.querySelector('.flag-btn').addEventListener('click', deleteLastTurn);
    
    if (save) {
        const activeChat = allChats.find(chat => chat.id === activeChatId);
        activeChat.messages.push({ role: 'assistant', content: message });
        saveChats();
    }
    scrollToBottom();
    }
    
    // ===================================================================
    // FUNÇÕES AUXILIARES E DE LÓGICA DA IA
    // ===================================================================

    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.classList.add('message-wrapper');
        typingElement.innerHTML = `<div class="message ai-message"><p>Pensando...</p></div>`;
        chatWindow.appendChild(typingElement);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }

    function handleCopy(event) {
        const button = event.currentTarget;
        const messageText = button.closest('.message-wrapper').querySelector('.ai-message').innerText;
        navigator.clipboard.writeText(messageText).then(() => {
            button.innerHTML = '<img src="assets/like.svg" alt="Copiado!" style="filter: invert(1);">';
            setTimeout(() => { button.innerHTML = '<img src="assets/copy.svg" alt="Copiar">'; }, 1500);
        }).catch(err => console.error('Falha ao copiar texto: ', err));
    }

    async function handleShare(event) {
        const messageText = event.currentTarget.closest('.message-wrapper').querySelector('.ai-message').innerText;
        if (navigator.share) {
            try { await navigator.share({ title: 'Resposta do Assistente IA', text: messageText }); }
            catch (error) { console.error('Erro ao compartilhar:', error); }
        } else {
            alert("Seu navegador não suporta compartilhamento. O texto foi copiado.");
            handleCopy(event);
        }
    }

    function handleFeedback(event) {
        const button = event.currentTarget;
        const wrapper = button.parentElement;
        wrapper.querySelectorAll('.like-btn, .dislike-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.3';
        });
        button.style.opacity = '1';
        button.style.transform = 'scale(1.15)';
    }

    function scrollToBottom() {
        chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
    }

    function escapeHTML(str) {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }


    function deleteChat(chatId) {
    allChats = allChats.filter(chat => chat.id !== chatId);
    if (activeChatId === chatId) {
        activeChatId = allChats.length > 0 ? allChats[0].id : null;
        if (!activeChatId) {
            createNewChat();
        } else {
            renderActiveChat();
        }
    }
    saveChats();
    renderChatList();
}

function renameChat(chatId) {
    const chat = allChats.find(chat => chat.id === chatId);
    const newTitle = prompt("Digite o novo título da conversa:", chat.title);
    if (newTitle && newTitle.trim() !== "") {
        chat.title = newTitle.trim();
        saveChats();
        renderChatList();
    }
}

function formatChatForExport(chat) {
    let chatText = `Título: ${chat.title}\n\n`;
    chat.messages.forEach(msg => {
        if (msg.role !== 'system') {
            chatText += `[${msg.role === 'user' ? 'Usuário' : 'IA'}]:\n${msg.content}\n\n`;
        }
    });
    return chatText;
}

function shareChat(chatId) {
    const chat = allChats.find(chat => chat.id === chatId);
    const chatText = formatChatForExport(chat);
    if (navigator.share) {
        navigator.share({ title: chat.title, text: chatText });
    } else {
        alert("Seu navegador não suporta compartilhamento. O texto foi copiado.");
        navigator.clipboard.writeText(chatText);
    }
}

function downloadChat(chatId) {
    const chat = allChats.find(chat => chat.id === chatId);
    const chatText = formatChatForExport(chat);
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showOptionsMenu(chatId, buttonElement) {
    // Remove qualquer menu antigo
    const existingMenu = document.getElementById('options-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'options-menu';
    menu.className = 'options-menu';
    menu.innerHTML = `
        <button data-action="rename"><img src="assets/pen.svg" alt="Renomear"> Renomear</button>
        <button data-action="share"><img src="assets/share.svg" alt="Compartilhar"> Compartilhar</button>
        <button data-action="download"><img src="assets/download.svg" alt="Download"> Download (.txt)</button>
        <button data-action="delete"><img src="assets/trash.svg" alt="Excluir"> Excluir</button>
    `;
    document.body.appendChild(menu);

    const rect = buttonElement.getBoundingClientRect();
    menu.style.display = 'block';
    menu.style.top = `${rect.bottom}px`;
    menu.style.left = `${rect.left}px`;

    menu.querySelector('[data-action="rename"]').onclick = () => renameChat(chatId);
    menu.querySelector('[data-action="share"]').onclick = () => shareChat(chatId);
    menu.querySelector('[data-action="download"]').onclick = () => downloadChat(chatId);
    menu.querySelector('[data-action="delete"]').onclick = () => {
        if (confirm('Tem certeza que deseja excluir esta conversa?')) {
            deleteChat(chatId);
        }
    };

    // Fecha o menu se clicar fora
    setTimeout(() => {
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
            }
        }, { once: true });
    }, 0);
}

function regenerateLastResponse() {
    const activeChat = allChats.find(chat => chat.id === activeChatId);
    if (!activeChat || activeChat.messages.length < 2) return;

    // Remove a última resposta da IA do histórico
    activeChat.messages.pop();
    saveChats();
    renderActiveChat(); // Remove a última mensagem da tela
    
    showTypingIndicator();
    getAIResponse();
}

function deleteLastTurn() {
    if (!confirm('Tem certeza que deseja apagar sua última pergunta e a resposta da IA?')) return;
    
    const activeChat = allChats.find(chat => chat.id === activeChatId);
    if (!activeChat || activeChat.messages.length < 3) return; // Precisa ter system, user, assistant

    // Remove a resposta da IA e a pergunta do usuário
    activeChat.messages.pop();
    activeChat.messages.pop();
    saveChats();
    renderActiveChat();
}


    async function getAIResponse() {
        const apiUrl = 'https://wonder-literacy-recruitment-departmental.trycloudflare.com'
        const activeChat = allChats.find(chat => chat.id === activeChatId);
        if (!activeChat) return;

        let fullPrompt = "";
        activeChat.messages.forEach(msg => {
            const role = msg.role === 'AI' ? 'assistant' : msg.role;
            fullPrompt += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`;
        });
        fullPrompt += `<|im_start|>assistant\n`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    n_predict: 1024,
                    temperature: 0.7,
                    repeat_penalty: 1.15,
                    stop: ["<|im_end|>"]
                })
            });

            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

            const data = await response.json();
            const aiResponse = data.content.trim();
            
            removeTypingIndicator();
            addAIMessage(aiResponse, true); // Salva a nova resposta

        } catch (error) {
            console.error("Erro ao conectar com o servidor local:", error);
            removeTypingIndicator();
            addAIMessage("Oops! Não consegui me conectar ao servidor no seu PC. Verifique se o terminal com o `llama-server.exe` está aberto e rodando.", false);
        }
    }

    // ===================================================================
    // EVENT LISTENERS (OS "CÉREBROS" DOS BOTÕES)
    // ===================================================================

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (messageText) {
            addUserMessage(messageText, true); // Salva a nova mensagem do usuário
            messageInput.value = '';
            messageInput.style.height = 'auto';
            showTypingIndicator();
            getAIResponse();
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        chatWindow.scrollTo({ top: 0, behavior: 'smooth' });
    });

    scrollToDownBtn.addEventListener('click', () => {
        chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
    });

    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('visible');
    });

    newChatBtn.addEventListener('click', createNewChat);

    uploadFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Arquivo selecionado:', file.name);
            if (file.type === "text/plain") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    messageInput.value = e.target.result;
                    messageInput.style.height = 'auto';
                    messageInput.style.height = `${messageInput.scrollHeight}px`;
                };
                reader.readAsText(file);
            } else {
                alert('Por enquanto, só consigo ler arquivos .txt!');
            }
        }
    });

    // NOVO E CORRIGIDO: Armadilha para fechar a sidebar ao clicar fora dela
document.addEventListener('click', (event) => {
    // Verifica se a sidebar está visível E se o clique não foi nela
    // nem no botão que a abre.
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnToggleButton = toggleSidebarBtn.contains(event.target);

    if (sidebar.classList.contains('visible') && !isClickInsideSidebar && !isClickOnToggleButton) {
        sidebar.classList.remove('visible');
    }
});
    // Inicia a aplicação carregando as conversas salvas
    loadChats();

});
