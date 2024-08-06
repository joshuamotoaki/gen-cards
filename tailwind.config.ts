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
                        name: "modern",
                        enhancements: true
                    },
                    {
                        name: "skeleton",
                        enhancements: true
                    },
                    {
                        name: "crimson",
                        enhancements: true
                    }
                ]
            }
        })
    ]
} satisfies Config;
