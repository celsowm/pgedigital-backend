export const dbConfig = {
  host: process.env.PGE_DIGITAL_HOST,
  user: process.env.PGE_DIGITAL_USER,
  password: process.env.PGE_DIGITAL_PASSWORD,
  database: process.env.PGE_DIGITAL_DATABASE,
  options: {
    encrypt: process.env.PGE_DIGITAL_ENCRYPT === 'true',
    trustServerCertificate: process.env.PGE_DIGITAL_TRUST_CERT === 'true'
  }
};
