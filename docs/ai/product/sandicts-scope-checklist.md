---
title: Sandicts Scope Checklist
doc-type: product-scope-checklist
role: working-draft
priority: medium
canonical: false
related:
  - docs/ai/product/sandicts-product-context.md
  - docs/ai/business/sandicts-business-rules.md
scope: product, mvp, v2, backlog, player-progression, marketplace
read-when:
  - deciding MVP scope
  - classifying product features as MVP, V2, future, or discard
  - consolidating Sandicts business rules from product decisions
do-not-read-when:
  - changing only low-level technical configuration
---

# Sandicts Scope Checklist

Este arquivo e um rascunho para decidir escopo.

Como marcar:

- Marque exatamente uma coluna por item: `MVP`, `V2`, `Futuro` ou `Descartar`.
- Use `[x]` para marcar.
- Use `Observacoes` quando quiser explicar condicoes, duvidas ou recortes.
- Depois de marcado, Codex pode ler este arquivo e transformar as decisoes em regras de negocio e backlog.

## 1. Base do produto

| Item                                   | MVP | V2  | Futuro | Descartar | Observacoes                                                 |
| -------------------------------------- | --- | --- | ------ | --------- | ----------------------------------------------------------- |
| Player pode criar conta                | [x] | [ ] | [ ]    | [ ]       | necessario para reserva, partida aberta e historico         |
| Player pode fazer login                | [x] | [ ] | [ ]    | [ ]       |                                                             |
| Player pode fazer logout               | [x] | [ ] | [ ]    | [ ]       |                                                             |
| Player pode recuperar senha            | [ ] | [ ] | [ ]    | [ ]       | não sei se em algum momento o app vai ter login com senha   |
| Player pode login com Google           | [X] | [ ] | [ ]    | [ ]       | reduzir friccao depois do fluxo principal                   |
| Player pode login com Google One Tap   | [X] | [ ] | [ ]    | [ ]       | junto com login Google                                      |
| Player pode editar perfil basico       | [x] | [ ] | [ ]    | [ ]       | nome e dados minimos                                        |
| Player pode informar localizacao       | [ ] | [x] | [ ]    | [ ]       | geolocalizacao fica para V2                                 |
| Player pode escolher esporte principal | [x] | [ ] | [ ]    | [ ]       | ajuda descoberta e partidas sem entrar em evolucao completa |
| Player pode escolher lado de jogo      | [ ] | [x] | [ ]    | [ ]       | direita, esquerda ou ambos; fica junto do perfil esportivo  |
| Player pode adicionar foto             | [ ] | [x] | [ ]    | [ ]       | importante para card/perfil, nao essencial no MVP           |
| Player pode adicionar bio              | [ ] | [x] | [ ]    | [ ]       |                                                             |
| Player pode informar nacionalidade     | [ ] | [x] | [ ]    | [ ]       | fica junto do card esportivo                                |
| Perfil publico de player               | [ ] | [x] | [ ]    | [ ]       | util para comunidade e partidas                             |
| Nivel simples por esporte              | [x] | [ ] | [ ]    | [ ]       | nivel simples para partidas; nao e evolucao/overall         |
| Admin interno existe                   | [ ] | [ ] | [x]    | [ ]       | criar apenas quando houver fluxo operacional real           |

## 2. Parceiros e locais

| Item                                      | MVP | V2  | Futuro | Descartar | Observacoes                                       |
| ----------------------------------------- | --- | --- | ------ | --------- | ------------------------------------------------- |
| Partner pode criar conta                  | [x] | [ ] | [ ]    | [ ]       | supply side do marketplace                        |
| Partner pode cadastrar arena/clube/escola | [x] | [ ] | [ ]    | [ ]       | conceito unico de partner para local/escola/clube |
| Partner pode editar perfil do local       | [x] | [ ] | [ ]    | [ ]       | dados basicos do local                            |
| Partner pode cadastrar quadras            | [x] | [ ] | [ ]    | [ ]       | essencial para reserva                            |
| Partner pode definir esportes disponiveis | [x] | [ ] | [ ]    | [ ]       | por local/quadra                                  |
| Partner pode definir preco por horario    | [x] | [ ] | [ ]    | [ ]       | necessario para reserva e comparacao basica       |
| Partner pode definir regras da quadra     | [x] | [ ] | [ ]    | [ ]       | regras simples visiveis ao player                 |
| Partner pode ativar/inativar quadras      | [x] | [ ] | [ ]    | [ ]       | controle operacional minimo                       |
| Partner pode gerenciar professores        | [ ] | [x] | [ ]    | [ ]       | entra com gestao de escola/aulas                  |
| Partner pode gerenciar aulas/turmas       | [ ] | [x] | [ ]    | [ ]       | nao essencial para marketplace inicial            |

## 3. Descoberta e marketplace

| Item                                    | MVP | V2  | Futuro | Descartar | Observacoes                              |
| --------------------------------------- | --- | --- | ------ | --------- | ---------------------------------------- |
| Player pode listar locais proximos      | [ ] | [x] | [ ]    | [ ]       | depende de geolocalizacao                |
| Player pode filtrar por esporte         | [x] | [ ] | [ ]    | [ ]       |                                          |
| Player pode filtrar por disponibilidade | [x] | [ ] | [ ]    | [ ]       |                                          |
| Player pode filtrar por preco           | [x] | [ ] | [ ]    | [ ]       |                                          |
| Player pode ver perfil do partner       | [x] | [ ] | [ ]    | [ ]       |                                          |
| Player pode ver quadras disponiveis     | [x] | [ ] | [ ]    | [ ]       |                                          |
| Player pode comparar locais             | [ ] | [x] | [ ]    | [ ]       | comparacao mais rica depois              |
| Local tem galeria de fotos              | [ ] | [x] | [ ]    | [ ]       | bom para conversao, mas nao bloqueia MVP |
| Local tem avaliacoes                    | [ ] | [ ] | [x]    | [ ]       | precisa de uso real antes                |

## 4. Agenda e reservas

| Item                                           | MVP | V2  | Futuro | Descartar | Observacoes                         |
| ---------------------------------------------- | --- | --- | ------ | --------- | ----------------------------------- |
| Partner pode cadastrar horarios disponiveis    | [x] | [ ] | [ ]    | [ ]       | partner controla disponibilidade    |
| Player pode solicitar reserva                  | [x] | [ ] | [ ]    | [ ]       | fluxo central do MVP                |
| Sistema impede reserva em horario indisponivel | [x] | [ ] | [ ]    | [ ]       | regra critica                       |
| Sistema impede reserva duplicada               | [x] | [ ] | [ ]    | [ ]       | mesma quadra e mesmo horario        |
| Reserva tem status explicito                   | [x] | [ ] | [ ]    | [ ]       |                                     |
| Reserva pode ficar pending_payment             | [x] | [ ] | [ ]    | [ ]       | mesmo com pagamento manual          |
| Reserva pode ficar confirmed                   | [x] | [ ] | [ ]    | [ ]       |                                     |
| Reserva pode ficar canceled                    | [x] | [ ] | [ ]    | [ ]       |                                     |
| Reserva pode ficar expired                     | [x] | [ ] | [ ]    | [ ]       |                                     |
| Reserva pode ficar completed                   | [x] | [ ] | [ ]    | [ ]       |                                     |
| Partner pode confirmar reserva manualmente     | [x] | [ ] | [ ]    | [ ]       | reduz dependencia de gateway no MVP |
| Player pode cancelar reserva                   | [x] | [ ] | [ ]    | [ ]       | definir janela permitida            |
| Partner pode cancelar reserva                  | [x] | [ ] | [ ]    | [ ]       |                                     |
| Player pode ver historico de reservas          | [x] | [ ] | [ ]    | [ ]       |                                     |
| Partner pode ver agenda por dia/semana         | [x] | [ ] | [ ]    | [ ]       |                                     |

## 5. Pagamentos

| Item                                              | MVP | V2  | Futuro | Descartar | Observacoes                                 |
| ------------------------------------------------- | --- | --- | ------ | --------- | ------------------------------------------- |
| Pagamento pode ser registrado manualmente         | [x] | [ ] | [ ]    | [ ]       | MVP sem gateway                             |
| Pagamento tem status pending                      | [x] | [ ] | [ ]    | [ ]       |                                             |
| Pagamento tem status paid                         | [x] | [ ] | [ ]    | [ ]       |                                             |
| Pagamento tem status failed                       | [x] | [ ] | [ ]    | [ ]       |                                             |
| Pagamento tem status refunded                     | [ ] | [x] | [ ]    | [ ]       | importante com gateway/operacao mais madura |
| Pagamento tem status overdue                      | [x] | [ ] | [ ]    | [ ]       | util para pendencias simples                |
| Reserva consulta status de pagamento              | [x] | [ ] | [ ]    | [ ]       |                                             |
| Partner ve pagamentos pendentes                   | [x] | [ ] | [ ]    | [ ]       |                                             |
| Partner ve inadimplencia dos seus alunos/clientes | [ ] | [x] | [ ]    | [ ]       | depende de alunos/mensalidade               |
| Integracao com gateway de pagamento               | [ ] | [x] | [ ]    | [ ]       | depois de validar fluxo manual              |
| Split ou repasse para partner                     | [ ] | [ ] | [x]    | [ ]       | depende de gateway e modelo comercial       |
| Comissao Sandicts por reserva                     | [ ] | [x] | [ ]    | [ ]       | pode ser modelada antes do split real       |

## 6. Partidas abertas

| Item                                            | MVP | V2  | Futuro | Descartar | Observacoes                                                |
| ----------------------------------------------- | --- | --- | ------ | --------- | ---------------------------------------------------------- |
| Player pode criar partida aberta                | [x] | [ ] | [ ]    | [ ]       | comunidade jogavel desde o MVP                             |
| Partner pode criar partida aberta               | [ ] | [x] | [ ]    | [ ]       | partner cria depois; MVP foca player                       |
| Partida aberta tem esporte                      | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Partida aberta tem local                        | [x] | [ ] | [ ]    | [ ]       | pode referenciar partner/quadra ou local textual no inicio |
| Partida aberta tem data e horario               | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Partida aberta tem limite de participantes      | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Partida aberta tem nivel esperado               | [x] | [ ] | [ ]    | [ ]       | nivel simples, nao evolucao completa                       |
| Player pode entrar em partida aberta            | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Sistema impede player de entrar duas vezes      | [x] | [ ] | [ ]    | [ ]       | regra critica                                              |
| Sistema impede entrada se partida estiver cheia | [x] | [ ] | [ ]    | [ ]       | regra critica                                              |
| Participante pode sair da partida               | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Criador pode cancelar partida                   | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Partida tem status open                         | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Partida tem status full                         | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Partida tem status canceled                     | [x] | [ ] | [ ]    | [ ]       |                                                            |
| Partida tem status completed                    | [x] | [ ] | [ ]    | [ ]       |                                                            |

## 7. Torneios e eventos

| Item                                         | MVP | V2  | Futuro | Descartar | Observacoes                                       |
| -------------------------------------------- | --- | --- | ------ | --------- | ------------------------------------------------- |
| Partner pode criar torneio                   | [ ] | [x] | [ ]    | [ ]       | bom produto, mas nao necessario no primeiro corte |
| Torneio tem esporte                          | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Torneio tem data e local                     | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Torneio tem limite de participantes          | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Player pode se inscrever em torneio          | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Sistema impede inscricao duplicada           | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Sistema impede inscricao com torneio fechado | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Torneio tem status open                      | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Torneio tem status in_progress               | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Torneio tem status finalized                 | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Torneio tem status canceled                  | [ ] | [x] | [ ]    | [ ]       |                                                   |
| Chaveamento simples                          | [ ] | [ ] | [x]    | [ ]       | depois da inscricao simples                       |
| Lancamento de resultados                     | [ ] | [ ] | [x]    | [ ]       |                                                   |
| Ranking por torneio                          | [ ] | [ ] | [x]    | [ ]       | depende de resultados e uso real                  |

## 8. Gestao B2B

| Item                                  | MVP | V2  | Futuro | Descartar | Observacoes                                      |
| ------------------------------------- | --- | --- | ------ | --------- | ------------------------------------------------ |
| Partner pode cadastrar alunos         | [ ] | [x] | [ ]    | [ ]       | escola/mensalidade depois do marketplace inicial |
| Partner pode cadastrar mensalidade    | [ ] | [x] | [ ]    | [ ]       |                                                  |
| Partner pode ver alunos ativos        | [ ] | [x] | [ ]    | [ ]       |                                                  |
| Partner pode ver alunos inadimplentes | [ ] | [x] | [ ]    | [ ]       |                                                  |
| Partner pode lancar pagamento manual  | [x] | [ ] | [ ]    | [ ]       | necessario para pagamentos sem gateway           |
| Partner pode ver receita por periodo  | [ ] | [x] | [ ]    | [ ]       | relatorio depois do fluxo operacional            |
| Partner pode ver reservas por periodo | [ ] | [x] | [ ]    | [ ]       |                                                  |
| Partner pode criar eventos            | [ ] | [x] | [ ]    | [ ]       | junto de torneios/eventos                        |

## 9. Evolucao do jogador

| Item                                           | MVP | V2  | Futuro | Descartar | Observacoes                                                |
| ---------------------------------------------- | --- | --- | ------ | --------- | ---------------------------------------------------------- |
| Player tem card esportivo estilo FIFA          | [ ] | [x] | [ ]    | [ ]       | evolucao do jogador fica para V2                           |
| Card mostra esporte principal                  | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Card mostra foto                               | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Card mostra nacionalidade                      | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Card mostra lado de jogo                       | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Card mostra overall                            | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Cor do card muda conforme overall              | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Player tem fundamentos por esporte             | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Fundamento tem score de 0 a 100                | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Overall e calculado a partir dos fundamentos   | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Player pode registrar evolucao mensal          | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Player pode comparar evolucao historica        | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Player pode se autoavaliar                     | [ ] | [x] | [ ]    | [ ]       | primeira versao da evolucao pode comecar por autoavaliacao |
| Professor ou partner pode avaliar player       | [ ] | [x] | [ ]    | [ ]       | mais confiavel para evolucao                               |
| Avaliacao pode exigir confirmacao de professor | [ ] | [ ] | [x]    | [ ]       | camada de governanca posterior                             |
| Sistema calcula ataque                         | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Sistema calcula defesa                         | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Sistema calcula fundamentos                    | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Sistema calcula recursos ou plasticas          | [ ] | [x] | [ ]    | [ ]       |                                                            |
| Player ganha badges ou achievements            | [ ] | [ ] | [x]    | [ ]       | depois da evolucao base                                    |

## 10. Fundamentos e recursos de futevolei

| Item                                                     | MVP | V2  | Futuro | Descartar | Observacoes                  |
| -------------------------------------------------------- | --- | --- | ------ | --------- | ---------------------------- |
| Futevolei tem chapa direita                              | [ ] | [x] | [ ]    | [ ]       | fundamento                   |
| Futevolei tem chapa esquerda                             | [ ] | [x] | [ ]    | [ ]       | fundamento                   |
| Futevolei tem ombro direito                              | [ ] | [x] | [ ]    | [ ]       | fundamento                   |
| Futevolei tem ombro esquerdo                             | [ ] | [x] | [ ]    | [ ]       | fundamento                   |
| Futevolei tem peito                                      | [ ] | [x] | [ ]    | [ ]       | fundamento                   |
| Futevolei tem coxa direita                               | [ ] | [x] | [ ]    | [ ]       | fundamento ou recurso?       |
| Futevolei tem coxa esquerda                              | [ ] | [x] | [ ]    | [ ]       | fundamento ou recurso?       |
| Futevolei tem cabeca para ataque                         | [ ] | [x] | [ ]    | [ ]       | fundamento                   |
| Futevolei tem cabeca para defesa                         | [ ] | [x] | [ ]    | [ ]       | fundamento                   |
| Futevolei tem lobby                                      | [ ] | [x] | [ ]    | [ ]       | ataque                       |
| Futevolei tem diagonal longa                             | [ ] | [x] | [ ]    | [ ]       | ataque                       |
| Futevolei tem diagonal curta                             | [ ] | [x] | [ ]    | [ ]       | ataque                       |
| Futevolei tem shark                                      | [ ] | [x] | [ ]    | [ ]       | recurso/plastica             |
| Futevolei tem voo da aguia                               | [ ] | [x] | [ ]    | [ ]       | recurso/plastica             |
| Futevolei tem pingo                                      | [ ] | [x] | [ ]    | [ ]       | ataque                       |
| Futevolei tem pingo para tras                            | [ ] | [x] | [ ]    | [ ]       | recurso/plastica             |
| Futevolei tem pingo de ombro                             | [ ] | [x] | [ ]    | [ ]       | recurso/plastica             |
| Futevolei tem pingo de costas                            | [ ] | [x] | [ ]    | [ ]       | recurso/plastica             |
| Recursos plasticos funcionam como estrelas de habilidade | [ ] | [x] | [ ]    | [ ]       | parecido com dribles no FIFA |

## 11. Comunidade e retencao

| Item                            | MVP | V2  | Futuro | Descartar | Observacoes                                   |
| ------------------------------- | --- | --- | ------ | --------- | --------------------------------------------- |
| Player pode seguir outro player | [ ] | [ ] | [x]    | [ ]       | social depois do core operacional             |
| Player pode adicionar amigos    | [ ] | [ ] | [x]    | [ ]       |                                               |
| Feed de atividades              | [ ] | [ ] | [x]    | [ ]       |                                               |
| Ranking local                   | [ ] | [ ] | [x]    | [ ]       | depende de evolucao/uso real                  |
| Ranking por esporte             | [ ] | [ ] | [x]    | [ ]       |                                               |
| Ranking por arena               | [ ] | [ ] | [x]    | [ ]       |                                               |
| Ranking por torneio             | [ ] | [ ] | [x]    | [ ]       |                                               |
| Destaque do mes                 | [ ] | [ ] | [x]    | [ ]       |                                               |
| Conquistas                      | [ ] | [ ] | [x]    | [ ]       |                                               |
| Notificacoes                    | [ ] | [x] | [ ]    | [ ]       | importante quando reservas/partidas crescerem |
| Convites para partidas          | [ ] | [x] | [ ]    | [ ]       | depois da partida aberta basica               |
| Chat de partida                 | [ ] | [ ] | [x]    | [ ]       |                                               |
| Grupo de comunidade por arena   | [ ] | [ ] | [x]    | [ ]       |                                               |

## 12. Futuro e experimentos

| Item                                 | MVP | V2  | Futuro | Descartar | Observacoes                    |
| ------------------------------------ | --- | --- | ------ | --------- | ------------------------------ |
| Web3 tokens                          | [ ] | [ ] | [x]    | [ ]       | nao bloquear MVP nem V2        |
| NFT de conquista                     | [ ] | [ ] | [x]    | [ ]       |                                |
| Trofeu digital                       | [ ] | [ ] | [x]    | [ ]       |                                |
| Player card colecionavel             | [ ] | [ ] | [x]    | [ ]       | depois do card funcional       |
| Loja de produtos                     | [ ] | [ ] | [x]    | [ ]       |                                |
| Marketplace de professores           | [ ] | [ ] | [x]    | [ ]       | depois de validar gestao B2B   |
| Recomendacao inteligente de partidas | [ ] | [ ] | [x]    | [ ]       |                                |
| Matchmaking automatico               | [ ] | [ ] | [x]    | [ ]       |                                |
| IA sugerindo treino por fundamento   | [ ] | [ ] | [x]    | [ ]       | depende da evolucao do jogador |
| Integracao com sistema do partner    | [ ] | [ ] | [x]    | [ ]       |                                |

## 13. Decisoes abertas

Use esta secao para anotar decisoes que ainda precisam ser fechadas.

- [x] Decidir se altinha entra no MVP ou fica para depois. Decisao inicial: futuro.
- [x] Decidir se futevolei sera chamado de `futevolei` ou `footvolley` internamente: vai ser chamado de `futevolei`.
- [x] Decidir se beach volleyball entra no MVP. Decisao inicial: sim.
- [x] Decidir se beach tennis entra no MVP. Decisao inicial: sim.
- [x] Decidir se reservas precisam de pagamento no MVP ou podem ser manuais. Decisao inicial: pagamento manual no MVP.
- [x] Decidir se torneios entram no MVP ou ficam para V2. Decisao inicial: V2.
- [x] Decidir se open matches entram no MVP. Decisao inicial: sim.
- [x] Decidir se perfil publico entra no MVP. Decisao inicial: V2.
- [x] Decidir se nivel simples do player entra antes da evolucao completa. Decisao inicial: sim, no MVP (nivel simples sera a categoria por exemplo: iniciante, avancado, amador, profissional).
- [x] Decidir se partner sera arena, escola, clube, organizador ou um conceito unico que cobre todos. Decisao inicial: conceito unico `Partner`.
- [x] Decidir se geolocalizacao entra no MVP. Decisao inicial: V2.
- [x] Decidir se evolucao do jogador entra no MVP. Decisao inicial: V2.
