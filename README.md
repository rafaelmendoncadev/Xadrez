# ♔ Jogo de Xadrez Completo

Um jogo de xadrez interativo e visualmente atrativo implementado em HTML5, CSS3 e JavaScript puro, com IA inteligente e três níveis de dificuldade.

## 🎮 Características

### ✅ Funcionalidades Implementadas

- **Regras Completas do Xadrez**
  - Movimentos de todas as peças (peão, torre, cavalo, bispo, rainha, rei)
  - Roque (pequeno e grande)
  - En passant
  - Promoção de peão
  - Xeque e xeque-mate
  - Empate por afogamento

- **Interface Moderna e Elegante**
  - Design responsivo com gradientes e efeitos visuais
  - Animações suaves para movimentos
  - Destaque visual para peças selecionadas e movimentos válidos
  - Coordenadas do tabuleiro (a-h, 1-8)

- **Sistema de IA com Três Níveis**
  - **Iniciante**: Profundidade 2-3, avaliação simples
  - **Normal**: Profundidade 4-5, considera posição das peças
  - **Profissional**: Profundidade 6-8, avaliação sofisticada

- **Recursos Adicionais**
  - Timer para cada jogador
  - Histórico de movimentos em notação algébrica
  - Lista de peças capturadas
  - Desfazer movimento
  - Oferecer empate / Desistir
  - Modal de promoção de peão

## 🚀 Como Jogar

### Instalação
1. Baixe todos os arquivos para uma pasta
2. Abra o arquivo `index.html` em um navegador web moderno
3. O jogo carregará automaticamente

### Controles
- **Clique** em uma peça para selecioná-la
- **Clique** em uma casa válida para mover a peça
- **Seletor de Dificuldade**: Escolha entre Iniciante, Normal ou Profissional
- **Botões de Controle**:
  - Novo Jogo: Reinicia a partida
  - Desfazer: Volta um movimento
  - Oferecer Empate: Propõe empate
  - Desistir: Abandona a partida

### Promoção de Peão
Quando um peão chega à última linha, um modal aparecerá para escolher a peça de promoção (Rainha, Torre, Bispo ou Cavalo).

## 🧠 Inteligência Artificial

### Algoritmo
- **Minimax com Poda Alpha-Beta** para otimização
- **Função de Avaliação Progressiva** baseada na dificuldade
- **Ordenação de Movimentos** para melhor performance

### Níveis de Dificuldade

#### 🟢 Iniciante
- Profundidade de busca: 2-3 movimentos
- Avaliação simples baseada no valor das peças
- Ocasionalmente faz movimentos sub-ótimos
- Ideal para jogadores novos no xadrez

#### 🟡 Normal
- Profundidade de busca: 4-5 movimentos
- Considera posição das peças no tabuleiro
- Reconhece padrões táticos básicos
- Desenvolvimento adequado na abertura

#### 🔴 Profissional
- Profundidade de busca: 6-8 movimentos
- Avaliação sofisticada incluindo:
  - Estrutura de peões
  - Segurança do rei
  - Controle do centro
  - Atividade das peças
- Conhecimento de aberturas principais

## 🎨 Design e Interface

### Características Visuais
- **Esquema de Cores**: Tons de madeira e mármore
- **Animações**: Transições suaves e efeitos hover
- **Responsividade**: Adapta-se a diferentes tamanhos de tela
- **Feedback Visual**: Destaques para seleção, movimentos válidos e xeque

### Elementos da Interface
- **Tabuleiro 8x8** com coordenadas
- **Painel Lateral** com controles e informações
- **Histórico de Movimentos** em tempo real
- **Timers** para cada jogador
- **Lista de Peças Capturadas**

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)
- **Dispositivos**: Desktop, tablet e mobile
- **Requisitos**: JavaScript habilitado

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com Flexbox e Grid
- **JavaScript ES6+**: Lógica do jogo e IA
- **Fontes**: Inter (Google Fonts)
- **Ícones**: Unicode chess symbols

## 🎯 Recursos Técnicos

### Validação de Movimentos
- Verificação rigorosa da legalidade
- Prevenção de movimentos que deixem o rei em xeque
- Detecção automática de situações especiais

### Performance
- Otimização para resposta rápida da IA (1-3 segundos)
- Código modular para fácil manutenção
- Comentários detalhados explicando a lógica

### Acessibilidade
- Interface intuitiva para iniciantes
- Feedback visual claro
- Controles simples e diretos

## 🏆 Como Vencer

- **Xeque-mate**: Capture o rei adversário
- **Desistência**: Oponente abandona a partida
- **Empate**: Acordo mútuo ou afogamento

## 📝 Notação Algébrica

O jogo utiliza notação algébrica padrão:
- **e4**: Peão para e4
- **Nf3**: Cavalo para f3
- **O-O**: Roque pequeno
- **e8=Q**: Promoção de peão para rainha

## 🤝 Contribuições

Este projeto foi desenvolvido como uma implementação completa de um jogo de xadrez com IA. Sinta-se à vontade para:

- Reportar bugs
- Sugerir melhorias
- Contribuir com código
- Compartilhar feedback

## 📄 Licença

Este projeto é de código aberto e está disponível para uso educacional e pessoal.

---

**Divirta-se jogando xadrez! ♔♛** 