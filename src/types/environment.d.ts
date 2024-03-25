declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
            BASE_URL: string;
            PORT: number;
            DATABASE_URL: string;
            ACCESS_TOKEN_SECRET: string;
            REFRESH_TOKEN_SECRET: string;
            REFRESH_TOKEN_EXPIRES_IN: string;
            ACCESS_TOKEN_EXPIRES_IN: string;
            PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES: number;
            VERIFICATION_TOKEN_EXPIRES_IN_HOURS: number;
            HASH_SECRET: string;
            JWT_SECRET: string;
            JWT_EXPIRES_IN: string;
            EMAIL_USER: string;
            EMAIL_PASS: string;
            EMAIL_HOST: string;
            EMAIL_FROM: string;
            EMAIL_PORT: number;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
