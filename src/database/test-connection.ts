import { createOrm, disposeOrm } from './connection.js';

async function testConnection() {
  console.log('Testing SQL Server connection...');
  
  try {
    const orm = await createOrm();
    const session = orm.createSession();
    
    const result = await session.executor.executeSql('SELECT 1 AS test, GETDATE() AS serverTime');
    
    const { columns, values } = result[0];
    const row = columns.reduce((acc, col, i) => {
      acc[col] = values[0]?.[i];
      return acc;
    }, {} as Record<string, unknown>);
    
    console.log('✅ Connection successful!');
    console.log('Result:', row);
    
    await session.dispose();
    await disposeOrm();
    
    console.log('✅ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
