import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const index = async (req: Request, res: Response) => {
    try {
        const sites = await prisma.site.findMany();
        res.json(sites);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sites' });
    }
};

export const setup = async (req: Request, res: Response) => {
    const INITIAL_SITES = [
        { name: 'Atendimento Prodabel', url: 'https://atendimentoprodabel.pbh.gov.br/CAisd/pdmweb.exe', icon: '🔧', description: 'Sistema de chamados e atendimento técnico.' },
        { name: 'Canva for Education', url: 'https://www.canva.com/education/', icon: '🎨', description: 'Ferramenta de design gráfico para professores.' },
        { name: 'Login do Windows (PC)', url: '', icon: '🖥️', description: 'Senha utilizada para acessar os computadores da escola.' }
    ];

    try {
        for (const site of INITIAL_SITES) {
            const existing = await prisma.site.findFirst({ where: { name: site.name } });
            if (!existing) {
                await prisma.site.create({ data: site });
            }
        }
        res.json({ message: 'Sites configured successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Setup failed', details: err });
    }
};
