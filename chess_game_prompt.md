# Prompt para Agente de IA: Jogo de Xadrez Completo

Crie um jogo de xadrez interativo e visualmente atrativo com as seguintes especificações:

## Requisitos Funcionais

### 1. Mecânicas do Jogo
- Implementar todas as regras oficiais do xadrez, incluindo:
  - Movimentos específicos de cada peça (peão, torre, cavalo, bispo, rainha, rei)
  - Roque (pequeno e grande)
  - En passant
  - Promoção de peão
  - Xeque e xeque-mate
  - Empate por afogamento, repetição tripla ou regra dos 50 movimentos

### 2. Interface do Usuário
- Tabuleiro 8x8 com coordenadas (a-h, 1-8)
- Peças claramente distinguíveis com ícones ou símbolos elegantes
- Destaque visual para:
  - Peça selecionada
  - Movimentos válidos
  - Último movimento realizado
  - Rei em xeque
- Painel lateral com informações do jogo (turno atual, capturas, tempo)

### 3. Sistema de IA com Três Níveis

#### Nível Iniciante:
- Profundidade de busca: 2-3 movimentos
- Avaliação simples baseada em valor das peças
- Ocasionalmente faz movimentos sub-ótimos propositalmente
- Foco em capturar peças e evitar capturas óbvias

#### Nível Normal:
- Profundidade de busca: 4-5 movimentos
- Avaliação considerando posição das peças
- Reconhece padrões táticos básicos (garfos, cravadas, ataques duplos)
- Desenvolvimento adequado na abertura

#### Nível Profissional:
- Profundidade de busca: 6-8 movimentos
- Avaliação sofisticada incluindo:
  - Estrutura de peões
  - Segurança do rei
  - Controle do centro
  - Atividade das peças
- Conhecimento de aberturas principais
- Técnicas de final de jogo

## Requisitos Visuais

### 1. Design Moderno e Elegante
- Esquema de cores profissional (ex: tons de madeira, mármore ou minimalista)
- Animações suaves para movimentos das peças
- Efeitos visuais sutis (sombras, gradientes, hover effects)
- Design responsivo para diferentes tamanhos de tela

### 2. Elementos de Interface
- Botões estilizados para:
  - Novo jogo
  - Seleção de dificuldade
  - Desfazer movimento
  - Oferecer empate
  - Desistir
- Indicador visual do nível de dificuldade ativo
- Histórico de movimentos em notação algébrica
- Timer opcional para cada jogador

### 3. Feedback Visual
- Confirmação visual de movimentos
- Notificações elegantes para xeque, xeque-mate, empate
- Destaque sutil das peças capturadas

## Características Técnicas

### 1. Algoritmo de IA
- Implementar algoritmo Minimax com poda Alpha-Beta
- Função de avaliação progressiva conforme o nível
- Ordenação de movimentos para otimização
- Tabela de transposição para memorização

### 2. Validação de Movimentos
- Verificação rigorosa da legalidade dos movimentos
- Detecção automática de situações especiais
- Prevenção de movimentos que deixem o próprio rei em xeque

### 3. Persistência (Opcional)
- Salvar estado do jogo
- Histórico de partidas
- Estatísticas de desempenho contra cada nível

## Instruções Específicas de Implementação

1. **Utilize tecnologias web modernas** (HTML5, CSS3, JavaScript ou React)
2. **Priorize a experiência do usuário** com transições suaves e feedback imediato
3. **Otimize o desempenho** para que a IA responda em tempo adequado (1-3 segundos máximo)
4. **Torne o código modular** para facilitar ajustes nos níveis de dificuldade
5. **Inclua comentários detalhados** explicando a lógica da IA e validações

## Resultado Esperado

Um jogo de xadrez completo, funcional e visualmente atrativo que:
- Seja intuitivo para iniciantes
- Ofereça desafio adequado para jogadores experientes
- Tenha aparência profissional e moderna
- Funcione perfeitamente em navegadores web modernos
- Proporcione uma experiência de jogo fluida e envolvente

**Foque em criar uma aplicação que seja tanto tecnicamente sólida quanto esteticamente agradável, oferecendo uma experiência de xadrez digital de alta qualidade.**