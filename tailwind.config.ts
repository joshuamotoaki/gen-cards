import { join } from "path";
import type { Config } from "tailwindcss";
import { skeleton } from "@skeletonlabs/tw-plugin";

export default {
    darkMode: "selector",
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        join(
            require.resolve("@skeletonlabs/skeleton"),
            "../**/*.{html,js,svelte,ts}"
        )
    ],
    theme: {
        extend: {}
    },
    plugins: [
        skeleton({
            themes: {
                preset: [
                    {
                        name: "skeleton",
                        enhancements: false
                    },
                    {
                        name: "wintry",
                        enhancements: false
                    },
                    {
                        name: "modern",
                        enhancements: false
                    },
                    {
                        name: "rocket",
                        enhancements: false
                    },
                    {
                        name: "seafoam",
                        enhancements: false
                    },
                    {
                        name: "vintage",
                        enhancements: false
                    },
                    {
                        name: "sahara",
                        enhancements: false
                    },
                    {
                        name: "hamlindigo",
                        enhancements: false
                    },
                    {
                        name: "gold-nouveau",
                        enhancements: false
                    },
                    {
                        name: "crimson",
                        enhancements: false
                    }
                ]
            }
        })
    ]
} satisfies Config;
