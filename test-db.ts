// Change .ts to .js
import { prisma } from './lib/prisma.js'; 

async function main() {
  try {
    console.log('🔄 Connecting to database...');
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('✅ Connection successful!');
    console.log('Test Query Result:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    process.exit(0);
  }
}

main();