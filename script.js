let estoque = JSON.parse(localStorage.getItem("ci_estoque")) || [];
let pratos = JSON.parse(localStorage.getItem("ci_pratos")) || [];
let chart = null;

function atualizarTudo() {
    document.getElementById("dataAtual").innerText = new Date().toLocaleDateString();
    show('dash');
    renderEstoque();
    renderReceitas();
    renderDash();
}

function login() {
    const msg = document.getElementById("loginMsg");
    const user = document.getElementById("user");
    const pass = document.getElementById("pass");

    if (user.value === "admin" && pass.value === "1234") {
        document.getElementById("loginTela").style.display = "none";
        atualizarTudo();
    } else {
        msg.innerText = "Usuário ou senha incorretos!";
    }
}

        function show(id) {
            ['dash','estoque','receitas'].forEach(s => {
                document.getElementById(s).style.display = s===id?'block':'none';
                document.getElementById('nav-'+s).classList.toggle('active', s===id);
            });
            if(id==='dash') renderDash();
            if(id==='estoque') renderEstoque();
            if(id==='receitas') renderReceitas();
        }

        function addInsumo() {
    const nome = document.getElementById('in_nome').value.trim();
    const cat = document.getElementById('in_cat').value;
    const un = document.getElementById('in_un').value.trim();
    const qtd = Number(document.getElementById('in_qtd').value);
    const min = Number(document.getElementById('in_min').value);
    const custo = Number(document.getElementById('in_custo').value);

    if (!nome || !cat || !un || !qtd || !min || !custo) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    const i = { id: Date.now(), nome, cat, un, qtd, min, custo };
    estoque.push(i);
    salvar();
    renderEstoque();
    renderDash();

    document.getElementById('in_nome').value = '';
    document.getElementById('in_cat').value = '';
    document.getElementById('in_un').value = '';
    document.getElementById('in_qtd').value = '';
    document.getElementById('in_min').value = '';
    document.getElementById('in_custo').value = '';
}

        function renderEstoque() {
            const out = document.getElementById("listaEstoque");
            out.innerHTML = "";
            estoque.forEach((item, idx) => {
                const status = item.qtd <= item.min ? "bg-low" : "bg-ok";
                out.innerHTML += `
                    <tr>
                        <td><b>${item.nome}</b></td>
                        <td>${item.cat}</td>
                        <td>${item.qtd} ${item.un} 
                            <button onclick="movimentar(${idx},1)">+</button>
                            <button onclick="movimentar(${idx},-1)">-</button>
                        </td>
                        <td>R$ ${item.custo.toFixed(2)}</td>
                        <td><span class="badge ${status}">${item.qtd <= item.min ? 'REPOR' : 'OK'}</span></td>
                        <td><button onclick="remover(${idx})" style="border:none;background:none;color:var(--secondary);cursor:pointer"><i class="fas fa-trash"></i></button></td>
                    </tr>`;
            });
        }

        function renderReceitas() {
            const out = document.getElementById("listaPratos");
            out.innerHTML = "";
            pratos.forEach((p, idx) => {
                const margem = p.venda ? ((p.venda-p.custo)/p.venda*100).toFixed(0) : 0;
                out.innerHTML += `
                    <tr>
                        <td><b>${p.nome}</b></td>
                        <td>R$ ${p.custo.toFixed(2)}</td>
                        <td>R$ ${p.venda.toFixed(2)}</td>
                        <td><span class="badge bg-ok">${margem}%</span></td>
                        <td><button class="badge bg-low" style="border:none;cursor:pointer" onclick="removerPrato(${idx})">Remover</button></td>
                    </tr>`;
            });
        }

        function renderDash() {
            let valorTotal = estoque.reduce((acc,i)=>acc+(i.qtd*i.custo),0);
            let baixo = estoque.filter(i=>i.qtd<=i.min).length;
            document.getElementById("st-total").innerText = estoque.length;
            document.getElementById("st-valor").innerText = "R$ " + valorTotal.toFixed(2);
            document.getElementById("st-baixo").innerText = baixo;
            document.getElementById("st-pratos").innerText = pratos.length;
            initChart();
        }

        function initChart() {
            const ctx = document.getElementById('chartGeral').getContext('2d');
            if(chart) chart.destroy();
            let cats = {};
            estoque.forEach(i => cats[i.cat] = (cats[i.cat]||0) + (i.qtd*i.custo));
            chart = new Chart(ctx, {
                type: 'bar',
                data: { labels: Object.keys(cats), datasets:[{ label:'Valor por Categoria (R$)', data:Object.values(cats), backgroundColor:['#008c45','#cd212a','#d4a373','#1a1a1a'] }]},
                options: { maintainAspectRatio: false }
            });
        }

        function salvar() {
            localStorage.setItem("ci_estoque", JSON.stringify(estoque));
            localStorage.setItem("ci_pratos", JSON.stringify(pratos));
        }

        function remover(i){ estoque.splice(i,1); salvar(); renderEstoque(); renderDash(); }
        function removerPrato(i){ pratos.splice(i,1); salvar(); renderReceitas(); renderDash(); }

        function salvarPrato() {
    const nome = document.getElementById('p_nome').value.trim();
    const venda = Number(document.getElementById('p_venda').value);

    if (!nome || !venda || venda <= 0) {
        alert('Informe nome do prato e preço de venda válido.');
        return;
    }

    const custo = estoque.reduce((acc, i) => acc + (i.qtd * i.custo), 0);
    pratos.push({ nome, venda, custo });
    salvar();
    renderReceitas();
    renderDash();

    document.getElementById('p_nome').value = '';
    document.getElementById('p_venda').value = '';
}

        function movimentar(idx,tipo){
            const q = Number(prompt("Quantidade:"));
            if(!q) return;
            estoque[idx].qtd += tipo*q;
            if(estoque[idx].qtd<0) estoque[idx].qtd=0;
            salvar(); renderEstoque(); renderDash();
        }

        function backup(){
            const data = JSON.stringify({estoque,pratos});
            const blob = new Blob([data],{type:'application/json'});
            const url = URL.createObjectURL(blob);
            const a=document.createElement('a');
            a.href=url; a.download='CasaItalia_Dados.json'; a.click();
        }

        document.getElementById("dataAtual").innerText = new Date().toLocaleDateString();
