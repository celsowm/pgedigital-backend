import 'dotenv/config';
import { Connection, Request } from 'tedious';
import { getTediousConfig } from '../../src/config/db.js';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

function isMain(): boolean {
    const argv1 = process.argv[1];
    if (!argv1) return false;
    return pathToFileURL(resolve(argv1)).href === import.meta.url;
}

function createConnection(): Promise<Connection> {
    return new Promise((resolveConn, reject) => {
        const connection = new Connection(getTediousConfig());

        connection.on('connect', (err) => {
            if (err) reject(err);
            else resolveConn(connection);
        });

        connection.connect();
    });
}

function execQuery<T = unknown>(connection: Connection, sql: string): Promise<T[]> {
    return new Promise((resolveRows, reject) => {
        const rows: T[] = [];

        const request = new Request(sql, (err) => {
            if (err) reject(err);
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
        console.log('Conexao bem-sucedida!');

        const resultados = await execQuery<{ mensagem: string }>(
            connection,
            'SELECT mensagem FROM nota_versao',
        );

        if (resultados.length > 0) {
            console.log('Resultado da query:', resultados[0].mensagem);
        } else {
            console.log('Nenhum resultado retornado.');
        }
    } catch (err) {
        console.error('Erro:', err);
        process.exitCode = 1;
    } finally {
        if (connection) connection.close();
    }
}

if (isMain()) {
    void main();
}
