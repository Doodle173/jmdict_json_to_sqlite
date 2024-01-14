const sqlite3 = require('sqlite3').verbose();

var fs = require('fs');

try {
  fs.unlinkSync('./test.db');
  console.log('successfully deleted ./test.db');
} catch (err) {
  // handle the error
  console.log(err);
}


const db = new sqlite3.Database('./test.db');


db.serialize(() => {
    var obj = JSON.parse(fs.readFileSync('data/jmdict-eng-3.5.0.json', 'utf8'));

    console.log('successfully created ./test.db');
    db.run("CREATE TABLE metadata (version TEXT)");

    const stmt = db.prepare(`INSERT INTO metadata VALUES ("${obj.version}")`);
    
    stmt.run();
    stmt.finalize();

    
});

db.close();
