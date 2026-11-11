# 06 — Validação e entrega

## Escala

Verificar 375, 768, 1024, 1440 e 1920 px. Em desktop o título permanece 80 px e o cesto 620 px. O conteúdo central tem no máximo 1024 px, com fundos indo até a borda. Não multiplicar viewport pela largura raster do PNG de 772 px. Esse erro produz títulos e produtos exagerados e não deve voltar.

Hero e macro não usam cover para preencher a janela. Mobile reorganiza os textos, cria a quebra extra do título dos rayons e usa prateleira horizontal nativa. A imagem não vira uma tela gigante.

## Revisão visual e funcional em navegador

Quando o ambiente permitir, revisar enquadramentos, sobreposições e rótulos em todos os breakpoints. Testar menu, âncoras, as três famílias, scroll por toque, botões de ampliação, Escape, clique externo, retorno de foco, horário, links, pausa e movimento reduzido. Confirmar ausência de transbordamento horizontal fora da prateleira intencional.

No ambiente desta entrega, o relay da prévia gerenciada estava indisponível. **QA visual e de interação em navegador permanece não verificado.** Não substituir essa revisão por uma prancha gerada ou alegar que o cálculo de escala é um teste em navegador.

## Integridade

Executar ferramentas/verificações a partir da raiz. Decodificar cada imagem e fonte, testar canal alpha, sintaxe JS, âncoras e referências locais. Comparar a fachada com o original. Gerar o manifesto SHA-256 e conferir os hashes.

Criar ZIP com um diretório raiz único e nomes relativos; reabrir, validar CRC de todas as entradas e comparar cada arquivo com o manifesto. Guardar o hash do ZIP no relatório externo para evitar autorreferência. Verificar novamente a cópia final disponibilizada.

## Publicação futura

Kit local sem publicação. A pasta dist já contém o site estático. O manifest local informa apenas essa pasta, sem inventar project_id. Uma publicação posterior deve registrar a identidade real do projeto, concluir a revisão em navegador e confirmar dados comerciais, imagens e informações legais com o cliente.

Não há envio de mensagens, ligação feita automaticamente, pedido, pagamento ou vídeo gerado nesta entrega.
