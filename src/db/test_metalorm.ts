import { Connection, Request, ConnectionConfig } from "tedious";
import {
  defineTable,
  col,
  SelectQueryBuilder,
  SqlServerDialect,
} from "metal-orm";
import { dbConfig } from "./connection";

function buildConfigFromEnv(): ConnectionConfig {
  const {
    host,
    user,
    password,
    database,
    options = {} as {
      encrypt?: boolean;
      trustServerCertificate?: boolean;
    },
  } = dbConfig;

  if (!host || !user || !password || !database) {
    throw new Error(
      "Dados de conexão incompletos para o Metal-ORM, defina as variáveis da base."
    );
  }

  return {
    server: host,
    authentication: {
      type: "default",
      options: {
        userName: user,
        password,
      },
    },
    options: {
      database,
      encrypt: options.encrypt ?? false,
      trustServerCertificate: options.trustServerCertificate ?? false,
    },
  };
}

const notaVersao = defineTable("nota_versao", {
  mensagem: col.varchar(1000),
});

const listaMensagens = new SelectQueryBuilder(notaVersao).select({
  mensagem: notaVersao.columns.mensagem,
});

const { sql, params } = listaMensagens.compile(new SqlServerDialect());

function createConnection(): Promise<Connection> {
  return new Promise((resolve, reject) => {
    const connection = new Connection(buildConfigFromEnv());

    connection.on("connect", (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(connection);
      }
    });

    connection.connect();
  });
}

function execQuery<T = unknown>(
  connection: Connection,
  sqlStatement: string
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    const request = new Request(sqlStatement, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });

    request.on("row", (columns) => {
      const row: Record<string, unknown> = {};
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
    connection = await createConnection();
    console.log("SQL gerado pelo Metal-ORM:", sql);
    if (params.length > 0) {
      console.warn("Parâmetros recebidos não estão sendo usados:", params);
    }

    const resultados = await execQuery<{ mensagem: string }>(
      connection,
      sql
    );

    if (resultados.length > 0) {
      console.log("Mensagem recuperada com Metal-ORM:", resultados[0].mensagem);
    } else {
      console.log("Nenhuma mensagem retornada.");
    }
  } catch (error) {
    console.error("Erro ao executar Metal-ORM no SQL Server:", error);
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

main();
