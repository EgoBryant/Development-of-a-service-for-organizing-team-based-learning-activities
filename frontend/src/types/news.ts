export type NewsColorVariant = "pink" | "blue" | "green" | "purple" | "amber" | "rose";

export interface NewsPost {
    id: string;
    title: string;
    body: string;
    authorName: string;
    createdAt: string;
    colorVariant: NewsColorVariant;
}

export interface NewsPostPushInput {
    title: string;
    body: string;
    authorName?: string;
}

export interface NewsCreateDraft {
    title: string;
    body: string;
}
