---
title: Especificacao Funcional do MVP Sandicts
doc-type: product-functional-spec
role: working-draft
priority: high
canonical: docs/ai/product/sandicts-mvp-functional-spec.md
related:
  - docs/ai/product/sandicts-mvp-scope.md
  - docs/ai/product/sandicts-product-context.md
  - docs/ai/business/sandicts-business-rules.md
  - docs/frontend/sandicts-frontend-tech-decisions.md
  - docs/frontend/sandicts-mvp-delivery-roadmap.md
  - docs/frontend/sandicts-frontend-planning.md
  - docs/frontend/discovery/sandicts-mvp-frontend-roadmap-draft.md
scope: product, mvp, frontend, backend, figma, jira, api-contracts
read-when:
  - definir fluxos de usuario do MVP Sandicts
  - criar telas do MVP no Figma
  - criar issues de roadmap no Jira para modulos do MVP
  - desenhar contratos de API para modulos do MVP
  - planejar fatias verticais de backend e frontend
do-not-read-when:
  - implementar refatoracao tecnica somente de backend
  - alterar apenas CI, logger ou infraestrutura de baixo nivel
---

# Especificacao Funcional do MVP Sandicts

## Proposito

Este documento e a especificacao funcional de trabalho para o MVP do Sandicts.

Use este documento como ponte entre:

- escopo de produto
- regras de negocio
- telas no Figma
- roadmap no Jira
- contratos de API do backend
- implementacao do frontend
- validacao integrada

Este documento e mais detalhado do que
`docs/ai/product/sandicts-mvp-scope.md`, mas ainda e um rascunho de trabalho.
Quando uma regra nao estiver decidida, mantenha como decisao aberta em vez de
transformar uma suposicao em regra de produto.

## Ordem Das Fontes De Verdade

Quando houver conflito entre documentos, preferir:

1. `docs/ai/product/sandicts-mvp-scope.md`
2. `docs/ai/business/sandicts-business-rules.md`
3. este documento
4. drafts de descoberta do frontend
5. comportamento legado do `sports-rats-web`

O frontend legado serve como inspiracao. Ele nao e fonte de verdade de produto.

## Objetivo Do MVP

O MVP deve provar que o Sandicts funciona como marketplace e comunidade leve
para esportes de areia.

O MVP deve provar que:

- jogadores conseguem acessar o Sandicts com baixo atrito
- jogadores conseguem completar um perfil esportivo basico
- parceiros conseguem se cadastrar e expor quadras
- parceiros conseguem publicar disponibilidade
- jogadores conseguem descobrir quadras disponiveis
- jogadores conseguem solicitar reservas
- parceiros conseguem confirmar e gerenciar reservas
- status de pagamento manual consegue ser acompanhado
- jogadores conseguem criar e entrar em partidas abertas

O MVP nao deve tentar provar:

- progressao completa de jogador
- paginas publicas de atleta
- torneios
- integracao com gateway de pagamento
- geolocalizacao e busca por proximidade
- ERP completo para escolas/arenas
- rede social
- comportamento Web3/token

## Modelo De Entrega

Construir o MVP em fatias verticais.

Cada fatia deve definir:

- comportamento de produto
- entidades e regras de backend
- rascunho de contrato de API
- telas e estados do frontend
- necessidades para Figma
- issues do Jira
- gate de integracao

O backend pode andar uma fatia na frente, mas nenhum modulo importante deve ser
considerado completo de produto antes do fluxo de frontend validar o formato da
API.

## Ordem Recomendada Dos Modulos

1. Autenticacao e acesso a conta
2. Fundacao do app frontend
3. Perfil do jogador
4. Onboarding de parceiro
5. Gestao de quadras
6. Calendario de disponibilidade
7. Descoberta de quadras
8. Reservas
9. Pagamentos manuais
10. Partidas abertas
11. Preparacao para lancamento

## Tipos De Usuario

### Visitante

Visitante e uma pessoa nao autenticada.

Visitantes podem:

- acessar a tela de entrada
- usar Google Sign-In ou Google One Tap
- talvez navegar em uma descoberta publica, se o produto aprovar

Visitantes nao podem:

- reservar quadras
- entrar em partidas abertas
- criar partidas abertas
- acessar ferramentas de parceiro
- atualizar perfis

Decisao aberta:

- se a descoberta publica de quadras existe antes do login.

### Jogador

Jogador e um usuario autenticado que pode reservar quadras e participar da
comunidade.

Jogadores podem:

- entrar e sair da conta
- completar um perfil basico
- escolher esporte principal
- informar nivel simples por esporte
- descobrir quadras
- solicitar reservas
- ver historico de reservas
- criar partidas abertas
- entrar e sair de partidas abertas

Jogadores nao podem no MVP:

- gerenciar atributos detalhados de progressao
- publicar pagina publica de jogador
- receber conquistas/rankings
- usar fluxos de carteira/Web3
- criar torneios de parceiros

### Parceiro

Parceiro e uma arena, clube, escola, operador de quadras ou organizador.

Parceiros podem:

- completar perfil de parceiro
- criar e gerenciar quadras
- ativar e desativar quadras
- definir esportes suportados
- definir precos e regras necessarias para reserva
- publicar horarios disponiveis
- ver agenda por dia ou semana
- ver detalhes de reservas
- confirmar ou cancelar reservas
- atualizar status de pagamento manualmente

Parceiros nao podem no MVP:

- gerenciar alunos e mensalidades
- gerenciar professores/aulas
- usar relatorios financeiros avancados
- criar torneios
- criar partidas abertas oficiais do parceiro

### Admin

Admin nao e uma area padrao do MVP.

Admin deve ser introduzido somente se houver um fluxo operacional real que
precise de revisao manual, suporte ou moderacao controlada.

Decisao aberta:

- se o lancamento precisa de uma ferramenta interna minima de admin ou se pode
  ser operado inicialmente por suporte/processos internos.

## Conceitos Compartilhados

### Esportes

Esportes do MVP:

- `futevolei`
- `beach_tennis`
- `beach_volleyball`

Regras:

- usar `futevolei` como nome interno do produto
- modelar esportes genericamente como `Sport`
- deixar `altinha` fora do MVP
- evitar hardcode que impeça novos esportes depois

Implicacoes no frontend:

- seletor de esporte deve suportar os tres esportes do MVP
- labels devem ser legiveis para humanos
- filtros de esporte devem funcionar em descoberta, quadras, perfil e partidas
  abertas

Implicacoes no backend:

- APIs devem expor identificadores estaveis de esporte
- quadra, perfil, disponibilidade, reserva e partida aberta devem referenciar o
  mesmo conceito de esporte

Decisao aberta:

- se esportes do MVP serao seed records no banco ou enums expostos por endpoint.

### Nivel Simples Do Jogador

Nivel simples e permitido no MVP apenas como atributo de matchmaking/filtro.

Regras:

- o nivel e autodeclarado
- o nivel nao e uma pontuacao verificada
- o nivel nao e o sistema V2 de overall/card
- o nivel pode ser usado como expectativa em partidas abertas
- o nivel pode ajudar jogadores a encontrarem jogos adequados

Sugestao inicial de niveis:

- `beginner`
- `intermediate`
- `advanced`

Decisao aberta:

- se o nivel e global por jogador, por esporte, ou ambos. Direcao atual: nivel
  por esporte.

### Visibilidade De Status E Estado

O MVP deve deixar estados explicitos. O usuario nao deve precisar adivinhar
etapas escondidas do fluxo.

Status principais:

- reserva: `pending_payment`, `confirmed`, `canceled`, `expired`, `completed`
- pagamento: `pending`, `paid`, `failed`, `overdue`
- partida aberta: `open`, `full`, `canceled`, `completed`
- quadra: `active`, `inactive`

Implicacoes no frontend:

- usar badges ou labels compactas de status
- mostrar acoes desabilitadas quando o status bloquear uma acao
- mostrar mensagens de regra de negocio em linguagem simples
- nao expor detalhes internos de provider, banco ou infraestrutura

Implicacoes no backend:

- status deve ser validado em toda transicao
- transicoes invalidas devem retornar `business_rule_violation`
- recursos inexistentes devem retornar `resource_not_found`
- acesso cruzado entre parceiros deve retornar `forbidden`

### Data, Hora E Dinheiro

O MVP precisa de tratamento consistente para reservas e disponibilidade.

Regras:

- reserva e disponibilidade devem referenciar data, hora inicial e hora final
- horarios de quadra devem ser comparaveis sem ambiguidade
- agenda do parceiro deve suportar visao por dia e por semana
- precos devem estar visiveis antes da solicitacao de reserva
- valores monetarios devem ser armazenados em centavos/unidade menor no backend,
  a menos que outro padrao seja aprovado

Implicacoes no frontend:

- usar exibicao amigavel para Brasil por padrao
- mostrar claramente inicio e fim do horario
- evitar datas relativas ambiguas em confirmacoes de reserva
- mostrar preco antes do jogador solicitar a reserva

Implicacoes no backend:

- validar se horario inicial e anterior ao horario final
- validar duracao do horario se o produto definir duracoes permitidas
- validar limites de data/hora de forma consistente
- evitar armazenamento monetario com ponto flutuante

Decisoes abertas:

- politica de timezone do MVP
- duracao permitida dos horarios de reserva
- se precos variam por dia/hora ou se o MVP comeca com preco simples por quadra
- janela de cancelamento

## Comportamento Compartilhado De API E Erros

Toda entrada e saida publica deve usar DTOs com Zod ou validacao equivalente.

Codigos publicos esperados:

- `validation_error`
- `unauthorized`
- `forbidden`
- `resource_not_found`
- `conflict`
- `business_rule_violation`
- `internal_error`

Regras:

- formato invalido de entrada retorna `validation_error`
- requests nao autenticados retornam `unauthorized`
- acesso cruzado entre parceiros retorna `forbidden`
- entidades inexistentes retornam `resource_not_found`
- duplicidade ou falha de unicidade retorna `conflict` quando apropriado
- requests validos bloqueados por regra de produto retornam
  `business_rule_violation`
- detalhes de provider ou infraestrutura nao devem vazar em respostas publicas

UX de erro no frontend:

- `validation_error`: erros inline nos campos sempre que possivel
- `business_rule_violation`: mensagem contextual perto da acao
- `unauthorized`: redirecionar para login ou estado de sessao expirada
- `forbidden`: mostrar estado de limite de acesso
- `resource_not_found`: mostrar tela/estado de nao encontrado
- `internal_error`: mostrar mensagem generica de tentar novamente/suporte

## Modulo 1: Autenticacao E Acesso A Conta

### Objetivo Do MVP

Permitir que usuarios autentiquem com Google e recebam a mesma sessao interna do
Sandicts usada pelos demais metodos de autenticacao.

Google Sign-In e Google One Tap sao os metodos principais de entrada com baixo
atrito.

### Incluido

- Google Sign-In
- Google One Tap
- criacao de sessao
- refresh/preservacao de sessao
- sign-out
- hidratacao da sessao/conta autenticada
- erros publicos seguros, sem detalhes do provider

### Fora Do Escopo

- Apple login
- login com senha
- recuperacao de senha
- escopos do Google Calendar
- autorizacao de calendario no frontend

### Fluxo No Frontend

Tela de entrada:

1. visitante abre `/sign-in`
2. pagina carrega o script Google Identity Services
3. usuario pode clicar em Google Sign-In
4. usuario pode receber prompt de Google One Tap
5. frontend recebe credential ou ID token do Google
6. frontend envia credential ao backend
7. backend cria sessao Sandicts
8. frontend hidrata estado autenticado
9. usuario cai na rota pos-login

Roteamento recomendado pos-login:

- se perfil do jogador estiver incompleto, ir para onboarding de perfil
- se perfil estiver completo, ir para home do jogador
- se usuario tiver acesso de parceiro e estava entrando na area de parceiro, ir
  para dashboard do parceiro

Estados do frontend:

- carregando script do Google
- request de login em andamento
- One Tap nao exibido/pulado de forma silenciosa ou com telemetria
- erro generico de credencial invalida
- sessao expirada
- usuario ja autenticado

### Comportamento No Backend

Backend deve:

- aceitar credential ou ID token do Google
- validar issuer
- validar audience/client ID vindo de config tipada
- validar expiracao
- validar assinatura
- validar subject
- validar email verificado
- usar `sub` do Google como chave de identidade do provider
- nunca usar email do Google como chave de identidade do provider
- vincular identidade Google verificada a conta existente apenas conforme
  politica de autenticacao
- criar sessao interna Sandicts com sucesso

Detalhes especificos do provider nao devem aparecer em mensagens publicas.

### Conceitos De Dados

Principais:

- `Account`
- `AuthSession`
- `ExternalIdentity`

Campos esperados de identidade externa:

- provider, por exemplo `google`
- subject do provider, vindo do `sub` do Google
- account id
- snapshot de email do provider, se util
- timestamps

Regras:

- provider + subject do provider deve ser unico
- subject do provider nao e email
- email pode ser usado apenas em politica de vinculacao quando verificado

### Rascunho De API

Endpoint de auth conhecido:

- `POST /auth/google/sign-in`

Endpoints necessarios ou esperados:

- `POST /auth/refresh`
- `POST /auth/sign-out`
- `GET /auth/session`

Os nomes exatos podem mudar para seguir convencoes do backend, mas o frontend
precisa de contratos estaveis antes da implementacao.

### Regras De Negocio

- token Google invalido retorna `unauthorized`
- email Google nao verificado e rejeitado
- identidade Google existente autentica a conta vinculada
- nova identidade Google verificada cria conta e sessao
- identidade Google verificada pode vincular a conta existente com mesmo email
  apenas conforme politica de auth
- sign-out invalida a sessao atual
- refresh nao deve criar outra conta

### Necessidades Para Figma

Telas/componentes:

- tela de entrada
- botao Google Sign-In
- permissao/posicionamento de One Tap
- estado de carregamento
- erro generico de autenticacao
- estado de sessao expirada
- confirmacao de saida, se o produto quiser

Nao desenhar como caminho padrao do MVP:

- formulario de senha
- esqueci minha senha
- Apple sign-in
- prompt de autorizacao de calendario

### Gate De Integracao

Auth esta pronto quando:

- usuario consegue entrar com botao Google
- usuario consegue entrar com One Tap
- usuario consegue preservar/renovar sessao
- usuario consegue sair
- token invalido mostra erro seguro
- email nao verificado e rejeitado
- frontend e backend concordam sobre hidratacao da sessao

## Modulo 2: Fundacao Do App Frontend

### Objetivo Do MVP

Criar a casca do frontend que sustentara todas as telas do MVP sem prender o
produto a suposicoes de V2.

### Incluido

- fundacao Next.js
- TypeScript
- App Router
- shadcn/ui
- Tailwind CSS
- lucide-react
- TanStack Query para server state
- Zod com React Hook Form para formularios
- cliente OpenAPI gerado a partir do Swagger do Nest
- Zustand apenas para estado local de UI
- Playwright para E2E
- Vitest com Testing Library para componentes/hooks
- validacao de ambiente
- cliente de API com credenciais
- layout publico
- layout protegido do jogador
- layout protegido do parceiro
- modelo de navegacao
- estados de loading, vazio, erro, proibido e nao encontrado
- direcao de componentes base e tokens visuais

### Fora Do Escopo

- polimento final de marca
- design system completo
- animacoes avancadas
- site de marketing completo

### Comportamento No Frontend

O app deve ter tres areas principais:

- area publica
- area do jogador
- area do parceiro

Rascunho de rotas:

- `/sign-in`
- `/app`
- `/app/profile`
- `/app/discovery`
- `/app/courts/[courtId]`
- `/app/reservations`
- `/app/open-matches`
- `/app/open-matches/[matchId]`
- `/app/open-matches/new`
- `/partner`
- `/partner/profile`
- `/partner/courts`
- `/partner/courts/new`
- `/partner/availability`
- `/partner/agenda`
- `/partner/reservations/[reservationId]`
- `/partner/payments`

Decisao aberta:

- os nomes de rota podem mudar depois do Figma e da criacao do repo frontend.

### Dependencias De Backend

- health endpoint
- endpoint de sessao/auth
- politica estavel de CORS/cookies
- Swagger/OpenAPI ou contratos documentados

### Necessidades Para Figma

Telas/componentes:

- shell global do app
- navegacao do jogador
- navegacao do parceiro
- navegacao mobile
- template de estado vazio
- template de estado de erro
- template de loading
- componente de badge/status
- padrao de validacao de campo

### Gate De Integracao

Fundacao do frontend esta pronta quando:

- frontend roda localmente
- frontend consegue chamar backend
- rotas protegidas redirecionam corretamente
- shell separa areas de jogador e parceiro
- estados base existem e podem ser reutilizados

## Modulo 3: Perfil Do Jogador

### Objetivo Do MVP

Permitir que jogadores autenticados completem o perfil minimo necessario para
descoberta, reservas e partidas abertas.

### Incluido

- nome de exibicao
- esporte principal
- nivel simples por esporte
- estado de completude do perfil
- edicao de perfil basico

### Fora Do Escopo

- perfil publico
- upload de foto
- bio
- nacionalidade
- lado de jogo
- pe dominante
- fundamentos/recursos detalhados
- overall
- evolucao de card do jogador

### Fluxo No Frontend

Onboarding:

1. jogador entra
2. app verifica completude do perfil
3. se incompleto, mostra onboarding de perfil
4. jogador confirma nome de exibicao
5. jogador escolhe esporte principal
6. jogador escolhe nivel simples nesse esporte
7. app salva perfil
8. jogador vai para home do jogador

Edicao:

1. jogador abre tela de perfil
2. jogador edita campos permitidos no MVP
3. app valida campos obrigatorios
4. backend salva alteracoes
5. app reflete perfil atualizado

Estados do frontend:

- perfil incompleto
- salvando
- erros de validacao
- salvo
- falha ao carregar perfil

### Comportamento No Backend

Backend deve:

- expor perfil atual do jogador
- criar ou atualizar perfil basico do jogador
- validar se esporte e suportado
- validar se nivel e suportado
- impedir jogador de editar perfil de outro jogador
- expor completude de perfil para roteamento no frontend

### Conceitos De Dados

Principais:

- `PlayerProfile`
- `Sport`
- `PlayerSportLevel` ou equivalente

Campos recomendados:

- account id
- nome de exibicao
- esporte principal
- nivel por esporte
- timestamps

### Rascunho De API

Possiveis endpoints:

- `GET /players/me`
- `PATCH /players/me`
- `GET /sports`

### Regras De Negocio

- conta autenticada pode ter um perfil de jogador
- perfil deve referenciar esportes suportados no MVP
- nivel simples e autodeclarado
- nivel de perfil nao e ranking
- perfil nao deve exigir geolocalizacao

### Necessidades Para Figma

Telas/componentes:

- onboarding de perfil
- edicao de perfil
- seletor de esporte
- seletor de nivel
- prompt de perfil incompleto
- estados de sucesso e erro ao salvar

### Gate De Integracao

Perfil do jogador esta pronto quando:

- jogador recem-autenticado e enviado para onboarding
- jogador consegue escolher esporte principal
- jogador consegue escolher nivel simples
- jogador consegue salvar e recarregar perfil
- esporte ou nivel invalido e rejeitado claramente

## Modulo 4: Onboarding De Parceiro

### Objetivo Do MVP

Permitir que um parceiro crie o perfil minimo necessario para expor quadras e
gerenciar reservas.

### Incluido

- conta/perfil de parceiro
- identidade de arena, clube, escola ou organizador
- informacoes publicas necessarias para descoberta
- detalhes operacionais de contato, se necessarios
- entrada no dashboard do parceiro

### Fora Do Escopo

- professores
- aulas
- alunos
- mensalidades
- ERP escolar completo
- relatorios avancados

### Fluxo No Frontend

Setup de parceiro:

1. usuario autenticado abre area de parceiro
2. se nao houver perfil de parceiro, mostrar estado de configuracao
3. usuario informa nome do parceiro e dados obrigatorios de listagem
4. usuario salva perfil do parceiro
5. app redireciona para dashboard do parceiro

Dashboard do parceiro:

- mostrar progresso de setup
- mostrar quantidade de quadras
- mostrar resumo da agenda do dia
- mostrar indicadores de reservas/pagamentos pendentes quando existirem

Estados do frontend:

- sem perfil de parceiro
- carregando perfil de parceiro
- area de parceiro proibida
- salvando perfil
- perfil salvo

### Comportamento No Backend

Backend deve:

- criar perfil de parceiro
- ler perfil do parceiro do usuario autenticado
- atualizar perfil do parceiro
- garantir limites de ownership/acesso
- impedir acesso a dados de outro parceiro

### Conceitos De Dados

Principais:

- `Partner`
- `PartnerUser` ou conceito equivalente de vinculo/ownership

Campos recomendados:

- nome de exibicao
- tipo/categoria, se necessario
- descricao ou resumo de listagem, se aprovado
- endereco/localizacao textual necessaria para listagem
- campos de contato operacional
- timestamps

Decisao aberta:

- campos exatos de localizacao do parceiro antes de geolocalizacao entrar em V2.

### Rascunho De API

Possiveis endpoints:

- `GET /partners/me`
- `POST /partners`
- `PATCH /partners/me`

### Regras De Negocio

- parceiro e o conceito unico para arena, escola, clube ou organizador
- usuarios de parceiro acessam apenas dados do proprio parceiro
- acesso cruzado entre parceiros retorna `forbidden`
- perfil de parceiro deve existir antes da criacao de quadra

### Necessidades Para Figma

Telas/componentes:

- setup de parceiro
- shell do dashboard de parceiro
- formulario de perfil de parceiro
- estado de parceiro ausente
- estado de acesso proibido

### Gate De Integracao

Onboarding de parceiro esta pronto quando:

- usuario consegue criar perfil de parceiro
- dashboard carrega depois do setup
- dados do parceiro ficam restritos ao parceiro autenticado
- estados de ausente/proibido ficam claros

## Modulo 5: Gestao De Quadras

### Objetivo Do MVP

Permitir que parceiros criem e gerenciem as quadras que jogadores poderao
descobrir e reservar.

### Incluido

- criacao de quadra
- edicao de quadra
- lista de quadras
- ativacao/desativacao de quadra
- esportes suportados
- informacao de preco
- regras simples visiveis para jogadores

### Fora Do Escopo

- galeria de fotos
- avaliacoes/reviews
- catalogo rico de comodidades, salvo se necessario ao MVP
- motor automatico de precificacao
- motor completo de regras de agenda, salvo se aprovado

### Fluxo No Frontend

Criacao de quadra:

1. parceiro abre gestao de quadras
2. parceiro cria nova quadra
3. parceiro define nome
4. parceiro seleciona esportes suportados
5. parceiro define informacao de preco
6. parceiro adiciona regras simples da quadra
7. parceiro salva
8. quadra aparece na lista de quadras do parceiro

Ativacao:

1. parceiro abre lista/detalhe de quadra
2. parceiro alterna quadra ativa/inativa
3. quadra inativa nao pode ser reservada
4. quadra inativa continua visivel para o parceiro

Estados do frontend:

- lista de quadras vazia
- criando quadra
- editando quadra
- quadra inativa
- selecao de esporte invalida
- falha ao salvar

### Comportamento No Backend

Backend deve:

- criar quadra no parceiro autenticado
- atualizar quadra do parceiro autenticado
- listar quadras do parceiro
- expor campos publicos/seguros de quadra para descoberta
- aplicar elegibilidade de reserva por ativo/inativo
- aplicar acesso escopado por parceiro

### Conceitos De Dados

Principais:

- `Court`
- `CourtSport`
- `CourtPrice` ou equivalente
- `CourtRule` ou campo textual de regras

Campos recomendados:

- partner id
- nome
- esportes suportados
- flag/status ativo
- preco em centavos ou referencia de regra de preco
- regras simples
- timestamps

### Rascunho De API

Possiveis endpoints:

- `GET /partner/courts`
- `POST /partner/courts`
- `GET /partner/courts/:courtId`
- `PATCH /partner/courts/:courtId`
- `PATCH /partner/courts/:courtId/status`

Descoberta pode usar endpoints publicos separados de leitura.

### Regras De Negocio

- parceiro gerencia apenas suas proprias quadras
- quadra deve suportar pelo menos um esporte do MVP
- quadras inativas nao podem ser reservadas
- quadras inativas nao devem aparecer como reservaveis na descoberta
- preco/regras da quadra devem aparecer antes da solicitacao de reserva

### Necessidades Para Figma

Telas/componentes:

- lista de quadras
- lista vazia
- formulario de criacao de quadra
- formulario de edicao de quadra
- seletor de esportes suportados
- campo de preco
- campo de regras da quadra
- controle ativo/inativo
- badge de status da quadra

### Gate De Integracao

Gestao de quadras esta pronta quando:

- parceiro consegue criar quadra
- parceiro consegue editar quadra
- parceiro consegue desativar quadra
- quadra inativa nao pode ser reservada
- quadra aparece na lista do parceiro

## Modulo 6: Calendario De Disponibilidade

### Objetivo Do MVP

Permitir que parceiros publiquem horarios disponiveis de quadras e vejam a
agenda operacional.

### Incluido

- criar horario disponivel
- editar horario disponivel
- excluir ou desativar horario disponivel
- visao de agenda por dia
- visao de agenda por semana
- prevencao de horario invalido/sobreposto

### Fora Do Escopo

- motor de recorrencia, salvo aprovacao explicita
- sincronizacao avancada de calendario
- integracao com Google Calendar
- atribuicao de funcionarios

### Fluxo No Frontend

Publicacao de disponibilidade:

1. parceiro abre calendario de disponibilidade
2. parceiro seleciona quadra
3. parceiro seleciona data
4. parceiro seleciona hora inicial e final
5. parceiro salva horario
6. horario aparece na agenda dia/semana
7. horario pode aparecer na descoberta para jogadores

Agenda:

- mostrar horarios disponiveis
- mostrar estado de reserva por horario quando houver reserva
- permitir leitura rapida por dia/semana

Estados do frontend:

- nenhuma quadra criada
- nenhuma disponibilidade
- editor de horario
- erro de sobreposicao
- faixa de horario invalida
- horario salvo
- agenda carregando

### Comportamento No Backend

Backend deve:

- criar disponibilidade para quadra do parceiro
- atualizar disponibilidade
- excluir/desativar disponibilidade quando permitido
- impedir faixas de horario invalidas
- impedir sobreposicao de disponibilidade na mesma quadra se o produto escolher
  unicidade estrita de slot
- expor disponibilidade para descoberta
- proteger dados escopados por parceiro

### Conceitos De Dados

Principal:

- `AvailabilitySlot`

Campos recomendados:

- partner id
- court id
- sport id, se o slot for especifico por esporte
- data
- hora inicial
- hora final
- status/flag ativo
- override de preco, se aprovado
- timestamps

Decisoes abertas:

- se disponibilidade e por quadra ou por esporte
- se um horario suporta multiplos esportes quando a quadra suporta multiplos
- se horarios sobrepostos sao sempre proibidos ou permitidos em algum caso

### Rascunho De API

Possiveis endpoints:

- `GET /partner/availability`
- `POST /partner/availability`
- `PATCH /partner/availability/:slotId`
- `DELETE /partner/availability/:slotId`
- `GET /partner/agenda`

### Regras De Negocio

- parceiros sao a fonte da verdade para disponibilidade
- disponibilidade deve referenciar quadra do parceiro
- horarios indisponiveis nao podem ser reservados
- reservas confirmadas devem bloquear o horario
- parceiro nao pode criar disponibilidade para quadra de outro parceiro

### Necessidades Para Figma

Telas/componentes:

- calendario de disponibilidade
- seletor de quadra
- editor de horario
- agenda por dia
- agenda por semana
- exibicao de status do slot
- erro de sobreposicao
- estado sem quadras

### Gate De Integracao

Disponibilidade esta pronta quando:

- parceiro consegue publicar horario
- horario aparece na agenda
- horario invalido e rejeitado
- horario fica disponivel para descoberta/reserva

## Modulo 7: Descoberta De Quadras

### Objetivo Do MVP

Permitir que jogadores encontrem quadras por filtros simples e escolham um
horario candidato para reserva.

### Incluido

- filtro por esporte
- filtro por disponibilidade
- filtro por preco
- ver resumo/perfil do parceiro
- ver detalhe da quadra
- ver horarios disponiveis

### Fora Do Escopo

- busca por proximidade/geolocalizacao
- avaliacoes e reviews
- comparacao rica de localizacao
- galeria de fotos
- recomendacao automatica

### Fluxo No Frontend

Descoberta:

1. jogador abre descoberta
2. jogador escolhe esporte
3. jogador opcionalmente escolhe data/hora
4. jogador opcionalmente filtra por preco
5. app mostra resultados de parceiros/quadras
6. jogador abre detalhe da quadra
7. jogador escolhe horario disponivel
8. jogador inicia solicitacao de reserva

Estados do frontend:

- estado inicial de descoberta
- carregando resultados
- nenhum resultado
- filtro alterado
- detalhe de quadra carregando
- slot selecionado ficou indisponivel
- usuario nao autenticado se descoberta publica existir, mas reserva exigir login

### Comportamento No Backend

Backend deve:

- consultar quadras ativas com disponibilidade ativa
- filtrar por esporte suportado
- filtrar por disponibilidade
- filtrar por preco
- retornar DTOs seguros para descoberta
- excluir quadras inativas de resultados reservaveis
- nao expor dados privados do parceiro

### Conceitos De Dados

Leitura a partir de:

- `Partner`
- `Court`
- `AvailabilitySlot`
- `Reservation`
- `Payment` quando necessario para estado de reserva, nao necessariamente para
  listagem

### Rascunho De API

Possiveis endpoints:

- `GET /discovery/courts`
- `GET /discovery/courts/:courtId`
- `GET /discovery/courts/:courtId/availability`

### Regras De Negocio

- descoberta deve mostrar apenas quadras ativas e reservaveis
- filtros devem ser simples e previsiveis
- quadras inativas nao podem aparecer como reservaveis
- reservas confirmadas devem remover/bloquear o horario
- descoberta nao exige geolocalizacao no MVP

### Necessidades Para Figma

Telas/componentes:

- tela de descoberta do jogador
- filtro de esporte
- filtro de data/hora
- filtro de preco
- card de resultado
- estado sem resultados
- detalhe da quadra
- lista de horarios disponiveis
- CTA de reserva

### Gate De Integracao

Descoberta esta pronta quando:

- jogador consegue filtrar por esporte
- jogador consegue filtrar por disponibilidade
- jogador consegue filtrar por preco
- quadras inativas/indisponiveis nao aparecem como reservaveis
- jogador consegue ir de um resultado para solicitacao de reserva

## Modulo 8: Reservas

### Objetivo Do MVP

Permitir que jogadores solicitem reservas e parceiros confirmem ou cancelem,
evitando duplicidade de reservas confirmadas no mesmo horario.

### Incluido

- solicitacao de reserva pelo jogador
- status de reserva
- confirmacao pelo parceiro
- cancelamento pelo jogador
- cancelamento pelo parceiro
- historico de reservas do jogador
- detalhe de reserva para parceiro
- prevencao de duplicidade de slot confirmado

### Fora Do Escopo

- confirmacao automatica por gateway de pagamento
- automacao complexa de politica de cancelamento
- reembolsos
- lista de espera
- reservas recorrentes

### Fluxo No Frontend

Solicitacao pelo jogador:

1. jogador seleciona horario disponivel da quadra
2. jogador revisa parceiro, quadra, esporte, data, hora, preco e regras
3. jogador envia solicitacao de reserva
4. app mostra status da reserva
5. jogador consegue ver reserva no historico

Confirmacao pelo parceiro:

1. parceiro abre agenda ou detalhe da reserva
2. parceiro revisa solicitacao
3. parceiro confirma ou cancela a reserva
4. reserva confirmada bloqueia o horario
5. jogador ve estado atualizado

Cancelamento:

1. jogador ou parceiro abre a reserva
2. ator permitido solicita cancelamento
3. backend valida status e politica de cancelamento
4. reserva vira `canceled`

Estados do frontend:

- solicitacao em andamento
- pagamento pendente
- confirmada
- cancelada
- expirada
- concluida
- erro de slot duplicado
- cancelamento nao permitido

### Comportamento No Backend

Backend deve:

- criar reserva para jogador autenticado
- referenciar parceiro, quadra, esporte, data, hora inicial, hora final,
  jogador, estado de pagamento e status de reserva
- validar se slot existe e esta disponivel
- validar se quadra esta ativa
- impedir duas reservas confirmadas ativas para mesma quadra/horario
- permitir parceiro confirmar reserva
- permitir jogador/parceiro cancelar conforme politica
- expor historico de reservas do jogador
- expor detalhe/agenda de reservas do parceiro

### Conceitos De Dados

Principais:

- `Reservation`
- `ReservationStatus`

Campos recomendados:

- partner id
- court id
- sport id
- player id
- availability slot id, se modelado diretamente
- data
- hora inicial
- hora final
- snapshot de preco
- referencia/status de pagamento
- status
- timestamps

### Rascunho De API

Possiveis endpoints:

- `POST /reservations`
- `GET /players/me/reservations`
- `GET /partner/reservations/:reservationId`
- `PATCH /partner/reservations/:reservationId/confirm`
- `PATCH /reservations/:reservationId/cancel`
- `PATCH /partner/reservations/:reservationId/cancel`

### Regras De Negocio

- status de reserva deve sempre ser explicito
- reserva confirmada bloqueia o horario da quadra
- mesma quadra/horario nao pode ter duas reservas confirmadas ativas
- reserva nao pode ser criada para quadra inativa
- reserva nao pode ser criada para horario indisponivel
- parceiro gerencia apenas suas reservas
- jogador ve apenas seu historico
- janela de cancelamento esta aberta e precisa ser decidida antes da
  implementacao final

### Necessidades Para Figma

Telas/componentes:

- revisao de reserva
- sucesso/status de reserva
- historico de reservas do jogador
- badge de status de reserva
- detalhe de reserva do parceiro
- acoes de confirmar/cancelar
- mensagem de slot duplicado
- mensagem de cancelamento bloqueado

### Gate De Integracao

Reservas estao prontas quando:

- jogador consegue solicitar reserva
- parceiro consegue confirmar
- reserva confirmada bloqueia horario
- duplicidade de reserva confirmada e rejeitada
- jogador e parceiro veem status atualizado
- cancelamento permitido funciona

## Modulo 9: Pagamentos Manuais

### Objetivo Do MVP

Acompanhar estado de pagamento manualmente, sem integracao com gateway.

### Incluido

- registro de status de pagamento
- reserva le status de pagamento
- parceiro ve pagamentos pendentes
- parceiro atualiza status manualmente
- mudancas de status sao controladas e auditaveis

### Fora Do Escopo

- gateway de pagamento
- reembolso como fluxo operacional
- splits
- repasses
- comissao automatica
- inadimplencia de mensalidade escolar

### Fluxo No Frontend

Gestao de pagamento pelo parceiro:

1. parceiro abre pagamentos pendentes
2. parceiro ve status de pagamento da reserva
3. parceiro abre detalhe do pagamento/reserva
4. parceiro marca pagamento como pago, falhou ou vencido quando permitido
5. telas de reserva refletem novo estado

Visibilidade para jogador:

- jogador ve status de pagamento na reserva
- jogador nao paga via gateway Sandicts no MVP

Estados do frontend:

- pagamento pendente
- pago
- falhou
- vencido
- atualizacao manual em andamento
- atualizacao bloqueada por status

### Comportamento No Backend

Backend deve:

- criar ou associar pagamento a reserva
- expor status de pagamento nas leituras de reserva
- permitir atualizacoes manuais escopadas por parceiro
- validar transicoes permitidas
- manter referencias de provider opcionais para futuro gateway
- nao exigir dados de gateway no MVP

### Conceitos De Dados

Principais:

- `Payment`
- `PaymentStatus`

Campos recomendados:

- reservation id
- partner id
- status
- valor em centavos
- moeda
- metadados de atualizacao manual, se disponiveis
- campos opcionais de provider para futuro
- timestamps

### Rascunho De API

Possiveis endpoints:

- `GET /partner/payments`
- `PATCH /partner/payments/:paymentId/status`
- `GET /partner/reservations/:reservationId/payment`

### Regras De Negocio

- status de pagamento deve ser explicito
- atualizacoes manuais sao escopadas por parceiro
- parceiro nao pode atualizar pagamentos de outro parceiro
- campos de provider sao opcionais no MVP
- `refunded` nao e status operacional do MVP sem fluxo de reembolso definido

### Necessidades Para Figma

Telas/componentes:

- lista de pagamentos pendentes
- badge de status de pagamento
- controle manual de status
- confirmacao de atualizacao
- erro de atualizacao
- resumo de pagamento na reserva

### Gate De Integracao

Pagamentos manuais estao prontos quando:

- parceiro ve pagamentos pendentes de reservas
- parceiro atualiza status manualmente
- reserva reflete status de pagamento
- atualizacao de pagamento entre parceiros e proibida

## Modulo 10: Partidas Abertas

### Objetivo Do MVP

Permitir que jogadores criem e entrem em partidas abertas para provar o loop de
comunidade.

### Incluido

- partida aberta criada por jogador
- esporte
- local
- data e hora
- limite de participantes
- nivel esperado simples
- entrar na partida
- sair da partida
- criador cancelar partida
- estados aberta/cheia/cancelada/concluida

### Fora Do Escopo

- partidas abertas criadas por parceiro
- convites
- chat
- matchmaking automatico
- rankings
- recompensas

### Fluxo No Frontend

Criar partida:

1. jogador abre criacao de partida aberta
2. jogador escolhe esporte
3. jogador escolhe local
4. jogador escolhe data e hora
5. jogador define limite de participantes
6. jogador define nivel esperado
7. app cria partida
8. jogador ve detalhe da partida

Entrar em partida:

1. jogador abre lista de partidas abertas
2. jogador filtra por esporte ou nivel, se disponivel
3. jogador abre detalhe da partida
4. jogador entra na partida
5. app atualiza quantidade de participantes
6. se limite for atingido, partida vira cheia

Sair/cancelar:

- participante pode sair se partida ainda estiver aberta e politica permitir
- criador pode cancelar a partida

Estados do frontend:

- aberta
- cheia
- cancelada
- concluida
- ja entrou
- entrada bloqueada
- saida bloqueada

### Comportamento No Backend

Backend deve:

- criar partida aberta para jogador autenticado
- listar partidas abertas
- ler detalhe de partida
- permitir entrada de participante
- permitir saida de participante
- impedir entrada duplicada
- impedir entrada quando cheia
- impedir entrada quando cancelada ou concluida
- atualizar status para cheia quando limite for atingido
- permitir criador cancelar

### Conceitos De Dados

Principais:

- `OpenMatch`
- `OpenMatchParticipant`

Campos recomendados:

- creator/player id
- sport id
- tipo/referencia de local ou texto livre
- data
- hora inicial
- hora final, se o produto escolher
- limite de participantes
- nivel esperado
- status
- timestamps

Decisao aberta:

- se local da partida no MVP e referencia a parceiro/quadra, texto livre ou os
  dois.

### Rascunho De API

Possiveis endpoints:

- `GET /open-matches`
- `POST /open-matches`
- `GET /open-matches/:matchId`
- `POST /open-matches/:matchId/participants`
- `DELETE /open-matches/:matchId/participants/me`
- `PATCH /open-matches/:matchId/cancel`

### Regras De Negocio

- jogador nao pode entrar duas vezes na mesma partida
- jogador nao pode entrar em partida cheia
- jogador nao pode entrar em partida cancelada ou concluida
- partida expoe vagas totais, participantes confirmados e vagas restantes
- nivel esperado e filtro/expectativa, nao prova verificada de habilidade
- criador pode cancelar a propria partida

### Necessidades Para Figma

Telas/componentes:

- lista de partidas abertas
- filtros de partida aberta
- detalhe de partida aberta
- formulario de criacao
- exibicao de participantes/vagas
- acao de entrar
- acao de sair
- acao de cancelar
- badges cheia/cancelada/concluida
- erro de entrada duplicada

### Gate De Integracao

Partidas abertas estao prontas quando:

- jogador consegue criar partida
- outro jogador consegue entrar
- entrada duplicada e bloqueada
- partida cheia bloqueia novas entradas
- participante consegue sair
- criador consegue cancelar

## Modulo 11: Preparacao Para Lancamento

### Objetivo Do MVP

Deixar o MVP confiavel o suficiente para lancamento controlado e validacao com
usuarios reais.

### Incluido

- smoke tests dos fluxos criticos
- cobertura de validacao de API
- checagens de auth/sessao
- checagens de acesso proibido
- observabilidade basica
- estrategia de seed data
- documentacao de variaveis de ambiente
- prontidao de deploy

### Fora Do Escopo

- otimizacao de grande escala
- plataforma admin completa
- analytics avancado
- automacao completa de suporte

### Fluxos Criticos

Lancamento deve validar:

- Google sign-in e One Tap
- onboarding de perfil
- setup de parceiro
- criacao de quadra
- publicacao de disponibilidade
- filtros de descoberta
- solicitacao e confirmacao de reserva
- atualizacao de pagamento manual
- criar/entrar/sair de partida aberta
- sign-out/expiracao de sessao

### Checagens De Backend

Deve cobrir:

- erros de validacao
- erros de regra de negocio
- acesso proibido entre parceiros
- acesso nao autenticado
- prevencao de reserva duplicada
- prevencao de entrada duplicada em partida aberta

### Checagens De Frontend

Deve cobrir:

- layout mobile dos fluxos principais
- loading states
- empty states
- exibicao de erro de regra de negocio
- sessao expirada
- redirects de rotas protegidas

### Gate De Integracao

Preparacao para lancamento esta pronta quando:

- todos os gates dos modulos do MVP passam
- validacao de CI passa
- ambiente de deploy esta configurado
- secrets/config de producao estao documentados fora do repo
- decisoes abertas estao resolvidas ou aceitas explicitamente como limitacoes
  de lancamento

## Inventario Para Figma

Use esta lista para criar as primeiras paginas/frames no Figma.

### Fundacoes

- tokens visuais
- tipografia
- botoes
- inputs
- select/combobox
- date picker
- slot de calendario
- badge/status
- card/list item
- modal/dialog
- estado vazio
- estado de erro
- estado de carregamento
- navegacao mobile
- navegacao desktop

### Auth

- entrada/login
- botao Google
- estado de One Tap
- sessao expirada
- erro de auth

### Jogador

- home do jogador
- onboarding de perfil
- edicao de perfil
- descoberta
- detalhe de quadra
- solicitacao de reserva
- status de reserva
- historico de reservas
- lista de partidas abertas
- detalhe de partida aberta
- criar partida aberta

### Parceiro

- setup de parceiro
- dashboard do parceiro
- lista de quadras
- criar/editar quadra
- calendario de disponibilidade
- agenda dia
- agenda semana
- detalhe de reserva
- lista de pagamentos
- atualizacao manual de pagamento

## Formato Do Roadmap No Jira

Epicos recomendados:

- `[MVP] Authentication and Account Access`
- `[Frontend] Web App Foundation`
- `[MVP] Player Profile`
- `[MVP] Partner Onboarding`
- `[MVP] Court Management`
- `[MVP] Availability`
- `[MVP] Discovery`
- `[MVP] Reservations`
- `[MVP] Manual Payments`
- `[MVP] Open Matches`
- `[MVP] Launch Hardening`

Formato recomendado:

```text
Epic: [MVP] Reservations
  Story: [Reservations] Player requests a court reservation
    Subtask: [Backend] Implement reservation request behavior
    Subtask: [Frontend] Build reservation request flow
    Subtask: [E2E] Validate reservation request happy path
```

Regras:

- criar epicos como ancoras de roadmap
- criar tarefas detalhadas apenas para o modulo atual e o proximo
- criar tarefas de decisao, prototipo e documentacao antes de implementar
  paginas que ainda nao tem formato aprovado
- manter tarefas de frontend e backend sob a mesma story de produto quando
  possivel
- adicionar validacao E2E/integracao para cada gate de modulo

Para o roadmap detalhado de frontend/fullstack, incluindo tarefas de decisao,
prototipo, documentacao, fundacao, implementacao e validacao, usar
`docs/frontend/sandicts-mvp-delivery-roadmap.md`.

## Decisoes Abertas Atuais

Resolver antes do Figma final e implementacao do modulo afetado.

Decidido:

- stack frontend: Next.js App Router com TypeScript
- UI: shadcn/ui, Tailwind CSS e lucide-react
- server state: TanStack Query
- formularios: Zod e React Hook Form
- API client: gerado a partir do Swagger/OpenAPI do Nest
- estado local de UI: Zustand somente quando necessario
- testes: Playwright para E2E, Vitest e Testing Library para componentes/hooks

Aberto:

- local do repositorio frontend
- versao do Node.js para frontend
- package manager
- gerador OpenAPI exato
- modelo de navegacao jogador vs parceiro
- descoberta publica antes do login
- fonte da verdade da sessao e endpoint de hidratacao
- politica de timezone do MVP
- duracao permitida de slots de reserva
- modelo de preco para quadras e disponibilidade
- janela de cancelamento
- se disponibilidade e por quadra ou por esporte
- se local da partida aberta e referencia a quadra, texto livre ou ambos
- se ferramenta admin e necessaria para lancamento

## Proximo Passo Imediato

Usar este documento para uma rodada de planejamento nesta ordem:

1. registrar tarefas de docs para as decisoes ja tomadas e docs nao commitados
2. revisar decisoes abertas e preencher as necessarias antes do Figma
3. criar ou ajustar epicos no Jira
4. detalhar primeiro apenas Auth, Fundacao do Frontend e Perfil do Jogador
5. criar prototipos/fluxos de Figma para Auth e Perfil do Jogador
6. implementar integracao de Auth e Perfil do Jogador como primeiras fatias
   fullstack
7. continuar modulo por modulo usando este mesmo formato
