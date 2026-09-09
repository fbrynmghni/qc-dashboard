import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password || !name) {
    console.error(
      'Usage: npm run user:create -- "email@perusahaan.com" "password" "Nama"'
    );
    process.exit(1);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hashPassword(password), name },
    create: { email, passwordHash: hashPassword(password), name },
  });

  console.log(`User siap: ${user.email} (${user.name})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
