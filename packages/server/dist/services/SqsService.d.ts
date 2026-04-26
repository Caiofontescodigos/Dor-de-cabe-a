export interface SqsMessage {
    type: 'room_created' | 'player_joined' | 'player_left' | 'game_started' | 'game_ended' | 'move_played';
    roomCode: string;
    timestamp: number;
    data: Record<string, unknown>;
}
/**
 * Serviço para integração com AWS SQS
 * Gerencia envio e recebimento de mensagens para sincronização distribuída
 */
export declare class SqsService {
    private isAwsConfigured;
    constructor();
    /**
     * Enviar mensagem para fila SQS
     */
    sendMessage(message: SqsMessage): Promise<string | null>;
    /**
     * Receber mensagens da fila SQS
     */
    receiveMessages(maxMessages?: number): Promise<SqsMessage[]>;
    /**
     * Deletar mensagem da fila
     */
    private deleteMessage;
    /**
     * Listar filas disponíveis
     */
    listQueues(): Promise<string[]>;
}
export declare const sqsService: SqsService;
//# sourceMappingURL=SqsService.d.ts.map