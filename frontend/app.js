// ==============================
// ORÇAMENTO FAMILIAR - APP
// ==============================

// Função para criar estrutura de mês vazio
function criarMesVazio() {
    return {
        salarios: { estimativa: 550000, realidade: 0, itens: [] },        
        contasFixas: { 
            estimativa: 150000,
            realidade: 0,
            itens: [
                { id: 1, descricao: "Dízimo",   estimativa: 20000, realidade: 0, pago: false },
                { id: 2, descricao: "Luz",      estimativa: 12000, realidade: 0, pago: false },
                { id: 3, descricao: "Água",     estimativa: 8000, realidade: 0, pago: false },
                { id: 4, descricao: "Gás",      estimativa: 5000, realidade: 0, pago: false },
                { id: 5, descricao: "Aluguel",  estimativa: 60000, realidade: 0, pago: false },
                { id: 6, descricao: "Tel/Internet",  estimativa: 8000, realidade: 0, pago: false },
                { id: 7, descricao: "Carro",  estimativa: 20000, realidade: 0, pago: false },
                { id: 8, descricao: "Seguro",  estimativa: 17000, realidade: 0, pago: false },

            ] },
        mercado: { estimativa: 60000, realidade: 0, itens: [] },
        refeicoes: { estimativa: 30000, realidade: 0, itens: [] },
        cartaoCredito: { estimativa: 80000, realidade: 0, itens: [] },
        outrosGastos: { estimativa: 40000, realidade: 0, itens: [] }
    }
}

// Dados - Gerar novos meses
let dadosMeses = {
    "2026-02": criarMesVazio(),
    "2026-03": criarMesVazio()
}

// Variáveis de controle
let mesAtual = ""
let opcaoAtual = "resumo"
let abaCartao = "avista"

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

// ==============================
// FUNÇÕES AUXILIARES
// ==============================

// Função para formatar valores em Ienes
function formatarMoeda(valor) {
    return '¥' + valor.toLocaleString('ja-JP')
}

// Função para calcular totais do resumo
function calcularResumo(dados) {    
        const receitasEst = dados.salarios.estimativa
        const receitasReal = dados.salarios.realidade

        //Despesas (todas as outras categorias)
        const despesasEst =         
        dados.contasFixas.estimativa +
        dados.mercado.estimativa +
        dados.refeicoes.estimativa +
        dados.cartaoCredito.estimativa +
        dados.outrosGastos.estimativa

        const despesasReal =
        dados.contasFixas.realidade +
        dados.mercado.realidade +
        dados.refeicoes.realidade +
        dados.cartaoCredito.realidade +
        dados.outrosGastos.realidade

        // Saldos (receitas - despesas)
        const saldoEst = receitasEst - despesasEst
        const saldoReal = receitasReal - despesasReal

        // Retornar objetos com os totais
        return {
            totalReceitasEstimativa: receitasEst,
            totalReceitasRealidade: receitasReal,
            totalDespesasEstimativa: despesasEst,
            totalDespesasRealidade: despesasReal,
            saldoEstimativa: saldoEst,
            saldoRealidade: saldoReal
        }
    }

//Função para renderizar a tela de Resumo
function renderizarResumo(dados) {
    const r = calcularResumo(dados)

    // Define a cor do saldo (verde ou vermelho)
    const corSaldoEst = r.saldoEstimativa >= 0 ? 'positivo' : 'negativo'
    const corSaldoReal = r.saldoRealidade >=0 ? 'positivo' : 'negativo'

    return `
    <h2 class="secao-titulo">Resumo</h2>
<table class="tabela-resumo">
    <thead>
        <tr>
            <th></th>
            <th>Estimativa</th>
            <th>Realidade</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Salário:</td>
            <td>${formatarMoeda(r.totalReceitasEstimativa)}</td>
            <td>${formatarMoeda(r.totalReceitasRealidade)}</td>
        </tr>
        <tr>
            <td>Contas Fixas:</td>
            <td>${formatarMoeda(dados.contasFixas.estimativa)}</td>
            <td>${formatarMoeda(dados.contasFixas.realidade)}</td>
        </tr>
        <tr>
            <td>C. Crédito:</td>
            <td>${formatarMoeda(dados.cartaoCredito.estimativa)}</td>
            <td>${formatarMoeda(dados.cartaoCredito.realidade)}</td>
        </tr>
        <tr>
            <td>Mercado:</td>
            <td>${formatarMoeda(dados.mercado.estimativa)}</td>
            <td>${formatarMoeda(dados.mercado.realidade)}</td>
        </tr>
        <tr>
            <td>Refeições:</td>
            <td>${formatarMoeda(dados.refeicoes.estimativa)}</td>
            <td>${formatarMoeda(dados.refeicoes.realidade)}</td>
        </tr>
        <tr>
            <td>Outros:</td>
            <td>${formatarMoeda(dados.outrosGastos.estimativa)}</td>
            <td>${formatarMoeda(dados.outrosGastos.realidade)}</td>
        </tr>
        <tr class="linha-saldo">
            <td><strong>Saldo:</strong></td>
            <td class="${corSaldoEst}">${formatarMoeda(r.saldoEstimativa)}</td>
            <td class="${corSaldoReal}">${formatarMoeda(r.saldoRealidade)}</td>
        </tr>
    </tbody>
</table>
`            
}

// Gera HTML da tela de Contas Fixas:
function renderizarContas(dados) {
    const itens = dados.contasFixas.itens

// Calcula o total da Realidade:
    const totalRealidade = itens.reduce((soma, item) => soma + item.realidade, 0)

// Monta as linhas da tabela:
    const linhas = itens.map(item => {
        const classePago = item.pago ? 'conta-paga' : ''
        return `
        <tr class="${classePago}">
            <td>${item.descricao}</td>
            <td class="valor-estimativa">${formatarMoeda(item.estimativa)}</td>
            <td>
                <input
                    type="number"
                    class="input-realidade"
                    value="${item.realidade}"
                    data-id="${item.id}"
                    placeholder="0"
                >
            </td>
            <td>
                <button
                    class="btn-pago ${item.pago ? 'ativo' : ''}"
                    data-id="${item.id}"
                >${item.pago ? '✓' : '○'}</button>
            </td>
        </tr>
        `
    }).join('')

    return `
        <h2 class="secao-titulo">Contas Fixas</h2>
        <table class="tabela-resumo">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Estimativa</th>
                    <th>Realidade</th>
                    <th></th>
                <tr>
            </thead>
            <tbody>
                ${linhas}
            </tbody>
            <tfoot>
                <tr class="linha-saldo">
                    <td><strong>Total:</strong></td>
                    <td>${formatarMoeda(dados.contasFixas.estimativa)}</td>
                    <td id="totalRealidadeContas">${formatarMoeda(totalRealidade)}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    `
}

// "Escuta" quando o usuário digita um valor ou clica no botão pago
function adicionarEventoContas() {
    // Evento nos input de realidade
    document.querySelectorAll('.input-realidade').forEach(input => {
        input.addEventListener('change', function() {
            const id = parseInt(this.dataset.id)
            const valor = parseInt(this.value) || 0

            // Atualiza o valor nos dados
            const item = dadosMeses[mesAtual].contasFixas.itens.find(i => i.id === id)
            item.realidade = valor

            // Recalcula o total
            const total = dadosMeses[mesAtual].contasFixas.itens
                .reduce((soma, i) => soma + i.realidade, 0)
            document.getElementById('totalRealidadeContas').textContent = formatarMoeda(total)

        })
    })
    
    // Evento nos botões de pago
    document.querySelectorAll('.btn-pago').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id)
            const item = dadosMeses[mesAtual].contasFixas.itens.find(i => i.id === id)

            // Alterna entre pago e não pago
            item.pago = !item.pago

            // Atualiza o botão visualmente
            this.textContent = item.pago ? '✓' : '○'
            this.classList.toggle('ativo')

            // Atualiza a cor da linha
            const linha = this.closest('tr')
            linha.classList.toggle('conta-paga')
        })
    })
}

// Gera HTML da tela de Mercado
function renderizarMercado(dados) {
    const itens = dados.mercado.itens
    const totalGasto = itens.reduce((soma, item) => soma + item.valor, 0)

    const linhas = itens.length === 0
        ? '<tr><td colspan="3" style="text-align:center; color: #999; padding:20px;">Nenhuma compra registrada</td></tr>'
        : itens.map(item => `
            <tr>
                <td>${item.descricao}</td>
                <td class="valor-estimativa">${item.data}</td>
                <td class="valor-item">
                    ${formatarMoeda(item.valor)}
                    <button class="btn-remover" data-id="${item.id}">⊗</button>
                </td>
            </td>
        `).join('')

        return `
            <h2 class="secao-titulo">Mercado</h2>

            <div class="resumo-categoria">
                <span>Estimativa: <strong>${formatarMoeda(dados.mercado.estimativa)}</strong></span>
                <span>Gasto: <strong id="totalMercado">${formatarMoeda(totalGasto)}</strong></span>
            </div>

            <div class="form-adicionar">
                <div class="form-group">
                    <label>Descrição:</label>
                    <input type="text" id="inputDescricao" placeholder="Digite">
                </div>
                <div class="form-inline">
                    <span class="simbolo-moeda">¥</span>
                    <input type="number" id="inputValor" placeholder="Digite">
                    <button class="btn-adicionar" id="btnAdicionar">+</button>
                </div>
            </div>

            <table class="tabela-resumo">
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Data</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody id="listaMercado">
                    ${linhas}
                </tbody>
            </table>
        `
}

function adicionarEventosMercado() {
    
    // Botão de adicionar item
    document.getElementById('btnAdicionar').addEventListener('click', function() {
        const descricao = document.getElementById('inputDescricao').value.trim()
        const valor = parseInt(document.getElementById('inputValor').value) || 0

        // Validação básica
        if (!descricao || valor <= 0) {
            alert('Preencha a descrição e um valor válido!')
            return
        }

        // Pega a data de hoje automaticamente
        const hoje = new Date()
        const dia = String(hoje.getDate()).padStart(2, '0')
        const mes = String(hoje.getMonth() + 1).padStart(2, '0')
        const dataFormatada = dia + '/' + mes

        // Cria o novo item
        const novoItem = {
            id: Date.now(),
            descricao: descricao,
            valor: valor,
            data: dataFormatada
        }

        // Adiciona nos dados
        dadosMeses[mesAtual].mercado.itens.push(novoItem)

        // Atualiza a tela
        renderizar()
    })

    // Botões de remover
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id)

            // Remove o item do array
            dadosMeses[mesAtual].mercado.itens = dadosMeses[mesAtual].mercado.itens
                .filter(item => item.id !== id)
            
            // Atualiza a tela
            renderizar()
        })
    })
}

// Gera HTML da tela de Refeições
function renderizarRefeicoes(dados) {
    const itens = dados.refeicoes.itens
    const totalGasto = itens.reduce((soma, item) => soma + item.valor, 0)

    const linhas = itens.length === 0
    ? '<tr><td colspan="3" style="text-align:center; color:#999; padding:20px;">Nenhuma refeição registrada</td></tr>'
    : itens.map(item => `
        <tr>
            <td>${item.descricao}</td>
            <td class="valor-estimativa">${item.data}</td>
            <td class="valor-item">
                ${formatarMoeda(item.valor)}
                <button class="btn-remover" data-id="${item.id}">⊗</button>
            </td>
        </tr>
    `).join('')

return `
        <h2 class="secao-titulo">Refeições</h2>

        <div class="resumo-categoria">
            <span>Estimativa: <strong>${formatarMoeda(dados.refeicoes.estimativa)}</strong></span>
            <span>Gasto: <strong id="totalRefeicoes">${formatarMoeda(totalGasto)}</strong></span>
        </div>

        <div class="form-adicionar">
            <div class="form-group">
                <label>Descrição:</label>
                <input type="text" id="inputDescricao" placeholder="Digite">
            </div>
            <div class="form-inline">
                <span class="simbolo-moeda">¥</span>
                <input type="number" id="inputValor" placeholder="Digite">
                <button class="btn-adicionar" id="btnAdicionar">+</button>
            </div>
        </div>

        <table class="tabela-resumo">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Data</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody id="listaRefeicoes">
                ${linhas}
            </tbody>
        </table>
`   
}

function adicionarEventosRefeicoes() {
    
    document.getElementById('btnAdicionar').addEventListener('click', function() {
        const descricao = document.getElementById('inputDescricao').value.trim()
        const valor = parseInt(document.getElementById('inputValor').value) || 0

        if (!descricao || valor <= 0) {
            alert('Preencha a descrição e um valor válido!')
            return
        }

        const hoje = new Date()
        const dia = String(hoje.getDate()).padStart(2, '0')
        const mes = String(hoje.getMonth() + 1).padStart(2, '0')
        const dataFormatada = dia + '/' + mes

        const novoItem = {
            id: Date.now(),
            descricao: descricao,
            valor: valor,
            data: dataFormatada
        }

        dadosMeses[mesAtual].refeicoes.itens.push(novoItem)
        renderizar()
    })

    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id)
            dadosMeses[mesAtual].refeicoes.itens = dadosMeses[mesAtual].refeicoes.itens
                .filter(item => item.id !== id)
            renderizar()
        })
    })
}

// Gera HTML da tela de Outros Gastos
function renderizarOutros(dados) {
    const itens = dados.outrosGastos.itens
    const totalGastos = itens.reduce((soma, item) => soma + item.valor, 0)

    const linhas = itens.length === 0
        ? '<tr><td colspan="3" style="text-align:center; color:#999; padding:20px;">Nenhum gasto registrado</td></tr>'
        : itens.map(item => `
            <tr>
                <td>${item.descricao}</td>
                <td class="valor-estimativa">${item.data}</td>
                <td class="valor-item">
                    ${formatarMoeda(item.valor)}
                    <button class="btn-remover" data-id="${item.id}">⊗</button>
                </td>
            </tr>
            `).join('')
    return `
        <h2 class="secao-titulo">Outros Gastos</h2>

        <div class="resumo-categoria">
            <span>Estimativa: <strong>${formatarMoeda(dados.outrosGastos.estimativa)}</strong></span>
            <span>Gasto: <strong id="totalOutros">${formatarMoeda(totalGastos)}</strong></span>
        </div>

        <div class="form-adicionar">
            <div class="form-group">
                <label>Descrição:</label>
                <input type="text" id="inputDescricao" placeholder="Digite">
            </div>
            <div class="form-inline">
                <span class="simbolo-moeda">¥</span>
                <input type="number" id="inputValor" placeholder="Digite">
                <button class="btn-adicionar" id="btnAdicionar">+</button>
            </div>
        </div>

        <table class="tabela-resumo">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Data</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody id="listaOutros">
                ${linhas}
            </tbody>
        </table>
    `
}

function adicionarEventosOutros() {

    document.getElementById('btnAdicionar').addEventListener('click', function () {
        const descricao = document.getElementById('inputDescricao').value.trim()
        const valor = parseInt(document.getElementById('inputValor').value) || 0

        if (!descricao || valor <= 0) {
            alert('Preencha a descrição e um valor válido!')
            return
        }

        const hoje = new Date()
        const dia = String(hoje.getDate()).padStart(2, '0')
        const mes = String(hoje.getMonth() + 1).padStart(2, '0')
        const dataFormatada = dia + '/' + mes

        const novoItem = {
            id: Date.now(),
            descricao: descricao,
            valor: valor,
            data: dataFormatada
        }

        dadosMeses[mesAtual].outrosGastos.itens.push(novoItem)
        renderizar()
    })

    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id)
            dadosMeses[mesAtual].outrosGastos.itens = dadosMeses[mesAtual].outrosGastos.itens
                .filter(item => item.id !== id)

                renderizar()
        })
    })
}

// Gera HTML da tela de Cartão de Crédito
function renderizarCartao(dados) {

    const itens = dados.cartaoCredito.itens

    const itensAvista       = itens.filter(item => item.totalParcelas === 1)
    const itensParcelado    = itens.filter(item => item.totalParcelas > 1)

    // Calcula total da aba ativa
    const totalAvista = itensAvista
        .reduce((soma, item) => soma + item.valorParcela, 0)
    
    const totalParcelado = itensParcelado  
        .reduce((soma, item) => soma + item.valorParcela, 0)
    
    // Gera as linhas da aba À Vista
    const linhasAvista = itensAvista.length === 0
        ? '<tr><td colspan="3" style="text-align: center; color: #999; padding: 15px;">Nenhum lançamento</td></tr>'
        : itensAvista.map(item => `
            <tr>
                <td>${item.descricao}</td>
                <td class="valor-estimativa">${item.dataCompra}</td>
                <td class="valor-item">
                    ${formatarMoeda(item.valorParcela)}
                    <button class="btn-remover" data-id="${item.id}">⊗</button>
                </td>
            </tr>
            `).join('')

    // Gera as linhas da aba Parcelado
    const linhasParcelado = itensParcelado.length === 0
        ? '<tr><td colspan="3" style="text-align: center; color: #999; padding: 15px;">Nenhum lançamento</td></tr>'
        : itensParcelado.map(item => `
            <tr>
                <td>${item.descricao}</td>
                <td class="valor-estimativa">${item.parcelaAtual}/${item.totalParcelas}</td>
                <td class="valor-item">
                    ${formatarMoeda(item.valorParcela)}
                    <button class="btn-remover" data-id="${item.id}">⊗</button>
                </td>
            </tr>
            `).join('')

    return `
        <h2 class="secao-titulo">Cartão de Crédito</h2>

        <div class="resumo-categoria">
            <span>Estimativa: <strong>${formatarMoeda(dados.cartaoCredito.estimativa)}</strong></span>
            <span>Total mês: <strong>${formatarMoeda(totalAvista + totalParcelado)}</strong></span>
        </div>

        <div class="abas-cartao">
            <button class="aba-btn ${abaCartao === 'avista' ? 'ativa' : ''}" data-aba="avista">
                à vista
            </button>
            <button class="aba-btn ${abaCartao === 'parcelado' ? 'ativa' : ''}" data-aba="parcelado">
                parcelado
            </button>
        </div>

        <div class="form-adicionar">

        ${ abaCartao === 'avista' ? `
            <div class="form-group">
                <label>Descrição:</label>
                <input type="text" id="inputDescricao" placeholder="Digite">
            </div>
            <div class="form-inline">
                <span class="simbolo-moeda">¥</span>
                <input type="number" id="inputValor" placeholder="Digite">
                <button class="btn-adicionar" id="btnAdicionar">+</button>
            </div>
        ` : `
            <div class="form-group">
                <label>Descrição:</label>
                <input type="text" id="inputDescricao" placeholder="Ex: Amazon">
            </div>
            <div class="form-group" style="margin-top: 10px">
                <label>Parcela:</label>
                <div class="form-inline">
                    <input type="number" id="inputParcelaAtual" placeholder="Atual" min="1" style="width:80px">
                    <span style="padding: 0 6px; color: #666">de</span>
                    <input type="number" id="inputTotalParcelas" placeholder="Total" min="2" style="width:80px">
                </div>
            </div>
            <div class="form-group" style="margin-top:10px">
               <label>Valor da parcela:</label>            
                <div class="form-inline">
                    <span class="simbolo-moeda">¥</span>
                    <input type="number" id="inputValor" placeholder="Digite">
                    <button class="btn-adicionar" id="btnAdicionar">+</button>
                </div>
            </div>
            `}
            </div>

        <table class="tabela-resumo">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>${abaCartao === 'avista' ? 'Data' : 'Parcela'}</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                ${abaCartao === 'avista' ? linhasAvista : linhasParcelado}
            </tbody>
        </table>
    `
}

function adicionarEventosCartao() {

    //Troca de abas
    document.querySelectorAll('.aba-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            abaCartao = this.dataset.aba
            renderizar()
        })
    })

    // Botão adicionar
    const btnAdicionar = document.getElementById('btnAdicionar')
    if (!btnAdicionar) return

    btnAdicionar.addEventListener('click', function() {
        const descricao = document.getElementById('inputDescricao').value.trim()
        const valor     = parseInt(document.getElementById('inputValor').value) || 0

        if (!descricao || valor <= 0) {
            alert('Preencha a descrição e um valor válido')
            return
        }

    // Pega a data de hoje
    const hoje = new Date()
    const data = String(hoje.getDate()).padStart(2, '0') + '/' +
                 String(hoje.getMonth() + 1).padStart(2, 0)

    if (abaCartao === 'avista') {
        // Compra à vista - 1 parcela
        const novoItem = {
            id: Date.now(),
            descricao: descricao,
            valorTotal: valor,
            valorParcela: valor,
            parcelaAtual: 1,
            totalParcelas: 1,
            dataCompra: data
        }
        dadosMeses[mesAtual].cartaoCredito.itens.push(novoItem)

    } else {
        // Compra parcelada 
        const parcelaAtual  = parseInt(document.getElementById('inputParcelaAtual').value) || 0
        const totalParcelas = parseInt(document.getElementById('inputTotalParcelas').value) || 0


        if (parcelaAtual < 1 || totalParcelas < 2) {
            alert('Informe a parcela atual e o total de parcelas!')
            return
        }

        if (parcelaAtual > totalParcelas) {
            alert('A parcela atual não pode ser maior que o total!')
            return
        }

        const novoItem = {
            id: Date.now(),
            descricao: descricao,
            valorTotal: valor * totalParcelas,
            valorParcela: valor,
            parcelaAtual: parcelaAtual,
            totalParcelas: totalParcelas,
            dataCompra: data
        }
        dadosMeses[mesAtual].cartaoCredito.itens.push(novoItem)
    }

    renderizar()
    })

    // Botões de remover
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id)
            dadosMeses[mesAtual].cartaoCredito.itens = dadosMeses[mesAtual].cartaoCredito.itens
                .filter(item => item.id!== id)
            renderizar()
        })
    })
}

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
        conteudoPrincipal.innerHTML = renderizarResumo(dados)
    } else if (opcaoAtual === 'contas') {
        conteudoPrincipal.innerHTML = renderizarContas(dados)
        setTimeout(() => adicionarEventoContas(), 0)
    } else if (opcaoAtual === 'mercado') {
        conteudoPrincipal.innerHTML = renderizarMercado(dados)
        setTimeout(() => adicionarEventosMercado(), 0)
    } else if (opcaoAtual === 'refeicoes') {
        conteudoPrincipal.innerHTML = renderizarRefeicoes(dados)
        setTimeout(() => adicionarEventosRefeicoes(), 0)
    } else if (opcaoAtual === 'outros'){
        conteudoPrincipal.innerHTML = renderizarOutros(dados)
        setTimeout(() => adicionarEventosOutros(), 0)
    } else if (opcaoAtual === 'cartao') { 
        conteudoPrincipal.innerHTML = renderizarCartao(dados)
        setTimeout(() => adicionarEventosCartao(), 0)
    } else {
        conteudoPrincipal.innerHTML = `<h2 class="secao-titulo">${opcaoAtual}</h2><p>Em desenvolvimento</p>`
    }
}