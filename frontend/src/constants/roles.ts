export const GlobalRole = {
    GUEST: 'GUEST',
    USER: 'USER',
    ADMIN: 'ADMIN'
}

export type GlobalRole = typeof GlobalRole[keyof typeof GlobalRole];
