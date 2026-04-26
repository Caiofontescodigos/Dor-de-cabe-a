import 'dotenv/config';
import { SqsService } from './services/SqsService.js';

/**
 * Worker SQS — processo separado que consome a fila e loga eventos.
 * Rodado pelo PM2 como segundo processo: pm2 start dist/worker.js --name domino-worker
 *
 * Em uma arquitetura multi-instância este worker encaminharia os eventos
 * para o servidor principal via HTTP/Socket. Numa instância única serve
 * para garantir que mensagens não processadas sejam consumidas e logadas.
 */

const sqsService = new SqsService();
const POLL_INTERVAL_MS = 5000;

console.log(`
╔═══════════════════════════════════════╗
║  🔧 DOMINÓ WORKER - SQS CONSUMER     ║
╠═══════════════════════════════════════╣
║  Polling a cada ${POLL_INTERVAL_MS / 1000}s                   ║
╚═══════════════════════════════════════╝
`);

async function pollMessages(): Promise<void> {
  try {
    const messages = await sqsService.receiveMessages(10);

    if (messages.length === 0) return;

    console.log(`\n📬 ${messages.length} mensagem(ns) recebida(s) do SQS`);

    for (const msg of messages) {
      console.log(`  ✅ [${msg.type}] Sala: ${msg.roomCode} | ts: ${new Date(msg.timestamp).toISOString()}`);
      console.log(`     Dados:`, JSON.stringify(msg.data));
    }
  } catch (err) {
    console.error('❌ Erro no worker ao processar SQS:', err);
  }
}

// Poll imediato + intervalo
pollMessages();
setInterval(pollMessages, POLL_INTERVAL_MS);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Worker encerrando...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Worker encerrando...');
  process.exit(0);
});
