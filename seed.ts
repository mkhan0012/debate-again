// seed.ts
import 'dotenv/config'; 
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create a Topic/Round
  const round = await prisma.round.create({
    data: {
      topic: "AI will replace Programmers",
      status: "ACTIVE",
    }
  });

  // 2. Create a User
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const user = await prisma.user.create({
    data: {
      username: "testuser1", // Matches schema.prisma
      email: "test@example.com",
      password: hashedPassword, 
    }
  });

  // 3. Create a Participant
  const participant = await prisma.participant.create({
    data: {
      role: "DEBATER",
      userId: user.id,   
      roundId: round.id, 
    }
  });

  console.log('✅ Seed successful!');
  console.log(`User: test@example.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });