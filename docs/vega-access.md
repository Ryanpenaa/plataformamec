# Acesso de alunos integrado à Vega

## Estado de segurança

- O novo receptor é `POST /api/public/vega-access`.
- O processamento permanece desativado por padrão em duas camadas: a variável de servidor `VEGA_ACCESS_ENABLED` e a configuração privada `vega_access` no banco.
- `test_mode: true` é aceito somente como teste de recepção e nunca cria cliente, compra ou permissão.
- O receptor `vega-test` continua independente e serve apenas para captura; seus eventos não comprovam pagamento.
- O segredo existente é lido somente no servidor e não deve aparecer no frontend, código, documentação ou logs.
- A assinatura oficial da Vega ainda não foi confirmada. Até a documentação oficial ser validada, o segredo compartilhado é uma proteção provisória e a ativação real deve permanecer desligada.

## Regras de acesso

- `3MKJ1N`, em qualquer preço, concede mecânica automotiva e apostilas.
- `3MNO78` concede automotiva, apostilas, imprimíveis e ar-condicionado.
- `3MNO79` concede automotiva, apostilas, imprimíveis e elétrica.
- `3MNO7B` concede automotiva, apostilas, imprimíveis e motos.
- `3MOP51` concede automotiva, apostilas, imprimíveis e som. Materiais específicos de som dependem desta permissão.
- Produtos desconhecidos não concedem acesso. O total da venda e os links de oferta não são usados para inferir produtos.
- Pendentes e recusados não concedem acesso. Reembolso ou chargeback revoga somente as permissões da transação afetada.

## Conta do aluno

- Cadastro solicita nome, email e senha, mas não concede cursos.
- O aluno precisa confirmar o email e usar o mesmo endereço da compra para vincular sua conta.
- Cada aluno lê somente o próprio perfil, compras, itens e permissões; não pode alterá-los.
- Recuperação e primeiro acesso usam link por email.
- Materiais sem arquivo enviado aparecem como indisponíveis, sem links fictícios.
- A liberação visual de desenvolvimento é identificada como prévia e não existe em produção.

## Antes de ativar

1. Aplicar e validar a migração privada do acesso de alunos.
2. Ativar autenticação por email com confirmação obrigatória.
3. Executar os testes de banco para duplicidade, ordem de eventos, revogação entre compras e isolamento entre alunos.
4. Confirmar com a Vega o formato oficial da assinatura e os campos reais enviados nas versões v1 e v2.
5. Configurar o endereço do receptor na Vega somente após a revisão, sem alterar os produtos ou URLs de entrega existentes.
6. Ativar primeiro a configuração privada do banco e depois `VEGA_ACCESS_ENABLED=true` no ambiente aprovado.

O frontend não deve ser publicado automaticamente durante esta preparação.