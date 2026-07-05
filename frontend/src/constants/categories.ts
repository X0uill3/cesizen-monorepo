export const ArticleCategory = {
    PREVENTION: 'PRÉVENTION',
    CONSEILS: 'CONSEILS',
    EXERCICES: 'EXERCICES',
    GENERAL: 'GÉNÉRAL'
}

export type ArticleCategory = typeof ArticleCategory[keyof typeof ArticleCategory];