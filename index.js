const sqlite3 = require('sqlite3').verbose();

var fs = require('fs');

try {
    fs.unlinkSync('./test.db');
    console.log('successfully deleted ./test.db \n');
} catch (err) {
    // handle the error
    console.log(err);
}


const db = new sqlite3.Database('./test.db');


db.serialize(() => {
    var obj = JSON.parse(fs.readFileSync('data/jmdict-eng-3.5.0.json', 'utf8'));

    console.log('successfully created ./test.db \n');
    db.run("CREATE TABLE metadata (version TEXT, build_date TEXT, commonOnly INTEGER)");

    var common = 0;

    if(obj.commonOnly == true){
        common = 1;
    }

    /**
     * Create the metadata table and insert the correct data..
     */
    console.log("Creating metadata table...");
    var stmt = db.prepare(`INSERT INTO metadata(version, build_date, commonOnly) VALUES ("${obj.version}", "${obj.dictDate}", ${common})`);
    stmt.run();
    stmt.finalize();
    console.log("Metadata table has been created. \n");


    console.log("Creating languages table...");

    /**
     * Create the languages table and insert the correct data..
     */
    db.run("CREATE TABLE languages (language TEXT)");
    obj.languages.forEach(async (lang) => {
        stmt = db.prepare(`INSERT INTO languages(language) VALUES ("${lang}")`);
        stmt.run();
        stmt.finalize();
    });

    console.log("Languages table has been created. \n");

    /**
     * Create the revisions table and insert the correct data..
     */
    console.log("Creating revisions table...");

    db.run("CREATE TABLE revisions (revision TEXT)");
    obj.dictRevisions.forEach(async (rev) => {
        stmt = db.prepare(`INSERT INTO revisions(revision) VALUES ("${rev}")`);
        stmt.run();
        stmt.finalize();
    });

    console.log("Languages table has been created. \n");
    
    /**
     * Create the tags table and insert the correct data..
     */
    console.log("Creating tags table...");

    db.run("CREATE TABLE tags (tag_type TEXT, tag TEXT)");

    for(var tag in obj.tags){
        // console.log(tag+": "+obj.tags[tag]);
        stmt = db.prepare(`INSERT INTO tags(tag_type, tag) VALUES ("${tag}", "${obj.tags[tag]}")`);
        stmt.run();
        stmt.finalize();
    }

    console.log("Tags table has been created. \n");
    
});
