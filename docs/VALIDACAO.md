# Validação da demonstração

Verificações executadas no ambiente da nuvem em 5 de outubro de 2026.

| Verificação | Resultado |
| --- | --- |
| Instalação repetida pelo script com `npm ci` e lockfile | Passou |
| Build de produção Next.js 16.3.8 | Passou: `/`, `/inicio`, ícone e página 404 |
| TypeScript (`tsc --noEmit`) | Passou |
| ESLint | Passou, sem erros ou avisos |
| Testes de regras de pedido | 23 passaram; nenhum falhou ou foi ignorado |
| Jornadas Playwright no build de produção | 32 passaram: 16 desktop e 16 celular emulado |
| Smoke de inicialização com servidor de desenvolvimento reiniciado | Passou: personalização, persistência, carrinho e `/inicio` |

Os testes de navegador usaram Chromium, desktop de 1440 × 1000 e celular emulado de 390 × 844. Foram verificados busca, categorias sticky, os 20 lanches, hot dogs, porções, bebidas, cinco tamanhos de pizza, limites de sabores, bordas, montagem e edição dos sete combos, quantidades, remoção, limpeza, restauração após recarregar e tratamento de armazenamento corrompido. Entrega e retirada foram exercitadas com validação dos campos e conferência da mensagem e do total. Os dados do cliente foram preservados durante a edição de itens.

A revisão visual incluiu as telas do cardápio, personalização e carrinho em desktop e celular. Não foi encontrada rolagem horizontal indesejada no catálogo ou no carrinho. O modo de movimento reduzido foi verificado. As páginas responderam HTTP 200 e a aplicação de desenvolvimento ficou interativa após o reinício.

O teste de WhatsApp interceptou a abertura da URL e verificou seu texto; nenhum pedido real foi enviado. A demo usa um link sem destinatário fixo, até que um número real seja configurado. Marca, informações comerciais, taxa de entrega e fotos são demonstrativas. O site de referência do anexo não pôde ser consultado por bloqueio de rede; o acabamento foi desenvolvido seguindo os requisitos descritos.

Estes resultados validam a instância atual e os comandos reproduzíveis de instalação/inicialização. Publicação do aplicativo, publicação do ambiente e restauração em uma nova tarefa ainda dependem do fluxo de publicação da plataforma e não foram realizadas por estas verificações.
