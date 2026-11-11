# Validação — Panier d’Herbi, Édition signée

**Checagens estáticas: 182/182 aprovadas.**

**QA visual e de interação em navegador: NÃO VERIFICADO.** O comando de prévia retornou `preview relay unavailable: No such file or directory`. Nenhum servidor/navegador alternativo foi iniciado para contornar a infraestrutura.

## Executado

Referências locais e âncoras; proporções intrínsecas; sintaxe JS; JSON; cinco capítulos e hero escolhido; horário de inverno; texto público em francês; fontes/licenças e glyphs; decodificação de cada imagem; canal alpha dos recortes e logo; igualdade exata RGB da fachada com o original; parâmetros de escala e métricas tipográficas em 375, 768, 1024, 1440 e 1920 px.

Em 1024/1440/1920: H1 80 px, cesto 620 px, base central 1024 px. O cálculo usa avanços da fonte e tracking e não substitui a medição em navegador. O mobile usa reflow com quebra extra nos rayons e scroll nativo da prateleira.

## Inspeção dos rótulos e assets

Prancha original e revisão com rótulos foram inspecionadas, assim como marca, hero, épicerie, boissons, snacks e serviço. As embalagens dos masters finais apresentam a identidade Panier d’Herbi, incluindo água e conservas. A restauração da marca é raster, não mestre vetorial oficial. São mockups de campanha, sem afirmação de estoque ou de linha própria real.

## Pendente em navegador

Enquadramento e sobreposições por breakpoint, legibilidade real dos rótulos e textos, estabilidade no carregamento, menu e âncoras, seleção/swipe dos rayons, ampliação, Escape, clique externo, retorno de foco, links em aplicativos reais, pausa, preferência reduzida e ausência de transbordamento horizontal fora da prateleira. Não foram efetuadas chamadas, mensagens, e-mails, pedidos ou publicação.

## Integridade

Os hashes de todos os arquivos estão em MANIFEST.sha256. O relatório externo de release registra o hash do ZIP e a verificação CRC de todas as entradas, além da comparação com o manifesto. Isso evita referências circulares ao próprio ZIP.
