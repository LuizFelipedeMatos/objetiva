document.addEventListener("DOMContentLoaded", function () {
    const lauraMessages = document.getElementById("laura-messages");
    const lauraInput = document.getElementById("laura-input");
    const lauraSendBtn = document.getElementById("laura-send-btn");

    let step = 0;
    let userName = "";
    let currentFlow = "";
    let orderData = {
        pizzaType: "",
        pizzaSize: "",
        pizzaPrice: 0,
        hasDrink: false,
        drinkType: "",
        drinkPrice: 0,
        paymentMethod: "",
        deliveryOption: "",
        address: "",
        subtotal: 0,
        deliveryFee: 0,
        total: 0
    };

    // Estrutura de produtos
    const pizzaMenu = {
        "🍕 Pizza de Calabresa": {
            "Pequena (4 fatias)": 25.90,
            "Média (6 fatias)": 35.90,
            "Grande (8 fatias)": 45.90,
            "Família (12 fatias)": 65.90
        },
        "🍕 Pizza de Mussarela": {
            "Pequena (4 fatias)": 22.90,
            "Média (6 fatias)": 32.90,
            "Grande (8 fatias)": 42.90,
            "Família (12 fatias)": 62.90
        },
        "🍕 Pizza de Portuguesa": {
            "Pequena (4 fatias)": 28.90,
            "Média (6 fatias)": 38.90,
            "Grande (8 fatias)": 48.90,
            "Família (12 fatias)": 68.90
        },
        "🍕 Pizza de Frango com Catupiry": {
            "Pequena (4 fatias)": 27.90,
            "Média (6 fatias)": 37.90,
            "Grande (8 fatias)": 47.90,
            "Família (12 fatias)": 67.90
        },
        "🍕 Pizza Margherita": {
            "Pequena (4 fatias)": 26.90,
            "Média (6 fatias)": 36.90,
            "Grande (8 fatias)": 46.90,
            "Família (12 fatias)": 66.90
        }
    };

    const drinks = {
        "🥤 Refrigerante Lata (350ml)": 5.00,
        "🥤 Refrigerante 1L": 8.00,
        "🥤 Refrigerante 2L": 12.00,
        "🧃 Suco Natural 500ml": 10.00,
        "💧 Água Mineral 500ml": 3.00,
        "🍺 Cerveja Lata (350ml)": 6.00
    };

    const paymentMethods = [
        "💳 Cartão de Crédito",
        "💳 Cartão de Débito",
        "💵 Dinheiro",
        "📱 PIX"
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

        // Se houver opções, não as adicionamos à bolha de mensagem do bot.
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

    function createPizzaOptions() {
        return Object.keys(pizzaMenu).map(pizza => ({
            text: pizza,
            value: pizza
        }));
    }

    function createSizeOptions(pizzaType) {
        const sizes = pizzaMenu[pizzaType];
        const options = Object.keys(sizes).map(size => ({
            text: `${size} - R$ ${sizes[size].toFixed(2)}`,
            value: size
        }));
        options.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_pizza' });
        return options;
    }

    function createDrinkOptions() {
        const options = Object.keys(drinks).map(drink => ({
            text: `${drink} - R$ ${drinks[drink].toFixed(2)}`,
            value: drink
        }));
        options.push({ text: '❌ Não quero bebida', value: 'sem_bebida' });
        options.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_tamanho' });
        return options;
    }

    function createPaymentOptions() {
        const options = paymentMethods.map(method => ({
            text: method,
            value: method
        }));
        options.push({ text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_bebida' });
        return options;
    }

    function createDeliveryOptions() {
        return [
            { text: '🏠 Entrega em Domicílio', value: 'delivery' },
            { text: '🏪 Retirar na Loja', value: 'pickup' },
            { text: '⬅️ Voltar ao Menu Anterior', value: 'voltar_pagamento' }
        ];
    }

    function calculateDeliveryFee(address) {
        // Simulação simples de cálculo de frete
        // Em um sistema real, isso seria baseado em CEP ou distância
        return 0; // Frete grátis para pedidos acima de R$ 89,90
    }

    function formatOrderSummary() {
        let summary = `<strong>📋 Resumo do Pedido:</strong><br><br>`;
        summary += `🍕 <strong>Pizza:</strong> ${orderData.pizzaType}<br>`;
        summary += `📏 <strong>Tamanho:</strong> ${orderData.pizzaSize}<br>`;
        summary += `💰 <strong>Preço:</strong> R$ ${orderData.pizzaPrice.toFixed(2)}<br><br>`;
        
        if (orderData.hasDrink) {
            summary += `🥤 <strong>Bebida:</strong> ${orderData.drinkType}<br>`;
            summary += `💰 <strong>Preço:</strong> R$ ${orderData.drinkPrice.toFixed(2)}<br><br>`;
        }
        
        summary += `💳 <strong>Forma de Pagamento:</strong> ${orderData.paymentMethod}<br><br>`;
        
        if (orderData.deliveryOption === 'delivery') {
            summary += `🏠 <strong>Entrega:</strong> ${orderData.address}<br>`;
            summary += `🚚 <strong>Taxa de Entrega:</strong> ${orderData.deliveryFee === 0 ? 'GRÁTIS! 🎉' : 'R$ ' + orderData.deliveryFee.toFixed(2)}<br><br>`;
        } else {
            summary += `🏪 <strong>Retirada:</strong> Na loja<br><br>`;
        }
        
        summary += `💵 <strong>Subtotal:</strong> R$ ${orderData.subtotal.toFixed(2)}<br>`;
        if (orderData.deliveryFee > 0) {
            summary += `🚚 <strong>Entrega:</strong> R$ ${orderData.deliveryFee.toFixed(2)}<br>`;
        }
        summary += `💰 <strong>TOTAL:</strong> R$ ${orderData.total.toFixed(2)}`;
        
        if (orderData.subtotal >= 89.90 && orderData.deliveryOption === 'delivery') {
            summary += `<br><br>🎉 <strong>Parabéns! Você ganhou FRETE GRÁTIS por pedidos acima de R$ 89,90!</strong>`;
        }
        
        return summary;
    }

    function botResponse(userInput) {
        if (currentFlow === "fazer_pedido") {
            if (step === 0) {
                // Passo 0: Coletar nome
                userName = userInput;
                addBotMessageWithTypingEffect(`Olá, <strong>${userName}</strong>! 😊<br><br>Qual pizza você deseja pedir hoje?`, false, "", createPizzaOptions());
                step++;
            } else if (step === 1) {
                // Passo 1: Selecionar pizza ou voltar
                if (userInput === 'voltar_inicio') {
                    step = 0;
                    currentFlow = "";
                    orderData = {
                        pizzaType: "",
                        pizzaSize: "",
                        pizzaPrice: 0,
                        hasDrink: false,
                        drinkType: "",
                        drinkPrice: 0,
                        paymentMethod: "",
                        deliveryOption: "",
                        address: "",
                        subtotal: 0,
                        deliveryFee: 0,
                        total: 0
                    };
                    addBotMessageWithTypingEffect("Pedido cancelado. Como posso ajudá-lo?", false, "", [
                        { text: '🍕 Fazer Pedido', value: 'fazer_pedido' },
                        { text: '📋 Ver Cardápio', value: 'ver_cardapio' },
                        { text: '💬 Falar com Atendente', value: 'falar_atendente' }
                    ]);
                    return;
                }
                
                orderData.pizzaType = userInput;
                addBotMessageWithTypingEffect(`Ótima escolha! 🍕<br><br>Agora escolha o tamanho da sua ${userInput}:`, false, "", createSizeOptions(userInput));
                step++;
            } else if (step === 2) {
                // Passo 2: Selecionar tamanho ou voltar
                if (userInput === 'voltar_pizza') {
                    orderData.pizzaType = "";
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Qual pizza você deseja pedir?`, false, "", createPizzaOptions());
                    step = 1;
                    return;
                }
                
                orderData.pizzaSize = userInput;
                orderData.pizzaPrice = pizzaMenu[orderData.pizzaType][userInput];
                orderData.subtotal = orderData.pizzaPrice;
                
                addBotMessageWithTypingEffect(`Perfeito! ${orderData.pizzaType} - ${orderData.pizzaSize} por R$ ${orderData.pizzaPrice.toFixed(2)} 👍<br><br>Gostaria de adicionar alguma bebida ao seu pedido?`, false, "", createDrinkOptions());
                step++;
            } else if (step === 3) {
                // Passo 3: Selecionar bebida ou não, ou voltar
                if (userInput === 'voltar_tamanho') {
                    orderData.pizzaSize = "";
                    orderData.pizzaPrice = 0;
                    orderData.subtotal = 0;
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Escolha o tamanho da sua ${orderData.pizzaType}:`, false, "", createSizeOptions(orderData.pizzaType));
                    step = 2;
                    return;
                }
                
                if (userInput === 'sem_bebida') {
                    orderData.hasDrink = false;
                    orderData.drinkType = "";
                    orderData.drinkPrice = 0;
                } else {
                    orderData.hasDrink = true;
                    orderData.drinkType = userInput;
                    orderData.drinkPrice = drinks[userInput];
                    orderData.subtotal += orderData.drinkPrice;
                }
                
                addBotMessageWithTypingEffect(`Ótimo! 💳<br><br>Qual será a forma de pagamento?`, false, "", createPaymentOptions());
                step++;
            } else if (step === 4) {
                // Passo 4: Selecionar forma de pagamento ou voltar
                if (userInput === 'voltar_bebida') {
                    orderData.subtotal = orderData.pizzaPrice;
                    orderData.hasDrink = false;
                    orderData.drinkType = "";
                    orderData.drinkPrice = 0;
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Gostaria de adicionar alguma bebida ao seu pedido?`, false, "", createDrinkOptions());
                    step = 3;
                    return;
                }
                
                orderData.paymentMethod = userInput;
                addBotMessageWithTypingEffect(`Perfeito! 🚚<br><br>Você prefere entrega em domicílio ou retirar na loja?`, false, "", createDeliveryOptions());
                step++;
            } else if (step === 5) {
                // Passo 5: Selecionar opção de entrega ou voltar
                if (userInput === 'voltar_pagamento') {
                    orderData.paymentMethod = "";
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Qual será a forma de pagamento?`, false, "", createPaymentOptions());
                    step = 4;
                    return;
                }
                
                orderData.deliveryOption = userInput;
                
                if (userInput === 'delivery') {
                    addBotMessageWithTypingEffect(`Por favor, informe seu endereço completo para entrega:<br><br><em>(Digite o endereço no campo abaixo)</em>`);
                    step++;
                } else {
                    // Retirada na loja
                    orderData.deliveryFee = 0;
                    orderData.total = orderData.subtotal;
                    
                    const summary = formatOrderSummary();
                    addBotMessageWithTypingEffect(summary);
                    
                    setTimeout(() => {
                        addBotMessageWithTypingEffect(`Deseja confirmar o pedido?`, false, "", [
                            { text: '✅ Confirmar Pedido', value: 'confirmar_pedido' },
                            { text: '⬅️ Voltar e Alterar', value: 'voltar_delivery' }
                        ]);
                    }, 2000);
                    step = 7; // Pula para confirmação
                }
            } else if (step === 6) {
                // Passo 6: Coletar endereço
                orderData.address = userInput;
                
                // Calcular frete
                if (orderData.subtotal >= 89.90) {
                    orderData.deliveryFee = 0;
                } else {
                    orderData.deliveryFee = 8.00;
                }
                
                orderData.total = orderData.subtotal + orderData.deliveryFee;
                
                const summary = formatOrderSummary();
                addBotMessageWithTypingEffect(summary);
                
                setTimeout(() => {
                    addBotMessageWithTypingEffect(`Deseja confirmar o pedido?`, false, "", [
                        { text: '✅ Confirmar Pedido', value: 'confirmar_pedido' },
                        { text: '⬅️ Voltar e Alterar', value: 'voltar_delivery' }
                    ]);
                }, 2000);
                step++;
            } else if (step === 7) {
                // Passo 7: Confirmar pedido ou voltar
                if (userInput === 'voltar_delivery') {
                    orderData.deliveryOption = "";
                    orderData.address = "";
                    orderData.deliveryFee = 0;
                    orderData.total = 0;
                    addBotMessageWithTypingEffect(`Sem problema! 😊<br><br>Você prefere entrega em domicílio ou retirar na loja?`, false, "", createDeliveryOptions());
                    step = 5;
                    return;
                }
                
                // Confirmar e enviar para WhatsApp
                addBotMessageWithTypingEffect(`Pedido confirmado! 🎉<br><br>Clique no botão abaixo para finalizar seu pedido via WhatsApp:`);
                
                let message = `Olá! Meu nome é ${userName} e gostaria de fazer o seguinte pedido:\n\n`;
                message += `🍕 Pizza: ${orderData.pizzaType}\n`;
                message += `📏 Tamanho: ${orderData.pizzaSize}\n`;
                message += `💰 Preço: R$ ${orderData.pizzaPrice.toFixed(2)}\n\n`;
                
                if (orderData.hasDrink) {
                    message += `🥤 Bebida: ${orderData.drinkType}\n`;
                    message += `💰 Preço: R$ ${orderData.drinkPrice.toFixed(2)}\n\n`;
                }
                
                message += `💳 Forma de Pagamento: ${orderData.paymentMethod}\n\n`;
                
                if (orderData.deliveryOption === 'delivery') {
                    message += `🏠 Entrega em: ${orderData.address}\n`;
                    message += `🚚 Taxa de Entrega: ${orderData.deliveryFee === 0 ? 'GRÁTIS!' : 'R$ ' + orderData.deliveryFee.toFixed(2)}\n\n`;
                } else {
                    message += `🏪 Retirada na loja\n\n`;
                }
                
                message += `💵 Subtotal: R$ ${orderData.subtotal.toFixed(2)}\n`;
                if (orderData.deliveryFee > 0) {
                    message += `🚚 Entrega: R$ ${orderData.deliveryFee.toFixed(2)}\n`;
                }
                message += `💰 TOTAL: R$ ${orderData.total.toFixed(2)}\n\n`;
                message += `A assistente virtual Laura me ajudou com o pedido. Obrigado!`;
                
                const whatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(message)}`;
                
                setTimeout(() => {
                    addBotMessageWithTypingEffect("💬 Finalizar Pedido no WhatsApp", true, whatsappLink);
                }, 1000);
                
                // Reset
                step = 0;
                currentFlow = "";
                userName = "";
                orderData = {
                    pizzaType: "",
                    pizzaSize: "",
                    pizzaPrice: 0,
                    hasDrink: false,
                    drinkType: "",
                    drinkPrice: 0,
                    paymentMethod: "",
                    deliveryOption: "",
                    address: "",
                    subtotal: 0,
                    deliveryFee: 0,
                    total: 0
                };
            }
            return;
        }

        // Tratamento de opções especiais
        switch(userInput) {
            case 'fazer_pedido':
                currentFlow = "fazer_pedido";
                step = 0;
                addBotMessageWithTypingEffect("Ótimo! Vou te ajudar a fazer seu pedido. 😊<br><br>Primeiro, qual é o seu nome?");
                break;
            case 'ver_cardapio':
                let cardapio = `<strong>📋 Nosso Cardápio:</strong><br><br>`;
                for (const [pizza, sizes] of Object.entries(pizzaMenu)) {
                    cardapio += `<strong>${pizza}</strong><br>`;
                    for (const [size, price] of Object.entries(sizes)) {
                        cardapio += `• ${size}: R$ ${price.toFixed(2)}<br>`;
                    }
                    cardapio += `<br>`;
                }
                cardapio += `<strong>🥤 Bebidas:</strong><br>`;
                for (const [drink, price] of Object.entries(drinks)) {
                    cardapio += `• ${drink}: R$ ${price.toFixed(2)}<br>`;
                }
                cardapio += `<br>🚚 <strong>Frete GRÁTIS para pedidos acima de R$ 89,90!</strong>`;
                
                addBotMessageWithTypingEffect(cardapio);
                setTimeout(() => {
                    addBotMessageWithTypingEffect("Gostaria de fazer um pedido?", false, "", [
                        { text: '🍕 Fazer Pedido', value: 'fazer_pedido' },
                        { text: '💬 Falar com Atendente', value: 'falar_atendente' }
                    ]);
                }, 2000);
                break;
            case 'falar_atendente':
                addBotMessageWithTypingEffect("Clique no botão abaixo para falar diretamente com nosso atendente via WhatsApp:");
                const message = `Olá! Meu nome é ${userName || 'Cliente'} e gostaria de falar com um atendente. A assistente virtual Laura me direcionou para este contato.`;
                const whatsappLink = `https://wa.me/5521982684928?text=${encodeURIComponent(message)}`;
                setTimeout(() => {
                    addBotMessageWithTypingEffect("💬 Falar com Atendente", true, whatsappLink);
                }, 1000);
                break;
            default:
                addBotMessageWithTypingEffect("Desculpe, não entendi. Como posso ajudá-lo?", false, "", [
                    { text: '🍕 Fazer Pedido', value: 'fazer_pedido' },
                    { text: '📋 Ver Cardápio', value: 'ver_cardapio' },
                    { text: '💬 Falar com Atendente', value: 'falar_atendente' }
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
    addBotMessageWithTypingEffect("Olá! Bem-vindo à nossa Pizzaria! 🍕");
    setTimeout(() => {
        addBotMessageWithTypingEffect("Como posso ajudá-lo hoje?", false, "", [
            { text: '🍕 Fazer Pedido', value: 'fazer_pedido' },
            { text: '📋 Ver Cardápio', value: 'ver_cardapio' },
            { text: '💬 Falar com Atendente', value: 'falar_atendente' }
        ]);
    }, 2000);
});

