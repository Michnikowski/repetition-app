module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['dist/**/**.entity{.ts,.js}'],
  logging: true,
  synchronize: true,
  factories: ['dist/**/factories/**/*.js'],
  seeds: ['dist/**/seeds/**/*.js'],
};
