# Sua Lanchonete Aqui

Cardápio online demonstrativo para lanchonetes de Lages/SC, criado com Next.js 16, React 19, TypeScript e Tailwind CSS 4. O cliente entra diretamente no cardápio em `/`; a apresentação da lanchonete fica em `/inicio`.

## Desenvolvimento

Node.js 24.19.0 foi validado neste ambiente; o mínimo do Next.js é 20.9. Não há banco de dados, serviço de autenticação ou segredo necessário para executar esta versão.

```bash
npm ci
npm run dev
```

No ambiente da nuvem, use um cache dentro da área gravável:

```bash
cd /workspace/card-pio-premium
export NPM_CONFIG_CACHE=/workspace/.cache/npm
npm ci --no-audit --no-fund
npm run dev
```

O servidor usa a porta 3000. Para escolher outra: `npm run dev -- --port 3001`. `allowedDevOrigins` inclui `127.0.0.1` para permitir a recarga de desenvolvimento nas verificações locais. Os processos precisam ser iniciados novamente em cada nova tarefa; use o checkout existente, sem criar worktrees.

## O que está implementado

- Busca instantânea sem distinção de acentos, categorias sticky, carregamento progressivo de opções e destaques de combos.
- 20 X-Lanches, 10 hot dogs, 40 sabores de pizza, 10 porções, 14 bebidas e 7 combos.
- Personalização por modal/bottom sheet: ingredientes removidos, adicionais, quantidade e observações.
- Pizzas com cinco tamanhos, seleção de sabores em partes iguais, limites por tamanho e bordas. A regra padrão cobra o sabor de maior valor, sem somar os sabores.
- Combos com lanches selecionáveis, bebidas, porções e pizzas conforme a composição; acréscimos premium ficam explícitos.
- Carrinho com edição de qualquer item, quantidades, remoção e confirmação para limpar. Itens são salvos em `localStorage` e preços são recalculados a partir do catálogo.
- Checkout único com entrega ou retirada, validação dos dados e geração de mensagem organizada para o WhatsApp, com opção de conferir e copiar.
- Interface responsiva, contenção de foco nos modais, Escape para fechar, estados acessíveis e respeito a `prefers-reduced-motion`.
- Fotos e fontes locais, otimização de imagens pelo Next.js, lazy loading e dimensões reservadas para evitar mudanças de layout.

## Editar a demonstração

Todos os preços são números inteiros em **centavos**. `2900` corresponde a R$ 29,00.

| Arquivo em `src/data`       | Conteúdo                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `restaurant.ts`             | Marca, contato, cidade, horários, endereço, taxa demonstrativa e chave do carrinho |
| `burgers.ts` / `hotdogs.ts` | Produtos, ingredientes, valores e adicionais permitidos                            |
| `pizzas.ts`                 | Sabores, categorias e acréscimos                                                   |
| `pizza-sizes.ts`            | Tamanhos, fatias, limites de sabores, preço base, multiplicadores e regra de preço |
| `extras.ts`                 | Adicionais e bordas                                                                |
| `portions.ts` / `drinks.ts` | Porções e bebidas                                                                  |
| `combos.ts`                 | Composição, preço, economia, lanches, bebidas e tamanho de pizza incluídos         |
| `catalog.ts`                | Adaptador do catálogo, ponto de integração para uma futura API ou Supabase         |

As regras e a mensagem do pedido estão em `src/lib/order.ts`. A interface não armazena preços enviados pelo navegador como fonte de verdade. Carrinhos antigos incompatíveis com as regras atuais são descartados item a item.

`restaurant.whatsapp` começa vazio: a mensagem abre no WhatsApp **sem destinatário predefinido**, permitindo escolher um contato. Para uso comercial, configure o número real com DDI e DDD (somente dígitos), `isDemo: false`, endereço, horários e os valores corretos. Configure `instagram` com o URL real para exibir esse link em `/inicio`. A taxa de entrega atual é demonstrativa e fixa; não há cálculo por distância.

A marca, a história e os dados comerciais são fictícios. As imagens foram geradas para a demonstração e compartilhadas entre produtos da mesma categoria; substitua-as pelas fotos reais para representar ingredientes e apresentações de cada produto. O mapa abre a cidade de Lages, não o endereço fictício. A demonstração está configurada com `noindex`.

O carrinho persiste neste navegador e dispositivo. Os dados do cliente permanecem em memória durante a sessão e não são enviados a um servidor; são incluídos na mensagem apenas ao finalizar. O site não registra, aceita ou confirma o pedido por conta própria: o cliente ainda precisa enviar a mensagem no WhatsApp.

## Verificações

```bash
npm run build
npm run typecheck
npm run lint
npm test
E2E_PRODUCTION=1 npm run test:e2e
```

Para uma checagem rápida de inicialização, com o servidor de desenvolvimento já em execução: `npm run test:smoke`. Ele abre um navegador independente, personaliza um lanche, verifica persistência e carrinho, e visita `/inicio`. Para outra porta, defina `SMOKE_BASE_URL`.

Os testes unitários cobrem preços, todos os tamanhos, regras de combos, validação, restauração e mensagens de entrega/retirada. Os testes de navegador cobrem as jornadas em desktop e celular emulado, incluindo busca, categorias, edição e persistência.

Playwright inicia e encerra seu próprio servidor na porta 3100, que deve estar livre. Para mudar: `E2E_PORT=3101 E2E_PRODUCTION=1 npm run test:e2e`. Por padrão, usa `/usr/bin/chromium` quando disponível, como nesta nuvem. Em outra máquina, instale o navegador com `npx playwright install chromium` ou defina `E2E_CHROMIUM_EXECUTABLE_PATH` para um Chromium existente. As verificações interceptam a abertura do WhatsApp e não enviam pedidos reais. Resultados ficam em `playwright-report/` e `test-results/`, ignorados pelo Git.

## Produção

```bash
npm run build
npm run start
```

O build gera as páginas estáticas e mantém a otimização de imagens no servidor Next.js. O projeto pode ser hospedado em uma plataforma compatível com Next.js ou em um servidor Node.js. A publicação do aplicativo e a publicação do ambiente da nuvem são ações separadas.
