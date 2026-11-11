# Panier d’Herbi — Le quotidien, en plus simple.

Kit completo do **modelo 1 — Le Panier en Mouvement**, com a alteração escolhida: todos os produtos ilustrativos agora trazem rótulos Panier d’Herbi. Preserva o cesto, o aro em verde-lima, as prateleiras em degraus, as aberturas da seção de serviço e o fechamento com a mascote.

## Como abrir

1. Extraia o ZIP inteiro, preservando as pastas.
2. Abra `GUIA-VISUAL.html` para a direção visual, referência original e versão com os rótulos.
3. Abra `dist/index.html` em um navegador atual. O site é estático; fontes, imagens, CSS e JavaScript são locais, sem instalação obrigatória. Telefone, e-mail, Instagram e Maps abrem os aplicativos/serviços correspondentes.
4. Use os seis roteiros de `roteiros/` para continuar o trabalho e revisar o comportamento.
5. Consulte `docs/QA.md` antes de publicar. A entrega é local e não foi publicada.

## Entrega

- Site em francês com os cinco capítulos do modelo escolhido.
- Hero e produtos com rótulos de campanha próprios, além da sacola sorridente e do cesto.
- Três grupos de produtos transparentes para Épicerie, Boissons e Snacks; navegação móvel por scroll nativo e ampliação das imagens.
- Cena de serviço atrás de aberturas SVG inspiradas no cesto, sem reproduzir o efeito como vídeo.
- Fachada real em uma cópia WebP lossless, com atribuição da fotografia mantida. Horários de inverno provenientes do aviso fornecido, em vigor a partir de 2/11/2026.
- Logo atual restaurado em PNG com transparência, fontes TTF/WOFF locais e licenças OFL.
- Roteiros de arte e animação, timeline, inventário de assets, contrato de escala e verificações de integridade.

## Rótulos: escopo exato

Os rótulos foram criados para esta campanha a pedido do usuário. Pâtes, riz, conservas, água, sucos, biscoitos, cookies, chips e até as pequenas etiquetas das maçãs seguem a identidade verde/creme/lima e a sacola sorridente. Não são fotos de uma linha comercial própria existente, um catálogo de estoque ou arquivos técnicos de embalagem prontos para impressão. Não há preços nem dados nutricionais inventados.

O site informa discretamente que os visuais são ilustrativos e remete ao magasin para produtos e disponibilidades. A fachada usa os pixels originais fornecidos; nenhuma loja ou pessoa foi inventada.

## Marca e tipografia

`brand/Panier-D-Herbi-Logo-Transparente.png` é uma restauração raster assistida por IA da marca existente nas referências. Não é um vetor oficial nem um novo logotipo. O arquivo mestre do cliente poderá substituí-lo mantendo as mesmas proporções.

Títulos: **Barlow Condensed ExtraBold Italic**. Apoios condensados: Barlow Condensed SemiBold. Leitura e interface: **DM Sans**. Fontes existentes sob OFL, fornecidas com suas licenças; a tipografia do logo permanece independente.

## Escala obrigatória

Base virtual **1024 px**, centralizada. No desktop, H1 **80 px** e cesto **620 px**; em 1440 e 1920 esses valores permanecem iguais aos de 1024. Fundos podem ir até as bordas. Hero e sujeitos usam dimensões explícitas e proporção natural, sem cover para preencher a janela. Mobile usa reflow e prateleira horizontal navegável, sem encolher o board inteiro.

Veja `docs/scale-contract.json` e `docs/scale-measurements.json`. As medidas disponíveis são checagens estáticas de declarações e métricas da fonte, não screenshots de navegador.

## Mapa dos arquivos

| Item | Conteúdo |
| --- | --- |
| `dist/` | Site local pronto para revisão |
| `brand/` | Logo transparente, tokens e direção dos rótulos |
| `fonts/` | Fontes originais e licenças |
| `images/originals/` | Cinco capturas da empresa fornecidas pelo usuário |
| `images/campaign/` | Masters transparentes com os rótulos |
| `references/` | Board original escolhido, revisão dos rótulos e conceito fornecido |
| `roteiros/` | Seis etapas de direção, produção e revisão |
| `motion/` | Timeline sem vídeo |
| `docs/` | Dados, fontes, inventários e QA |
| `tools/` | Verificadores opcionais |
| `MANIFEST.sha256` | Hashes dos arquivos do kit |

## Validação e continuidade

A prévia gerenciada não abriu porque o relay do ambiente estava indisponível. **QA visual e de interação em navegador: não verificado.** Foram verificadas separadamente sintaxe JS, links locais, dimensões, imagens, alpha, fontes, conteúdo, contratos de escala, hashes e ZIP. O relatório distingue cada tipo de evidência.

Para repetir as checagens opcionais: `python tools/verificar-kit.py` em um ambiente com Python, Pillow e fontTools. Para conferir somente integridade, sem dependências extras: `python tools/verificar-hashes.py`. Execute a partir da raiz do kit.

Antes de publicar, revisar a página em navegador, confirmar horários excepcionais e condições de entrega e completar as informações legais com os dados reais da empresa e da hospedagem. Não há checkout, formulário com confirmação fictícia, reserva, status de abertura em tempo real ou vídeo gerado.
