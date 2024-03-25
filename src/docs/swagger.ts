import swaggerJsDoc from "swagger-jsdoc";

// define documentation options with open api
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AKANSIE",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        // security: [
        //     {
        //         bearerAuth: [],
        //     },
        // ],
        servers: [{ url: `${process.env.BASE_URL}/api/v1` }],
    },
    apis: ["./src/routes/*.ts", "./src/schemas/*.ts"],
};

export const openApiSpecification = swaggerJsDoc(options);
