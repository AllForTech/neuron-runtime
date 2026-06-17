import { Request, Response } from 'express';
import {
    getAllVaultSecrets,
    insertVaultSecret,
    deleteVaultSecretById,
    findSecretById
} from "@neuron/db";
import {AuthRequest} from "./execution.controller";
import {decryptSecret, encryptSecret, SECRET_PREFIX } from "@neuron/shared/server";

const secret = process.env.VAULT_SECRET!;

export const listSecrets = async (req: AuthRequest, res: Response) => {
    try {
        console.log("Loading secrets from DB...");
        const userId = req.user.id;
        const results = await getAllVaultSecrets(userId);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch secrets' });
    }
};

export const createSecret = async (req: AuthRequest, res: Response) => {
    try {
        const { name, value } = req.body;
        const userId = req.user.id;
        if (!name || !value) {
            return res.status(400).json({ error: 'Name and value are required' });
        }

        console.log("Creating encrypted secret...");

        const encryptedKey = value.startsWith(SECRET_PREFIX) ? value : encryptSecret(value);

        // TODO: Remove iv and tag from vault schema
        const newSecret = await insertVaultSecret({
            name,
            content: encryptedKey,
            iv: encryptedKey,
            tag: encryptedKey,
            userId,
        });

        res.status(201).json(newSecret);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create secret' });
    }
};

export const deleteSecret = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params as any;
        console.log(`Deleting secret ${id}...`);

        await deleteVaultSecretById(id);
        res.json({ message: 'Secret deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete secret' });
    }
};

export const getDecryptedSecret = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params as any;
        const secret = await findSecretById(id);

        if (!secret) return res.status(404).json({ error: 'No Secret found' });

        const decryptedSecret = secret.content.startsWith(SECRET_PREFIX) ? secret.content : decryptSecret(secret.content)

        res.json({ name: secret.name, value: decryptedSecret });
    } catch (error) {
        console.error("Decryption failed:", error);
        res.status(500).json({ error: 'Decryption failed' });
    }
};