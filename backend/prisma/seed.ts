import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_SITES = [
    {
        name: 'Atendimento Prodabel',
        url: 'https://atendimentoprodabel.pbh.gov.br/CAisd/pdmweb.exe',
        icon: '🔧',
        description: 'Sistema de chamados e atendimento técnico.'
    },
    {
        name: 'Canva for Education',
        url: 'https://www.canva.com/education/',
        icon: '🎨',
        description: 'Ferramenta de design gráfico para professores.'
    },
    {
        name: 'Login do Windows (PC)',
        url: '',
        icon: '🖥️',
        description: 'Senha utilizada para acessar os computadores da escola.'
    }
];

async function main() {
    console.log('Seeding sites...');
    for (const site of INITIAL_SITES) {
        // Only create if not exists (check by name roughly)
        const existing = await prisma.site.findFirst({ where: { name: site.name } });
        if (!existing) {
            await prisma.site.create({ data: site });
        }
    }
    console.log('Seeding done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
