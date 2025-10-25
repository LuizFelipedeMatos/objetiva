document.addEventListener("DOMContentLoaded", function () {
    const lauraMessages = document.getElementById("laura-messages");
    const lauraInput = document.getElementById("laura-input");
    const lauraSendBtn = document.getElementById("laura-send-btn");

    let step = 0;
    let userName = "";
    let currentFlow = "";
    let studentData = {
        name: "",
        courseLevel: "",
        courseDomain: "",
        isTransfer: false,
        wantsVisit: false,
        visitDate: "",
        phone: ""
    };

    // Estrutura de cursos
    const courseLevels = {
        "🌱 Básico (Iniciante)": [
            "Inglês para Iniciantes Absolutos",
            "Conversação Básica",
            "Gramática Fundamental",
            "Vocabulário do Dia a Dia"
        ],
        "📚 Intermediário": [
            "Conversação Intermediária",
            "Gramática Avançada",
            "Inglês para Viagens",
            "Business English Básico"
        ],
        "🎓 Avançado": [
            "Fluência em Conversação",
            "Preparatório para TOEFL",
            "Preparatório para IELTS",
            "Business English Avançado"
        ],
        "🏆 Domínio (Proficiência)": [
            "Inglês Nativo",
            "Preparatório para Cambridge (CPE)",
            "Inglês Acadêmico",
            "Inglês para Negócios Internacionais"
        ]
    };

    const courseDomains = [
        "🗣️ Conversação",
        "📖 Leitura e Escrita",
        "👂 Compreensão Auditiva",
        "✍️ Gramática",
        "💼 Inglês para Negócios",
        "✈️ Inglês para Viagens",
        "🎯 Preparatório para Exames (TOEFL, IELTS, Cambridge)"
    ];

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

    function createLevelOptions() {
        const options = Object.keys(courseLevels).map(level => ({
            text: level,
            value: level
        }));
        options.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_inicio' });
        return options;
    }

    function createDomainOptions() {
        const options = courseDomains.map(domain => ({
            text: domain,
            value: domain
        }));
        options.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_nivel' });
        return options;
    }

    function createTransferOptions() {
        return [
            { text: '✅ Sim, sou aluno de outra escola', value: 'sim_transferencia' },
            { text: '❌ Não, sou novo no inglês', value: 'nao_transferencia' },
            { text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_dominio' }
        ];
    }

    function createVisitOptions() {
        return [
            { text: '✅ Sim, quero conhecer a unidade', value: 'sim_visita' },
            { text: '❌ Não, prefiro continuar online', value: 'nao_visita' },
            { text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_transferencia' }
        ];
    }

    function formatStudentSummary() {
        let summary = `<strong>📋 Resumo da Sua Solicitação:</strong><br><br>`;
        summary += `👤 <strong>Nome:</strong> ${studentData.name}<br>`;
        summary += `📚 <strong>Nível:</strong> ${studentData.courseLevel}<br>`;
        summary += `🎯 <strong>Área de Interesse:</strong> ${studentData.courseDomain}<br>`;
        summary += `🔄 <strong>Transferência:</strong> ${studentData.isTransfer ? 'Sim, sou aluno de outra escola' : 'Não, sou novo no inglês'}<br>`;
        
        if (studentData.wantsVisit) {
            summary += `🏫 <strong>Visita à Unidade:</strong> Sim, desejo conhecer<br>`;
        } else {
            summary += `🏫 <strong>Visita à Unidade:</strong> Prefiro continuar online<br>`;
        }
        
        if (studentData.phone) {
            summary += `📱 <strong>Telefone:</strong> ${studentData.phone}<br>`;
        }
        
        return summary;
    }

    function botResponse(userInput) {
        if (currentFlow === "informacoes_curso") {
            if (step === 0) {
                // Passo 0: Coletar nome
                userName = userInput;
                studentData.name = userInput;
                addBotMessageWithTypingEffect(`Prazer em conhecê-lo, <strong>${userName}</strong>! 😊<br><br>Qual é o seu nível atual de inglês?`, false, "", createLevelOptions());
                step++;
            } else if (step === 1) {
                // Passo 1: Selecionar nível ou voltar
                if (userInput === 'voltar_inicio') {
                    step = 0;
                    currentFlow = "";
                    studentData = {
                        name: "",
                        courseLevel: "",
                        courseDomain: "",
                        isTransfer: false,
                        wantsVisit: false,
                        visitDate: "",
                        phone: ""
                    };
                    addBotMessageWithTypingEffect("Como posso ajudá-lo?", false, "", [
                        { text: '📚 Informações sobre Cursos', value: 'informacoes_curso' },
                        { text: '🎯 Teste de Nivelamento', value: 'teste_nivelamento' },
                        { text: '🏫 Conhecer Unidade', value: 'conhecer_unidade' },
                        { text: '💬 Falar com Consultor', value: 'falar_consultor' }
                    ]);
                    return;
                }
                
                studentData.courseLevel = userInput;
                addBotMessageWithTypingEffect(`Excelente! 🎯<br><br>Em qual área você gostaria de focar seus estudos?`, false, "", createDomainOptions());
                step++;
            } else if (step === 2) {
                // Passo 2: Selecionar domínio ou voltar
                if (userInput === 'voltar_nivel') {
                    studentData.courseLevel = "";
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Qual é o seu nível atual de inglês?`, false, "", createLevelOptions());
                    step = 1;
                    return;
                }
                
                studentData.courseDomain = userInput;
                addBotMessageWithTypingEffect(`Ótima escolha! 👍<br><br>Você é aluno de outra escola de inglês e deseja fazer transferência?`, false, "", createTransferOptions());
                step++;
            } else if (step === 3) {
                // Passo 3: Transferência ou voltar
                if (userInput === 'voltar_dominio') {
                    studentData.courseDomain = "";
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Em qual área você gostaria de focar seus estudos?`, false, "", createDomainOptions());
                    step = 2;
                    return;
                }
                
                if (userInput === 'sim_transferencia') {
                    studentData.isTransfer = true;
                    addBotMessageWithTypingEffect(`Que legal! 🎉 Temos condições especiais para alunos transferidos!<br><br>Gostaria de conhecer nossa unidade presencialmente?`, false, "", createVisitOptions());
                } else {
                    studentData.isTransfer = false;
                    addBotMessageWithTypingEffect(`Perfeito! Vamos começar sua jornada no inglês! 🚀<br><br>Gostaria de conhecer nossa unidade presencialmente?`, false, "", createVisitOptions());
                }
                step++;
            } else if (step === 4) {
                // Passo 4: Visita à unidade ou voltar
                if (userInput === 'voltar_transferencia') {
                    studentData.isTransfer = false;
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Você é aluno de outra escola de inglês e deseja fazer transferência?`, false, "", createTransferOptions());
                    step = 3;
                    return;
                }
                
                if (userInput === 'sim_visita') {
                    studentData.wantsVisit = true;
                    addBotMessageWithTypingEffect(`Excelente! 🏫<br><br>Por favor, informe seu telefone para agendarmos sua visita:<br><br><em>(Digite o telefone no campo abaixo)</em>`);
                    step++;
                } else {
                    studentData.wantsVisit = false;
                    addBotMessageWithTypingEffect(`Sem problema! Podemos continuar online. 💻<br><br>Por favor, informe seu telefone para entrarmos em contato:<br><br><em>(Digite o telefone no campo abaixo)</em>`);
                    step++;
                }
            } else if (step === 5) {
                // Passo 5: Coletar telefone
                studentData.phone = userInput;
                
                const summary = formatStudentSummary();
                addBotMessageWithTypingEffect(summary);
                
                setTimeout(() => {
                    addBotMessageWithTypingEffect(`Deseja confirmar e falar com um consultor?`, false, "", [
                        { text: '✅ Confirmar e Falar com Consultor', value: 'confirmar_consultor' },
                        { text: '⬅️ Voltar e Alterar', value: 'voltar_visita' }
                    ]);
                }, 2000);
                step++;
            } else if (step === 6) {
                // Passo 6: Confirmar ou voltar
                if (userInput === 'voltar_visita') {
                    studentData.phone = "";
                    studentData.wantsVisit = false;
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Gostaria de conhecer nossa unidade presencialmente?`, false, "", createVisitOptions());
                    step = 4;
                    return;
                }
                
                // Confirmar e enviar para WhatsApp
                addBotMessageWithTypingEffect(`Perfeito, <strong>${studentData.name}</strong>! 🎉<br><br>Vou conectar você com um consultor especializado.<br><br>Clique no botão abaixo:`);
                
                let message = `Olá! Meu nome é ${studentData.name} e gostaria de informações sobre os cursos de inglês.\n\n`;
                message += `📚 Nível: ${studentData.courseLevel}\n`;
                message += `🎯 Área de Interesse: ${studentData.courseDomain}\n`;
                message += `🔄 Transferência: ${studentData.isTransfer ? 'Sim, sou aluno de outra escola' : 'Não, sou novo no inglês'}\n`;
                message += `🏫 Visita à Unidade: ${studentData.wantsVisit ? 'Sim, desejo conhecer' : 'Prefiro continuar online'}\n`;
                message += `📱 Telefone: ${studentData.phone}\n\n`;
                message += `A assistente virtual Laura me ajudou com essas informações. Aguardo contato!`;
                
                const whatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(message)}`;
                
                setTimeout(() => {
                    addBotMessageWithTypingEffect("💬 Falar com Consultor no WhatsApp", true, whatsappLink);
                }, 1000);
                
                // Reset
                step = 0;
                currentFlow = "";
                userName = "";
                studentData = {
                    name: "",
                    courseLevel: "",
                    courseDomain: "",
                    isTransfer: false,
                    wantsVisit: false,
                    visitDate: "",
                    phone: ""
                };
            }
            return;
        }

        // Tratamento de opções especiais
        switch(userInput) {
            case 'informacoes_curso':
                currentFlow = "informacoes_curso";
                step = 0;
                addBotMessageWithTypingEffect("Ótimo! Vou te ajudar a encontrar o curso ideal. 😊<br><br>Primeiro, qual é o seu nome?");
                break;
            case 'teste_nivelamento':
                addBotMessageWithTypingEffect("Nosso teste de nivelamento é gratuito e ajuda a identificar seu nível atual de inglês! 📝<br><br>O teste é realizado online e leva cerca de 20 minutos.<br><br>Gostaria de agendar um teste de nivelamento?", false, "", [
                    { text: '✅ Sim, quero fazer o teste', value: 'agendar_teste' },
                    { text: '📚 Ver Informações sobre Cursos', value: 'informacoes_curso' }
                ]);
                break;
            case 'agendar_teste':
                addBotMessageWithTypingEffect("Perfeito! Vou te direcionar para agendar seu teste de nivelamento.<br><br>Clique no botão abaixo:");
                const testMessage = `Olá! Gostaria de agendar um teste de nivelamento de inglês. A assistente virtual Laura me direcionou para este contato.`;
                const testWhatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(testMessage)}`;
                setTimeout(() => {
                    addBotMessageWithTypingEffect("💬 Agendar Teste de Nivelamento", true, testWhatsappLink);
                }, 1000);
                break;
            case 'conhecer_unidade':
                addBotMessageWithTypingEffect("Ficaremos felizes em recebê-lo em nossa unidade! 🏫<br><br>📍 <strong>Endereço:</strong> Rua Exemplo, 123 - Centro<br>🕘 <strong>Horário:</strong> Segunda a Sexta, 8h às 20h | Sábado, 9h às 13h<br><br>Gostaria de agendar uma visita?", false, "", [
                    { text: '✅ Sim, quero agendar', value: 'agendar_visita' },
                    { text: '📚 Ver Informações sobre Cursos', value: 'informacoes_curso' }
                ]);
                break;
            case 'agendar_visita':
                addBotMessageWithTypingEffect("Excelente! Vou te direcionar para agendar sua visita.<br><br>Clique no botão abaixo:");
                const visitMessage = `Olá! Gostaria de agendar uma visita à unidade para conhecer os cursos de inglês. A assistente virtual Laura me direcionou para este contato.`;
                const visitWhatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(visitMessage)}`;
                setTimeout(() => {
                    addBotMessageWithTypingEffect("💬 Agendar Visita à Unidade", true, visitWhatsappLink);
                }, 1000);
                break;
            case 'falar_consultor':
                addBotMessageWithTypingEffect("Clique no botão abaixo para falar diretamente com um consultor via WhatsApp:");
                const consultorMessage = `Olá! Gostaria de falar com um consultor sobre os cursos de inglês. A assistente virtual Laura me direcionou para este contato.`;
                const consultorWhatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(consultorMessage)}`;
                setTimeout(() => {
                    addBotMessageWithTypingEffect("💬 Falar com Consultor", true, consultorWhatsappLink);
                }, 1000);
                break;
            default:
                addBotMessageWithTypingEffect("Desculpe, não entendi. Como posso ajudá-lo?", false, "", [
                    { text: '📚 Informações sobre Cursos', value: 'informacoes_curso' },
                    { text: '🎯 Teste de Nivelamento', value: 'teste_nivelamento' },
                    { text: '🏫 Conhecer Unidade', value: 'conhecer_unidade' },
                    { text: '💬 Falar com Consultor', value: 'falar_consultor' }
                ]);
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
    addBotMessageWithTypingEffect("Olá! Bem-vindo à nossa Escola de Inglês! 🎓");
    setTimeout(() => {
        addBotMessageWithTypingEffect("Como posso ajudá-lo hoje?", false, "", [
            { text: '📚 Informações sobre Cursos', value: 'informacoes_curso' },
            { text: '🎯 Teste de Nivelamento', value: 'teste_nivelamento' },
            { text: '🏫 Conhecer Unidade', value: 'conhecer_unidade' },
            { text: '💬 Falar com Consultor', value: 'falar_consultor' }
        ]);
    }, 2000);
});

