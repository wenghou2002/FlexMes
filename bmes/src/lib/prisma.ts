import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient();

// Handle potential connection errors
prisma.$connect()
  .then(() => {
    console.log('Connected to PostgreSQL via Prisma');
  })
  .catch((err) => {
    console.error('Prisma connection error:', err);
    process.exit(1);
  });

export default prisma; 