import {db} from "../client.js";
import {vaultSecrets, workspaces} from "../schemas/index.js";
import {and, desc, eq} from 'drizzle-orm';

export async function getAllVaultSecrets(userId: string) {

    return db
        .query.vaultSecrets.findMany({
            where: eq(vaultSecrets.userId, userId),
            orderBy: [desc(workspaces.createdAt)]
        })

}

export const findSecretById = async (id: string) => {
    const [result] = await db.select().from(vaultSecrets).where(eq(vaultSecrets.id, id));
    return result || null;
};

export const findSecretByName = async (name: string, userId: string) => {
    const [result] = await db
        .select()
        .from(vaultSecrets)
        .where(
            and(
                eq(vaultSecrets.name, name),
                eq(vaultSecrets.userId, userId),
            )
        );

    return result || null;
};

export const insertVaultSecret = async (data: {
    name: string;
    content: string;
    iv: string;
    tag: string;
    userId: string;
}) => {
    const [newSecret] = await db.insert(vaultSecrets)
        .values(data)
        .returning({ id: vaultSecrets.id, name: vaultSecrets.name });
    return newSecret;
};

export const deleteVaultSecretById = async (id: string) => {
    return db.delete(vaultSecrets).where(eq(vaultSecrets.id, id));
};