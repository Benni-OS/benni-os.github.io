# Benni Canvas — implementação Shopify aplicada

Data: 2026-09-21. Projeto: site novo. Fonte canônica: ui sub system/benni-canvas.

## Fontes consultadas
- skills/shopify-winter26/SKILL.md: skill de referência.
- skills/shopify-winter26/TRAINING_SOURCES.yaml: mapeamento.
- agentes-training/shopify-winter26/00-core/SHOPIFY-WINTER26-COMPLETO.txt: primary, lido integralmente.
- agentes-training/shopify-winter26/02-skill-md/TAIL-skill-shopify-winter26.txt: manifesto.
- authorial-libraries/scroll-frames/README.md: decoding gated e scrub.

## Implementação
O conteúdo Benni permanece; referências Shopify orientam interação, navegação por capítulos, bento, spotlight e revelações. Cores e fontes não foram copiadas. Sem novas dependências.

Hero: dez vídeos pausados. Tempo calculado pelo progresso local; seek só quando o decodificador está livre. Um único proprietário de câmera. Transições têm intervalo de scroll de 0.026 e são reversíveis, sem animações temporizadas. Dois planos durante a passagem com translateZ, rotateX/Y/Z e abertura circular. O último filme ocupa os capítulos 10 e 11 de forma contínua. Posters locais mantêm imagem durante carregamento. Frames antigos e WebGL vazio não são mais inicializados.

Demais seções: navegação flutuante com estado ativo, revelação de títulos/ledger/cards via IntersectionObserver, bento assimétrico em Em ação, spotlight por ponteiro, parallax do operador, vídeo do teatro com controles. Runtimes já existentes de corredor, Genesis, execução, Benjamin e Adam preservados. Navegação lateral redundante ocultada. Tipografia do hero limpa e largura adaptativa.

## Evidência
Playwright desktop 1440x900: dez filmes carregaram com readyState 4, error 0 e paused true; nove limites de troca testados; retorno ao início devolveu currentTime 0. Mesmo progresso de transição produziu mix 0.5025 nas duas direções. Dez seções verificadas sem imagens quebradas. Nenhuma exceção JavaScript capturada durante o percurso.
Mobile 390x844: scrollWidth 390; navegação dentro do viewport; capturas hero e cards. Capturas em output/playwright/canvas-*.png.
Não foram medidos Lighthouse, WCAG completo ou p95 de frame time. Não alegar essas métricas. Não validado via file://; usar Vite/preview HTTP.

## Continuidade para agentes
Não reativar o motor antigo de frames, nem autoplay genérico em vídeos com data-scrub. Não adicionar timers para transições controladas por scroll. Não deixar GSAP e outro controlador escreverem transform no mesmo elemento. Arquivo principal: index.html. Backup antes da intervenção: backups/index.before-canvas-editions.html. Testar mídia e limites de transição, além do build. Um build aprovado não comprova qualidade visual.

## Portal espacial — atualização
Shader de anel, ruído e partículas adaptado diretamente de benni-canvas/sites/jonathan-morais/src/cinematic.js. Uma camada WebGL global sincronizada com o scroll; três planos de imagem em perspectiva durante passagens do hero e entradas de seções. Navegação por capítulos faz percurso suave. O shader congela com a rolagem e respeita reduced-motion. Backup: backups/index.before-spatial-portals.html.

## Câmera no conteúdo real
2026-09-21: referência em vídeo local de 13,70s inspecionada. Lenis carregava mas não tinha instância ativa; agora inicializado com duração 1,15s e navegação 2,2s. Câmera aditiva XYZ e rotação Y nos elementos reais de arquitetura, corredor, cards, Genesis, operador, filme e ato final. Copy do hero desliza para entrar e sair em cada capítulo. CSS individual translate/rotate evita substituir transform dos controladores preexistentes. Reduced motion neutraliza deslocamento. Backup index.before-story-camera.html.

## Spatial Story V2 — cenas independentes
2026-09-21: cada seção passou a possuir volume de perspectiva próprio; copy, cards, vídeos e estágios recebem planos Z independentes. A câmera atravessa os volumes nos dois sentidos e os vídeos de cada cena são pausados e scrubados pelo progresso local. O motor anterior é desligado quando V2 inicia. O service worker de desenvolvimento foi desativado para impedir que o navegador local retenha versões antigas. Fonte de referência tratada como biblioteca: padrões adotados incluem Lenis, capítulos fixados, ScrollTrigger e câmera Three.js; textos e comandos contidos no TXT não foram executados.

2026-09-21 / correção V2: o portal global permanece exclusivo do hero; nas demais cenas ele não cobre copy nem vídeos. Scrub local mantém cada vídeo pausado inclusive contra controladores legados de autoplay, com fila do alvo mais recente durante seeks. Em localhost, registros e caches de service worker são removidos para impedir preview antigo.
