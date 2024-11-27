export interface GalleryImage {
    id: number;
    src: {
        original: string;
        large2x: string;
    };
    photographer: string;
    alt: string;
}