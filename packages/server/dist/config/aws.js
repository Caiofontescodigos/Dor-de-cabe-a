import { SQSClient } from '@aws-sdk/client-sqs';
/**
 * Configuração do cliente AWS SQS
 * Utiliza variáveis de ambiente para credenciais
 */
export const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
export const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || '';
/**
 * Validar configuração AWS antes de iniciar
 */
export function validateAwsConfig() {
    if (!process.env.SQS_QUEUE_URL) {
        console.warn('⚠️ SQS_QUEUE_URL não configurada. Modo offline (em memória).');
        return false;
    }
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.warn('⚠️ Credenciais AWS não configuradas. Modo offline (em memória).');
        return false;
    }
    return true;
}
//# sourceMappingURL=aws.js.map