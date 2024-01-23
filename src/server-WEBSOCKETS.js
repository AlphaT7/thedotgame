import Database from 'better-sqlite3';
const db = new Database("sql.db");
db.pragma("journal_mode = WAL");


import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 3000,
 
});

wss.on('connection', function connection(ws) {
  console.log('websocket connection initialized')
});

// "type": "module", 
// needs to be added to package.json
