document.addEventListener("DOMContentLoaded", function () {
    const lauraMessages = document.getElementById("laura-messages");
    const lauraInput = document.getElementById("laura-input");
    const lauraSendBtn = document.getElementById("laura-send-btn");
    const lauraChatContainer = document.querySelector(".laura-chat-container");
    const lauraChatIcon = document.getElementById("laura-chat-icon");

    let step = 0;
    let userName = "";
    let userService = "";
    let userSubService = "";
    let currentFlow = "";
    let conversationHistory = [];

    // Estrutura de serviços expandida
    const services = {
        "Marketing Digital": [
            "Estratégia de Conteúdo",
            "Mídias Sociais",
            "E-mail Marketing",
            "Inbound Marketing"
        ],
        "SEO": [
            "Otimização On-Page",
            "Otimização Off-Page",
            "SEO Técnico",
            "SEO Local"
        ],
        "Tráfego Pago": [
            "Google Ads",
            "Meta Ads (Facebook/Instagram)",
            "LinkedIn Ads",
            "TikTok Ads"
        ],
        "Business Intelligence": [
            "Análise de Dados",
            "Dashboards e Relatórios",
            "Consultoria de BI",
            "Power BI e Tableau"
        ],
        "Desenvolvimento Web": [
            "Criação de Sites",
            "E-commerce",
            "Sistemas Web Personalizados",
            "Aplicativos Web"
        ],
        "Consultoria Digital": [
            "Planejamento Estratégico",
            "Auditoria Digital",
            "Treinamento e Capacitação",
            "Transformação Digital"
        ]
    };

    // Respostas do chatbot melhoradas
    const responses = {
        falar_consultor: {
            keywords: ['falar', 'consultor', 'atendimento', 'contato', 'whatsapp', 'ligar', 'telefone'],
            response: 'Fico feliz em conectar você com nossa equipe! 😊<br><br>📞 <strong>Telefone:</strong> +55 (21) 98268-4928<br>📧 <strong>Email:</strong> contato@objetivalabs.com.br<br>💬 <strong>WhatsApp:</strong> Clique no botão abaixo para falar diretamente conosco<br><br>⏰ <strong>Horário:</strong> Segunda a Sexta, 9h às 18h'
        },
        servicos_geral: {
            keywords: ['serviços', 'servico', 'soluções', 'o que fazem', 'oferecem'],
            response: 'A Objetiva Labs oferece soluções completas de transformação digital! 🚀<br><br>Nossos principais serviços incluem:<br>• Marketing Digital<br>• SEO<br>• Tráfego Pago<br>• Business Intelligence<br>• Desenvolvimento Web<br>• Consultoria Digital<br><br>Em qual área você precisa de ajuda?'
        },
        sobre: {
            keywords: ['sobre', 'quem somos', 'história', 'missão', 'objetiva labs', 'empresa'],
            response: '🎯 A <strong>Objetiva Labs</strong> é uma agência focada em Inteligência de Dados e Performance Digital.<br><br>Nossa missão é transformar desafios em oportunidades, utilizando tecnologia de ponta e análise de dados para impulsionar o crescimento dos nossos clientes.<br><br>Acreditamos que cada negócio é único e merece soluções personalizadas!'
        },
        horario: {
            keywords: ['horário', 'horario', 'funciona', 'aberto', 'quando'],
            response: '⏰ Nosso horário de atendimento é:<br><br><strong>Segunda a Sexta:</strong> 9h às 18h<br><br>Fora desse horário, você pode deixar sua mensagem no WhatsApp e retornaremos assim que possível!'
        },
        preco: {
            keywords: ['preço', 'preco', 'valor', 'custo', 'quanto custa', 'orçamento'],
            response: '💰 Nossos valores variam de acordo com as necessidades específicas de cada projeto.<br><br>Para receber um orçamento personalizado, gostaria de falar com um consultor? Assim podemos entender melhor suas necessidades e oferecer a melhor solução!'
        },
        default: {
            response: "Hmm, não tenho certeza se entendi sua pergunta. 🤔<br><br>Você pode me perguntar sobre:<br><br>• 💬 Falar com Consultor<br>• 🚀 Nossos Serviços<br>• 🎯 Sobre a Objetiva Labs<br>• ⏰ Horário de Atendimento<br>• 💰 Orçamento<br><br>Ou escolha uma das opções abaixo:"
        }
    };

    // Função para salvar histórico
    function saveToHistory(sender, message) {
        conversationHistory.push({
            sender: sender,
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    function addMessage(sender, text, isButton = false, buttonLink = "", options = null) {
        const msg = document.createElement("div");
        msg.classList.add("laura-message", sender);
        
        if (isButton) {
            const btn = document.createElement("a");
            btn.href = buttonLink;
            btn.target = "_blank";
            btn.innerHTML = text;
            btn.classList.add("laura-whatsapp-btn");
            msg.appendChild(btn);
        } else {
            msg.innerHTML = text;
        }

        if (options) {
            const optionsDiv = document.createElement("div");
            optionsDiv.classList.add("laura-options");
            options.forEach(option => {
                const button = document.createElement("button");
                button.classList.add("laura-option-btn");
                button.textContent = option.text;
                button.onclick = () => {
                    addMessage("user", option.text);
                    saveToHistory("user", option.text);
                    optionsDiv.querySelectorAll('button').forEach(btn => btn.disabled = true);
                    optionsDiv.style.pointerEvents = 'none';
                    
                    setTimeout(() => botResponse(option.value), 500);
                };
                optionsDiv.appendChild(button);
            });
            msg.appendChild(optionsDiv);
        }

        lauraMessages.appendChild(msg);
        lauraMessages.scrollTop = lauraMessages.scrollHeight;
        
        // Salvar no histórico
        if (!options) {
            saveToHistory(sender, text);
        }
    }

    function addBotMessageWithTypingEffect(text, isButton = false, buttonLink = "", options = null) {
        const typingIndicator = document.createElement("div");
        typingIndicator.classList.add("laura-message", "bot", "laura-typing");
        typingIndicator.innerHTML = `<span></span><span></span><span></span>`;
        lauraMessages.appendChild(typingIndicator);
        lauraMessages.scrollTop = lauraMessages.scrollHeight;

        setTimeout(() => {
            if (lauraMessages.contains(typingIndicator)) {
                lauraMessages.removeChild(typingIndicator);
            }
            addMessage("bot", text, isButton, buttonLink, options);
        }, 1500);
    }

    function findResponse(userInput) {
        const input = userInput.toLowerCase();
        
        // Verifica as respostas específicas
        for (const [key, item] of Object.entries(responses)) {
            if (item.keywords && item.keywords.some(keyword => input.includes(keyword))) {
                return { key: key, response: item.response };
            }
        }
        
        // Verifica se é um serviço
        for (const service in services) {
            if (input.includes(service.toLowerCase())) {
                return { 
                    key: 'service_specific', 
                    response: `Ótima escolha! 🎯 O serviço de <strong>${service}</strong> é uma de nossas especialidades.<br><br>Gostaria de saber mais detalhes ou falar com um consultor?` 
                };
            }
        }
        
        return { key: 'default', response: responses.default.response };
    }

    function createServiceOptions(serviceObject) {
        return Object.keys(serviceObject).map(service => ({
            text: service,
            value: service
        }));
    }

    function createSubServiceOptions(subServices) {
        return subServices.map(subService => ({
            text: subService,
            value: subService
        }));
    }

    function botResponse(userInput) {
        // Fluxo principal de coleta de dados para falar com consultor
        if (currentFlow === "falar_consultor") {
            if (step === 0) {
                userName = userInput;
                addBotMessageWithTypingEffect(`Prazer em conhecê-lo, <strong>${userName}</strong>! 😊<br><br>Em qual de nossos serviços você precisa de ajuda?`, false, "", createServiceOptions(services));
                step++;
            } else if (step === 1) {
                userService = userInput;
                if (services[userService]) {
                    let subServiceOptions = createSubServiceOptions(services[userService]);
                    subServiceOptions.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_servicos' });
                    addBotMessageWithTypingEffect(`Excelente escolha! 🎯<br><br>Dentro de <strong>${userService}</strong>, qual é a sua necessidade específica?`, false, "", subServiceOptions);
                    step++;
                } else {
                    addBotMessageWithTypingEffect(`Entendi! Vou conectar você com um consultor especializado. 👨‍💼<br><br>Clique no botão abaixo para falar diretamente conosco no WhatsApp:`);
                    const message = `Olá Objetiva Labs! Meu nome é ${userName} e preciso de ajuda com ${userService}. A assistente virtual Laura me direcionou para falar com vocês. Poderiam me ajudar?`;
                    const whatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(message)}`;
                    setTimeout(() => {
                        addBotMessageWithTypingEffect("💬 Falar com Consultor no WhatsApp", true, whatsappLink);
                    }, 1000);
                    step = 0;
                    currentFlow = "";
                }
            } else if (step === 2) {
                if (userInput === 'voltar_servicos') {
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Em qual de nossos serviços você precisa de ajuda?`, false, "", createServiceOptions(services));
                    step--;
                    return;
                }

                userSubService = userInput;
                addBotMessageWithTypingEffect(`Perfeito, <strong>${userName}</strong>! 🎉<br><br>Vou conectar você com um consultor especializado em <strong>${userSubService}</strong>.<br><br>Clique no botão abaixo:`);
                const message = `Olá Objetiva Labs! Meu nome é ${userName} e preciso de ajuda com ${userSubService} dentro da área de ${userService}. A assistente virtual Laura me direcionou para falar com vocês. Poderiam me ajudar?`;
                const whatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(message)}`;
                setTimeout(() => {
                    addBotMessageWithTypingEffect("💬 Falar com Consultor no WhatsApp", true, whatsappLink);
                }, 1000);
                step = 0;
                currentFlow = "";
            }
            return;
        }

        // Tratamento de opções especiais
        switch(userInput) {
            case 'iniciar_atendimento':
                currentFlow = "falar_consultor";
                step = 0;
                addBotMessageWithTypingEffect("Perfeito! Vou te ajudar a conectar com nossa equipe. 😊<br><br>Para começar, qual é o seu nome?");
                break;
            case 'nossos_servicos':
                addBotMessageWithTypingEffect(responses.servicos_geral.response, false, "", createServiceOptions(services));
                break;
            case 'sobre_a_objetiva':
                addBotMessageWithTypingEffect(responses.sobre.response);
                setTimeout(() => {
                    addBotMessageWithTypingEffect("Gostaria de iniciar um atendimento ou conhecer nossos serviços?", false, "", [
                        { text: '💬 Iniciar Atendimento', value: 'iniciar_atendimento' },
                        { text: '🚀 Ver Serviços', value: 'nossos_servicos' }
                    ]);
                }, 2000);
                break;
            case 'servicos_sim':
            case 'servicos_nao':
                if (userInput === 'servicos_sim') {
                    currentFlow = "falar_consultor";
                    step = 0;
                    addBotMessageWithTypingEffect("Perfeito! Vou te ajudar a conectar com nossa equipe. 😊<br><br>Para começar, qual é o seu nome?");
                } else {
                    addBotMessageWithTypingEffect(responses.default.response, false, "", [
                        { text: '💬 Falar com Consultor', value: 'iniciar_atendimento' },
                        { text: '🚀 Nossos Serviços', value: 'nossos_servicos' },
                        { text: '🎯 Sobre a Objetiva Labs', value: 'sobre_a_objetiva' }
                    ]);
                }
                break;
            default:
                const result = findResponse(userInput);
                if (result.key !== 'default') {
                    addBotMessageWithTypingEffect(result.response);
                    
                    if (result.key === 'service_specific' || result.key === 'preco') {
                        setTimeout(() => {
                            addBotMessageWithTypingEffect('Gostaria de falar diretamente com um consultor?', false, "", [
                                { text: '✅ Sim, iniciar atendimento', value: 'iniciar_atendimento' },
                                { text: '🚀 Ver Todos os Serviços', value: 'nossos_servicos' }
                            ]);
                        }, 2000);
                    } else if (result.key === 'falar_consultor') {
                        setTimeout(() => {
                            addBotMessageWithTypingEffect('Gostaria de iniciar um atendimento agora?', false, "", [
                                { text: '✅ Sim, iniciar atendimento', value: 'iniciar_atendimento' },
                                { text: '🚀 Ver Serviços', value: 'nossos_servicos' }
                            ]);
                        }, 2000);
                    }
                } else {
                    addBotMessageWithTypingEffect(result.response, false, "", [
                        { text: '💬 Falar com Consultor', value: 'iniciar_atendimento' },
                        { text: '🚀 Nossos Serviços', value: 'nossos_servicos' },
                        { text: '🎯 Sobre a Objetiva Labs', value: 'sobre_a_objetiva' }
                    ]);
                }
                break;
        }
    }

    function sendMessage() {
        const userInput = lauraInput.value.trim();
        if (userInput === "") return;
        
        addMessage("user", userInput);
        lauraInput.value = "";
        
        if (currentFlow === "falar_consultor" && step === 0) {
            setTimeout(() => botResponse(userInput), 500);
        } else {
            setTimeout(() => botResponse(userInput), 500);
        }
    }

    lauraSendBtn.addEventListener("click", sendMessage);
    lauraInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") sendMessage();
    });

    // Inicialização do chat
    if (lauraChatIcon) {
        lauraChatIcon.addEventListener("click", function () {
            lauraChatContainer.style.display = "flex";
            lauraChatIcon.style.display = "none";
            addBotMessageWithTypingEffect("Olá! Eu sou a <strong>Laura</strong>, assistente virtual da Objetiva Labs! 👋");
            setTimeout(() => {
                addBotMessageWithTypingEffect("Como posso ajudá-lo hoje?", false, "", [
                    { text: '💬 Falar com Consultor', value: 'iniciar_atendimento' },
                    { text: '🚀 Nossos Serviços', value: 'nossos_servicos' },
                    { text: '🎯 Sobre a Objetiva Labs', value: 'sobre_a_objetiva' }
                ]);
            }, 2000);
        });
    } else {
        addBotMessageWithTypingEffect("Olá! Eu sou a <strong>Laura</strong>, assistente virtual da Objetiva Labs! 👋");
        setTimeout(() => {
            addBotMessageWithTypingEffect("Como posso ajudá-lo hoje?", false, "", [
                { text: '💬 Falar com Consultor', value: 'iniciar_atendimento' },
                { text: '🚀 Nossos Serviços', value: 'nossos_servicos' },
                { text: '🎯 Sobre a Objetiva Labs', value: 'sobre_a_objetiva' }
            ]);
        }, 2000);
    }

    // Função global para fechar o chat
    window.closeChat = function() {
        if (lauraChatContainer) lauraChatContainer.style.display = "none";
        if (lauraChatIcon) lauraChatIcon.style.display = "flex";
        step = 0;
        userName = "";
        userService = "";
        userSubService = "";
        currentFlow = "";
        lauraMessages.innerHTML = "";
        conversationHistory = [];
    };

    // Função para exportar histórico (útil para análise)
    window.exportChatHistory = function() {
        return conversationHistory;
    };
});

