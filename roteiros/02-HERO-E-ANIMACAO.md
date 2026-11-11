# 02 — Hero e movimento

## Cena

Headline: LE QUOTIDIEN, / EN PLUS SIMPLE. Fundo claro com luz difusa, cesto verde, alças escuras e aro lima passando atrás e à frente. Agora cada embalagem tem rótulo Panier d’Herbi. Os objetos mantêm textura, janelas transparentes e volume; o rótulo não fica como um adesivo digital flutuando fora da embalagem.

Logo e navegação ficam acima. Ações: Découvrir les rayons e Venir au magasin. Sem pessoa copiada do conceito e sem personagem apresentado como dono ou funcionário.

## Timeline implementada

| Evento | Tempo | Movimento |
| --- | --- | --- |
| Entrada do texto | 0–1 s | Opacidade e 16 px de deslocamento vertical |
| Assentamento do cesto e aro | 0–1,6 s | 20 px horizontal, 24 px vertical, rotação de 2° a 0° |
| Respiração do conjunto | Após 1,6 s | Até 5 px e ±0,25°, ciclo alternado de 8 s |
| Entrada de texto por seção | Ao entrar 12% na área visível | 17 px e opacidade, 0,8 s, uma vez |
| Seleção de rayon | Ação do visitante | Grupo sobe 5 px; zoom por clique ou teclado |
| Janela do serviço | Ao entrar no campo visual | Revelação do plano recortado, 1,1 s |

A implementação usa um plano principal do hero. O aro já atravessa o volume na imagem; não é uma órbita 3D independente. Produtos não são objetos físicos separados no código atual. Para uma evolução com entrada individual de itens, seriam necessários novos recortes aprovados. Não prometer esse comportamento como se já estivesse implementado.

## Regras

Scroll nativo; nenhum pinning de 100vh ou interceptação de roda/toque. Sem vídeo, contagem de carregamento ou espera para liberar o conteúdo. Sem rotação constante do cesto que vire os rótulos para trás.

Com movimento reduzido, retirar entradas, respiração e scroll suave. A pausa manual do rodapé mostra os textos e interrompe o movimento. O conteúdo é visível por padrão se JavaScript ou IntersectionObserver não estiver disponível. Não há rastreamento nem preferência gravada em conta.

Desktop: base 1024, cesto 620 px e título 80 px em 1024/1440/1920. Tablet: cesto 520 px e H1 68 px. Mobile até 680: cesto 365 px e H1 56 px; texto e imagem ocupam áreas próprias, sem reduzir a prancha inteira.
