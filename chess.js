// Classe principal do jogo de xadrez
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameState = 'waiting'; // Aguardando seleção de nível
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.lastMove = null;
        this.difficulty = 'normal';
        this.timers = { white: 0, black: 0 };
        this.timerInterval = null;
        this.isAIThinking = false;
        this.selectedLevel = null;
        
        this.initializeUI();
        this.setupEventListeners();
        this.showLevelSelection();
    }

    // Inicialização do tabuleiro
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Posicionamento inicial das peças
        const initialSetup = {
            0: ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            1: ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            6: ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            7: ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
        };

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (initialSetup[row]) {
                    board[row][col] = {
                        type: initialSetup[row][col],
                        color: row < 2 ? 'black' : 'white'
                    };
                }
            }
        }

        return board;
    }

    // Inicialização da interface
    initializeUI() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    square.innerHTML = this.getPieceSymbol(piece);
                    square.classList.add('piece');
                }
                
                chessboard.appendChild(square);
            }
        }
    }

    // Símbolos das peças
    getPieceSymbol(piece) {
        const symbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        return symbols[piece.color][piece.type];
    }

    // Configuração dos event listeners
    setupEventListeners() {
        const chessboard = document.getElementById('chessboard');
        chessboard.addEventListener('click', (e) => this.handleSquareClick(e));

        // Controles do jogo
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('undo-move').addEventListener('click', () => this.undoMove());
        document.getElementById('offer-draw').addEventListener('click', () => this.offerDraw());
        document.getElementById('resign').addEventListener('click', () => this.resign());

        // Seletor de dificuldade
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        // Modal de promoção
        document.querySelectorAll('.promotion-piece').forEach(piece => {
            piece.addEventListener('click', (e) => {
                this.handlePromotion(e.target.dataset.piece);
            });
        });

        // Modal de confirmação
        document.getElementById('confirm-yes').addEventListener('click', () => this.confirmAction());
        document.getElementById('confirm-no').addEventListener('click', () => this.hideConfirmModal());
    }

    // Manipulação de cliques no tabuleiro
    handleSquareClick(event) {
        if (this.isAIThinking || this.gameState !== 'playing') return;

        const square = event.target.closest('.square');
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.board[row][col];

        // Limpar apenas seleções e movimentos válidos, manter último movimento
        this.clearHighlights();

        // Se clicou em uma peça do jogador atual
        if (piece && piece.color === this.currentPlayer) {
            this.selectedSquare = { row, col };
            this.validMoves = this.getValidMoves(row, col);
            this.highlightSquare(row, col, 'selected');
            this.highlightValidMoves();
        }
        // Se clicou em um movimento válido
        else if (this.selectedSquare && this.isValidMove(row, col)) {
            this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
        }
    }

    // Obter movimentos válidos para uma peça
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];

        if (piece.type === 'pawn') {
            this.getPawnMoves(row, col, piece.color, moves);
        } else if (piece.type === 'knight') {
            this.getKnightMoves(row, col, piece.color, moves);
        } else {
            const directions = this.getPieceDirections(piece.type);
            for (const [dRow, dCol] of directions) {
                this.getSlidingMoves(row, col, dRow, dCol, piece.color, moves);
            }
        }

        // Filtrar movimentos que deixariam o rei em xeque
        return moves.filter(move => !this.wouldLeaveKingInCheck(row, col, move.row, move.col));
    }

    // Direções de movimento das peças
    getPieceDirections(pieceType) {
        const directions = {
            rook: [[-1, 0], [1, 0], [0, -1], [0, 1]],
            bishop: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
            queen: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
            king: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
        };
        return directions[pieceType] || [];
    }

    // Movimentos do peão
    getPawnMoves(row, col, color, moves) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Movimento para frente
        if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Movimento duplo do início
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Capturas diagonais
        for (const dCol of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        // En passant (simplificado)
        if (this.lastMove && this.lastMove.piece.type === 'pawn') {
            const lastPiece = this.board[this.lastMove.toRow][this.lastMove.toCol];
            if (lastPiece && lastPiece.type === 'pawn') {
                const lastStartRow = this.lastMove.piece.color === 'white' ? 6 : 1;
                if (Math.abs(this.lastMove.fromRow - this.lastMove.toRow) === 2) {
                    if (row === this.lastMove.toRow && Math.abs(col - this.lastMove.toCol) === 1) {
                        moves.push({ 
                            row: row + direction, 
                            col: this.lastMove.toCol,
                            enPassant: true 
                        });
                    }
                }
            }
        }
    }

    // Movimentos do peão para um tabuleiro específico
    getPawnMovesForBoard(row, col, color, moves, board) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Movimento para frente
        if (this.isValidPosition(row + direction, col) && !board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Movimento duplo do início
            if (row === startRow && !board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Capturas diagonais
        for (const dCol of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    // Movimentos do cavalo
    getKnightMoves(row, col, color, moves) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    // Movimentos do cavalo para um tabuleiro específico
    getKnightMovesForBoard(row, col, color, moves, board) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    // Movimentos deslizantes (torre, bispo, rainha, rei)
    getSlidingMoves(row, col, dRow, dCol, color, moves) {
        const piece = this.board[row][col];
        const maxDistance = piece.type === 'king' ? 1 : 7;

        for (let distance = 1; distance <= maxDistance; distance++) {
            const newRow = row + dRow * distance;
            const newCol = col + dCol * distance;
            
            if (!this.isValidPosition(newRow, newCol)) break;
            
            const targetPiece = this.board[newRow][newCol];
            if (!targetPiece) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
        }
    }

    // Movimentos deslizantes para um tabuleiro específico
    getSlidingMovesForBoard(row, col, dRow, dCol, color, moves, board) {
        const piece = board[row][col];
        const maxDistance = piece.type === 'king' ? 1 : 7;

        for (let distance = 1; distance <= maxDistance; distance++) {
            const newRow = row + dRow * distance;
            const newCol = col + dCol * distance;
            
            if (!this.isValidPosition(newRow, newCol)) break;
            
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
        }
    }

    // Verificar se uma posição é válida
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // Verificar se um movimento é válido
    isValidMove(row, col) {
        return this.validMoves.some(move => move.row === row && move.col === col);
    }

    // Verificar se um movimento deixaria o rei em xeque
    wouldLeaveKingInCheck(fromRow, fromCol, toRow, toCol) {
        const tempBoard = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
        const capturedPiece = tempBoard[toRow][toCol];
        
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = null;

        const kingPosition = this.findKing(this.currentPlayer, tempBoard);
        return this.isSquareUnderAttack(kingPosition.row, kingPosition.col, this.currentPlayer === 'white' ? 'black' : 'white', tempBoard);
    }

    // Encontrar a posição do rei
    findKing(color, board = this.board) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Verificar se uma casa está sob ataque
    isSquareUnderAttack(row, col, attackingColor, board = this.board) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === attackingColor) {
                    const moves = this.getValidMovesForPiece(r, c, piece, board);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Obter movimentos válidos para uma peça (sem verificar xeque)
    getValidMovesForPiece(row, col, piece, board) {
        const moves = [];
        
        if (piece.type === 'pawn') {
            this.getPawnMovesForBoard(row, col, piece.color, moves, board);
        } else if (piece.type === 'knight') {
            this.getKnightMovesForBoard(row, col, piece.color, moves, board);
        } else {
            const directions = this.getPieceDirections(piece.type);
            for (const [dRow, dCol] of directions) {
                this.getSlidingMovesForBoard(row, col, dRow, dCol, piece.color, moves, board);
            }
        }
        
        return moves;
    }

    // Realizar um movimento
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Registrar o movimento
        const move = {
            fromRow, fromCol, toRow, toCol,
            piece: { ...piece },
            captured: capturedPiece ? { ...capturedPiece } : null,
            notation: this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece)
        };

        // Executar o movimento
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Captura en passant
        if (move.enPassant) {
            this.board[this.lastMove.toRow][this.lastMove.toCol] = null;
            move.captured = { type: 'pawn', color: this.lastMove.piece.color };
        }

        // Promoção de peão
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.showPromotionModal(toRow, toCol);
            return;
        }

        this.completeMove(move);
    }

    // Completar movimento após promoção
    completeMove(move) {
        this.moveHistory.push(move);
        this.lastMove = move;

        // Adicionar peça capturada à lista
        if (move.captured) {
            this.capturedPieces[this.currentPlayer].push(move.captured);
        }

        // Trocar jogador primeiro
        const nextPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.currentPlayer = nextPlayer;
        this.selectedSquare = null;
        this.validMoves = [];

        // Verificar xeque e xeque-mate no jogador que acabou de jogar
        const kingPosition = this.findKing(nextPlayer);
        if (kingPosition) {
            const isInCheck = this.isSquareUnderAttack(kingPosition.row, kingPosition.col, this.currentPlayer === 'white' ? 'black' : 'white');

            if (isInCheck) {
                const isCheckmate = this.isCheckmate(nextPlayer);
                if (isCheckmate) {
                    this.gameState = 'checkmate';
                    this.updateGameStatus(`${this.currentPlayer === 'white' ? 'Brancas' : 'Pretas'} vencem por xeque-mate!`);
                } else {
                    this.updateGameStatus(`${nextPlayer === 'white' ? 'Brancas' : 'Pretas'} estão em xeque!`);
                }
            } else {
                const isStalemate = this.isStalemate(nextPlayer);
                if (isStalemate) {
                    this.gameState = 'stalemate';
                    this.updateGameStatus('Empate por afogamento!');
                }
            }
        }

        // Limpar todas as marcações e atualizar display
        this.clearAllHighlights();
        this.updateDisplay();

        // Fazer movimento da IA se for o turno dela
        if (this.currentPlayer === 'black' && this.gameState === 'playing') {
            this.makeAIMove();
        }
    }

    // Verificar xeque-mate
    isCheckmate(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Verificar afogamento
    isStalemate(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Notação algébrica do movimento
    getMoveNotation(fromRow, fromCol, toRow, toCol, piece, captured) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        let notation = '';
        
        if (piece.type !== 'pawn') {
            notation += piece.type === 'knight' ? 'N' : piece.type.charAt(0).toUpperCase();
        }
        
        if (captured) {
            if (piece.type === 'pawn') {
                notation += files[fromCol];
            }
            notation += 'x';
        }
        
        notation += files[toCol] + ranks[toRow];
        
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            notation += '=Q';
        }
        
        return notation;
    }

    // Mostrar modal de promoção
    showPromotionModal(row, col) {
        const modal = document.getElementById('promotion-modal');
        modal.classList.remove('hidden');
        modal.dataset.row = row;
        modal.dataset.col = col;
    }

    // Manipular promoção
    handlePromotion(pieceType) {
        const modal = document.getElementById('promotion-modal');
        const row = parseInt(modal.dataset.row);
        const col = parseInt(modal.dataset.col);
        
        this.board[row][col].type = pieceType;
        modal.classList.add('hidden');
        
        // Completar o movimento
        const move = this.moveHistory[this.moveHistory.length - 1];
        move.promotion = pieceType;
        move.notation += `=${pieceType.charAt(0).toUpperCase()}`;
        
        this.completeMove(move);
    }

    // IA - Algoritmo Minimax com poda Alpha-Beta
    makeAIMove() {
        this.isAIThinking = true;
        this.updateGameStatus('IA está pensando...');

        setTimeout(() => {
            let bestMove;
            
            if (this.difficulty === 'beginner') {
                // No nível iniciante, adicionar aleatoriedade
                bestMove = this.findBestMoveWithRandomness(2);
            } else {
                const depth = this.getAIDepth();
                bestMove = this.findBestMove(depth);
            }
            
            if (bestMove) {
                this.makeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
            }
            
            this.isAIThinking = false;
            this.updateGameStatus('Jogo em andamento');
        }, 100);
    }

    // Encontrar melhor movimento com aleatoriedade para iniciantes
    findBestMoveWithRandomness(depth) {
        const moves = this.getAllValidMoves('black');
        
        // 30% de chance de fazer um movimento aleatório
        if (Math.random() < 0.3) {
            const randomIndex = Math.floor(Math.random() * moves.length);
            return moves[randomIndex];
        }
        
        // 70% de chance de usar o algoritmo minimax
        return this.findBestMove(depth);
    }

    // Obter profundidade baseada na dificuldade
    getAIDepth() {
        const depths = {
            beginner: 2,
            normal: 4,
            professional: 6
        };
        return depths[this.difficulty];
    }

    // Encontrar melhor movimento
    findBestMove(depth) {
        let moves = this.getAllValidMoves('black');
        
        // Ordenar movimentos para melhorar a poda alpha-beta
        moves = this.orderMoves(moves);
        
        let bestMoves = [];
        let bestScore = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        for (const move of moves) {
            const tempBoard = this.makeTemporaryMove(move);
            const score = this.minimax(tempBoard, depth - 1, alpha, beta, false);
            this.undoTemporaryMove(move, tempBoard);

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }

        // Se há múltiplos movimentos com a mesma pontuação, escolher aleatoriamente
        if (bestMoves.length > 1) {
            const randomIndex = Math.floor(Math.random() * bestMoves.length);
            return bestMoves[randomIndex];
        }

        return bestMoves[0] || moves[0];
    }

    // Ordenar movimentos para melhorar a poda alpha-beta
    orderMoves(moves) {
        return moves.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            // Capturas têm prioridade
            const capturedA = this.board[a.toRow][a.toCol];
            const capturedB = this.board[b.toRow][b.toCol];
            
            if (capturedA) {
                scoreA += this.getPieceValue(capturedA.type) * 10;
            }
            if (capturedB) {
                scoreB += this.getPieceValue(capturedB.type) * 10;
            }

            // Movimentos para o centro têm prioridade
            const centerDistanceA = Math.abs(a.toRow - 3.5) + Math.abs(a.toCol - 3.5);
            const centerDistanceB = Math.abs(b.toRow - 3.5) + Math.abs(b.toCol - 3.5);
            scoreA += (7 - centerDistanceA) * 2;
            scoreB += (7 - centerDistanceB) * 2;

            // Desenvolvimento de peças na abertura
            if (this.moveHistory.length < 10) {
                if (a.piece.type === 'pawn' && a.fromRow === 1) scoreA += 5;
                if (b.piece.type === 'pawn' && b.fromRow === 1) scoreB += 5;
                if (a.piece.type === 'knight' && a.fromRow === 0) scoreA += 3;
                if (b.piece.type === 'knight' && b.fromRow === 0) scoreB += 3;
                if (a.piece.type === 'bishop' && a.fromRow === 0) scoreA += 3;
                if (b.piece.type === 'bishop' && b.fromRow === 0) scoreB += 3;
            }

            return scoreB - scoreA; // Ordem decrescente
        });
    }

    // Obter valor de uma peça
    getPieceValue(pieceType) {
        const values = {
            pawn: 100,
            knight: 320,
            bishop: 330,
            rook: 500,
            queen: 900,
            king: 20000
        };
        return values[pieceType] || 0;
    }

    // Obter todos os movimentos válidos para uma cor
    getAllValidMoves(color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMoves(row, col);
                    for (const move of validMoves) {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            piece: piece
                        });
                    }
                }
            }
        }
        return moves;
    }

    // Fazer movimento temporário para avaliação
    makeTemporaryMove(move) {
        const tempBoard = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = null;
        return tempBoard;
    }

    // Desfazer movimento temporário
    undoTemporaryMove(move, tempBoard) {
        // Não é necessário desfazer, pois trabalhamos com cópias
    }

    // Algoritmo Minimax com poda Alpha-Beta
    minimax(board, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard(board);
        }

        const color = isMaximizing ? 'black' : 'white';
        const moves = this.getAllValidMovesForBoard(board, color);

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                const tempBoard = this.makeTemporaryMove(move);
                const score = this.minimax(tempBoard, depth - 1, alpha, beta, false);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Poda Beta
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                const tempBoard = this.makeTemporaryMove(move);
                const score = this.minimax(tempBoard, depth - 1, alpha, beta, true);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Poda Alpha
            }
            return minScore;
        }
    }

    // Obter movimentos válidos para um tabuleiro específico
    getAllValidMovesForBoard(board, color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMovesForPiece(row, col, piece, board);
                    for (const move of validMoves) {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            piece: piece
                        });
                    }
                }
            }
        }
        return moves;
    }

    // Avaliação do tabuleiro baseada na dificuldade
    evaluateBoard(board) {
        const pieceValues = {
            pawn: 100,
            knight: 320,
            bishop: 330,
            rook: 500,
            queen: 900,
            king: 20000
        };

        let score = 0;

        // Avaliação básica por valor das peças
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const value = pieceValues[piece.type];
                    // Corrigido: perspectiva do jogador branco (positivo = vantagem branca)
                    score += piece.color === 'white' ? value : -value;
                }
            }
        }

        // Avaliações adicionais baseadas na dificuldade
        if (this.difficulty === 'normal' || this.difficulty === 'professional') {
            score += this.evaluatePosition(board);
        }

        if (this.difficulty === 'professional') {
            score += this.evaluateAdvanced(board);
        }

        return score;
    }

    // Avaliação de posição (nível normal)
    evaluatePosition(board) {
        let score = 0;
        
        // Controle do centro
        const centerSquares = [
            [3, 3], [3, 4], [4, 3], [4, 4]
        ];
        
        for (const [row, col] of centerSquares) {
            const piece = board[row][col];
            if (piece) {
                // Corrigido: perspectiva do jogador branco
                score += piece.color === 'white' ? 15 : -15;
            }
        }

        // Desenvolvimento de peças
        for (let col = 0; col < 8; col++) {
            const pawn = board[1][col];
            if (pawn && pawn.type === 'pawn' && pawn.color === 'black') {
                score += 8;
            }
        }

        // Mobilidade das peças
        score += this.evaluateMobility(board);

        // Controle de colunas abertas
        score += this.evaluateOpenFiles(board);

        // Peões avançados
        score += this.evaluatePawnAdvancement(board);

        return score;
    }

    // Avaliar mobilidade das peças
    evaluateMobility(board) {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const moves = this.getValidMovesForPiece(row, col, piece, board);
                    // Corrigido: perspectiva do jogador branco
                    score += piece.color === 'white' ? moves.length * 2 : -moves.length * 2;
                }
            }
        }
        
        return score;
    }

    // Avaliar colunas abertas
    evaluateOpenFiles(board) {
        let score = 0;
        
        for (let col = 0; col < 8; col++) {
            let hasWhitePawn = false;
            let hasBlackPawn = false;
            
            for (let row = 0; row < 8; row++) {
                const piece = board[row][col];
                if (piece && piece.type === 'pawn') {
                    if (piece.color === 'white') hasWhitePawn = true;
                    else hasBlackPawn = true;
                }
            }
            
            if (!hasWhitePawn && !hasBlackPawn) {
                // Coluna completamente aberta - neutro
                score += 0;
            } else if (!hasBlackPawn) {
                // Coluna semi-aberta para as pretas - vantagem para as pretas
                score -= 5;
            } else if (!hasWhitePawn) {
                // Coluna semi-aberta para as brancas - vantagem para as brancas
                score += 5;
            }
        }
        
        return score;
    }

    // Avaliar avanço dos peões
    evaluatePawnAdvancement(board) {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'pawn') {
                    if (piece.color === 'white') {
                        score += (7 - row) * 5; // Peões brancos avançam para baixo
                    } else {
                        score -= row * 5; // Peões pretos avançam para cima
                    }
                }
            }
        }
        
        return score;
    }

    // Avaliação avançada (nível profissional)
    evaluateAdvanced(board) {
        let score = 0;

        // Estrutura de peões
        score += this.evaluatePawnStructure(board);

        // Segurança do rei
        score += this.evaluateKingSafety(board);

        // Atividade das peças
        score += this.evaluatePieceActivity(board);

        // Ataques ao rei
        score += this.evaluateKingAttack(board);

        return score;
    }

    // Avaliar estrutura de peões
    evaluatePawnStructure(board) {
        let score = 0;
        
        // Peões dobrados
        for (let col = 0; col < 8; col++) {
            let whitePawns = 0, blackPawns = 0;
            for (let row = 0; row < 8; row++) {
                const piece = board[row][col];
                if (piece && piece.type === 'pawn') {
                    if (piece.color === 'white') whitePawns++;
                    else blackPawns++;
                }
            }
            if (whitePawns > 1) score -= 20;
            if (blackPawns > 1) score += 20;
        }

        return score;
    }

    // Avaliar segurança do rei
    evaluateKingSafety(board) {
        let score = 0;
        
        const whiteKing = this.findKing('white', board);
        const blackKing = this.findKing('black', board);
        
        if (whiteKing) {
            const whiteKingDistance = Math.abs(whiteKing.row - 7) + Math.abs(whiteKing.col - 4);
            score -= whiteKingDistance * 5;
        }
        
        if (blackKing) {
            const blackKingDistance = Math.abs(blackKing.row - 0) + Math.abs(blackKing.col - 4);
            score += blackKingDistance * 5;
        }

        return score;
    }

    // Avaliar atividade das peças
    evaluatePieceActivity(board) {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type !== 'pawn' && piece.type !== 'king') {
                    const moves = this.getValidMovesForPiece(row, col, piece, board);
                    // Corrigido: perspectiva do jogador branco
                    score += piece.color === 'white' ? moves.length * 3 : -moves.length * 3;
                    
                    // Bônus para peças no centro
                    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
                    if (centerDistance < 3) {
                        score += piece.color === 'white' ? 5 : -5;
                    }
                }
            }
        }

        return score;
    }

    // Avaliar ataques ao rei
    evaluateKingAttack(board) {
        let score = 0;
        
        const whiteKing = this.findKing('white', board);
        const blackKing = this.findKing('black', board);
        
        if (whiteKing) {
            const attackers = this.countAttackers(whiteKing.row, whiteKing.col, 'black', board);
            score += attackers * 10;
        }
        
        if (blackKing) {
            const attackers = this.countAttackers(blackKing.row, blackKing.col, 'white', board);
            score -= attackers * 10;
        }
        
        return score;
    }

    // Contar atacantes de uma posição
    countAttackers(row, col, attackingColor, board) {
        let count = 0;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === attackingColor) {
                    const moves = this.getValidMovesForPiece(r, c, piece, board);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        count++;
                    }
                }
            }
        }
        
        return count;
    }

    // Destaque de casas
    highlightSquare(row, col, type) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add(type);
        }
    }

    // Destaque de movimentos válidos
    highlightValidMoves() {
        for (const move of this.validMoves) {
            const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (square) {
                const hasPiece = this.board[move.row][move.col];
                square.classList.add(hasPiece ? 'valid-capture' : 'valid-move');
            }
        }
    }

    // Limpar destaques
    clearHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'valid-capture');
        });
    }

    // Limpar todas as marcações (incluindo último movimento)
    clearAllHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'valid-capture', 'last-move', 'check');
        });
    }

    // Atualizar display
    updateDisplay() {
        // Atualizar tabuleiro
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const piece = this.board[row][col];
                
                if (square) {
                    square.innerHTML = piece ? this.getPieceSymbol(piece) : '';
                    square.classList.toggle('piece', !!piece);
                }
            }
        }

        // Destaque do último movimento (sempre mostrar)
        if (this.lastMove) {
            this.highlightSquare(this.lastMove.fromRow, this.lastMove.fromCol, 'last-move');
            this.highlightSquare(this.lastMove.toRow, this.lastMove.toCol, 'last-move');
        }

        // Destaque de xeque
        const kingPosition = this.findKing(this.currentPlayer);
        if (kingPosition && this.isSquareUnderAttack(kingPosition.row, kingPosition.col, this.currentPlayer === 'white' ? 'black' : 'white')) {
            this.highlightSquare(kingPosition.row, kingPosition.col, 'check');
            document.getElementById('check-indicator').classList.remove('hidden');
        } else {
            document.getElementById('check-indicator').classList.add('hidden');
        }

        // Atualizar turno
        document.getElementById('current-turn').textContent = this.currentPlayer === 'white' ? 'Brancas' : 'Pretas';

        // Atualizar peças capturadas
        this.updateCapturedPieces();

        // Atualizar histórico
        this.updateMoveHistory();
    }

    // Atualizar peças capturadas
    updateCapturedPieces() {
        const whiteCaptured = document.getElementById('captured-white');
        const blackCaptured = document.getElementById('captured-black');
        
        whiteCaptured.innerHTML = this.capturedPieces.white.map(piece => 
            `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`
        ).join('');
        
        blackCaptured.innerHTML = this.capturedPieces.black.map(piece => 
            `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`
        ).join('');
    }

    // Atualizar histórico de movimentos
    updateMoveHistory() {
        const moveList = document.getElementById('move-list');
        moveList.innerHTML = '';

        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveEntry = document.createElement('div');
            moveEntry.className = 'move-entry';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.moveHistory[i];
            const blackMove = this.moveHistory[i + 1];
            
            moveEntry.innerHTML = `
                <span class="move-number">${moveNumber}.</span>
                <span class="move-white">${whiteMove.notation}</span>
                <span class="move-black">${blackMove ? blackMove.notation : ''}</span>
            `;
            
            moveList.appendChild(moveEntry);
        }
        
        moveList.scrollTop = moveList.scrollHeight;
    }

    // Timer
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameState === 'playing') {
                this.timers[this.currentPlayer]++;
                this.updateTimers();
            }
        }, 1000);
    }

    updateTimers() {
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        document.getElementById('white-timer').textContent = formatTime(this.timers.white);
        document.getElementById('black-timer').textContent = formatTime(this.timers.black);
    }

    // Controles do jogo
    newGame() {
        // Mostrar seleção de nível para novo jogo
        this.showLevelSelectionForNewGame();
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        // Desfazer último movimento
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.fromRow][lastMove.fromCol] = lastMove.piece;
        this.board[lastMove.toRow][lastMove.toCol] = lastMove.captured;
        
        // Remover peça capturada da lista
        if (lastMove.captured) {
            this.capturedPieces[this.currentPlayer].pop();
        }
        
        // Trocar jogador
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Atualizar último movimento
        this.lastMove = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
        
        this.clearAllHighlights();
        this.updateDisplay();
        this.updateGameStatus('Jogo em andamento');
    }

    offerDraw() {
        this.showConfirmModal('Oferecer Empate', 'Deseja oferecer empate?', () => {
            this.gameState = 'draw-offered';
            this.updateGameStatus('Empate oferecido');
        });
    }

    resign() {
        this.showConfirmModal('Desistir', 'Tem certeza que deseja desistir?', () => {
            this.gameState = 'resigned';
            const winner = this.currentPlayer === 'white' ? 'Pretas' : 'Brancas';
            this.updateGameStatus(`${winner} vencem por desistência!`);
        });
    }

    // Modais
    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-modal').classList.remove('hidden');
        
        this.confirmCallback = onConfirm;
    }

    confirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideConfirmModal();
    }

    hideConfirmModal() {
        document.getElementById('confirm-modal').classList.add('hidden');
        this.confirmCallback = null;
    }

    updateGameStatus(message) {
        document.getElementById('game-status').textContent = message;
    }

    // Mostrar modal de seleção de nível
    showLevelSelection() {
        document.getElementById('level-modal').classList.remove('hidden');
        this.setupLevelSelectionListeners();
    }

    // Configurar listeners para seleção de nível
    setupLevelSelectionListeners() {
        // Seleção de nível
        document.querySelectorAll('.level-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remover seleção anterior
                document.querySelectorAll('.level-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Selecionar novo nível
                option.classList.add('selected');
                this.selectedLevel = option.dataset.level;
            });
        });

        // Botão iniciar jogo
        document.getElementById('start-game').addEventListener('click', () => {
            if (this.selectedLevel) {
                this.startGameWithLevel(this.selectedLevel);
            }
        });

        // Selecionar nível normal por padrão
        document.querySelector('.level-option[data-level="normal"]').classList.add('selected');
        this.selectedLevel = 'normal';
    }

    // Iniciar jogo com nível selecionado
    startGameWithLevel(level) {
        this.difficulty = level;
        this.gameState = 'playing';
        
        // Resetar tabuleiro e estado do jogo
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.lastMove = null;
        this.timers = { white: 0, black: 0 };
        
        // Atualizar seletor de dificuldade no header
        document.getElementById('difficulty').value = level;
        
        // Esconder modal
        document.getElementById('level-modal').classList.add('hidden');
        
        // Inicializar jogo
        this.clearAllHighlights();
        this.startTimer();
        this.updateDisplay();
        this.updateGameStatus('Jogo em andamento');
    }

    // Mostrar seleção de nível para novo jogo
    showLevelSelectionForNewGame() {
        // Resetar seleção
        document.querySelectorAll('.level-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.querySelector('.level-option[data-level="normal"]').classList.add('selected');
        this.selectedLevel = 'normal';
        
        // Mostrar modal
        document.getElementById('level-modal').classList.remove('hidden');
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});