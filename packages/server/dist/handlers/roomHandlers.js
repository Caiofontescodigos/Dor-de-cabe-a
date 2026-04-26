import { roomService } from '../services/RoomService';
/**
 * Registrar todos os handlers de sala
 */
export function registerRoomHandlers(io, socket) {
    /**
     * Criar nova sala
     * Cliente: socket.emit('create_room', { name, maxPlayers, gameMode, playerName })
     * Servidor: socket.emit('room_created', { roomCode, room })
     */
    socket.on('create_room', async (data) => {
        try {
            const { name, maxPlayers, gameMode, playerName } = data;
            const room = await roomService.createRoom({
                name,
                maxPlayers,
                gameMode,
                ownerName: playerName,
            });
            socket.emit('room_created', {
                success: true,
                roomCode: room.code,
                room,
            });
            console.log(`📨 Sala criada por cliente: ${room.code}`);
        }
        catch (error) {
            socket.emit('room_created', {
                success: false,
                error: 'Erro ao criar sala',
            });
            console.error('❌ Erro ao criar sala:', error);
        }
    });
    /**
     * Entrar em uma sala
     * Cliente: socket.emit('join_room', { roomCode, playerName })
     * Servidor: socket.emit('room_joined', { success, player, room })
     *           io.to(roomCode).emit('player_joined_notify', { player, players })
     */
    socket.on('join_room', async (data) => {
        try {
            const { roomCode, playerName } = data;
            const result = await roomService.joinRoom(roomCode, playerName, socket.id);
            if (!result.success) {
                socket.emit('room_joined', {
                    success: false,
                    error: result.error,
                });
                return;
            }
            socket.join(roomCode);
            socket.emit('room_joined', {
                success: true,
                player: result.player,
                room: result.room,
            });
            // Notificar outros jogadores
            io.to(roomCode).emit('player_joined_notify', {
                player: result.player,
                players: result.room?.players,
                message: `${result.player?.name} entrou na sala`,
            });
            console.log(`📨 Jogador entrou na sala: ${roomCode}`);
        }
        catch (error) {
            socket.emit('room_joined', {
                success: false,
                error: 'Erro ao entrar na sala',
            });
            console.error('❌ Erro ao entrar na sala:', error);
        }
    });
    /**
     * Sair de uma sala
     * Cliente: socket.emit('leave_room', { playerId, roomCode })
     * Servidor: socket.emit('room_left', { success })
     *           io.to(roomCode).emit('player_left_notify', { playerName, players })
     */
    socket.on('leave_room', async (data) => {
        try {
            const { playerId, roomCode } = data;
            const room = roomService.getRoom(roomCode);
            const player = roomService.getPlayer(playerId);
            const result = await roomService.leaveRoom(playerId);
            if (!result.success) {
                socket.emit('room_left', { success: false });
                return;
            }
            socket.leave(roomCode);
            socket.emit('room_left', { success: true });
            // Notificar outros jogadores
            if (!result.roomDeleted) {
                io.to(roomCode).emit('player_left_notify', {
                    playerName: player?.name,
                    players: roomService.getRoomInfo(roomCode)?.players,
                    message: `${player?.name} saiu da sala`,
                });
            }
            console.log(`📨 Jogador saiu da sala: ${roomCode}`);
        }
        catch (error) {
            socket.emit('room_left', { success: false });
            console.error('❌ Erro ao sair da sala:', error);
        }
    });
    /**
     * Listar salas disponíveis
     * Cliente: socket.emit('list_rooms')
     * Servidor: socket.emit('rooms_list', { rooms })
     */
    socket.on('list_rooms', () => {
        try {
            const rooms = roomService.listRooms();
            socket.emit('rooms_list', {
                success: true,
                rooms,
                count: rooms.length,
            });
            console.log(`📨 Listadas ${rooms.length} salas`);
        }
        catch (error) {
            socket.emit('rooms_list', {
                success: false,
                error: 'Erro ao listar salas',
            });
            console.error('❌ Erro ao listar salas:', error);
        }
    });
    /**
     * Obter informações da sala
     * Cliente: socket.emit('get_room_info', { roomCode })
     * Servidor: socket.emit('room_info', { success, room })
     */
    socket.on('get_room_info', (data) => {
        try {
            const { roomCode } = data;
            const roomInfo = roomService.getRoomInfo(roomCode);
            if (!roomInfo) {
                socket.emit('room_info', {
                    success: false,
                    error: 'Sala não encontrada',
                });
                return;
            }
            socket.emit('room_info', {
                success: true,
                room: roomInfo,
            });
            console.log(`📨 Info da sala solicitada: ${roomCode}`);
        }
        catch (error) {
            socket.emit('room_info', {
                success: false,
                error: 'Erro ao obter info da sala',
            });
            console.error('❌ Erro ao obter info da sala:', error);
        }
    });
    /**
     * Marcar jogador como pronto
     * Cliente: socket.emit('player_ready', { playerId, roomCode, isReady })
     * Servidor: io.to(roomCode).emit('player_ready_notify', { playerId, isReady })
     */
    socket.on('player_ready', async (data) => {
        try {
            const { playerId, roomCode, isReady } = data;
            const room = roomService.getRoom(roomCode);
            if (!room) {
                return;
            }
            const player = room.players.find(p => p.id === playerId);
            if (player) {
                player.isReady = isReady;
            }
            io.to(roomCode).emit('player_ready_notify', {
                playerId,
                playerName: player?.name,
                isReady,
                allReady: room.players.every(p => p.isReady),
            });
            console.log(`📨 Jogador ${playerId} ${isReady ? 'pronto' : 'não pronto'} em ${roomCode}`);
        }
        catch (error) {
            console.error('❌ Erro ao marcar jogador como pronto:', error);
        }
    });
    /**
     * Iniciar jogo
     * Cliente: socket.emit('start_game', { roomCode })
     * Servidor: io.to(roomCode).emit('game_started_notify', { game })
     */
    socket.on('start_game', async (data) => {
        try {
            const { roomCode } = data;
            const result = await roomService.startGame(roomCode);
            if (!result) {
                socket.emit('start_game_error', {
                    error: 'Não é possível iniciar o jogo',
                });
                return;
            }
            const room = roomService.getRoomInfo(roomCode);
            io.to(roomCode).emit('game_started_notify', {
                success: true,
                room,
                message: 'Jogo iniciado!',
            });
            console.log(`📨 Jogo iniciado na sala: ${roomCode}`);
        }
        catch (error) {
            socket.emit('start_game_error', {
                error: 'Erro ao iniciar jogo',
            });
            console.error('❌ Erro ao iniciar jogo:', error);
        }
    });
    /**
     * Desconexão - limpar recursos
     */
    socket.on('disconnect', async () => {
        try {
            console.log(`🔌 Cliente desconectado: ${socket.id}`);
            // Aqui você pode adicionar lógica para encontrar o jogador
            // e removê-lo da sala automaticamente
        }
        catch (error) {
            console.error('❌ Erro ao processar desconexão:', error);
        }
    });
}
//# sourceMappingURL=roomHandlers.js.map