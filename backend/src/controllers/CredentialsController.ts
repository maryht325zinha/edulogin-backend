import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { encrypt, decrypt } from '../utils/crypto';

export const index = async (req: Request, res: Response) => {
    try {
        const credentials = await prisma.credential.findMany({
            where: { user_id: req.user!.id },
            include: { site: true }
        });

        const decrypted = credentials.map(c => ({
            ...c,
            password: decrypt(c.password_encrypted), // Send back as 'password' for convenience
            password_encrypted: undefined // Hide from response
        }));

        res.json(decrypted);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
};

export const create = async (req: Request, res: Response) => {
    const { site_id, login, password } = req.body;

    if (!site_id || !login || !password) {
        res.status(400).json({ error: 'Missing fields' });
        return;
    }

    try {
        const encrypted = encrypt(password);

        // Check if exists
        const existing = await prisma.credential.findUnique({
            where: {
                user_id_site_id: {
                    user_id: req.user!.id,
                    site_id
                }
            }
        });

        if (existing) {
            res.status(400).json({ error: 'Credential already exists for this site' });
            return;
        }

        const credential = await prisma.credential.create({
            data: {
                user_id: req.user!.id,
                site_id,
                login,
                password_encrypted: encrypted
            }
        });

        res.json({ ...credential, password_encrypted: undefined });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save credential' });
    }
};

export const update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { login, password } = req.body;

    try {
        const cred = await prisma.credential.findUnique({ where: { id } });

        if (!cred || cred.user_id !== req.user!.id) {
            res.status(404).json({ error: 'Credential not found' });
            return;
        }

        const data: any = {};
        if (login) data.login = login;
        if (password) data.password_encrypted = encrypt(password);

        const updated = await prisma.credential.update({
            where: { id },
            data
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update' });
    }
};

export const remove = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const cred = await prisma.credential.findUnique({ where: { id } });

        if (!cred || cred.user_id !== req.user!.id) {
            res.status(404).json({ error: 'Credential not found' });
            return;
        }

        await prisma.credential.delete({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
};
