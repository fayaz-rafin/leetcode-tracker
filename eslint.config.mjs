import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([{
    extends: [...nextCoreWebVitals, ...nextTypescript],
    rules: {
        // Existing effects intentionally load remote data into component state.
        "react-hooks/set-state-in-effect": "off",
        "react-hooks/immutability": "off",
    },
}, {
    ignores: [
        "node_modules/**",
        ".next/**",
        "out/**",
        "build/**",
        "generated/**",
        "next-env.d.ts",
    ],
}]);
