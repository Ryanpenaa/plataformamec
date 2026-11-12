# Teste de dados de comprador Vega + AppMax (sem login)

Branch de preparação isolada. Nada foi publicado em produção nem conectado ao fluxo de acesso dos alunos.

## O que já existe
- O repositório tem captura Vega de teste em supabase/functions/vega-test, receptor de acesso Vega desativado em src/routes/api/public/vega-access.ts, e base de perfis/compras/permissões planejada.
- Supabase configurado neste repositório: mlkzvjieyhguxwewqktb (Lovable Cloud). Não é o Supabase de rastreamento.
- O Supabase mecanico-tracking já possui Vega e AppMax ativos. A caixa de entrada AppMax guarda eventos com data.customer.fullname, data.customer.email, data.id e data.products.
- Auditoria agregada em 12/11/2026: 654 eventos AppMax; os 654 contêm nome e e-mail; 636 eventos OrderPaid ou OrderApproved também contêm ambos.
- O tracking da Vega persiste hash de e-mail, não nome; ainda é necessário verificar o nome enviado pela Vega em evento real.

## Teste isolado
- src/lib/purchase-probe.ts: normaliza o recebimento lógico de nome, email, transação, status e produtos. Não persiste, não cria aluno, não libera cursos e não efetua autenticação real da compra.
- src/lib/purchase-probe.test.ts: amostras fictícias das formas Vega v1/v2 e AppMax, pendência, reembolso e falta de campos.
- Para executar: node --experimental-strip-types --test src/lib/purchase-probe.test.ts (Node 22+).

## Para testar com webhooks reais depois
1. Verificar no painel do Lovable Cloud se a função de captura de Vega está publicada e o banco/tabela de teste existem.
2. Validar assinatura/autenticidade dos webhooks antes de confiar no pagamento.
3. Em homologação, encaminhar dados mínimos dos compradores (nome, email, transação, produto, status) a uma tabela privada com RLS e segredo apenas no servidor.
4. Confirmar notificações duplicadas, reembolso, nome completo, email e vinculação correta por identificador de transação.
5. Somente após testes de verdade decidir por acesso individual e regras de liberação de todos os cursos, sem ativar login nesta fase.

## Restrições
- Não usar este módulo para conceder cursos: completeApprovedEvent apenas indica campos preenchidos e um status declarado no payload, não comprova autenticidade.
- Não colocar payloads de compradores em commits, logs públicos, links com segredo ou prints.
- Não criar contas Supabase Auth nem enviar emails de primeiro acesso na fase de teste.
- A implementação de captura live no Lovable Cloud não está concluída neste branch, pois o banco Lovable Cloud não está acessível no conector Supabase atualmente vinculado.