export interface IVaultResolver {
    resolve: (key: string) => Promise<string>;
}