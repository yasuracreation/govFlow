import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GovFlow API',
      version: '1.0.0',
      description: 'API documentation for the GovFlow government workflow management system',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/**/*.ts'], // Scan all TypeScript files in src for JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 