document.addEventListener('DOMContentLoaded', () => {
    // Seletores de elementos
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollToDownBtn = document.getElementById('scrollToDownBtn');
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatList = document.getElementById('chat-list');
    const uploadFileBtn = document.getElementById('upload-file-btn');
    const fileInput = document.getElementById('file-input');
    const sendButton = document.querySelector('.send-button');
    const sendButtonImg = sendButton.querySelector('img');

    // Estado da Aplicação
    let allChats = [];
    let activeChatId = null;
    let isGenerating = false;
    let abortController = null; // Controlador para pausar a geração

    // ===================================================================
    // FUNÇÕES DE GERENCIAMENTO DE CONVERSAS
    // ===================================================================
    
    function getSystemPrompt() {
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
            title: 'Chat Atual',
            messages: [getSystemPrompt()]
        };
        allChats.unshift(newChat);
        activeChatId = newChat.id;
        saveChats();
        renderChatList();
        renderActiveChat();
    }

    function switchChat(chatId) {
        if (isGenerating) {
            stopGeneration();
        }
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
            item.querySelector('.chat-options-btn').addEventListener('click', (e) => {
                e.stopPropagation();
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
        scrollToBottom();
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
    // FUNÇÕES AUXILIARES E DE INTERFACE
    // ===================================================================

    function showTypingIndicator() {
        // Se já existir, não cria outro
        if (document.getElementById('typing-indicator')) return;
        
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.classList.add('message-wrapper');
        typingElement.innerHTML = `<div class="message ai-message"><div class="dot-wave"></div></div>`;
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
            button.style.borderColor = '#4caf50';
            setTimeout(() => { button.style.borderColor = ''; }, 1500);
        }).catch(err => console.error('Falha ao copiar texto: ', err));
    }

    async function handleShare(event) {
        const messageText = event.currentTarget.closest('.message-wrapper').querySelector('.ai-message').innerText;
        if (navigator.share) {
            try { await navigator.share({ title: 'Resposta da Guinam-IA', text: messageText }); }
            catch (error) { console.error('Erro ao compartilhar:', error); }
        } else {
            alert("Seu navegador não suporta compartilhamento. O texto foi copiado.");
            navigator.clipboard.writeText(messageText);
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

    // ===================================================================
    // FUNÇÕES DO MENU DE OPÇÕES (RENOMEAR, EXCLUIR, ETC.)
    // ===================================================================

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
        const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
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
        // Função para fechar o menu e remover o listener de clique
        const closeMenu = () => {
            const menu = document.getElementById('options-menu');
            if (menu) {
                menu.remove();
                document.removeEventListener('click', handleOutsideClick);
            }
        };

        // Função para lidar com cliques fora do menu
        const handleOutsideClick = (e) => {
            const menu = document.getElementById('options-menu');
            // Se o clique não foi no menu E não foi no botão que o abriu, fecha o menu
            if (menu && !menu.contains(e.target) && !buttonElement.contains(e.target)) {
                closeMenu();
            }
        };
        
        closeMenu(); // Garante que qualquer menu antigo seja fechado primeiro

        const menu = document.createElement('div');
        menu.id = 'options-menu';
        menu.className = 'options-menu';
        menu.innerHTML = `
            <button data-action="rename"><img src="assets/pen.svg" alt="Renomear"> Renomear</button>
            <button data-action="share"><img src="assets/share.svg" alt="Compartilhar"> Compartilhar</button>
            <button data-action="download"><img src="assets/download.svg" alt="Download"> Download (.txt)</button>
            <button data-action="delete" style="color: #ff5c5c;"><img src="assets/trash.svg" alt="Excluir"> Excluir</button>
        `;
        document.body.appendChild(menu);

        const rect = buttonElement.getBoundingClientRect();
        menu.style.display = 'block';
        menu.style.top = `${rect.bottom + window.scrollY}px`;
        menu.style.left = `${rect.left + window.scrollX - menu.offsetWidth + rect.width}px`;

        // Atribui as ações e garante que o menu feche após cada uma
        menu.querySelector('[data-action="rename"]').onclick = () => { renameChat(chatId); closeMenu(); };
        menu.querySelector('[data-action="share"]').onclick = () => { shareChat(chatId); closeMenu(); };
        menu.querySelector('[data-action="download"]').onclick = () => { downloadChat(chatId); closeMenu(); };
        menu.querySelector('[data-action="delete"]').onclick = () => {
            if (confirm('Tem certeza que deseja excluir esta conversa?')) {
                deleteChat(chatId);
            }
            closeMenu();
        };

        // Adiciona a "armadilha" para fechar o menu ao clicar fora
        setTimeout(() => { // Usamos setTimeout para garantir que este listener seja adicionado após o evento de clique atual
            document.addEventListener('click', handleOutsideClick);
        }, 0);
    }

    // ===================================================================
    // FUNÇÕES DE AÇÃO DA MENSAGEM DA IA (REFAZER, APAGAR)
    // ===================================================================

    function regenerateLastResponse() {
        if (isGenerating) return;
        const activeChat = allChats.find(chat => chat.id === activeChatId);
        if (!activeChat || activeChat.messages.length < 2) return;

        activeChat.messages.pop(); // Remove a última resposta da IA
        saveChats();
        renderActiveChat();
        
        getAIResponse();
    }

    function deleteLastTurn() {
        if (isGenerating) return;
        if (confirm('Tem certeza que deseja apagar sua última pergunta e a resposta da IA?')) {
            const activeChat = allChats.find(chat => chat.id === activeChatId);
            if (!activeChat || activeChat.messages.length < 3) return;

            activeChat.messages.pop(); // Remove a resposta da IA
            activeChat.messages.pop(); // Remove a pergunta do usuário
            saveChats();
            renderActiveChat();
        }
    }

    // ===================================================================
    // FUNÇÃO PRINCIPAL DE COMUNICAÇÃO COM A IA (STREAMING)
    // ===================================================================

    async function getAIResponse() {
    isGenerating = true;
    abortController = new AbortController();
    sendButtonImg.src = 'assets/pause.svg';
    sendButton.title = 'Pausar geração';
    
    const apiUrl = 'https://bunny-fifty-hat-babies.trycloudflare.com/completion'; // VERIFIQUE SEU LINK!
    const activeChat = allChats.find(chat => chat.id === activeChatId);
    if (!activeChat) {
        stopGeneration();
        return;
    }
    
    // 1. MOSTRA OS 3 PONTINHOS PRIMEIRO E SEMPRE
    showTypingIndicator();

    // 2. Monta o prompt
    let fullPrompt = "";
    activeChat.messages.forEach(msg => {
        const role = msg.role === 'AI' ? 'assistant' : msg.role;
        fullPrompt += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`;
    });
    fullPrompt += `<|im_start|>assistant\n`;

    let messageWrapper, pElement;
    let fullResponseText = "";
    let responseStarted = false; // Flag para controlar a primeira resposta

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: fullPrompt,
                n_predict: 1024,
                temperature: 0.7,
                repeat_penalty: 1.15,
                stop: ["<|im_end|>"],
                stream: true
            }),
            signal: abortController.signal
        });
        
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n').filter(line => line.trim().startsWith('data:'));

            for (const line of lines) {
                const jsonStr = line.substring(6);
                try {
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.content) {
                        // ACONTECE SÓ NA PRIMEIRA VEZ QUE RECEBEMOS DADOS
                        if (!responseStarted) {
                            responseStarted = true;
                            removeTypingIndicator(); // Remove os pontinhos
                            // Cria o balão de mensagem vazio
                            messageWrapper = document.createElement('div');
                            messageWrapper.classList.add('message-wrapper');
                            messageWrapper.innerHTML = `<div class="message ai-message"><p></p></div>`;
                            chatWindow.appendChild(messageWrapper);
                            pElement = messageWrapper.querySelector('p');
                        }
                        
                        fullResponseText += parsed.content;
                        pElement.innerHTML = marked.parse(fullResponseText + '<span class="streaming-cursor">|</span>');
                        scrollToBottom();
                    }
                } catch (e) { /* Ignora erros de parse */ }
            }
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Geração de resposta pausada pelo usuário.');
        } else {
            console.error("Erro no stream da IA:", error);
            // Garante que os pontinhos sumam em caso de erro
            removeTypingIndicator(); 
            addAIMessage("Oops! Não consegui me conectar ao servidor. Verifique se os terminais estão rodando.", false);
        }
    } finally {
        // Bloco de finalização (limpa, salva e adiciona botões)
        if (pElement) {
            pElement.innerHTML = marked.parse(fullResponseText);
        }
        
        // Só salva e adiciona botões se alguma resposta foi gerada
        if (responseStarted && fullResponseText.trim().length > 0) {
            const currentChat = allChats.find(chat => chat.id === activeChatId);
            if (currentChat) {
                currentChat.messages.push({ role: 'assistant', content: fullResponseText });
                saveChats();
            }

            const actions = document.createElement('div');
            actions.className = 'message-actions';
            actions.innerHTML = `
                <button class="action-button copy-btn" title="Copiar"><img src="assets/copy.svg" alt="Copiar"></button>
                <button class="action-button share-btn" title="Compartilhar"><img src="assets/share.svg" alt="Compartilhar"></button>
                <button class="action-button like-btn" title="Gostei"><img src="assets/like.svg" alt="Like"></button>
                <button class="action-button dislike-btn" title="Não gostei"><img src="assets/like.svg" alt="Dislike" style="transform: rotate(180deg);"></button>
                <button class="action-button regenerate-btn" title="Refazer resposta"><img src="assets/rotate.svg" alt="Refazer"></button>
                <button class="action-button flag-btn" title="Apagar última mensagem"><img src="assets/flag.svg" alt="Apagar"></button>
            `;
            messageWrapper.appendChild(actions);

            actions.querySelector('.copy-btn').addEventListener('click', handleCopy);
            actions.querySelector('.share-btn').addEventListener('click', handleShare);
            actions.querySelector('.like-btn').addEventListener('click', handleFeedback);
            actions.querySelector('.dislike-btn').addEventListener('click', handleFeedback);
            actions.querySelector('.regenerate-btn').addEventListener('click', regenerateLastResponse);
            actions.querySelector('.flag-btn').addEventListener('click', deleteLastTurn);
        }
        
        stopGeneration();
    }
}




    function stopGeneration() {
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
        isGenerating = false;
        sendButtonImg.src = 'assets/send.svg';
        sendButton.title = 'Enviar Mensagem';
        removeTypingIndicator();
    }

    // ===================================================================
    // EVENT LISTENERS (OS "CÉREBROS" DOS BOTÕES)
    // ===================================================================

    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = `${messageInput.scrollHeight}px`;
    });

    chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (isGenerating) {
        setGeneratingState(false); // Pausa a geração se estiver acontecendo
        return;
    }
    
    const messageText = messageInput.value.trim();
    if (messageText) {
        addUserMessage(messageText, true);
        messageInput.value = '';
        messageInput.dispatchEvent(new Event('input'));
        
        // CORREÇÃO: A ORDEM CERTA É ESTA
        showTypingIndicator(); // 1. Mostra a animação
        getAIResponse();       // 2. SÓ DEPOIS chama a IA
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
            if (file.type === "text/plain") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    messageInput.value = e.target.result;
                    messageInput.dispatchEvent(new Event('input'));
                };
                reader.readAsText(file);
            } else {
                alert('Por enquanto, só consigo ler arquivos .txt!');
            }
        }
    });

    document.addEventListener('click', (event) => {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggleButton = toggleSidebarBtn.contains(event.target);
        if (sidebar.classList.contains('visible') && !isClickInsideSidebar && !isClickOnToggleButton) {
            sidebar.classList.remove('visible');
        }
    });

    loadChats();
});

