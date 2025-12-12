import 'dotenv/config';
import { Connection, Request } from 'tedious';
import { defineTable, col, SelectQueryBuilder, SqlServerDialect } from 'metal-orm';
import { getTediousConfig } from '../../src/config/db.js';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

function isMain(): boolean {
    const argv1 = process.argv[1];
    if (!argv1) return false;
    return pathToFileURL(resolve(argv1)).href === import.meta.url;
}

const notaVersao = defineTable('nota_versao', {
    mensagem: col.varchar(1000),
});

const listaMensagens = new SelectQueryBuilder(notaVersao).select({
    mensagem: notaVersao.columns.mensagem,
});

const { sql, params } = listaMensagens.compile(new SqlServerDialect());

function createConnection(): Promise<Connection> {
    return new Promise((resolveConn, reject) => {
        const connection = new Connection(getTediousConfig());

        connection.on('connect', (error) => {
            if (error) reject(error);
            else resolveConn(connection);
        });

        connection.connect();
    });
}

function execQuery<T = unknown>(connection: Connection, sqlStatement: string): Promise<T[]> {
    return new Promise((resolveRows, reject) => {
        const rows: T[] = [];
        const request = new Request(sqlStatement, (error) => {
            if (error) reject(error);
            else resolveRows(rows);
        });

        request.on('row', (columns) => {
            const row: Record<string, unknown> = {};
            for (const column of columns) {
                row[column.metadata.colName] = column.value;
            }
            rows.push(row as T);
        });

        connection.execSql(request);
    });
}

export async function main() {
    let connection: Connection | undefined;

    try {
        connection = await createConnection();
        console.log('SQL gerado pelo Metal-ORM:', sql);
        if (params.length > 0) {
            console.warn('Parâmetros recebidos não estão sendo usados:', params);
        }

        const resultados = await execQuery<{ mensagem: string }>(connection, sql);

        if (resultados.length > 0) {
            console.log('Mensagem recuperada com Metal-ORM:', resultados[0].mensagem);
        } else {
            console.log('Nenhuma mensagem retornada.');
        }
    } catch (error) {
        console.error('Erro ao executar Metal-ORM no SQL Server:', error);
        process.exitCode = 1;
    } finally {
        if (connection) connection.close();
    }
}

if (isMain()) {
    void main();
}
