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
