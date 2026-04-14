// ==============================
// ORÇAMENTO FAMILIAR - APP
// ==============================

// Função para criar estrutura de mês vazio
function criarMesVazio() {
     
    return {
        inicializado: false,
        salarios: { 
            estimativa: 0, 
            realidade: 0, 
            modoEstimativa: 'calculo',
            valorHora: 1700,
            diasDiurnos: 10,
            diasNoturnos: 10,
            hesDiurnas: 0,
            hesNoturnas: 0,
            seguroSaude: 18432,
            seguroAssist: 2862,
            impostoResidencial: 12600,
            previdencia: 32940
         },        
        contasFixas: { 
            estimativa: 0,
            realidade: 0,
            itens: [] 
        },

        mercado: { estimativa: 0, realidade: 0, itens: [] },
        refeicoes: { estimativa: 0, realidade: 0, itens: [] },
        cartaoCredito: { estimativa: 0, realidade: 0, itens: [] },
        outrosGastos: { 
            estimativa: 0, 
            realidade: 0, 
            itens: [],
            receitasExtras: []
        }
    }
}

// Dados - Gerar novos meses
let dadosMeses = {}

// Variáveis de controle
let mesAtual = ""
let opcaoAtual = "resumo"
let abaCartao = "avista"

const NOMES_MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Atualiza o select de meses com os meses salvos
function atualizarSelectMeses() {
    const meses = Object.keys(dadosMeses).sort()

    mesSelect.innerHTML = '<option value="">selecione</option>'

    meses.forEach(mesId => {
        const [ano, mes] = mesId.split('-')
        const nome = `${NOMES_MESES[parseInt(mes) - 1]} ${ano}`
        const option = document.createElement('option')
        option.value = mesId
        option.textContent = nome
        if (mesId === mesAtual) option.selected = true
        mesSelect.appendChild(option)
    })
}

// Mostra o formulário de novo mês
function mostrarFormNovoMes() {
    const hoje = new Date()
    const anoAtual = hoje.getFullYear()

    // Gera options dos meses
    const optionsMeses = NOMES_MESES.map((nome, i) => {
        const num = String(i + 1).padStart(2, '0')
        return `<option value="${num}">${nome}</option>`
    }).join('')

    // Gera options dos anos (atual e próximos 2)
    const optionsAnos = [anoAtual, anoAtual + 1, anoAtual + 2]
        .map(ano => `<option value="${ano}">${ano}</option>`)
        .join('')

    conteudoPrincipal.innerHTML = `
        <div style="max-width:300px; margin:40px auto">
            <h2 class="secao-titulo">➕ Novo Mês</h2>
            <div class="form-adicionar">
                <div class="form-group">
                    <label>Mês:</label>
                    <select id="selectNovoMes" style="width:100%; padding:8px">
                        ${optionsMeses}
                    </select>
                </div>
                <div class="form-group" style="margin-top:10px">
                    <label>Ano:</label>
                    <select id="selectNovoAno" style="width:100%; padding:8px">
                        ${optionsAnos}
                    </select>
                </div>
                <div style="display:flex; gap:8px; margin-top:15px">
                    <button class="btn-adicionar" id="btnConfirmarNovoMes"
                        style="flex:1; padding:12px; font-size:14px">Criar mês</button>
                    <button class="btn-adicionar" id="btnCancelarNovoMes"
                        style="flex:1; padding:12px; background:#999; font-size:14px">Cancelar</button>
                </div>
                <p id="erroNovoMes" style="color:red; margin-top:10px"></p>
            </div>
        </div>
    `

    setTimeout(() => {
        document.getElementById('btnConfirmarNovoMes').addEventListener('click', function() {
            const mes = document.getElementById('selectNovoMes').value
            const ano = document.getElementById('selectNovoAno').value
            const mesId = `${ano}-${mes}`

            // Verifica se já existe
            if (dadosMeses[mesId]) {
                document.getElementById('erroNovoMes').textContent = 'Este mês já existe!'
                return
            }

            // Cria o mês vazio
            dadosMeses[mesId] = criarMesVazio()

            // Atualiza o select e seleciona o novo mês
            atualizarSelectMeses()
            mesAtual = mesId
            mesSelect.value = mesId

            // Renderiza (vai acionar a cópia do mês anterior automaticamente)
            opcaoAtual = 'resumo'
            opcaoSelect.value = 'resumo'
            renderizar()
        })

        document.getElementById('btnCancelarNovoMes').addEventListener('click', function() {
            renderizar()
        })
    }, 0)
}

// Capturar elementos do HTML
const mesSelect = document.getElementById('mesSelect')
const opcaoSelect = document.getElementById('opcaoSelect')
const conteudoPrincipal = document.getElementById('conteudoPrincipal')

// Evento único para todos os botões remover
conteudoPrincipal.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-remover')
        
    if (btn) {
        const id = Number(btn.dataset.id)
        const tipo = btn.dataset.tipo
        
        if (opcaoAtual === 'mercado') {
            dadosMeses[mesAtual].mercado.itens =
            dadosMeses[mesAtual].mercado.itens.filter(i => i.id !== id)

            dadosMeses[mesAtual].mercado.realidade =
            dadosMeses[mesAtual].mercado.itens
            .reduce((soma, i) => soma + i.valor,0)
            
        } else if (opcaoAtual === 'refeicoes') {
            dadosMeses[mesAtual].refeicoes.itens =
            dadosMeses[mesAtual].refeicoes.itens.filter(i => i.id !== id)
            dadosMeses[mesAtual].refeicoes.realidade =
            dadosMeses[mesAtual].refeicoes.itens
            .reduce((soma, i) => soma + i.valor,0)
            
        } else if (opcaoAtual === 'cartao') {
            dadosMeses[mesAtual].cartaoCredito.itens =
            dadosMeses[mesAtual].cartaoCredito.itens.filter(i => i.id !== id)
            dadosMeses[mesAtual].cartaoCredito.realidade =
            dadosMeses[mesAtual].cartaoCredito.itens
            .reduce((soma, i) => soma + i.valorParcela,0)
            
        } else if (opcaoAtual === 'outros') {
            if (tipo === 'extra') {
                dadosMeses[mesAtual].outrosGastos.receitasExtras =
                dadosMeses[mesAtual].outrosGastos.receitasExtras.filter(i => i.id !== id)
            } else {
                dadosMeses[mesAtual].outrosGastos.itens =
                dadosMeses[mesAtual].outrosGastos.itens.filter(i => i.id !== id)
                dadosMeses[mesAtual].outrosGastos.realidade =
                dadosMeses[mesAtual].outrosGastos.itens
                .reduce((soma, i) => soma + i.valor,0)
            }
            
        }else if (opcaoAtual === 'contas') {
            dadosMeses[mesAtual].contasFixas.itens =
            dadosMeses[mesAtual].contasFixas.itens.filter(i => i.id !== id)
            
            dadosMeses[mesAtual].contasFixas.estimativa =
            dadosMeses[mesAtual].contasFixas.itens
            .reduce((soma, i) => soma + i.estimativa, 0)
            
            dadosMeses[mesAtual].contasFixas.realidade =
            dadosMeses[mesAtual].contasFixas.itens
            .reduce((soma, i) => soma + i.realidade, 0)         
        }

        renderizar()
        return
    }

    const btnPago = e.target.closest('.btn-pago')
       
    if (btnPago && opcaoAtual === 'contas') {
        const idPago = Number(btnPago.dataset.id)
        const item = dadosMeses[mesAtual].contasFixas.itens.find(i => i.id === idPago)        
        if (item) {
            item.pago = !item.pago 
            renderizar()
    }       
                
    }
})


// Event Listeners (escutadores de eventos)
mesSelect.addEventListener('change', function() {
    mesAtual = mesSelect.value
    renderizar()    
})

opcaoSelect.addEventListener('change', function () {
    opcaoAtual = opcaoSelect.value
    renderizar()
})

document.getElementById('btnNovoMes').addEventListener('click', function() {
    mostrarFormNovoMes()
})

// ==============================
// FUNÇÕES AUXILIARES
// ==============================

// Função para formatar valores em Ienes
function formatarMoeda(valor) {
    return '¥' + valor.toLocaleString('ja-JP')
}

// Gera o bloco de estimativa editável (usado em todas as categorias)
function htmlEstimativa(categoria, valorEstimativa) {
    return `
    <div class="resumo-categoria">
        <span>Estimativa:
            <strong id="textoEstimativa">${formatarMoeda(valorEstimativa)}</strong>
            <button class="btn-editar-est" data-categoria="${categoria}"
                title="editar estimativa">✏️</button>
        </span>
    </div>
    <div id="formEstimativa" style="display:none" class="form-adicionar"
        style="margin-botton:10px">
        <div class="form-inline">
            <span class="simbolo-moeda">¥</span>
            <input type="number" id="inputEstimativa"
                value="${valorEstimativa}" placeholder="0">
            <button class="btn-adicionar" id="btnConfirmarEstimativa">✓</button>
        </div>
    </div>
  `   
}

// Função para calcular totais do resumo
function calcularResumo(dados) {
    const s = dados.salarios;
    

    const receitasEst = s.modoEstimativa === 'calculo' ?
     calcularSalario(s).liquido : s.estimativa;
    const receitasReal = s.realidade;
    
    const totalExtrasReal = (dados.outrosGastos.receitasExtras || [])
        .reduce((soma, item) => soma + item.valor, 0)

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
        const saldoReal = (receitasReal + totalExtrasReal) - despesasReal

        // Retornar objetos com os totais
        return {
            totalReceitasEstimativa: receitasEst,
            totalReceitasRealidade: receitasReal,
            totalExtrasRealidade: totalExtrasReal,
            totalDespesasEstimativa: despesasEst,
            totalDespesasRealidade: despesasReal,
            saldoEstimativa: saldoEst,
            saldoRealidade: saldoReal
        }
    }

// Calcula todos os valores do salário
function calcularSalario(s) {
    const HORAS_DIURNAS_DIA = 7.833
    const HORAS_NOTURNAS_DIA = 7.583
    const HORAS_ADICIONAL = 1.75 // horas após 22h (com adicional)

    const salarioDiurno = s.diasDiurnos * HORAS_DIURNAS_DIA * s.valorHora
    const salarioNoturno = s.diasNoturnos * HORAS_NOTURNAS_DIA * s.valorHora

    const heDiurnas = s.hesDiurnas * s.valorHora * 1.25
    const heNoturnas = s.hesNoturnas * s.valorHora * 1.25

    const adicionalNoturno = s.diasNoturnos * 
        (HORAS_ADICIONAL + s.hesNoturnas) * s.valorHora * 0.25
    
    const totalDias = s.diasDiurnos + s.diasNoturnos
    const premioAssiduidade     = 30000
    const premioTurno           = totalDias * 500
    const auxTransporte         = totalDias * 210

    const bruto =   salarioDiurno + salarioNoturno +
                    heDiurnas + heNoturnas +
                    adicionalNoturno + premioAssiduidade +
                    premioTurno + auxTransporte
    
    // Descontos variáveis (calculados sobre o bruto)
    const seguroDesemprego = Math.round(bruto * 0.0055)
    const impostoRenda = Math.round(bruto * 0.0242)

    // TOTAL DESCONTOS
    const totalDescontos = s.seguroSaude + s.seguroAssist +
                            s.impostoResidencial + s.previdencia +
                            seguroDesemprego + impostoRenda
    
    // LÍQUIDO
    const liquido = bruto - totalDescontos

    // Retorna todos os valores calculados
    return {
        salarioDiurno,
        salarioNoturno,
        heDiurnas,
        heNoturnas,
        adicionalNoturno,
        premioAssiduidade,
        premioTurno,
        auxTransporte,
        bruto,
        seguroDesemprego,
        impostoRenda,
        totalDescontos,
        liquido
    }
}

// Função para renderizar o salário
function renderizarSalario(dados) {
    const s = dados.salarios
    const c = calcularSalario(s)
    const modo = s.modoEstimativa || 'calculo'

    // Atualiza estimativa automaticamente no modo calculo
    if (modo === 'calculo') {
        dadosMeses[mesAtual].salarios.estimativa = Math.round(c.liquido)
    }

    return `
        <h2 class="secao-titulo">Salário</h2>

        <div class="abas-cartao">
            <button class="aba-btn ${modo === 'calculo' ? 'ativa' : ''}" data-modo="calculo">
                📊 Cálculo por horas
            </button>
            <button class="aba-btn ${modo === 'simples' ? 'ativa' : ''}" data-modo="simples">
                ✏️ Valor simples
            </button>
        </div>

        ${ modo === 'calculo' ? `
            
        <div class="salario-secao">
            <h3 class="salario-titulo">⚙️ configuração</h3>
            <div class="salario-linha">
                <label>Valor por hora (¥):</label>
                <div class="salario-calc">
                    <span class="simbolo-moeda">¥</span>
                    <input type="number" class="input-salario largo" id="valorHora"
                        value="${s.valorHora}">
                </div>
            </div>
        </div>

        <div class="salario-secao">
            <h3 class="salario-titulo">📅 Dias Trabalhados</h3>

            <div class="salario-linha">
                <label>Turno diurno (dias):</label>
                <div class="salario-calc">
                    <input type="number" class="input-salario" id="diasDiurnos"
                        value="${s.diasDiurnos}" min="0">
                    <span class="salario-resultado">${formatarMoeda(c.salarioDiurno)}</span>
                </div>
            </div>

            <div class="salario-linha">
                <label>H.E. Diurnas (horas):</label>
                <div class="salario-calc">
                    <input type="number" class="input-salario" id="hesDiurnas"
                        value="${s.hesDiurnas}" min="0">
                    <span class="salario-resultado">${formatarMoeda(c.heDiurnas)}</span>
                </div>
            </div>

            <div class="salario-linha">
                <label>Turno noturno (dias):</label>
                <div class="salario-calc">
                    <input type="number" class="input-salario" id="diasNoturnos"
                        value="${s.diasNoturnos}" min="0">
                    <span class="salario-resultado">${formatarMoeda(c.salarioNoturno)}</span>
                </div>
            </div>

            <div class="salario-linha">
                <label>H.E. noturnas (horas):</label>
                <div class="salario-calc">
                    <input type="number" class="input-salario" id="hesNoturnas"
                        value="${s.hesNoturnas}" min="0">
                    <span class="salario-resultado">${formatarMoeda(c.heNoturnas)}</span>
                </div>
            </div>

            <div class="salario-linha">
                <label>Adicional noturno:</label>
                <div class="salario-calc">
                    <span class="salario-resultado">${formatarMoeda(c.adicionalNoturno)}</span>
                </div>
            </div>
        </div>

        <div class="salario-secao">
            <h3 class="salario-titulo">🎁 Prêmios e Auxílios</h3>

            <div class="salario-linha">
                <label>Prêmio assiduidade:</label>
                <span class="salario-resultado">${formatarMoeda(c.premioAssiduidade)}</span>
            </div>
            <div class="salario-linha">
                <label>Prêmio turno (¥500/dia):</label>
                <span class="salario-resultado">${formatarMoeda(c.premioTurno)}</span>
            </div>
            <div class="salario-linha">
                <label>Aux.Transporte (¥210/dia):</label>
                <span class="salario-resultado">${formatarMoeda(c.auxTransporte)}</span>
            </div>

            <div class="salario-bruto">
                <span>Total Bruto:</span>
                <span>${formatarMoeda(c.bruto)}</span>
            </div>
        </div>

        <div class="salario-secao">
            <h3 class="salario-titulo">📤 Descontos</h3>

            <div class="salario-linha">
                <label>Seguro Saúde (fixo):</label>
                <span class="salario-desconto">${formatarMoeda(s.seguroSaude)}</span>
            </div>
            <div class="salario-linha">
                <label>Seg. Assistência (fixo):</label>
                <span class="salario-desconto">${formatarMoeda(s.seguroAssist)}</span>
            </div>
            <div class="salario-linha">
                <label>Imp. Residencial (fixo):</label>
                <span class="salario-desconto">${formatarMoeda(s.impostoResidencial)}</span>
            </div>
            <div class="salario-linha">
                <label>Previdência:</label>
                <span class="salario-desconto">${formatarMoeda(s.previdencia)}</span>
            </div>
            <div class="salario-linha">
                <label>Seg. Desemprego:</label>
                <span class="salario-desconto">${formatarMoeda(c.seguroDesemprego)}</span>
            </div>
            <div class="salario-linha">
                <label>Imp. Renda:</label>
                <span class="salario-desconto">${formatarMoeda(c.impostoRenda)}</span>
            </div>
        </div>

        <div class="salario-liquido">
            <span>💰 Estimativa Líquida:</span>
            <span id="valorLiquido" class="${c.liquido >= 0 ? 'positivo' : 'negativo'}">
                ${formatarMoeda(c.liquido)}
            </span>
        </div>

        ` : `

        <div class="salario-secao" style="margin-top:15px">
            <h3 class="salario-titulo">💰 Estimativa</h3>
            <div class="salario-linha">
                <label>Valor estimado (¥):</label>
                <div class="salario-calc">
                    <span class="simbolo-moeda">¥</span>
                    <input type="number" class="input-salario largo" id="estimativaSimples"
                        value="${s.estimativa || ''}" placeholder="0">
                </div>
            </div>
        </div>

        `}

        <div class="salario-secao" style="margin-top:15px">
            <h3 class="salario-titulo">✅ Realidade</h3>
            <div class="salario-linha">
                <label>Valor líquido real (do holerite):</label>
                <div class="salario-calc">
                    <span class="simbolo-moeda">¥</span>
                    <input type="number" class="input-salario largo" id="salarioRealidade"
                        value="${s.realidade || ''}" placeholder="0">
                </div>
            </div>
        </div>           
    `
}

// Função para adicionar eventos Salario
function adicionarEventosSalario() {
    const s = dadosMeses[mesAtual].salarios
    const modo = s.modoEstimativa || 'calculo'

    // Troca de abas
    document.querySelectorAll('.aba-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            dadosMeses[mesAtual].salarios.modoEstimativa = this.dataset.modo
            renderizar()
        })
    })

    if (modo === 'calculo') {
        // Campos que disparam recálculo completo da tela
    const campos = ['valorHora', 'diasDiurnos', 'diasNoturnos',
                    'hesDiurnas', 'hesNoturnas']
    
    campos.forEach(campo => {
        const input = document.getElementById(campo)
        if (!input) return

        input.addEventListener('input', function () {
            dadosMeses[mesAtual].salarios[campo] = Number(this.value) || 0

        const s = dadosMeses[mesAtual].salarios
        const c = calcularSalario(s)

        // Atualiza o líquido
        const elemLiquido = document.getElementById('valorLiquido')
        if (elemLiquido) {
            elemLiquido.textContent = formatarMoeda(c.liquido)
            elemLiquido.className = c.liquido >= 0 ? 'positivo' : 'negativo'
        }

        // Atualiza estimativa no objeto de dados
        dadosMeses[mesAtual].salarios.estimativa = c.liquido

        })
    })

} else {
    // Modo simples - salva o valor digitado como estimativa
    const inputSimples = document.getElementById('estimativaSimples')
    if (inputSimples) {
        inputSimples.addEventListener('input', function() {
            dadosMeses[mesAtual].salarios.estimativa = parseInt(this.value) || 0

        })
    }
}

    // Campo de realidade - (igual nos dois modos)
    const inputRealidade = document.getElementById('salarioRealidade')
    if (inputRealidade) {
        inputRealidade.addEventListener('input', function() {
            dadosMeses[mesAtual].salarios.realidade = parseInt(this.value) || 0
        })
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
        ${r.totalExtrasRealidade > 0 ? `
        <tr>
            <td>Receitas Extras:</td>
            <td>-</td>
            <td class="positivo">+${formatarMoeda(r.totalExtrasRealidade)}</td>
        </tr>
            ` : ''}
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

// Calcula o total da Estimativa e Realidade:
const totalEstimativa = itens.reduce((soma, item) => soma + item.estimativa, 0)    
const totalRealidade = itens.reduce((soma, item) => soma + item.realidade, 0)

const linhas = itens.length === 0
    ? '<tr><td colspan="4" style="text-align:center; color: #999; padding:20px;">Nenhuma conta registrada</td></tr>'
    : itens.map(item => {
        const classePago = item.pago ? 'conta-paga' : ''
        return `
        <tr class="${classePago}">
            <td>${item.descricao}</td>
            <td class="valor-estimativa">${formatarMoeda(item.estimativa)}</td>
            <td>
                <input
                    type="number"
                    class="input-realidade"
                    value="${item.realidade || ''}"
                    placeholder="0"
                    data-id="${item.id}"
                >
            </td>
            <td style="white-space:nowrap">
                <button
                    class="btn-pago ${item.pago ? 'ativo' : ''}"
                    data-id="${item.id}"
                >${item.pago ? '✓' : '○'}</button>
                <button class="btn-remover" data-id="${item.id}">⊗</button>
            </td>
        </tr>
        `
    }).join('')

    return `
        <h2 class="secao-titulo">Contas Fixas</h2>
       
       <div class="form-adicionar">
        <div class="form-group">
            <label>Descrição:</label>
            <input type="text" id="inputDescricao" placeholder="Ex: Aluguel">
        </div>
        <div class="form-inline">
            <span class="simbolo-moeda">¥</span>
            <input type="number" id="inputValor" placeholder="Estimativa">
            <button class="btn-adicionar" id="btnAdicionar">+</button>
        </div>
        </div>
       
        <table class="tabela-resumo">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Estimativa</th>
                    <th>Realidade</th>
                    <th></th>
                <tr>
            </thead>
            <tbody id="listaContas">
                ${linhas}
            </tbody>
            <tfoot>
                <tr class="linha-saldo">
                    <td><strong>Total:</strong></td>
                    <td>${formatarMoeda(totalEstimativa)}</td>
                    <td id="totalRealidadeContas">${formatarMoeda(totalRealidade)}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    `
}

// "Escuta" quando o usuário digita um valor ou clica no botão pago
function adicionarEventoContas() {
    
    // Botão adicionar
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('#btnAdicionar')
        if (!btn || opcaoAtual !== 'contas') return
        
        
        const descricao = document.getElementById('inputDescricao').value.trim()
        const valor = parseInt(document.getElementById('inputValor').value) || 0

        if (!descricao || valor <= 0) {
            alert('Preencha a descrição e um valor válido!')
            return
        }

        dadosMeses[mesAtual].contasFixas.itens.push({
            id: Date.now(),
            descricao,
            estimativa: valor,
            realidade: 0,
            pago: false
        })

    // Atualiza estimativa geral da categoria
    dadosMeses[mesAtual].contasFixas.estimativa =
        dadosMeses[mesAtual].contasFixas.itens
            .reduce((soma, i) => soma + i.estimativa, 0)
    
    renderizar()
    })
    
     // Realidade - mantém 'change' mas sem loop
    document.getElementById('listaContas').addEventListener('change', function(e) {
        const input = e.target.closest('.input-realidade')
        if (!input) return
        const id = parseInt(input.dataset.id)
        const valor = parseInt(input.value) || 0
        const item = dadosMeses[mesAtual].contasFixas.itens.find(i => i.id === id)
        item.realidade = valor
        const total = dadosMeses[mesAtual].contasFixas.itens
            .reduce((soma, i) => soma + (i.realidade || 0), 0)
        document.getElementById('totalRealidadeContas').textContent = formatarMoeda(total)
        dadosMeses[mesAtual].contasFixas.realidade = total
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
            </tr>
        `).join('')

        return `
            <h2 class="secao-titulo">Mercado</h2>

            ${htmlEstimativa('mercado', dados.mercado.estimativa)}
            <div class="resumo-categoria">
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
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('#btnAdicionar')
        if (!btn || opcaoAtual !== 'mercado') return


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
        dadosMeses[mesAtual].mercado.itens.push({
            id: Date.now(),
            descricao: descricao,
            valor: valor,
            data: dataFormatada
        })
        
        // Adiciona nos dados
        dadosMeses[mesAtual].mercado.realidade =
            dadosMeses[mesAtual].mercado.itens
                .reduce((soma, i) => soma + i.valor, 0)

                renderizar()
        })


            
        adicionarEventosEstimativa()
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

        ${htmlEstimativa('refeicoes', dados.refeicoes.estimativa)}
        <div class="resumo-categoria">
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
    
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('#btnAdicionar')
        if (!btn || opcaoAtual !== 'refeicoes') return

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

        dadosMeses[mesAtual].refeicoes.itens.push({
            id: Date.now(),
            descricao,
            valor,
            data: dataFormatada
        })

        dadosMeses[mesAtual].refeicoes.realidade =
            dadosMeses[mesAtual].refeicoes.itens
                .reduce((soma, i) => soma + i.valor, 0)
        renderizar()
    })

       
    adicionarEventosEstimativa()
}

// Gera HTML da tela de Outros Gastos
function renderizarOutros(dados) {
    const itens = dados.outrosGastos.itens
    const extras = dados.outrosGastos.receitasExtras || []

    const totalGastos = itens.reduce((soma, item) => soma + item.valor, 0)
    const totalExtras = extras.reduce((soma, item) => soma + item.valor, 0)

    const linhasGastos = itens.length === 0
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

    const linhasExtras = extras.length === 0
            ? '<tr><td colspan="3" style="text-align:center; color:#999; padding:20px;">Nenhuma receita registrada</td></tr>'
            : extras.map(item => `
                <tr>
                    <td>${item.descricao}</td>
                    <td class="valor-estimativa">${item.data}</td>
                    <td class="valor-item positivo">
                        +${formatarMoeda(item.valor)}
                        <button class="btn-remover" data-id="${item.id}" data-tipo="extra">⊗</button>
                    </td>
                </tr>
            `).join('')
    return `
        <h2 class="secao-titulo">Outros</h2>

        ${htmlEstimativa('outrosGastos', dados.outrosGastos.estimativa)}
        <div class="resumo-categoria">
            <span>Saldo: <strong id="totalOutros" class="${totalExtras - totalGastos >= 0 ? 'positivo' : 'negativo'}">
                ${formatarMoeda(totalExtras - totalGastos)}
            </strong></span>
        </div>

        <!-- SEÇÃO: RECEITAS EXTRAS -->
        <div class="salario-secao" style="margin-bottom: 20px">
                <h3 class="salario-titulo">Receitas Extras</h3>

                <div class="form-adicionar">
                    <div class="form-group">
                        <label>Descrição:</label>
                        <input type="text" id="inputDescricaoExtra" placeholder="Ex: Auxílio do leite">
                    </div>
                    <div class="form-inline">
                        <span class="simbolo-moeda">¥</span>
                        <input type="number" id="inputValorExtra" placeholder="Digite">
                        <button class="btn-adicionar" id="btnAdicionarExtra">+</button>
                    </div>
                </div>

                <table class="tabela-resumo">
                    <thead>
                        <tr><th>Descrição</th><th>Data</th><th>Valor</th></tr>
                    </thead>
                    <tbody id="listaExtras">${linhasExtras}</tbody>
                    <tfoot>
                        <tr class="linha-saldo">
                            <td colspan="2"><strong>Total receitas:</strong></td>
                            <td class="positivo"><strong>+${formatarMoeda(totalExtras)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        
        <!-- SEÇÃO: GASTOS -->
        <div class="salario-secao">
            <h3 class="salario-titulo">Gastos</h3>

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
            <tbody id="listaGastos">${linhasGastos}</tbody>
            <tfoot>
                <tr class="linha-saldo">
                    <td colspan="2"><strong>Total gastos:</strong></td>
                    <td><strong>${formatarMoeda(totalGastos)}</strong></td>
                </tr>
            </tfoot>
        </table>
    </div>
    `
}

function adicionarEventosOutros() {

    // Botão adicionar GASTO
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('#btnAdicionar')
        if (!btn || opcaoAtual !== 'outros') return

        const descricao = document.getElementById('inputDescricao').value.trim()
        const valor = parseInt(document.getElementById('inputValor').value) || 0

        if (!descricao || valor <= 0) {
            alert('Preencha a descrição e um valor válido!')
            return
        }

        const hoje = new Date()
        const dia = String(hoje.getDate()).padStart(2, '0')
        const mes = String(hoje.getMonth() + 1).padStart(2, '0')
        
        dadosMeses[mesAtual].outrosGastos.itens.push({
            id: Date.now(),
            descricao,
            valor,
            data: dia + '/' + mes
        })

        dadosMeses[mesAtual].outrosGastos.realidade =
        dadosMeses[mesAtual].outrosGastos.itens.reduce((soma, i) => soma + i.valor, 0)

        renderizar()
    })

    // Botão adicionar RECEITA EXTRA
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('#btnAdicionarExtra')
        if (!btn || opcaoAtual !== 'outros') return


        const descricao = document.getElementById('inputDescricaoExtra').value.trim()
        const valor = parseInt(document.getElementById('inputValorExtra').value) || 0

        if (!descricao || valor <=0) {
            alert('Preencha a descrição e um valor válido!')
            return
        }

        const hoje = new Date()
        const dia = String(hoje.getDate()).padStart(2, '0')
        const mes = String(hoje.getMonth() + 1).padStart(2, '0')

        dadosMeses[mesAtual].outrosGastos.receitasExtras.push({
            id: Date.now(),
            descricao,
            valor,
            data: dia + '/' + mes
        })

        renderizar()
    })

    
    adicionarEventosEstimativa()
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

        ${htmlEstimativa('cartaoCredito', dados.cartaoCredito.estimativa)}
        <div class="resumo-categoria">
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
            <tbody id="listaCartao">
                ${abaCartao === 'avista' ? linhasAvista : linhasParcelado}
            </tbody>
        </table>
    `
}

function adicionarEventosCartao() {

        // Troca de aba
        document.querySelectorAll('.aba-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (opcaoAtual !== 'cartao') return
                abaCartao = this.dataset.aba
                renderizar
            })
        })
        
          
        // Botão adicionar
        const btnAdicionar = e.target.getElementById('btnAdicionar')
        if (btnAdicionar) return

        btnAdicionar.addEventListener('click', function(){
            const descricao = document.getElementById('inputDescricao').value.trim()
            const valor     = parseInt(document.getElementById('inputValor').value) || 0

            if (!descricao || valor <= 0) {
                alert('Preencha a descrição e um valor válido')
                return
            }
            // Pega a data de hoje
            const hoje = new Date()
            const data = String(hoje.getDate()).padStart(2, '0') + '/' +
                         String(hoje.getMonth() + 1).padStart(2, '0')
                         
            if (abaCartao === 'avista') {
                // Compra à vista - 1 parcela
                dadosMeses[mesAtual].cartaoCredito.itens.push({
                    id: Date.now(),
                    descricao,
                    valorTotal: valor,
                    valorParcela: valor,
                    parcelaAtual: 1,
                    totalParcelas: 1,
                    dataCompra: data
                })
                
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
        
                dadosMeses[mesAtual].cartaoCredito.itens.push({
                    id: Date.now(),
                    descricao,
                    valorTotal: valor * totalParcelas,
                    valorParcela: valor,
                    parcelaAtual,
                    totalParcelas,
                    dataCompra: data
                })
        }

        dadosMeses[mesAtual].cartaoCredito.realidade =
            dadosMeses[mesAtual].cartaoCredito.itens
                .reduce((soma, i) => soma + i.valorParcela, 0)

        renderizar()
    })

    adicionarEventosEstimativa()
}

// Função copiar contas do mês anterior
function copiarContasDoMesAnterior(mesAtual) {
    const meses = Object.keys(dadosMeses).sort()
    const indexAtual = meses.indexOf(mesAtual)

    // Não tem mes anterior
    if (indexAtual <= 0) return

    const mesAnterior = meses[indexAtual - 1]

    // CONTAS FIXAS
    const itensAnteriores = dadosMeses[mesAnterior].contasFixas.itens

    // Copia cada item, resetando realidade e pago
    dadosMeses[mesAtual].contasFixas.itens = itensAnteriores.map(item => ({
        ...item,
        id: Date.now() + Math.random(), // id único para cada item
        realidade: 0,
        pago: false
    }))

    // Recalcula estimativa
    dadosMeses[mesAtual].contasFixas.estimativa =
        dadosMeses[mesAtual].contasFixas.itens
            .reduce((soma, i) => soma + i.estimativa, 0)

    // CARTÃO PARCELADO
    const jaTemParcelados = dadosMeses[mesAtual].cartaoCredito.itens
    .some(item => item.totalParcelas > 1)

    if (!jaTemParcelados) {

    const parceladosAnteriores = dadosMeses[mesAnterior].cartaoCredito.itens
        .filter(item => item.totalParcelas > 1 && item.parcelaAtual < item.totalParcelas)

    const parceladosCopias = parceladosAnteriores.map(item => ({
        ...item,
        id: Date.now() + Math.random(),
        parcelaAtual: item.parcelaAtual + 1
    }))

    dadosMeses[mesAtual].cartaoCredito.itens.push(...parceladosCopias)
}}

const API = 'https://api-orcamento-q4iy.onrender.com'

// Pega o token salvo no localStorage
function getToken() {
    return localStorage.getItem('token')
}

// Salva um mês específico no backend
async function salvarDados() {
    if (!mesAtual) return

    try {
        await fetch(`${API}/meses/${mesAtual}`, {
            method: 'PUT',
            headers: { 
                'Content-type': 'application/json',
                'authorization': getToken()
            },
            body: JSON.stringify({ dados: dadosMeses[mesAtual] })
        })
    } catch (err) {
        console.log('Erro ao salvar - usando LocalStorage como backup')
        localStorage.setItem('orcamento-familiar', JSON.stringify(dadosMeses))
    }
}

// Carrega todos os meses do backend
async function carregarDados() {
    try {
        const resposta = await fetch(`${API}/meses`, {
            headers: { 'authorization': getToken() }
        })

        // Token inválido ou expirado - vai para o login
        if (resposta.status === 401) {
            return false
        }

        const meses = await resposta.json()

        // Se veio dados do servidor, usa eles
        if (meses.length > 0) {
            meses.forEach(mes => {
                dadosMeses[mes.mesId] = mes.dados
            })
        }
        return true

    } catch (err) {
        console.log('Servidor offline - carregando do LocalStorage')
        const dadosSalvos = localStorage.getItem('orcamento-familiar')
        if (dadosSalvos) dadosMeses = JSON.parse(dadosSalvos)
        return true
    }
}

// Mostra a tela de login
function mostrarLogin() {

    // Esconde os dropdowns enquanto não está logado
    mesSelect.style.display = 'none'
    opcaoSelect.style.display = 'none'

    conteudoPrincipal.innerHTML = `
        <div style="max-width:300px; margin:60px auto; text-align:center">
            <h2 class="secao-titulo">🔐 Login</h2>
            <div class="form-adicionar">
                <div class="form-group">
                    <label>Usuário:</label>
                    <input type="text" id="inputLogin" placeholder="Digite o usuário">
                </div>
                <div class="form-group" style="margin-top:10px">
                    <label>Senha:</label>
                    <input type="password" id="inputSenha" placeholder="Digite a senha">
                </div>
                <button class="btn-adicionar" id="btnLogin"
                    style="width:100%; margin-top:15px; padding:12px">
                    Entrar
                </button>
                <p id="erroLogin" style="color:red; margin-top:10px"></p>
            </div>
        </div>
    `

    setTimeout(() => {
        document.getElementById('btnLogin').addEventListener('click', async function() {
            const login = document.getElementById('inputLogin').value.trim()
            const senha = document.getElementById('inputSenha').value

            if (!login || !senha) {
                document.getElementById('erroLogin').textContent = 'Preencha todos os campos'
                return
            }

            try {
                const resposta = await fetch(`${API}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, senha })
                })

                const dados = await resposta.json()

                if (resposta.status === 401) {
                    document.getElementById('erroLogin').textContent = dados.erro
                    return
                }

                // Salva o token e carrega o app
                localStorage.setItem('token', dados.token)
                mesSelect.style.display = ''
                opcaoSelect.style.display = ''
                carregarDados ().then(() => {
                    atualizarSelectMeses()
                    renderizar()
                })

            } catch (err) {
                document.getElementById('erroLogin').textContent = 'Erro ao conectar ao servidor'
            }
        })
    }, 0)
}

// Adiciona eventos do botão lápis (usado em todas as categorias)
function adicionarEventosEstimativa() {
    const btnEditar = document.querySelector('.btn-editar-est')
    if (!btnEditar) return

    btnEditar.addEventListener('click', function() {
        const formEst = document.getElementById('formEstimativa')
        const estaEditando = formEst.style.display === 'block'

        if (estaEditando) {
            formEst.style.display = 'none'
        } else {
            formEst.style.display = 'block'
            document.getElementById('inputEstimativa').focus()
        }
    })

    const btnConfirmar = document.getElementById('btnConfirmarEstimativa')
    if (!btnConfirmar) return

    btnConfirmar.addEventListener('click', function() {
        const categoria = document.querySelector('.btn-editar-est').dataset.categoria
        const valor = parseInt(document.getElementById('inputEstimativa').value) || 0

        // Salva no objeto de dados
        dadosMeses[mesAtual][categoria].estimativa = valor

        // Atualiza o texto na tela sem re-renderizar tudo
        document.getElementById('textoEstimativa').textContent = formatarMoeda(valor)
        document.getElementById('formEstimativa').style.display = 'none'

        // Salva no backend
        salvarDados()
    })
}

// Função principal de renderização
function renderizar() {
    // Verifica se um mês foi selecionado
    if (!mesAtual) {
        conteudoPrincipal.innerHTML = '<p>Selecione um mês</p>'
        return
    }
    
    const contas = dadosMeses[mesAtual].contasFixas.itens
    if (!dadosMeses[mesAtual].inicializado) {
        copiarContasDoMesAnterior(mesAtual)
        dadosMeses[mesAtual].inicializado = true
    }

    salvarDados()

    // Busca os dados do mês selecionado
    const dados = dadosMeses[mesAtual]

    //Atualiza o conteúdo baseado na opção selecionada
    if (opcaoAtual === 'resumo') {
        conteudoPrincipal.innerHTML = renderizarResumo(dados)
    } else if (opcaoAtual === 'contas') {
        conteudoPrincipal.innerHTML = renderizarContas(dados)
        setTimeout(() => adicionarEventoContas(), 0)
    } else if (opcaoAtual === 'salario') {
        conteudoPrincipal.innerHTML = renderizarSalario(dados)
        setTimeout(() => adicionarEventosSalario(), 0)
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

carregarDados().then(autenticado => {
    if (autenticado) {
        mesSelect.style.display = '' // restaura display original
        opcaoSelect.style.display = ''
        atualizarSelectMeses()
        renderizar()
    } else {
        mostrarLogin()
    }
})