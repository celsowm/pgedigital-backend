import { Connection, Request, ConnectionConfig } from "tedious";
import { dbConfig } from "./connection";

function buildConfigFromEnv(): ConnectionConfig {
  const { host, user, password, database, options = {} } = dbConfig;

  if (!host || !user || !password || !database) {
    throw new Error("Dados de conexao incompletos, defina as variaveis de ambiente da base de dados.");
  }

  return {
    server: host,
    authentication: {
      type: "default",
      options: {
        userName: user,
        password
      }
    },
    options: {
      database,
      encrypt: options.encrypt ?? false,
      trustServerCertificate: options.trustServerCertificate ?? false
    }
  };
}

const config: ConnectionConfig = buildConfigFromEnv();

interface ConfigSummary {
  server: string;
  userName: string;
  database: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
}

const legacyConfigSummary: ConfigSummary = {
  server: "10.120.100.156",
  userName: "pge_digital_user",
  database: "pge_digital",
  encrypt: true,
  trustServerCertificate: true
};

function summarizeConnectionConfig(connectionConfig: ConnectionConfig): ConfigSummary {
  return {
    server: connectionConfig.server,
    userName: connectionConfig.authentication.options.userName,
    database: connectionConfig.options.database,
    encrypt: connectionConfig.options.encrypt ?? false,
    trustServerCertificate: connectionConfig.options.trustServerCertificate ?? false
  };
}

function logConfigComparison() {
  const envSummary = summarizeConnectionConfig(config);
  console.log("Config via env:", envSummary);
  console.log("Config hard-coded (legacy):", legacyConfigSummary);
  const differences = Object.entries(envSummary).filter(
    ([key, value]) => value !== legacyConfigSummary[key as keyof ConfigSummary]
  );
  if (differences.length === 0) {
    console.log("Sem diferencas entre as configuracoes.");
  } else {
    console.log("Diferencas encontradas:", Object.fromEntries(differences));
  }
}

function createConnection(): Promise<Connection> {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);

    connection.on("connect", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });

    connection.connect();
  });
}

function execQuery<T = unknown>(connection: Connection, sql: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];

    const request = new Request(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });

    request.on("row", (columns) => {
      const row: any = {};
      for (const column of columns) {
        row[column.metadata.colName] = column.value;
      }
      rows.push(row as T);
    });

    connection.execSql(request);
  });
}

async function main() {
  let connection: Connection | undefined;

  try {
    logConfigComparison();
    connection = await createConnection();
    console.log("Conexao bem-sucedida!");

    const resultados = await execQuery<{ mensagem: string }>(connection, "SELECT mensagem FROM nota_versao");

    if (resultados.length > 0) {
      console.log("Resultado da query:", resultados[0].mensagem);
    } else {
      console.log("Nenhum resultado retornado.");
    }
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

main();
