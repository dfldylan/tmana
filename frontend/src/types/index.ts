// frontend/src/types/index.ts

export interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
}

