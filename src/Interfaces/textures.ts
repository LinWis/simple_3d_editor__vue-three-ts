export interface Texture {
    name: string;
    url: string;
}

export interface TexturesContainer {
    [key: string]: Texture[];
}