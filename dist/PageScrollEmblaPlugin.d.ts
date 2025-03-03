import { EmblaPluginType } from "embla-carousel";
export type PageScrollEmblaOptions = Partial<{
    active: boolean;
    breakpoints: {
        [key: string]: Omit<Partial<PageScrollEmblaOptions>, "breakpoints">;
    };
    speed: number;
}>;
export declare function usePageScrollEmbla(options?: PageScrollEmblaOptions): EmblaPluginType;
