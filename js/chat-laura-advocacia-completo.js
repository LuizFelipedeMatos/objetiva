document.addEventListener("DOMContentLoaded", function () {
    const lauraMessages = document.getElementById("laura-messages");
    const lauraInput = document.getElementById("laura-input");
    const lauraSendBtn = document.getElementById("laura-send-btn");

    let step = 0;
    let userName = "";
    let userRegion = "";
    let userArea = "";
    let userSubArea = "";
    let currentFlow = "";

    // Estrutura das áreas jurídicas conforme especificado
    const legalAreas = {
        "⚖️ Direito de Família": [
            "Casamento e União Estável",
            "Divórcio e Separação",
            "Guarda de Filhos",
            "Pensão Alimentícia",
            "Alienação Parental",
            "Investigação e Negação de Paternidade",
            "Adoção",
            "Interdição e Curatela",
            "Direitos dos Idosos e Incapazes",
            "Violência Doméstica e Familiar",
            "Planejamento Familiar",
            "Filiação Socioafetiva"
        ],
        "🏛️ Direito Criminal": [
            "Crimes contra a Pessoa",
            "Crimes contra o Patrimônio",
            "Crimes contra a Honra",
            "Crimes contra a Dignidade Sexual",
            "Crimes de Violência Doméstica",
            "Crimes de Trânsito",
            "Crimes Cibernéticos",
            "Crimes Ambientais",
            "Crimes Tributários e Financeiros",
            "Crimes contra a Administração Pública",
            "Execução Penal"
        ],
        "📋 Direito Civil": [
            "Responsabilidade Civil",
            "Contratos",
            "Direito das Coisas",
            "Obrigações",
            "Direito das Sucessões",
            "Direito do Consumidor",
            "Responsabilidade Civil Médica e Hospitalar",
            "Tutelas e Curatelas",
            "Direito Imobiliário"
        ],
        "💰 Direito Tributário e Fiscal": [
            "Tributos em Geral",
            "Impostos Federais",
            "Impostos Estaduais",
            "Impostos Municipais",
            "Planejamento Tributário",
            "Execução Fiscal e Defesa do Contribuinte",
            "Recuperação de Tributos",
            "Consultoria e Compliance Fiscal",
            "Defesas Administrativas",
            "Tributação de Pessoas Jurídicas e Físicas",
            "Regimes Especiais de Tributação"
        ],
        "🌍 Direito Internacional": [
            "Direito Internacional Público",
            "Direito Internacional Privado",
            "Extradição e Cooperação Jurídica",
            "Direitos Humanos",
            "Comércio Internacional",
            "Migração e Nacionalidade",
            "Reconhecimento de Sentenças Estrangeiras"
        ],
        "🏥 Planos de Saúde": [
            "Negativa de Cobertura",
            "Reembolso Médico",
            "Tratamentos Especiais",
            "Cirurgias e Exames",
            "Medicamentos de Alto Custo",
            "Planos Coletivos e Individuais",
            "Cancelamento Indevido",
            "Reajustes Abusivos",
            "Cláusulas Abusivas",
            "Tutelas de Urgência"
        ]
    };

    // Regiões disponíveis
    const regions = [
        "Rio de Janeiro",
        "Niterói",
        "Duque de Caxias",
        "Outro"
    ];

    // Respostas do chatbot baseadas no modelo integrado
    const responses = {
        agendar: {
            keywords: ['agendar', 'consulta', 'agendamento', 'marcar', 'horário', 'atendimento'],
            response: 'Para falar com o especialista, você pode:<br><br>📞 <strong>Ligar:</strong> (21) 97984-2002<br>📧 <strong>Email:</strong> contato@escritorio.adv.br<br>💬 <strong>WhatsApp:</strong> Clique no botão abaixo<br><br>⏰ <strong>Horário de funcionamento:</strong> Segunda a Sexta, 9h às 18h.'
        },
        areas: {
            keywords: ['áreas', 'atuação', 'especialidades', 'direito', 'família', 'civil', 'criminal', 'tributário', 'planos', 'saúde'],
            response: 'Nosso escritório atua nas seguintes áreas:<br><br>⚖️ <strong>Direito de Família</strong><br>• Divórcio e Separação<br>• Guarda de Filhos<br>• Pensão Alimentícia<br>• União Estável<br><br>🏛️ <strong>Direito Criminal</strong><br>• Crimes contra a Pessoa<br>• Crimes contra o Patrimônio<br>• Crimes de Trânsito<br>• Execução Penal<br><br>📋 <strong>Direito Civil</strong><br>• Responsabilidade Civil<br>• Contratos<br>• Direito das Sucessões<br>• Direito Imobiliário<br><br>💰 <strong>Direito Tributário e Fiscal</strong><br>• Planejamento Tributário<br>• Execução Fiscal<br>• Recuperação de Tributos<br><br>🌍 <strong>Direito Internacional</strong><br>• Direitos Humanos<br>• Migração e Nacionalidade<br>• Comércio Internacional<br><br>🏥 <strong>Planos de Saúde</strong><br>• Negativa de Cobertura<br>• Reembolso Médico<br>• Tratamentos Especiais'
        },
        sobre: {
            keywords: ['sobre', 'advogado', 'experiência', 'formação', 'oab'],
            response: 'Nosso escritório conta com mais de 15 anos de experiência em diversas áreas do Direito.<br><br>👨‍⚖️ <strong>Experiência:</strong> Mais de 15 anos<br>🎓 <strong>Formação:</strong> Especializada em diversas áreas<br>🏆 <strong>Especializações:</strong><br>• Direito de Família<br>• Direito Criminal<br>• Direito Civil<br>• Direito Tributário<br>• Direito Internacional<br><br>Atendimento humanizado e personalizado para cada cliente.'
        },
        contato: {
            keywords: ['contato', 'telefone', 'email', 'endereço', 'localização', 'onde'],
            response: 'Entre em contato conosco:<br><br>📞 <strong>Telefone:</strong> (21) 97984-2002<br>📧 <strong>Email:</strong> contato@escritorio.adv.br<br>📍 <strong>Localização:</strong> Rio de Janeiro, RJ<br>🕘 <strong>Horário:</strong> Segunda a Sexta, 9h às 18h<br><br>Estamos prontos para ajudá-lo!'
        }
    };

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

        // Removido o bloco de opções da bolha de mensagem do bot.
        // Elas serão adicionadas separadamente após a bolha de mensagem.
        // O código para adicionar as opções como uma bolha separada é movido para a função `addBotMessageWithTypingEffect`.
        // A função `addMessage` agora só lida com a mensagem de texto.
        // if (options) {
        //     const optionsDiv = document.createElement("div");
        //     optionsDiv.classList.add("laura-options");
        //     options.forEach(option => {
        //         const button = document.createElement("button");
        //         button.classList.add("laura-option-btn");
        //         button.textContent = option.text;
        //         button.onclick = () => {
        //             addMessage("user", option.text);
        //             optionsDiv.querySelectorAll('button').forEach(btn => btn.disabled = true);
        //             optionsDiv.style.pointerEvents = 'none';
        //             
        //             setTimeout(() => botResponse(option.value), 500);
        //         };
        //         optionsDiv.appendChild(button);
        //     });
        //     msg.appendChild(optionsDiv);
        // }

        lauraMessages.appendChild(msg);
        lauraMessages.scrollTop = lauraMessages.scrollHeight;
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
            // 1. Adiciona a mensagem de texto do bot
            addMessage("bot", text, isButton, buttonLink); // Não passa as opções aqui
            
            // 2. Se houver opções, adiciona-as como uma bolha separada e alinhada à direita
            if (options) {
                const optionsMessageElement = document.createElement("div");
                // Usar a classe 'laura-options-bubble' que está alinhada à direita no CSS
                optionsMessageElement.classList.add("laura-message", "laura-options-bubble"); 
                
                const optionsContainer = document.createElement("div");
                optionsContainer.classList.add("laura-options"); // O container de opções agora tem flex-direction: column e align-items: flex-end no CSS
                
                options.forEach(option => {
                    const optionButton = document.createElement("button");
                    optionButton.classList.add("laura-option-btn");
                    optionButton.textContent = option.text;
                    optionButton.onclick = () => {
                        addMessage("user", option.text);
                        // Desabilitar todas as opções após a seleção
                        optionsContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
                        optionsContainer.style.pointerEvents = 'none';
                        
                        setTimeout(() => botResponse(option.value), 500);
                    };
                    optionsContainer.appendChild(optionButton);
                });
                
                optionsMessageElement.appendChild(optionsContainer);
                lauraMessages.appendChild(optionsMessageElement);
            }

            // Garante que a tela role para o final após adicionar tudo
            lauraMessages.scrollTop = lauraMessages.scrollHeight;
        }, 1500);
    }

    function showAreasSequentially() {
        const areas = [
            "⚖️ <strong>Direito de Família</strong><br>• Casamento e União Estável<br>• Divórcio e Separação<br>• Guarda de Filhos<br>• Pensão Alimentícia",
            "🏛️ <strong>Direito Criminal</strong><br>• Crimes contra a Pessoa<br>• Crimes contra o Patrimônio<br>• Crimes de Trânsito<br>• Execução Penal",
            "📋 <strong>Direito Civil</strong><br>• Responsabilidade Civil<br>• Contratos<br>• Direito das Sucessões<br>• Direito Imobiliário",
            "💰 <strong>Direito Tributário e Fiscal</strong><br>• Planejamento Tributário<br>• Execução Fiscal<br>• Recuperação de Tributos<br>• Defesas Administrativas",
            "🌍 <strong>Direito Internacional</strong><br>• Direitos Humanos<br>• Migração e Nacionalidade<br>• Comércio Internacional<br>• Extradição e Cooperação Jurídica",
            "🏥 <strong>Planos de Saúde</strong><br>• Negativa de Cobertura<br>• Reembolso Médico<br>• Tratamentos Especiais<br>• Medicamentos de Alto Custo"
        ];

        areas.forEach((area, index) => {
            setTimeout(() => {
                addBotMessageWithTypingEffect(area);
                if (index === areas.length - 1) {
                    setTimeout(() => {
                        addBotMessageWithTypingEffect("Deseja ajuda em alguma destas áreas?", false, "", [
                            { text: '✅ Sim', value: 'areas_sim' },
                            { text: '❌ Não', value: 'areas_nao' },
                            { text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_inicio' }
                        ]);
                    }, 1500);
                }
            }, index * 1500);
        });
    }

    function findResponse(userInput) {
        const input = userInput.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (response.keywords.some(keyword => input.includes(keyword))) {
                return response.response;
            }
        }
        return 'Desculpe, não entendi sua pergunta. Você pode tentar perguntar sobre:<br><br>• Falar com especialista<br>• Áreas de atuação<br>• Informações sobre o escritório<br>• Formas de contato<br><br>Ou clique em uma das opções abaixo:';
    }

    function createAreaOptions(areas) {
        const options = Object.keys(areas).map(area => ({
            text: area,
            value: area
        }));
        options.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_regiao' });
        return options;
    }

    function createSubAreaOptions(subAreas) {
        const options = subAreas.map(subArea => ({
            text: subArea,
            value: subArea
        }));
        options.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_area' });
        return options;
    }

    function createRegionOptions() {
        const options = regions.map(region => ({
            text: region,
            value: region
        }));
        options.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_nome' });
        return options;
    }

    function botResponse(userInput) {
        // Fluxo principal de coleta de dados
        if (currentFlow === "falar_especialista") {
            if (step === 0) {
                // Passo 0: Coletar nome
                userName = userInput;
                addBotMessageWithTypingEffect(`Olá, ${userName}! 😊`, false, "",);
                addBotMessageWithTypingEffect(`Em qual região você está localizado?`, false, "", createRegionOptions());
                step++;
            } else if (step === 1) {
                // Passo 1: Selecionar região ou voltar
                if (userInput === 'voltar_nome') {
                    userName = "";
                    step = 0;
                    addBotMessageWithTypingEffect("Sem problema! 😊<br><br>Para começar, qual é o seu nome?");
                    return;
                }
                
                userRegion = userInput;
                addBotMessageWithTypingEffect(`Perfeito!`, false, "");
                addBotMessageWithTypingEffect(`Agora me diga: qual área do direito você precisa de ajuda?`, false, "", createAreaOptions(legalAreas));
                step++;
            } else if (step === 2) {
                // Passo 2: Selecionar área ou voltar
                if (userInput === 'voltar_regiao') {
                    userRegion = "";
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Em qual região você está localizado?`, false, "", createRegionOptions());
                    step = 1;
                    return;
                }
                
                userArea = userInput;
                if (legalAreas[userArea]) {
                    addBotMessageWithTypingEffect(`Excelente! 🎯`, false, "",);
                    addBotMessageWithTypingEffect(`Dentro de ${userArea}, qual é a sua necessidade específica?`, false, "", createSubAreaOptions(legalAreas[userArea]));
                    step++;
                } else {
                    addBotMessageWithTypingEffect(`Entendi! Clique no botão abaixo para falar diretamente com o especialista via WhatsApp:`);
                    const message = `Olá! Meu nome é ${userName}, sou da região de ${userRegion} e preciso de atendimento jurídico na área de ${userArea}. A assistente virtual Laura me direcionou para falar com vocês. Poderiam me ajudar?`;
                    const whatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(message)}`;
                    setTimeout(() => {
                        addBotMessageWithTypingEffect("💬 Falar com Especialista", true, whatsappLink);
                    }, 1000);
                    // Reset
                    step = 0;
                    currentFlow = "";
                    userName = "";
                    userRegion = "";
                    userArea = "";
                }
            } else if (step === 3) {
                // Passo 3: Selecionar sub-área ou voltar
                if (userInput === 'voltar_area') {
                    userArea = "";
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Qual área do direito você precisa de ajuda?`, false, "", createAreaOptions(legalAreas));
                    step = 2;
                    return;
                }
                
                userSubArea = userInput;
                
                // Mostrar resumo e opções de confirmar ou voltar
                const summary = `<strong>📋 Resumo:</strong><br><br>👤 <strong>Nome:</strong> ${userName}<br>📍 <strong>Região:</strong> ${userRegion}<br>⚖️ <strong>Área:</strong> ${userArea}<br>🎯 <strong>Necessidade:</strong> ${userSubArea}<br><br>Deseja confirmar e falar com um especialista?`;
                addBotMessageWithTypingEffect(summary, false, "", [
                    { text: '✅ Sim', value: 'confirmar_especialista' },
                    { text: '⬅️ Voltar e Alterar', value: 'voltar_subarea' }
                ]);
                step++;
            } else if (step === 4) {
                // Passo 4: Confirmar ou voltar
                if (userInput === 'voltar_subarea') {
                    userSubArea = "";
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Dentro de <strong>${userArea}</strong>, qual é a sua necessidade específica?`, false, "", createSubAreaOptions(legalAreas[userArea]));
                    step = 3;
                    return;
                }
                
                // Confirmar e enviar para WhatsApp
                addBotMessageWithTypingEffect(`Perfeito ${userName}.`);
                addBotMessageWithTypingEffect(`Vou conectar você com um especialista.`);
                addBotMessageWithTypingEffect(`Clique no botão abaixo:`);
                const message = `Olá! Meu nome é ${userName}, sou da região de ${userRegion} e preciso de atendimento jurídico em ${userArea}, em específico ${userSubArea}. A assistente virtual Laura me direcionou para falar com vocês. Poderiam me ajudar?`;
                const whatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(message)}`;
                setTimeout(() => {
                    addBotMessageWithTypingEffect("💬 Falar com Especialista", true, whatsappLink);
                }, 1000);
                // Reset
                step = 0;
                currentFlow = "";
                userName = "";
                userRegion = "";
                userArea = "";
                userSubArea = "";
            }
            return;
        }

        // Tratamento de opções especiais
        switch(userInput) {
            case 'falar_especialista':
                currentFlow = "falar_especialista";
                step = 0;
                addBotMessageWithTypingEffect("Perfeito! Para que eu possa direcioná-lo melhor, me informe seu nome:");
                break;
            case 'sobre_escritorio':
                addBotMessageWithTypingEffect(responses.sobre.response);
                setTimeout(() => {
                    addBotMessageWithTypingEffect("Está precisando de ajuda?", false, "", [
                        { text: '✅ Sim', value: 'sobre_sim' },
                        { text: '❌ Não', value: 'sobre_nao' },
                        { text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_inicio' }
                    ]);
                }, 2000);
                break;
            case 'sobre_sim':
                currentFlow = "falar_especialista";
                step = 0;
                addBotMessageWithTypingEffect("Perfeito! Para que eu possa direcioná-lo melhor, me informe seu nome:");
                break;
            case 'sobre_nao':
                addBotMessageWithTypingEffect("Compreendido! De qualquer forma, deixamos nosso contato abaixo para o que precisar:<br><br>📞 <strong>Telefone:</strong> (21) 97984-2002<br>📧 <strong>Email:</strong> contato@escritorio.adv.br<br>📍 <strong>Localização:</strong> Rio de Janeiro, RJ<br>🕘 <strong>Horário:</strong> Segunda a Sexta, 9h às 18h<br><br>Estamos prontos para ajudá-lo!");
                break;
            case 'areas_atuacao':
                addBotMessageWithTypingEffect("Nosso escritório atua nas seguintes áreas:");
                setTimeout(() => {
                    showAreasSequentially();
                }, 1500);
                break;
            case 'areas_sim':
                currentFlow = "falar_especialista";
                step = 0;
                addBotMessageWithTypingEffect("Perfeito! Para que eu possa direcioná-lo melhor, me informe seu nome:");
                break;
            case 'areas_nao':
                addBotMessageWithTypingEffect("Compreendido! De qualquer forma, deixamos nosso contato abaixo para o que precisar:<br><br>📞 <strong>Telefone:</strong> (21) 97984-2002<br>📧 <strong>Email:</strong> contato@escritorio.adv.br<br>📍 <strong>Localização:</strong> Rio de Janeiro, RJ<br>🕘 <strong>Horário:</strong> Segunda a Sexta, 9h às 18h<br><br>Estamos prontos para ajudá-lo!");
                break;
            case 'voltar_inicio':
                step = 0;
                currentFlow = "";
                userName = "";
                userRegion = "";
                userArea = "";
                userSubArea = "";
                addBotMessageWithTypingEffect("Como posso ajudá-lo hoje?", false, "", [
                    { text: '💬 Falar com Especialista', value: 'falar_especialista' },
                    { text: '👨‍⚖️ Sobre o Escritório', value: 'sobre_escritorio' },
                    { text: '⚖️ Áreas de Atuação', value: 'areas_atuacao' }
                ]);
                break;
            default:
                // Primeiro, verifica se é uma pergunta específica
                const response = findResponse(userInput);
                if (response !== findResponse('')) { // Se encontrou uma resposta específica
                    addBotMessageWithTypingEffect(response);
                    // Adiciona opções de contato após responder
                    setTimeout(() => {
                        addBotMessageWithTypingEffect('Gostaria de falar diretamente com um especialista?', false, "", [
                            { text: '💬 Falar com Especialista', value: 'falar_especialista' },
                            { text: '❓ Outras Dúvidas', value: 'voltar_inicio' }
                        ]);
                    }, 2000);
                } else {
                    addBotMessageWithTypingEffect("Desculpe, não entendi. Como posso ajudá-lo?", false, "", [
                        { text: '💬 Falar com Especialista', value: 'falar_especialista' },
                        { text: '👨‍⚖️ Sobre o Escritório', value: 'sobre_escritorio' },
                        { text: '⚖️ Áreas de Atuação', value: 'areas_atuacao' }
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
        
        setTimeout(() => botResponse(userInput), 500);
    }

    if (lauraSendBtn) {
        lauraSendBtn.addEventListener("click", sendMessage);
    }
    
    if (lauraInput) {
        lauraInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") sendMessage();
        });
    }

    // Inicialização do chat
    addBotMessageWithTypingEffect("Olá! Eu sou a Laura, assistente virtual do escritório! 👋");
    setTimeout(() => {
        addBotMessageWithTypingEffect("Como posso ajudá-lo hoje?", false, "", [
            { text: '💬 Falar com Especialista', value: 'falar_especialista' },
            { text: '👨‍⚖️ Sobre o Escritório', value: 'sobre_escritorio' },
            { text: '⚖️ Áreas de Atuação', value: 'areas_atuacao' }
        ]);
    }, 2000);
});

