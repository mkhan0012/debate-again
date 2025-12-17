import 'dotenv/config';
import { prisma } from './lib/prisma';

async function main() {
  console.log('🔍 Checking database content...');
  
  // Fetch users and rounds
  const userCount = await prisma.user.count();
  const roundCount = await prisma.round.count();
  const users = await prisma.user.findMany({ take: 2 });

  console.log(`\n📊 Status:`);
  console.log(`- Users found: ${userCount}`);
  console.log(`- Rounds found: ${roundCount}`);
  
  if (users.length > 0) {
    console.log('\n👤 Sample User:', users[0]);
  } else {
    console.log('\n⚠️ No users found. Did you run the seed script?');
  }
}

main()
  .finally(() => prisma.$disconnect());