# Instruções do Codex

Este arquivo define as regras permanentes para qualquer agente que trabalhe neste repositório.

## Objetivo do projeto

Construir e evoluir uma plataforma SaaS B2B de inovação, conectando inventores, ICTs/universidades, empresas e investidores. O sistema pode utilizar inteligência artificial para análise de projetos, matchmaking, relatórios estratégicos e apoio à transferência de tecnologia.

As decisões técnicas devem manter o produto preparado para crescimento, multi-tenancy, segurança, observabilidade e futura hospedagem em serviços de nuvem, especialmente AWS, sem criar acoplamento desnecessário a um provedor.

## Regras de trabalho

- Leia o repositório, a documentação e o histórico do Git antes de propor ou executar mudanças relevantes.
- Preserve alterações existentes feitas pelo usuário ou por outros agentes. Nunca use comandos destrutivos para apagar ou reverter trabalho sem autorização explícita.
- Prefira soluções simples, testáveis e compatíveis com os padrões já adotados no projeto.
- Não faça apenas um plano quando a solicitação pedir implementação: execute a mudança, valide-a e documente o resultado.
- Faça alterações pequenas e coerentes, mantendo o sistema executável ao final de cada etapa.
- Não invente requisitos de negócio. Quando uma decisão mudar significativamente escopo, custo, segurança ou arquitetura, registre a suposição e peça confirmação.
- Não crie recursos pagos, faça deploy em produção ou altere ambientes externos sem autorização explícita.

## Arquitetura

- Mantenha frontend, backend, domínio, infraestrutura e código compartilhado com responsabilidades claras.
- Coloque regras de negócio no backend ou em módulos de domínio; nunca confie no frontend para autorização.
- Versione APIs públicas e padronize respostas, erros, paginação e validação de entrada.
- Isole integrações externas atrás de interfaces ou adaptadores.
- Prefira TypeScript e tipagem forte sempre que a stack permitir.
- Evite complexidade prematura e abstrações sem uso real.
- Ao escolher serviços de nuvem, considere custo, operação, escalabilidade, segurança, portabilidade e facilidade de recuperação.
- Use variáveis de ambiente e arquivos de exemplo. Segredos nunca devem entrar no Git, logs, commits ou respostas do agente.

## Segurança e dados

- Valide e sanitize dados em todas as entradas externas.
- Aplique autenticação e autorização no backend, considerando organização, tenant, papel e recurso.
- Preserve isolamento entre organizações e usuários em todas as consultas e mutações.
- Proteja dados sensíveis, documentos jurídicos, informações de PI, credenciais e dados de pagamento.
- Configure CORS, cookies, headers, rate limiting e políticas de acesso de acordo com o ambiente.
- Não exponha stack traces, tokens, chaves ou informações pessoais em mensagens de erro.
- Considere LGPD, retenção de dados, auditoria e rastreabilidade nas decisões que envolvam dados pessoais.

## Frontend

- Priorize fluxos reais do produto, estados de carregamento, erro, vazio e sucesso.
- Mantenha responsividade, acessibilidade, consistência visual e boa experiência em telas densas de operação.
- Não replique regras de autorização apenas na interface.
- Evite dados mockados permanentes. Quando um mock for necessário, deixe clara a interface de substituição e documente a limitação.

## Qualidade

Antes de concluir uma tarefa, execute as validações disponíveis e corrija falhas introduzidas pela mudança:

- lint e formatação;
- verificação de tipos;
- testes unitários e de integração relevantes;
- build do frontend e backend;
- validação dos fluxos críticos, quando possível.

Para novas regras de negócio, endpoints, autenticação ou integrações, adicione testes proporcionais ao risco. Não suprima erros de lint ou TypeScript sem justificativa registrada.

## Distribuição entre modelos

Quando a skill de roteamento/distribuição de modelos estiver disponível, utilize-a em tarefas extensas ou com frentes independentes:

- use modelos mais leves para inspeção, inventário de arquivos, tarefas mecânicas e execução delimitada;
- reserve o modelo mais capaz para arquitetura, decisões críticas, segurança, revisão de contratos e integração final;
- forneça contexto, escopo, arquivos permitidos, critérios de aceite e comandos de validação para cada frente;
- não delegue decisões críticas sem revisão do agente responsável pela tarefa principal;
- consolide as alterações, resolva conflitos e execute a validação final no repositório principal.

Para tarefas pequenas, mantenha a execução direta e evite delegação desnecessária.

## Git e documentação

- Use commits pequenos e descritivos quando commits forem solicitados ou fizerem parte do fluxo definido.
- Verifique `git status` e os arquivos alterados antes de cada commit.
- Não inclua arquivos `.env`, chaves, credenciais, dumps ou artefatos temporários.
- Atualize README e documentação de arquitetura, desenvolvimento, API, deploy e decisões quando a mudança afetar esses assuntos.
- Registre limitações, decisões pendentes e próximos passos em documentação apropriada.

## Comunicação do agente

Ao iniciar uma tarefa relevante, informe brevemente o que será analisado e quais premissas estão sendo usadas. Ao finalizar, informe:

- o que foi implementado;
- arquivos principais alterados;
- comandos de validação executados e seus resultados;
- limitações ou pendências reais;
- próximo passo recomendado, quando houver.

Se um comando falhar por causa do ambiente, diferencie isso de uma falha do código e informe claramente a causa.
