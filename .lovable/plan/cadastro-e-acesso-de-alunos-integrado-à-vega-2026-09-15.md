# Cadastro e acesso de alunos integrado à Vega

## Objetivo
Criar login e cadastro com confirmação de email, vincular compras válidas da Vega aos alunos e liberar somente os cursos e materiais correspondentes, sem alterar o conteúdo visual, os produtos ou a configuração atual da Vega. O novo processamento ficará desativado por padrão e o receptor `vega-test` continuará exclusivamente como captura de testes.

## Acesso do aluno
- Criar página pública de autenticação com entrar, cadastrar nome/email/senha, solicitar primeiro acesso/recuperação e definir nova senha.
- Exigir confirmação do email. Cadastro ou login sem compra válida não concede qualquer curso.
- Proteger a área atual atrás do login e adicionar saída segura, limpando dados privados em memória antes de voltar à autenticação.
- Trocar o simulador de compra pelo acesso real. A simulação ficará disponível somente em ambiente de desenvolvimento, marcada explicitamente como prévia.
- Consultar permissões no servidor e também aplicar regras no banco; aulas de cursos bloqueados não serão entregues ao navegador.
- Manter materiais sem arquivo como “indisponíveis”, sem criar links fictícios.

## Banco e segurança
- Criar tabelas privadas para perfis (nome e email normalizado), clientes Vega, compras, itens e permissões originadas por compra.
- Aplicar permissões mínimas e RLS: cada aluno lê somente seu perfil, suas compras resumidas e suas permissões; nenhum aluno cria ou altera compras/permissões.
- Vincular automaticamente um perfil confirmado a compras do mesmo email normalizado, sem conceder acesso a email não confirmado.
- Garantir unicidade de transação, histórico de eventos e processamento atômico no banco.
- Fazer eventos repetidos serem idempotentes e ignorar eventos antigos que tentem desfazer um estado mais recente.
- Em estorno/chargeback, revogar apenas as permissões daquela compra; direitos equivalentes de outra compra aprovada permanecem.

## Regras Vega
- Validar o formato v2 (`transaction_token`, `status`, `customer`, `products`) e a compatibilidade documentada v1 (`plans`), deduplicando o mesmo produto entre ambos.
- `3MKJ1N`, em qualquer valor (incluindo 10, 18,90 e 27,90), concede `auto` e `apostilas`.
- Bumps: `3MNO78=ar`, `3MNO79=eletrica`, `3MNO7B=motos`, `3MOP51=som`. Cada bump concede `auto`, `apostilas`, `imprimíveis` e somente seu curso extra.
- PDFs específicos de som exigem a permissão `som`.
- Pendente, recusado e produto desconhecido não concedem acesso. `test_mode: true` nunca cria cliente real, compra real ou permissão.
- Não inferir acesso por preço e não contar um produto duas vezes.

## Processamento e ativação
- Criar um novo endpoint de servidor separado e protegido pelo segredo já existente; o endpoint de captura não será usado como prova de pagamento.
- Validar corpo, tamanho, segredo e dados antes de qualquer gravação; não registrar segredo ou dados sensíveis em logs.
- Manter uma chave de ativação desabilitada por padrão. Enquanto desabilitado, o endpoint valida e responde em modo inativo sem gravar clientes ou conceder acesso.
- Documentar que a assinatura oficial da Vega ainda não foi confirmada e que a troca/configuração do webhook na Vega permanece pendente de revisão; nada será alterado na Vega agora.

## Testes e verificação
- Testar códigos conhecidos/desconhecidos, preços do produto principal, cada bump e combinações.
- Testar `test_mode`, ausência de autenticação/segredo, eventos duplicados, evento antigo após reembolso e payloads v1/v2 sobrepostos.
- Testar reembolso entre duas compras do mesmo aluno e isolamento entre dois alunos.
- Testar cadastro, confirmação pendente, login, recuperação, saída e proteção da área do aluno.
- Verificar interface em desktop e celular e executar os testes e verificações de código disponíveis.

## Entregáveis e pendências explícitas
- Código, migração versionada, testes e documentação operacional no projeto.
- Aplicar a migração no Lovable Cloud quando o serviço sair da manutenção e a aprovação estiver disponível.
- Não publicar o frontend automaticamente.
- Manter como pendências reais: confirmar a assinatura oficial da Vega, revisar/ativar o novo processamento, configurar o endpoint na Vega e enviar os arquivos dos materiais antes de habilitar downloads.
