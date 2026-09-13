# Receptor de teste da Vega

Estado: código preparado; precisa de banco e publicação para ter URL funcional.

Recebe um objeto JSON e guarda o conteúdo em `vega_test_events`, com data e ID próprios. Não cria contas, envia mensagens ou libera cursos. Mantém notificações repetidas para comparar o comportamento da Vega. Não valida assinatura oficial da Vega: o segredo serve apenas como proteção temporária do receptor.

## Ativação pelo administrador no Lovable Cloud / Supabase

1. Confirmar qual backend está ligado ao projeto. Aplicar a migração SQL deste diretório no banco desse projeto.
2. Criar um segredo aleatório de pelo menos 32 caracteres no gerenciador de segredos, chamado `VEGA_TEST_SECRET`. Não colocar seu valor no GitHub, frontend ou chat.
3. Publicar a função `vega-test` com a configuração fornecida. As variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` devem existir somente no servidor.
4. Usar a URL real gerada pelo provedor, acrescentando `?key=VALOR_DO_SEGREDO` no campo de webhook da Vega. Se ela permitir cabeçalhos personalizados, preferir `x-vega-test-secret` e remover o parâmetro da URL. Tratar a URL com segredo como credencial e não compartilhá-la.
5. Enviar primeiro uma notificação fictícia. A resposta de sucesso é HTTP 200 com `received: true`. Confirmar o registro no banco; a função retorna 503 se o armazenamento falhar.
6. Fazer teste de compra com dados fictícios: básico, completo e básico com bump. Comparar `products`/`plans`, códigos, status e identificador de transação. Testar também mudança de pendente para aprovado.

Consultar os registros somente pelo painel administrativo do banco:

```sql
select id, received_at, payload
from public.vega_test_events
order by received_at desc
limit 20;
```

Sem painel público ou download dos dados no site. Não copiar dados pessoais de compradores para issues ou commits. Após análise, desativar o webhook de teste, remover a função e eliminar os registros de teste pelo painel com confirmação do administrador. Não usar esta caixa temporária como histórico permanente de vendas.

Antes de produção: confirmar autenticação oficial dos avisos, mapear produtos/ofertas, tratar repetição e ordem dos eventos e implantar regras de acesso/reembolso. Compras anteriores precisam de importação ou reenvio confirmado pela Vega.
