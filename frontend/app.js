// ==============================
// ORÇAMENTO FAMILIAR - APP
// ==============================

// DADOS MOCKADOS (Temporários)

let dadosMeses = {
    "2026-02": {        
        salarios: {
            estimativa: 550000,
            realidade: 0,
            itens: []
        },        
        contasFixas: {
            estimativa: 150000,
            realidade: 0,
            itens: []
        },
        mercado: {
            estimativa: 60000,
            realidade: 0,
            itens: []
        },
        refeicoes: {
            estimativa: 30000,
            realidade: 0,
            itens: []
        },
        cartaoCredito: {
            estimativa: 40000,
            realidade: 0,
            itens: []
        }
    }
}

// Variáveis de controle
let mesAtual = ""
let opcaoAtual = "resumo"

// Capturar elementos do HTML
const mesSelect = document.getElementById('mesSelect')
const opcaoSelect = document.getElementById('opcaoSelect')
const conteudoPrincipal = document.getElementById('conteudoPrincipal')

// Event Listeners (escutadores de eventos)

mesSelect.addEventListener('change', function() {
    mesAtual = mesSelect.value
    renderizar()    
})

opcaoSelect.addEventListener('change', function () {
    opcaoAtual = opcaoSelect.value
    renderizar()
})

// Função principal de renderização

function renderizar() {
    // Verifica se um mês foi selecionado
    if (!mesAtual) {
        conteudoPrincipal.innerHTML = '<p>Selecione um mês</p>'
        return
    }

    // Busca os dados do mês selecionado
    const dados = dadosMeses[mesAtual]

    //Atualiza o conteúdo baseado na opção selecionada
    if (opcaoAtual === 'resumo') {
        conteudoPrincipal.innerHTML = '<h2>Resumo de '+ mesAtual + '</h2><p>Em desenvolvimento...</p>'
    } else {
        conteudoPrincipal.innerHTML = '<h2>' + opcaoAtual + '</h2><p>Em desenvolvimento...</p>'
    }
}