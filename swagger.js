const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
      openapi: '3.0.0',
      info: {
          title: 'Task Management API',
          version: '1.0.0',
          description: 'API documentation for the Task Management system',
      },
      servers: [
          {
            url: process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3000',
            description: 'Local server',
          },
      ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app)=>{
  app.use('/api-docs',  swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;