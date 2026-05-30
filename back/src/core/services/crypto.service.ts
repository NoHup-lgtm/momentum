import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGO = 'aes-256-gcm';
// marca de versão: identifica payload criptografado e permite migração suave
const PREFIX = 'enc:v1:';

@Injectable()
export class CryptoService {
  private key(): Buffer {
    const hex = process.env.TOKEN_ENC_KEY;
    if (!hex || hex.length !== 64) {
      throw new Error(
        'TOKEN_ENC_KEY ausente ou inválida (esperado 64 hex chars = 32 bytes)',
      );
    }
    return Buffer.from(hex, 'hex');
  }

  // Criptografa. Saída: enc:v1:<iv>:<authTag>:<ciphertext> (tudo base64).
  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGO, this.key(), iv);
    const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return (
      PREFIX +
      [iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join(
        ':',
      )
    );
  }

  // Descriptografa. Tolerante a token legado em texto puro (antes da cripto):
  // se não tiver o prefixo, devolve como está (será re-criptografado no próximo login).
  decrypt(payload: string): string {
    if (!payload.startsWith(PREFIX)) {
      return payload;
    }
    const [ivB64, tagB64, ctB64] = payload.slice(PREFIX.length).split(':');
    const decipher = createDecipheriv(
      ALGO,
      this.key(),
      Buffer.from(ivB64, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(ctB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
}
