/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'zen-sage': '#8BA889',  // Ton vert principal
                'zen-cream': '#F9F7F2', // Ton fond blanc cassé
                'zen-sky': '#AEC6CF',   // Ton bleu secondaire
                'zen-dark': '#2D3436',  // Ton texte
            },
            borderRadius: {
                'zen': '24px', // Tes coins très arrondis
            }
        },
    },
    plugins: [],
}