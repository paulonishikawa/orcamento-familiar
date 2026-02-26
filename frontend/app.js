// ==============================
// ORÇAMENTO FAMILIAR - APP
// ==============================

// Função para criar estrutura de mês vazio
function criarMesVazio() {
    return {
        salarios: { estimativa: 550000, realidade: 0, itens: [] },        
        contasFixas: { estimativa: 150000, realidade: 0, itens: [] },
        mercado: { estimativa: 60000, realidade: 0, itens: [] },
        refeicoes: { estimativa: 30000, realidade: 0, itens: [] },
        cartaoCredito: { estimativa: 80000, realidade: 0, itens: [] },
        outrosGastos: { estimativa: 40000, realidade: 0, itens: [] }
    }
}

// Função para gerar múltiplos meses
function gerarMeses(anoInicio, mesInicio, quantidade) {
    const meses = {}
    let ano = anoInicio
    let mes = mesInicio

        for (let i = 0; i < quantidade; i++) {
        // Criar chave no formato"2026-02"
        const mesFormatado = String(mes).padStart(2, '0')
        const chave = `${ano}-${mesFormatado}`

        // Criar mês vazio
        meses[chave] = criarMesVazio()

        // Próximo mês
        mes = mes + 1

        // Se passou de dezembro, volta para janeiro e incrementa ano
        if (mes === 13) {
            mes = 1
            ano = ano + 1
        }

        }

    return meses
}

// Função para popular dropdown de meses
function popularDropdownMeses() {
    // Limpa opções antigas (exceto "selecione")
    mesSelect.innerHTML = '<option value="">selecione</option>'

    // Nomes dos meses
    const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    // Para cada mês nos dados, criar option
    Object.keys(dadosMeses).forEach(mesAno => {
        // mesAno = "2026-02"
        const [ano, mes] = mesAno.split('-') // ["2026", "02"]
        const nomeMes = nomesMeses[parseInt(mes) - 1] // "Fevereiro"

        //Criar option
        const option = document.createElement('option')
        option.value = mesAno
        option.textContent = `${nomeMes} ${ano}`

        // Adicionar ao select
        mesSelect.appendChild(option)
    })
}

// Dados - Gerar 12 meses automaticamente
let dadosMeses = gerarMeses(2026, 2, 12)

// Variáveis de controle
let mesAtual = ""
let opcaoAtual = "resumo"

// Capturar elementos do HTML
const mesSelect = document.getElementById('mesSelect')
const opcaoSelect = document.getElementById('opcaoSelect')
const conteudoPrincipal = document.getElementById('conteudoPrincipal')

// Popular dropdown com os meses disponíveis
popularDropdownMeses()

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