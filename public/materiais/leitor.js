
(function(){
const qs=new URLSearchParams(location.search),id=qs.get("material")||"";
const $=s=>document.querySelector(s);
const e=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const bullets=a=>"<ul>"+(a||[]).map(s=>"<li>"+e(s)+"</li>").join("")+"</ul>";
const steps=a=>'<ol class="steps">'+(a||[]).map(s=>"<li>"+e(s)+"</li>").join("")+"</ol>";
const table=(heads,rows)=>'<div class="table-scroll"><table class="sheet"><thead><tr>'+heads.map(s=>"<th>"+e(s)+"</th>").join("")+"</tr></thead><tbody>"+(rows||[]).map(r=>"<tr>"+r.map(s=>"<td>"+e(s)+"</td>").join("")+"</tr>").join("")+"</tbody></table></div>";
const flow=a=>'<div class="flow">'+a.map((s,i)=>"<b>"+e(s)+"</b>"+(i<a.length-1?"<span>→</span>":"")).join("")+"</div>";
const box=(label,txt,warn)=>'<div class="info'+(warn?" warning":"")+'"><strong>'+e(label)+'</strong><p>'+e(txt)+'</p></div>';
function render(d){
 document.title=d.title+" | Formação Mecânico Automotivo";
 const chapters=d.chapters||[];
 let html='<section class="cover"><div class="overline">FORMAÇÃO MECÂNICO AUTOMOTIVO · '+e(d.group)+'</div><h1>'+e(d.title)+'</h1><p>'+e(d.subtitle)+'</p><div class="cover-foot">MATERIAL DIDÁTICO · PORTUGUÊS · FORMATO A4<br>TEORIA • CONSULTA • EXEMPLOS • EXERCÍCIOS</div></section>';
 html+='<section class="page" id="intro"><span class="tag">ORIENTAÇÃO DE ESTUDO</span><h2>Introdução e objetivos</h2><p class="lead">'+e(d.intro)+'</p><h3>Ao final, você deverá conseguir</h3>'+bullets(d.goals)+'<h3>Como utilizar esta apostila</h3>'+steps(["Leia o capítulo e assista às aulas correspondentes da plataforma.","Observe os sistemas no veículo, em bancada de treinamento ou em diagramas.","Registre hipóteses e medições na ficha ao final, citando a fonte das especificações.","Repita os testes de forma segura e confira o resultado antes de concluir."])+box("Importante",d.safety,true)+'</section>';
 chapters.forEach((c,i)=>{
  html+='<section class="page" id="cap'+i+'"><span class="tag">CAPÍTULO '+String(i+1).padStart(2,"0")+'</span><h2>'+e(c.title)+'</h2><p class="lead">'+e(c.lead)+'</p><div class="rule"></div><h3>Fundamentos explicados</h3>'+(c.text||[]).map(p=>"<p>"+e(p)+"</p>").join("");
  if(c.flow)html+='<h3>Fluxo do sistema</h3>'+flow(c.flow);
  if(c.table)html+='<h3>Quadro de consulta</h3>'+table(c.columns||["Componente","Função","Diagnóstico"],c.table);
  if(c.steps)html+='<h3>Roteiro de inspeção ou raciocínio</h3>'+steps(c.steps);
  if(c.tip)html+=box("Dica de oficina",c.tip,false);
  if(c.warning)html+=box("Segurança e limites",c.warning,true);
  if(c.case)html+='<div class="scenario"><b>CASO PRÁTICO</b><p>'+e(c.case)+'</p><p><strong>Desafio:</strong> '+e(c.task||"Quais testes você faria antes de autorizar a troca de peças?")+'</p></div>';
  html+='</section>';
 });
 html+='<section class="page" id="atividade"><span class="tag">EXERCÍCIO DE OFICINA</span><h2>Ficha de acompanhamento</h2><p>Preencha com dados reais ou simulação identificada como exercício. A ficha ajuda a documentar diagnóstico, orçamento e aprendizagem.</p>'+table(["Campo","Anotação"],[["Veículo, ano, versão","______________________________________"],["Código do motor / combustível","______________________________________"],["Quilometragem / uso","______________________________________"],["Sintoma e condições","______________________________________"],["Códigos e dados medidos","______________________________________"],["Fonte das especificações","______________________________________"],["Hipóteses testadas","______________________________________"],["Causa confirmada","______________________________________"],["Serviço e verificação final","______________________________________"]])+'<h3>Checklist de estudo</h3><div class="checklist">'+(d.checklist||[]).map(a=>"<label>"+e(a)+"</label>").join("")+'</div><h3>Observações do aluno</h3>'+Array(5).fill('<div class="line"></div>').join("")+'</section>';
 html+='<section class="page" id="revisao"><span class="tag">ENCERRAMENTO</span><h2>Revisão final e glossário</h2><h3>Questões de fixação</h3><ol>'+(d.questions||[]).map(x=>"<li>"+e(x)+"</li>").join("")+'</ol><h3>Vocabulário técnico</h3>'+table(["Termo","Significado"],d.glossary||[])+box("Fontes para confirmar procedimentos","Manual do fabricante por VIN/versão e motor; plano de manutenção; boletins técnicos; normas e fichas técnicas de instrumentos. Não utilize especificações genéricas como se fossem universais.",true)+'<p class="fine">Material didático de apoio. A execução de reparos depende de qualificação, equipamentos e documentação específicos. Formação Mecânico Automotivo.</p></section>';
 $("#book").innerHTML=html;
 $("#nav").innerHTML='<strong>ÍNDICE</strong><a href="#intro">Introdução</a>'+chapters.map((c,i)=>'<a href="#cap'+i+'">'+(i+1)+'. '+e(c.title)+'</a>').join("")+'<a href="#atividade">Ficha prática</a><a href="#revisao">Revisão e glossário</a><small>Material técnico para consulta e impressão.</small>';
}
if(!/^material-(0[1-9]|1[0-4])$/.test(id)){$("#book").innerHTML="<div class='page'><h2>Material não encontrado</h2></div>";return;}
fetch("./dados/"+id+".json").then(r=>{if(!r.ok)throw Error("not found");return r.json()}).then(render).catch(()=>{$("#book").innerHTML="<div class='page'><h2>Não foi possível carregar o material</h2><p>Reabra pelo menu de Material de apoio do curso.</p></div>"});
$("#print").addEventListener("click",()=>print());
})();
