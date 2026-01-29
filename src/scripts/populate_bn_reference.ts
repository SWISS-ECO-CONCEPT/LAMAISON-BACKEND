import { prisma } from '@/utils/db';

async function main() {
  const annoncesToUpdate = await prisma.annonce.findMany({
    where: {
      bn_reference: null,
    },
  });

  for (const annonce of annoncesToUpdate) {
    const bn_reference = `BN${annonce.id}`;
    await prisma.annonce.update({
      where: { id: annonce.id },
      data: { bn_reference },
    });
    console.log(`Updated annonce ${annonce.id} with bn_reference: ${bn_reference}`);
  }

  console.log('Finished updating bn_references for existing annonces.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
