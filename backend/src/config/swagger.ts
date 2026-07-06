import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CESIZen API',
            version: '1.0.0',
            description: 'API REST de la plateforme CESIZen — gestion du bien-être et des émotions',
            contact: { name: 'X0uill3', url: 'https://github.com/X0uill3/cesizen-monorepo' },
        },
        servers: [
            { url: 'https://cesizen-api.azurewebsites.net', description: 'Production (Azure)' },
            { url: 'http://localhost:5000', description: 'Local' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
