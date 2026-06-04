import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './dist/src/generated/prisma/client.js';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
try {
  const r = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log('DB reachable OK', JSON.stringify(r));
} catch (e) {
  console.log('NAME:', e.name);
  console.log('MSG:', JSON.stringify(e.message));
  console.log('CODE:', e.code, '| errno:', e.errno);
}
await prisma.$disconnect();
