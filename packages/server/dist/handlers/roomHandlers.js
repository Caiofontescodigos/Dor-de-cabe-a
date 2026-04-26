import { roomService } from '../services/RoomService';
export function registerRoomHandlers(io, socket) {
    // ===============================
    // 🏠 CREATE ROOM
    // ===============================
    socket.on('create_room', (data) => {
        try {
            const { name } = data;
            const room = roomService.createRoom(name);
            socket.emit('room_created', {
                success: true,
                roomCode: room.id,
                room,
            });
            console.log(`📨 Sala criada: ${room.id}`);
        }
        catch (error) {
            socket.emit('room_created', {
                success: false,
                error: 'Erro ao criar sala',
            });
        }
    });
    // ===============================
    // 👥 JOIN ROOM
    // ===============================
    socket.on('join_room', (data) => {
        try {
            const { roomCode } = data;
            const room = roomService.joinRoom(roomCode, socket.id);
            if (!room) {
                socket.emit('room_joined', {
                    success: false,
                    error: 'Sala não encontrada',
                });
                return;
            }
            socket.join(roomCode);
            socket.emit('room_joined', {
                success: true,
                player: socket.id,
                room,
            });
            io.to(roomCode).emit('player_joined_notify', {
                player: socket.id,
                players: room.players,
            });
            console.log(`📨 Jogador entrou: ${roomCode}`);
        }
        catch (error) {
            socket.emit('room_joined', {
                success: false,
                error: 'Erro ao entrar na sala',
            });
        }
    });
    // ===============================
    // 🚪 LEAVE ROOM
    // ===============================
    socket.on('leave_room', (data) => {
        try {
            const { roomCode } = data;
            const room = roomService.leaveRoom(roomCode, socket.id);
            if (!room) {
                socket.emit('room_left', { success: false });
                return;
            }
            socket.leave(roomCode);
            socket.emit('room_left', { success: true });
            io.to(roomCode).emit('player_left_notify', {
                player: socket.id,
                players: room.players,
            });
            console.log(`📨 Jogador saiu: ${roomCode}`);
        }
        catch (error) {
            socket.emit('room_left', { success: false });
        }
    });
    // ===============================
    // 📡 GET ROOM
    // ===============================
    socket.on('get_room_info', (data) => {
        try {
            const { roomCode } = data;
            const room = roomService.getRoom(roomCode);
            if (!room) {
                socket.emit('room_info', {
                    success: false,
                    error: 'Sala não encontrada',
                });
                return;
            }
            socket.emit('room_info', {
                success: true,
                room,
            });
        }
        catch (error) {
            socket.emit('room_info', {
                success: false,
                error: 'Erro ao obter sala',
            });
        }
    });
    // ===============================
    // ▶️ START GAME
    // ===============================
    socket.on('start_game', (data) => {
        try {
            const { roomCode } = data;
            const game = roomService.startGame(roomCode);
            if (!game) {
                socket.emit('start_game_error', {
                    error: 'Não foi possível iniciar',
                });
                return;
            }
            io.to(roomCode).emit('game_started_notify', {
                success: true,
                game,
            });
            console.log(`📨 Jogo iniciado: ${roomCode}`);
        }
        catch (error) {
            socket.emit('start_game_error', {
                error: 'Erro ao iniciar jogo',
            });
        }
    });
    // ===============================
    // 🔌 DISCONNECT
    // ===============================
    socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
}
//# sourceMappingURL=roomHandlers.js.map