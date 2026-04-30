// ==============================
// ORÇAMENTO FAMILIAR - v2
// ==============================

/* DADOS E CONSTANTES */

const API = 'https://api-orcamento-q4iy.onrender.com'

const NOMES_MESES = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

// Estado global da aplicação
let dadosMeses = {}
let mesAtual = ''
let abaAtiva = 'salario'
let graficoInstancia = null // guarda a instância do Chart.js

// -- Cria estrutura de mês vazio --
function criarMesVazio() {
    return {
        salarios: {
        modo: 'calculo',
        valorHora: 1750,
        diasDiurnos: 0,
        diasNoturnos: 0,
        hesDiurnas: 0,
        hesNoturnas: 0,
        seguroSaude: 18432,
        seguroAssist: 2862,
        impostoResidencial: 12600,
        previdencia: 32940,
        valorSimples: 0,
        realidade: 0 
    },
    rendaExtra: [],
    contasFixas: [],
    mercado: [],
    refeicoes: [],
    cartao: [],
    outros: [],
    }
}

// -- Funções de cálculo puras (não tocam no DOM) --

function calcularSalario(s) {
    const HORAS_DIURNAS = 7.833
    const HORAS_NOTURNAS = 7.583
    const HORAS_ADICIONAL = 1.75

    const salDiurno = s.diasDiurnos * HORAS_DIURNAS * s.valorHora
    const salNoturno = s.diasNoturnos * HORAS_NOTURNAS * s.valorHora
    const heDiurnas = s.hesDiurnas * s.valorHora * 1.25
    const heNoturnas = s.hesNoturnas * s.valorHora * 1.25
    const adicNoturno = s.diasNoturnos * (HORAS_ADICIONAL + s.hesNoturnas) * s.valorHora * 0.25

    const totalDias = s.diasDiurnos + s.diasNoturnos
    const premAssiduidade = 0
    const premTurno       = totalDias * 0
    const auxTransporte   = totalDias * 0
    
    const bruto = salDiurno + salNoturno + heDiurnas + heNoturnas +
                  adicNoturno + premAssiduidade + premTurno + auxTransporte

    const segDesemprego = Math.round(bruto * 0.0055)
    const impRenda      = Math.round(bruto * 0.0242)
    const totalDescontos = s.seguroSaude + s.seguroAssist +
                           s.impostoResidencial + s.previdencia +
                           segDesemprego + impRenda
    
    return {
        bruto,
        segDesemprego,
        impRenda,
        totalDescontos,
        liquido: Math.round(bruto - totalDescontos)
    }
}

function calcularTotais(mes) {
    const s = mes.salarios
    const salEst = s.modo === 'calculo'
    ? calcularSalario(s).liquido
    : s.valorSimples

    const rendaExtraTotal = mes.rendaExtra.reduce((a, i) => a + i.valor, 0)
    const entradas        = salEst + rendaExtraTotal

    const contasTotal    = mes.contasFixas.reduce((a, i) => a + i.valor, 0)
    const cartaoTotal    = mes.cartao.reduce((a, i) => a + i.valorParcela, 0)
    const mercadoTotal   = mes.mercado.reduce((a, i) => a + i.valor, 0)
    const refeicoesTotal = mes.refeicoes.reduce((a, i) => a + i.valor, 0)
    const outrosTotal    = mes.outros.reduce((a, i) => a + i.valor, 0)
    const saidas         = contasTotal + cartaoTotal + mercadoTotal + refeicoesTotal + outrosTotal

    return {
        salario: salEst,
        rendaExtra: rendaExtraTotal,
        entradas,
        contas: contasTotal,
        cartao: cartaoTotal,
        mercado: mercadoTotal,
        refeicoes: refeicoesTotal,
        outros: outrosTotal,
        saidas,
        saldo: entradas - saidas,
        saldoReal: s.realidade + rendaExtraTotal - saidas
    }
}

// -- Funções auxiliares --
function formatarMoeda(valor) {
    return '¥' + Math.round(valor).toLocaleString('ja-JP')
}

function gerarId() {
    return Date.now() + Math.random()
}

function getToken() {
    return localStorage.getItem('token')
}

/* FUNÇÕES DE RENDERIZAR */

// -- Atualiza o select de meses --
function atualizarSelectMeses() {
    const select = document.getElementById('mesSelect')
    if (!select) return
    const meses = Object.keys(dadosMeses).sort()

    // Limpa tudo e recria as opções do zero para não haver erro
    select.innerHTML = '<option value="">Selecione o mês</option>';

    // Adiciona os meses que já existem
    meses.forEach(mesId => {
        const [ano, mes] = mesId.split('-');
        const option = document.createElement('option');
        option.value = mesId;
        option.textContent = `${NOMES_MESES[parseInt(mes) - 1]} ${ano}`;

        if (mesId === mesAtual) option.selected = true;
        select.appendChild(option);
    });

    // Adiciona a opção de criar novo por último
    const optNovo = document.createElement('option');
    optNovo.value = '__novo__';
    optNovo.textContent = '+ Novo mês';
    select.appendChild(optNovo);
}

// -- Atualiza o resumo principal --
function atualizarResumo() {
    if (!mesAtual) return
    const t = calcularTotais(dadosMeses[mesAtual])

    document.getElementById('totalEntradas').textContent = formatarMoeda(t.entradas)
    document.getElementById('totalSaidas').textContent   = formatarMoeda(t.saidas)
    document.getElementById('r-salario').textContent     = formatarMoeda(t.salario)
    document.getElementById('r-contas').textContent      = formatarMoeda(t.contas)
    document.getElementById('r-cartao').textContent      = formatarMoeda(t.cartao)
    document.getElementById('r-mercado').textContent     = formatarMoeda(t.mercado)
    document.getElementById('r-refeicoes').textContent   = formatarMoeda(t.refeicoes)
    document.getElementById('r-outros').textContent      = formatarMoeda(t.outros)
 
    const saldo = document.getElementById('r-saldo')
    saldo.textContent = formatarMoeda(t.saldo)
    saldo.className = t.saldo >= 0 ? 'val-entrada' : 'val-saida'

    // Renda extra: mostrar linha só se tiver valor
    const trExtra = document.getElementById('tr-rendaExtra')
    if (t.rendaExtra > 0) {
        trExtra.classList.remove('hidden')
        document.getElementById('r-rendaExtra').textContent = '+' + formatarMoeda(t.rendaExtra)
    } else {
        trExtra.classList.add('hidden')
    }

    atualizarGrafico(t)
}

// -- Atualiza o gráfico --
function atualizarGrafico(t) {
    const ctx = document.getElementById('grafico').getContext('2d')

    if (graficoInstancia) {
        graficoInstancia.destroy()
    }

    graficoInstancia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Entradas', 'Saidas'],
            datasets: [
                {
                    label: 'Salario + Renda extra',
                    data: [t.entradas, 0],
                    backgroundColor: '#2da862',
                    borderRadius: 6,
                    stack: 'grupo'
                },
                {
                    label: 'Contas fixas',
                    data: [0, t.contas],
                    backgroundColor: '#9b59b6',
                    borderRadius: 0,
                    stack: 'grupo'
                },
                {
                    label: 'Cartão',
                    data: [0, t.cartao],
                    backgroundColor: '#e67e22',
                    borderRadius: 0,
                    stack: 'grupo'
                },
                {
                    label: 'Variáveis',
                    data: [0, t.mercado + t.refeicoes + t.outros],
                    backgroundColor: '#e74c3c',
                    borderRadius: 6,
                    stack: 'grupo'
                }

            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {  position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } },
                tooltip: {
                    callbacks: {
                        label: ctx => ' ' + formatarMoeda(ctx.raw)
                    }
                }
            },
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, ticks: { callback: v => '¥' + (v/1000).toFixed(0) + 'k' } }
            }
        }
    })
}

// -- Atualiza a lista de contas fixas --
function atualizarListaContas() {
    if (!mesAtual) return
    const contas = dadosMeses[mesAtual].contasFixas
    const container = document.getElementById('listaContas')

    if (contas.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8e8e93;padding:20px;font-size:13px">Nenhuma conta registrada</p>'
        return
    }

    container.innerHTML = contas.map(item => {
        const tagClasse = item.pago ? 'pago' : 'pendente'
        const tagTexto  = item.pago ? 'pago' : 'pendente'
        return `
            <div class="lista-item">
                <div class="item-info">
                    <div class="item-desc">${item.descricao}</div>
                </div>
                <div class="item-valor">${formatarMoeda(item.valor)}</div>
                <span class="tag-pago ${tagClasse}"
                    data-acao="togglePago" data-id="${item.id}">
                    ${tagTexto}
                </span>
                <button class="btn-editar" data-acao="editarConta"
                    data-id="${item.id}">✏️</button>
                <button class="btn-excluir" data-acao="remover"
                    data-categoria="contasFixas"
                    data-id="${item.id}">✕</button>
            </div>
        `
    }).join('')  
}

// -- Atualiza a lista de parcelados --
function atualizarListaParcelados() {
    if(!mesAtual) return
    const parcelados = dadosMeses[mesAtual].cartao.filter(i => i.totalParcelas > 1)
    const container = document.getElementById('listaParcelados')

    if (parcelados.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8e8e93;padding:20px;font-size:13px">Nenhum parcelado ativo</p>'
        return
    }

    container.innerHTML = parcelados.map(item => `
        <div class="lista-item">
            <div class="item-info">
                <div class="item-desc">${item.descricao}</div>
                <div class="item-meta">${item.parcelaAtual}/${item.totalParcelas} parcelas</div>
            </div>
            <div class="item-valor">${formatarMoeda(item.valorParcela)}</div>
            <button class="btn-excluir" data-acao="remover"
                data-categoria="cartao"
                data-id="${item.id}">✕</button>
        </div>
        `).join('')        
}

// -- Atualiza o histórico agrupado por categoria --
function atualizarHistorico() {
    if (!mesAtual) return
    const mes = dadosMeses[mesAtual]
    const container = document.getElementById('listaHistorico')

    const categorias = [
        { chave: 'mercado',     icone: '🛒', nome: 'Mercado', campo: 'valor' },
        { chave: 'refeicoes',   icone: '🍜', nome: 'Refeições', campo: 'valor' },
        { chave: 'cartao',      icone: '💳', nome: 'Cartão à vista', campo: 'valorParcela',
            filtro: i => i.totalParcelas === 1 },
        { chave: 'outros',      icone: '📦', nome: 'Outros', campo: 'valor' },
        { chave: 'rendaExtra',  icone: '⭐', nome: 'Renda extra', campo: 'valor' }
    ]

    let html = ''

    categorias.forEach(({ chave, icone, nome, campo, filtro }) => {
        let itens = mes[chave] || []
        if (filtro) itens = itens.filter(filtro)
        if (itens.length === 0) return

        const total = itens.reduce((s, i) => s + i[campo], 0)

        html +=`
            <div class="historico-categoria">
                <div class="historico-cat-titulo">
                    ${icone} ${nome}
                    <span>${formatarMoeda(total)}</span>
                </div>
                ${itens.map(item => `
                    <div class="lista-item">
                        <div class="item-info">
                            <div class="item-desc">${item.descricao}</div>
                            <div class="item-meta">${item.data || item.dataCompra || ''}</div>
                        </div>
                        <div class="item-valor">${formatarMoeda(item[campo])}</div>
                        <button class="btn-editar" data-acao="editarItem"
                                data-categoria="${chave}"
                                data-id="${item.id}">✏️</button>
                        <button class="btn-excluir" data-acao="remover"
                                data-categoria="${chave}"
                                data-id="${item.id}">✕</button>
                    </div>
                    `).join('')}
            </div>
        `
    })

    container.innerHTML = html || '<p style="text-align:center;color:#8e8e93;padding:20px;font-size:13px">Nenhum lançamento registrado</p>'
}

// -- Atualiza a aba de salário com inputs editáveis --
function atualizarAbaSalario() {
    if (!mesAtual) return
    const s = dadosMeses[mesAtual].salarios
    const c = calcularSalario(s)
    const container = document.getElementById('detalhesSalario')

    container.innerHTML = `
        <div class="card-resumo" style="padding: 16px; margin-bottom: 12px;">
            <div class="form-titulo">Configuração Base</div>
            <div class="form-row two-col">
                <div class="valor-wrapper">
                    <span class="valor-prefix">¥</span>
                    <input type="number" class="input-field input-valor" data-sal="valorHora" value="${s.valorHora}" placeholder="Valor Hora">
                </div>
                <select class="input-field" data-sal="modo">
                    <option value="calculo" ${s.modo === 'calculo' ? 'selected' : ''}>Cálculo Horas</option>
                    <option value="simples" ${s.modo === 'simples' ? 'selected' : ''}>Valor Fixo</option>
                </select>
            </div>
        </div>

        <div class="card-resumo ${s.modo === 'simples' ? 'hidden' : ''}" style="padding: 16px; margin-bottom: 12px;">
            <div class="form-titulo">Atividade do Mês</div>
            <div class="form-row two-col">
                <input type="number" class="input-field" data-sal="diasDiurnos" value="${s.diasDiurnos}" placeholder="Dias Diurnos">
                <input type="number" class="input-field" data-sal="diasNoturnos" value="${s.diasNoturnos}" placeholder="Dias Noturnos">
            </div>
            <div class="form-row two-col">
                <input type="number" class="input-field" data-sal="hesDiurnas" value="${s.hesDiurnas}" placeholder="HE Diurnas">
                <input type="number" class="input-field" data-sal="hesNoturnas" value="${s.hesNoturnas}" placeholder="HE Noturnas">
            </div>
        </div>

        <div class="card-resumo" style="padding: 16px;">
            <div class="form-titulo">Resultado Estimado</div>
            <div class="item-info" style="display:flex; justify-content: space-between; margin-top: 8px;">
                <span class="item-desc">Bruto:</span>
                <span class="item-valor">${formatarMoeda(c.bruto)}</span>
            </div>
            <div class="item-info" style="display:flex; justify-content: space-between; margin-top: 4px;">
                <span class="item-desc" style="color: var(--vermelho);">Descontos:</span>
                <span class="item-valor" style="color: var(--vermelho);">${formatarMoeda(c.totalDescontos)}</span>
            </div>
            <hr style="border: 0; border-top: 1px solid var(--borda); margin: 8px 0;">
            <div class="item-info" style="display:flex; justify-content: space-between;">
                <span class="item-desc" style="font-weight: bold;">Líquido:</span>
                <span class="item-valor" style="font-size: 1.1rem; color: var(--verde);">${formatarMoeda(c.liquido)}</span>
            </div>
        </div>
    `

    // Adiciona listeners para salvar mudanças automaticamente
    container.querySelectorAll('[data-sal]').forEach(input => {
        input.addEventListener('input', (e) => {
            const campo = e.target.dataset.sal
            s[campo] = e.target.type === 'number' ? Number(e.target.value) : e.target.value
            atualizarTudo()
            salvarDados()
        })
    })
}

// -- Atualiza tudo de uma vêz --
function atualizarTudo() {
    atualizarResumo()
    atualizarListaContas()
    atualizarListaParcelados()
    atualizarHistorico()
    atualizarAbaSalario()
}

// == LISTENER GLOBAL ÚNICO ==
document.addEventListener('click', function(e) {
    const el = e.target.closest('[data-acao]')
    if (!el) return

    const acao = el.dataset.acao
    const id   = el.dataset.id ? Number(el.dataset.id) : null
    const cat  = el.dataset.categoria || null
    
    switch (acao) {

        // -- Formulário flutuante --
        case 'toggleForm':
            toggleFormulario()
            break

        case 'adicionar':
            handleAdicionar()
            break   

        // -- Contas fixas --
        case 'abrirFormConta':
            document.getElementById('formConta').classList.toggle('hidden')
            break
        
        case 'cancelarConta':
            document.getElementById('formConta').classList.add('hidden')
            limparFormConta()
            break

        case 'confirmarConta':
            handleAdicionarConta()
            break
        
        case 'editarConta':
            handleEditarConta(id)
            break
        
        case 'togglePago':
            handleTogglePago(id)
            break
        
        // -- Parcelados --
        case 'abrirFormParcelado':
            document.getElementById('formParcelado').classList.toggle('hidden')
            break
        
        case 'cancelarParcelado':
            document.getElementById('formParcelado').classList.add('hidden')
            limparFormParcelado()
            break

        case 'confirmarParcelado':
            handleAdicionarParcelado()
            break

        // -- Remover item genérico --
        case 'remover':
            handleRemover(cat, id)
            break

        // -- Editar item do histórico --
        case 'editarItem':
            handleEditarItem(cat, id)
            break

        // -- Login --
        case 'login':
            handleLogin()
            break

        // -- Modal novo mês --
        case 'confirmarNovoMes':
            handleCriarMes()
            break

        case 'fecharModal':
            document.getElementById('modalNovoMes').classList.add('hidden')
            // Reseta o select para o mês atual
            document.getElementById('mesSelect').value = mesAtual
            break
    }
})

// -- Listener para as ABAS (data-aba, não data-acao) --
document.addEventListener('click', function(e) {
    const aba = e.target.closest('[data-aba]')
    if (!aba) return
    trocarAba(aba.dataset.aba)
})

// -- Listener para o SELECT de mês --
document.getElementById('mesSelect').addEventListener('change', function() {
    if (this.value === '__novo__') {
        this.value = mesAtual // volta para o mês atual visualmente
        abrirModalNovoMes()
        return
    }
    if (this.value) {
        mesAtual = this.value
        atualizarTudo()
        salvarDados()
    }
})

// -- Toggle do formulário flutuante --
function toggleFormulario(forcar) {
    const panel = document.getElementById('formPanel')
    const overlay = document.getElementById('overlay')
    const btnFlt = document.getElementById('btnFlutuante')
    const aberto = !panel.classList.contains('collapsed')

    const deveFechar = forcar === 'fechar' || aberto

    if (deveFechar) {
        panel.classList.add('collapsed')
        overlay.classList.add('hidden')
        btnFlt.classList.remove('ativo')
        limparFormPrincipal()
    } else {
        panel.classList.remove('collapsed')
        overlay.classList.remove('hidden')
        btnFlt.classList.add('ativo')
        document.getElementById('tipoSelect').focus()
    }
}

// Fecha o formulário ao clicar no overlay
document.getElementById('overlay').addEventListener('click', () => toggleFormulario('fechar'))

// Mostra/oculta campos extras de salário
document.getElementById('tipoSelect').addEventListener('change', function() {
    const extras = document.getElementById('salarioExtras')
    if (this.value === 'salario') {
        extras.classList.remove('hidden')
    } else {
        extras.classList.add('hidden')
    }
})

// Novo listener para aparecer/sumir campos salario
document.getElementById('salarioModo').addEventListener('change', function() {
    const campos = document.getElementById('camposCalculo');
    if (this.value === 'calculo') {
        campos.classList.remove('hidden');
    } else {
        campos.classList.add('hidden');
    }
});

// -- Limpar formulários --
function limparFormPrincipal() {
    document.getElementById('tipoSelect').value = ''
    document.getElementById('descricaoInput').value = ''
    document.getElementById('valorInput').value = ''
    document.getElementById('salarioExtras').classList.add('hidden')
}

function limparFormConta() {
    document.getElementById('contaDesc').value = ''
    document.getElementById('contaValor').value = ''
}

function limparFormParcelado() {
    document.getElementById('parceladoDesc').value = ''
    document.getElementById('parceladoValor').value = ''
    document.getElementById('parcelaAtual').value = ''
    document.getElementById('totalParcelas').value = ''
}

// -- Handler: adicionar lançamento principal --
function handleAdicionar() {
    if (!mesAtual) { alert('Selecione um mês primeiro!'); return }

    const tipo = document.getElementById('tipoSelect').value
    const desc = document.getElementById('descricaoInput').value.trim()
    const valor = Number(document.getElementById('valorInput').value) || 0

    if (!tipo) { alert('Selecione o tipo de lançamento!'); return }

    const hoje = new Date()
    const data = String(hoje.getDate()).padStart(2,'0') + '/' +
                 String(hoje.getMonth()+1).padStart(2,'0')

    const mes = dadosMeses[mesAtual]

    if (tipo === 'salario') {
        handleLancarSalario()
        return
    }

    if (!desc || valor <= 0) { alert('Preencha a descrição e um valor válido!'); return }
    
    if (tipo === 'rendaExtra') {
        mes.rendaExtra.push({ id: gerarId(), descricao: desc, valor, data })
    } else if (tipo === 'mercado') {
        mes.mercado.push({ id: gerarId(), descricao: desc, valor, data })
    } else if (tipo === 'refeicao') {
        mes.refeicoes.push({ id: gerarId(), descricao: desc, valor, data })
    } else if (tipo === 'cartao') {
        // Cartão à vista — totalParcelas = 1
        mes.cartao.push({
            id: gerarId(), descricao: desc,
            valorParcela: valor, valorTotal: valor,
            parcelaAtual: 1, totalParcelas: 1, dataCompra: data
        })
    } else if (tipo === 'outros') {
        mes.outros.push({ id: gerarId(), descricao: desc, valor, data })
    }

    toggleFormulario('fechar')
    atualizarTudo()
    salvarDados()
}

// —— Handler: lançar salário ——
function handleLancarSalario() {
    const modo  = document.getElementById('salarioModo').value
    const tipo  = document.getElementById('salarioTipo').value
    const valor = Number(document.getElementById('valorInput').value) || 0
    const s     = dadosMeses[mesAtual].salarios

    s.modo = modo

    if (tipo === 'realidade') {
        s.realidade = valor
    } else {
        // estimativa no modo simples
        if (modo === 'simples') {
            s.valorSimples = valor
        } else {
            // se for cálculo, salva os campos detalhados
            s.diasDiurnos =
            Number(document.getElementById('salDiasDiurnos').value) || 0;
            s.diasNoturnos =
            Number(document.getElementById('salDiasNoturnos').value) || 0;
            s.hesDiurnas =
            Number(document.getElementById('salHEDiurnas').value) || 0;
            s.hesNoturnas =
            Number(document.getElementById('salHENoturnas').value) || 0;
        }
        // no modo calculo, os campos são atualizados na tela de detalhes do salário
        // (não implementado no formulário rápido — usar aba futura se necessário)
    }

    toggleFormulario('fechar')
    atualizarTudo()
    salvarDados()
}

// —— Handler: remover item genérico ——
function handleRemover(categoria, id) {
    if (!mesAtual || !categoria || !id) return
    const mes = dadosMeses[mesAtual]

    if (categoria === 'contasFixas') {
        mes.contasFixas = mes.contasFixas.filter(i => i.id !== id)
    } else if (categoria === 'cartao') {
        mes.cartao = mes.cartao.filter(i => i.id !== id)
    } else if (categoria === 'mercado') {
        mes.mercado = mes.mercado.filter(i => i.id !== id)
    } else if (categoria === 'refeicoes') {
        mes.refeicoes = mes.refeicoes.filter(i => i.id !== id)
    } else if (categoria === 'outros') {
        mes.outros = mes.outros.filter(i => i.id !== id)
    } else if (categoria === 'rendaExtra') {
        mes.rendaExtra = mes.rendaExtra.filter(i => i.id !== id)
    }

    atualizarTudo()
    salvarDados()
}

// —— Handler: toggle pago/pendente ——
function handleTogglePago(id) {
    if (!mesAtual) return
    const item = dadosMeses[mesAtual].contasFixas.find(i => i.id === id)
    if (item) {
        item.pago = !item.pago
        atualizarListaContas()
        atualizarResumo()
        salvarDados()
    }
}

// —— Handler: adicionar conta fixa ——
function handleAdicionarConta() {
    if (!mesAtual) {
        alert('Selecione um mês primeiro!');
        return;
    }

    const desc = document.getElementById('contaDesc').value.trim();
    const valor = Number(document.getElementById('contaValor').value) || 0;

    if (!desc || valor <= 0) {
        alert('Preencha a descrição e um valor válido!');
        return;
    }

    // Adiciona o novo objeto no array de contas fixas do mês atual
    dadosMeses[mesAtual].contasFixas.push({
        id: gerarId(),
        descricao: desc,
        valor: valor,
        pago: false
    });

    // Esconde o formulário e limpa os campos
    document.getElementById('formConta').classList.add('hidden');
    document.getElementById('contaDesc').value = '';
    document.getElementById('contaValor').value = '';

    // Atualiza a tela para mostrar a nova conta e o novo saldo
    atualizarTudo();
    salvarDados();
}

function handleEditarConta(id) {
    if (!mesAtual) return
    const item = dadosMeses[mesAtual].contasFixas.find(i => i.id === id)
    if (!item) return

    const novoValor = prompt(`Editar valor de "${item.descricao}":`, item.valor)
    if (novoValor === null) return // cancelou

    const valor = Number(novoValor)
    if (valor <= 0 || isNaN(valor)) { alert('Valor inválido'); return }

    item.valor = valor
    atualizarListaContas()
    atualizarResumo()
    salvarDados()
}

// —— Handler: editar item do histórico ——
function handleEditarItem(categoria, id) {
    if (!mesAtual || !categoria) return
    const mes = dadosMeses[mesAtual]
    let item

    if (categoria === 'cartao') {
        item = mes.cartao.find(i => i.id === id)
        if (!item) return
        const novoValor = prompt(`Editar valor de "${item.descricao}":`, item.valorParcela)
        if (novoValor === null) return
        const v = Number(novoValor)
        if (v <= 0 || isNaN(v)) { alert('Valor inválido'); return }
        item.valorParcela = v
    } else {
        const arr = mes[categoria]
        item = arr ? arr.find(i => i.id === id) : null
        if (!item) return
        const novoValor = prompt(`Editar valor de "${item.descricao}":`, item.valor)
        if (novoValor === null) return
        const v = Number(novoValor)
        if (v <= 0 || isNaN(v)) { alert('Valor inválido'); return }
        item.valor = v
    }

    atualizarTudo()
    salvarDados()
}

// —— Handler: adicionar parcelado ——
function handleAdicionarParcelado() {
    if (!mesAtual) return
    const desc         = document.getElementById('parceladoDesc').value.trim()
    const valorParcela = Number(document.getElementById('parceladoValor').value) || 0
    const parcelaAt    = Number(document.getElementById('parcelaAtual').value) || 0
    const totalParcels = Number(document.getElementById('totalParcelas').value) || 0

    if (!desc || valorParcela <= 0) { alert('Preencha descrição e valor!'); return }
    if (parcelaAt < 1 || totalParcels < 2) { alert('Informe a parcela atual e o total!'); return }
    if (parcelaAt > totalParcels) { alert('Parcela atual não pode ser maior que o total!'); return }

    const hoje = new Date()
    const data = String(hoje.getDate()).padStart(2, '0') + '/' +
                 String(hoje.getMonth()+1).padStart(2,'0')
    
    dadosMeses[mesAtual].cartao.push({
        id: gerarId(),
        descricao: desc,
        valorParcela,
        valorTotal: valorParcela * totalParcels,
        parcelaAtual: parcelaAt,
        totalParcelas: totalParcels,
        dataCompra: data
    })

    document.getElementById('formParcelado').classList.add('hidden')
    limparFormParcelado()
    atualizarListaParcelados()
    atualizarResumo()
    salvarDados()
}

// —— Trocar aba ——
function trocarAba(novaAba) {
    abaAtiva = novaAba

    document.querySelectorAll('.aba').forEach(btn => {
        btn.classList.toggle('ativa', btn.dataset.aba === novaAba) 
    })

    document.querySelectorAll('.aba-conteudo').forEach(sec => {
        sec.classList.add('hidden')
    })

    document.getElementById('aba-' + novaAba).classList.remove('hidden')
}

// —— Abrir modal de novo mês ——
function abrirModalNovoMes() {
    const modal = document.getElementById('modalNovoMes')
    const selMes = document.getElementById('novoMesMes')
    const selAno = document.getElementById('novoMesAno')

    // Preenche options do mês
    selMes.innerHTML = NOMES_MESES.map((nome, i) => {
        const num = String(i+1).padStart(2,'0')
        return '<option value="' + num + '">' + nome + '</option>'
    }).join('')

    // Preenche options do ano (atual + 2)
    const anoAtual = new Date().getFullYear()
    selAno.innerHTML = [anoAtual, anoAtual+1, anoAtual+2].map(ano =>
        '<option value="' + ano + '">' + ano + '</option>'
    ).join('')

    document.getElementById('erroNovoMes').textContent = ''
    modal.classList.remove('hidden')
}

// —— Criar novo mês ——
function handleCriarMes() {
    const mes = document.getElementById('novoMesMes').value
    const ano = document.getElementById('novoMesAno').value
    const mesId = `${ano}-${mes}`

    if (dadosMeses[mesId]) {
        document.getElementById('erroNovoMes').textContent = 'Este mês já existe!'
        return
    }

    // Cria o mês vazio
    dadosMeses[mesId] = criarMesVazio()

    // Copia do mês anterior imediatamente (aqui, não na renderização)
    copiarDoMesAnterior(mesId)

    // Salva no backend
    mesAtual = mesId
    salvarDados()

    // Fecha o modal e atualiza
    document.getElementById('modalNovoMes').classList.add('hidden')
    atualizarSelectMeses()
    atualizarTudo()
}

// —— Cópia do mês anterior ——
function copiarDoMesAnterior(mesId) {
    const meses = Object.keys(dadosMeses).sort()
    const idx   = meses.indexOf(mesId)
    if (idx <= 0) return

    const mesAnteriorId = meses[idx - 1]
    const anterior = dadosMeses[mesAnteriorId]
    const novo     = dadosMeses[mesId]

    // Copia contas fixas (reseta pago)
    novo.contasFixas = anterior.contasFixas.map(item => ({
        ...item,
        id: gerarId(),
        pago: false
    }))

    // Copia salário (mantém configuração, zera realidade)
    novo.salarios = { ...anterior.salarios, realidade: 0 }

    // Copia parcelados que ainda não terminaram (incrementa parcela)
    const parceladosAtivos = anterior.cartao.filter(
        i => i.totalParcelas > 1 && i.parcelaAtual < i.totalParcelas
    )

    novo.cartao = parceladosAtivos.map(item => ({
        ...item,
        id: gerarId(),
        parcelaAtual: item.parcelaAtual +1
    }))
}

// —— Salvar dados no backend (com debounce) ——
let salvarTimer = null

function salvarDados() {
    if (!mesAtual) return

    // Debounce: espera 1.5s sem novas chamadas antes de salvar
    clearTimeout(salvarTimer)
    salvarTimer = setTimeout(async () => {
        try{
            await fetch(`${API}/meses/${mesAtual}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': getToken()
                },
                body: JSON.stringify({ dados: dadosMeses[mesAtual] })
            })
        } catch (err) {
            console.log('Erro ao salvar — backup no LocalStorage')
            localStorage.setItem('orcamento-backup', JSON.stringify(dadosMeses))
        }
    }, 1500)
}

// —— Carregar dados do backend ——
async function carregarDados() {
    try {
        const token = getToken()
        // Se não houver token, não tenta buscar no servidor para evitar o erro 401
        if (!token) return false

        const res = await fetch(`${API}/meses`, {
            headers: { 'authorization': token }
        })

        if (res.status === 401) return false

        const meses = await res.json()

        if (meses.length > 0) {
            meses.forEach(m => { dadosMeses[m.mesId] = m.dados })
        }

        return true
    } catch (err) {
        console.log('Servidor offline — carregando backup')
        const backup = localStorage.getItem('orcamento-backup')
        if (backup) dadosMeses = JSON.parse(backup)
        return true
    }
}

// —— Login ——
async function handleLogin() {
    const login = document.getElementById('loginInput').value.trim()
    const senha = document.getElementById('senhaInput').value
    const erro  = document.getElementById('erroLogin')
    const btn   = document.getElementById('btnLogin')

    if (!login || !senha) { erro.textContent = 'Preencha todos os campos'; return }

    // Feedback visual para iOS e servidores lentos
    btn.disabled = true
    btn.textContent = 'Entrando...'
    erro.textContent = 'Iniciando servidor (aguarde)...'

    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, senha })
        })
        
        // Verifica se a resposta é JSON antes de converter
        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Resposta inválida do servidor")
        }

        const data = await res.json()
        if (res.status === 401) { 
            erro.textContent = data.erro
            btn.disabled = false
            btn.textContent = 'Entrar'
            return 
        }

        localStorage.setItem('token', data.token)
        iniciarApp()
    } catch (err) {
        erro.textContent = 'Erro ao conectar ao servidor'
        btn.disabled = false
        btn.textContent = 'Entrar'
    }
}

// —— Inicialização ——
async function iniciarApp() {
    const autenticado = await carregarDados()

    if (!autenticado) {
        // Mostrar tela de login
        document.getElementById('telaLogin').style.display = 'flex'
        return
    }

    // Esconde tela de login, mostra app
    document.getElementById('telaLogin').style.display = 'none'
    document.getElementById('main').classList.remove('hidden')
    const btnFlt = document.getElementById('btnFlutuante')
    if (btnFlt) btnFlt.style.display = 'flex'

    atualizarSelectMeses()

    // Seleciona o mês mais recente automaticamente
    const meses = Object.keys(dadosMeses).sort()
    if (meses.length > 0) {
        mesAtual = meses[meses.length - 1]
        document.getElementById('mesSelect').value = mesAtual
        atualizarTudo()
    }
}

// —— Inicia o app ——
iniciarApp()