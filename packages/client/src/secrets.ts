import { authorizedFetch } from '@neuron/auth';
import { safeTask } from '@neuron/shared/utils';

const URL = process.env.NEXT_PUBLIC_API_ENDPOINT!;

export const secrets = {
    list: (token: string) =>
        safeTask(() => authorizedFetch(`${URL}/secrets`, { method: 'GET' }, token)),

    create: (name: string, value: string, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/secrets`, {
            method: 'POST',
            body: JSON.stringify({ name, value })
        }, token)),

    delete: (id: string, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/secrets/delete/${id}`, { method: 'DELETE' }, token)),
};