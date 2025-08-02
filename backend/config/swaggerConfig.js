const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SCRUM Tool API',
      version: '1.0.0',
      description: 'API documentation for the SCRUM Tool backend',
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // Update with your deployed URL if needed
      },
    ],
  },
  apis: ['./routes/*.js'], // Adjust path as per your routes folder
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
