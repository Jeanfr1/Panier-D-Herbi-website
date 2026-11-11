# 05 — Rótulos e assets

## Alteração aprovada

Escolha: modelo 1, identificado pelo hero Le quotidien, en plus simple. Modificação solicitada: produtos com o rótulo Panier d’Herbi. Aplicar ao hero, à prateleira e à cena de serviço, e não apenas ao cesto ou à sacola.

## Sistema de embalagem de campanha

Rótulo creme; marca no alto; nome da família em verde; acento lima; janelas que deixam o conteúdo aparecer. Manter a sacola sorridente reconhecível. Garrafas, latas e pacotes recebem superfícies físicas de rótulo, com perspectiva e luz coerentes. Maçãs recebem pequenas etiquetas.

Categorias ilustradas: massas, arroz, conservas, água, sucos, biscoitos, cookies e chips. O conjunto não é um lançamento de linha própria real nem um arquivo industrial. Não há ingredientes, informações nutricionais, quantidade líquida ou códigos comerciais inventados.

## Masters incluídos

| Arquivo | Papel |
| --- | --- |
| `images/campaign/hero-rotulos-panier.png` | Cesto e aro, todos os produtos rotulados |
| `images/campaign/epicerie-rotulos-panier.png` | Grupo de épicerie |
| `images/campaign/boissons-rotulos-panier.png` | Três garrafas rotuladas |
| `images/campaign/snacks-rotulos-panier.png` | Biscoitos, cookies e chips |
| `images/campaign/service-rotulos-panier.png` | Sacola e produtos rotulados |
| `brand/Panier-D-Herbi-Logo-Transparente.png` | Marca atual restaurada, alpha real |

Cópias WebP ficam em dist/assets/images/. A fachada é uma exportação lossless da foto original, com igualdade RGB verificada. Não retocar a arquitetura nem remover atribuição fotográfica.

## Passo a passo reproduzível

1. Preservar as fontes fornecidas em images/originals/ e separar o conceito de estilo.
2. Restaurar a marca atual, sem substituir seu desenho por outro logo.
3. Revisar a prancha escolhida alterando somente os produtos para rótulos próprios.
4. Gerar assets separados usando a marca e a prancha revisada como referência. Prompts completos em docs/generation-prompts.json.
5. Conferir o rótulo em cada embalagem: não deixar garrafa, lata ou pacote anônimo nos masters finais.
6. Exportar WebP, validar decodificação e alpha; preservar os masters PNG.
7. Montar a página com texto e elementos nativos. Não transformar o board inteiro em background.

A restauração do logo é raster assistida por IA, não uma vetorização oficial. As hastes/folhas desenhadas nas embalagens são decoração de campanha e não uma certificação de produto.
