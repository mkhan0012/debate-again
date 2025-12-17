// 1. Add this line at the VERY TOP
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

  // 2. Create a User (Required for Auth)
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const user = await prisma.user.create({
    data: {
      name: "Test User 1",
      email: "test@example.com",
      password: hashedPassword, 
    }
  });

  // 3. Create a Participant (Linked to User & Round)
  const participant = await prisma.participant.create({
    data: {
      role: "DEBATER",
      userId: user.id,   
      roundId: round.id, 
    }
  });

  console.log('✅ Seed successful!');
  console.log('-------------------------------------------');
  console.log('👤 Created User: test@example.com / password123');
  console.log('📋 COPY THESE IDS FOR YOUR CODE:');
  console.log(`Round ID:       ${round.id}`);
  console.log(`Participant ID: ${participant.id}`);
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });