import type { CustomThemeConfig } from "@skeletonlabs/tw-plugin";

export const gengokoStyle: CustomThemeConfig = {
    name: "gengoko",
    properties: {
        // =~= Theme Properties =~=
        "--theme-font-family-base": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        "--theme-font-family-heading": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        "--theme-font-color-base": "0 0 0",
        "--theme-font-color-dark": "255 255 255",
        "--theme-rounded-base": "4px",
        "--theme-rounded-container": "4px",
        "--theme-border-base": "1px",
        // =~= Theme On-X Colors =~=
        "--on-primary": "0 0 0",
        "--on-secondary": "0 0 0",
        "--on-tertiary": "0 0 0",
        "--on-success": "0 0 0",
        "--on-warning": "0 0 0",
        "--on-error": "0 0 0",
        "--on-surface": "0 0 0",
        // =~= Theme Colors  =~=
        // primary | #ff6666
        "--color-primary-50": "255 232 232", // #ffe8e8
        "--color-primary-100": "255 224 224", // #ffe0e0
        "--color-primary-200": "255 217 217", // #ffd9d9
        "--color-primary-300": "255 194 194", // #ffc2c2
        "--color-primary-400": "255 148 148", // #ff9494
        "--color-primary-500": "255 102 102", // #ff6666
        "--color-primary-600": "230 92 92", // #e65c5c
        "--color-primary-700": "191 77 77", // #bf4d4d
        "--color-primary-800": "153 61 61", // #993d3d
        "--color-primary-900": "125 50 50", // #7d3232
        // secondary | #0dccf2
        "--color-secondary-50": "219 247 253", // #dbf7fd
        "--color-secondary-100": "207 245 252", // #cff5fc
        "--color-secondary-200": "195 242 252", // #c3f2fc
        "--color-secondary-300": "158 235 250", // #9eebfa
        "--color-secondary-400": "86 219 246", // #56dbf6
        "--color-secondary-500": "13 204 242", // #0dccf2
        "--color-secondary-600": "12 184 218", // #0cb8da
        "--color-secondary-700": "10 153 182", // #0a99b6
        "--color-secondary-800": "8 122 145", // #087a91
        "--color-secondary-900": "6 100 119", // #066477
        // tertiary | #d37aff
        "--color-tertiary-50": "248 235 255", // #f8ebff
        "--color-tertiary-100": "246 228 255", // #f6e4ff
        "--color-tertiary-200": "244 222 255", // #f4deff
        "--color-tertiary-300": "237 202 255", // #edcaff
        "--color-tertiary-400": "224 162 255", // #e0a2ff
        "--color-tertiary-500": "211 122 255", // #d37aff
        "--color-tertiary-600": "190 110 230", // #be6ee6
        "--color-tertiary-700": "158 92 191", // #9e5cbf
        "--color-tertiary-800": "127 73 153", // #7f4999
        "--color-tertiary-900": "103 60 125", // #673c7d
        // success | #1bc52f
        "--color-success-50": "221 246 224", // #ddf6e0
        "--color-success-100": "209 243 213", // #d1f3d5
        "--color-success-200": "198 241 203", // #c6f1cb
        "--color-success-300": "164 232 172", // #a4e8ac
        "--color-success-400": "95 214 109", // #5fd66d
        "--color-success-500": "27 197 47", // #1bc52f
        "--color-success-600": "24 177 42", // #18b12a
        "--color-success-700": "20 148 35", // #149423
        "--color-success-800": "16 118 28", // #10761c
        "--color-success-900": "13 97 23", // #0d6117
        // warning | #e77913
        "--color-warning-50": "251 235 220", // #fbebdc
        "--color-warning-100": "250 228 208", // #fae4d0
        "--color-warning-200": "249 222 196", // #f9dec4
        "--color-warning-300": "245 201 161", // #f5c9a1
        "--color-warning-400": "238 161 90", // #eea15a
        "--color-warning-500": "231 121 19", // #e77913
        "--color-warning-600": "208 109 17", // #d06d11
        "--color-warning-700": "173 91 14", // #ad5b0e
        "--color-warning-800": "139 73 11", // #8b490b
        "--color-warning-900": "113 59 9", // #713b09
        // error | #e0ce00
        "--color-error-50": "250 248 217", // #faf8d9
        "--color-error-100": "249 245 204", // #f9f5cc
        "--color-error-200": "247 243 191", // #f7f3bf
        "--color-error-300": "243 235 153", // #f3eb99
        "--color-error-400": "233 221 77", // #e9dd4d
        "--color-error-500": "224 206 0", // #e0ce00
        "--color-error-600": "202 185 0", // #cab900
        "--color-error-700": "168 155 0", // #a89b00
        "--color-error-800": "134 124 0", // #867c00
        "--color-error-900": "110 101 0", // #6e6500
        // surface | #e8e8e8
        "--color-surface-50": "252 252 252", // #fcfcfc
        "--color-surface-100": "248 248 248", // #f8f8f8
        "--color-surface-200": "244 244 244", // #f4f4f4
        "--color-surface-300": "235 235 235", // #ebebeb
        "--color-surface-400": "214 214 214", // #d6d6d6
        "--color-surface-500": "173 173 173", // #c0c0c0
        "--color-surface-600": "144 144 144", // #adadad
        "--color-surface-700": "115 115 115", // #909090
        "--color-surface-800": "77 77 77", // #737373
        "--color-surface-900": "44 44 44" // #2c2c2c
    }
};
