export interface ILemon {
    id: number;
    color: string;
    title: string;
    latitude: number;
    longitude: number;
    content: string;
}

export interface IUseLemonsProvider {
    readonly updateLemons: () => ILemon[];
    readonly errorMessage: string;
    readonly isLoading: boolean;
}