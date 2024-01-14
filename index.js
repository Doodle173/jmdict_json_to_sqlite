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

var obj = JSON.parse(fs.readFileSync('data/jmdict-eng-3.5.0.json', 'utf8'));


db.serialize(() => {

    console.log('successfully created ./test.db \n');

    // create_metadata_table(db);
    // create_tags_table(db);
    // create_languages_table(db);
    // create_revisions_table(db);

    create_words_table(db);






});

function create_words_table(db) {
    /**
     * Create the tags table and insert the correct data..
     */
    console.log("Creating words table...");

    db.run("CREATE TABLE words (id TEXT)");

    var tmp = JSON.stringify(obj.words);
    var words = JSON.parse(tmp);


    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        console.log(word);


        break;
    }


    console.log("Tags table has been created. \n");
}

function create_tags_table(db) {
    /**
     * Create the tags table and insert the correct data..
     */
    console.log("Creating tags table...");

    db.run("CREATE TABLE tags (tag_type TEXT, tag TEXT)");

    for (var tag in obj.tags) {
        // console.log(tag+": "+obj.tags[tag]);
        stmt = db.prepare(`INSERT INTO tags(tag_type, tag) VALUES ("${tag}", "${obj.tags[tag]}")`);
        stmt.run();
        stmt.finalize();
    }

    console.log("Tags table has been created. \n");
}

function create_revisions_table(db) {
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

    console.log("Revisions table has been created. \n");
}

function create_languages_table(db) {
    /**
    * Create the languages table and insert the correct data..
    */

    console.log("Creating languages table...");
    db.run("CREATE TABLE languages (language TEXT)");
    obj.languages.forEach(async (lang) => {
        stmt = db.prepare(`INSERT INTO languages(language) VALUES ("${lang}")`);
        stmt.run();
        stmt.finalize();
    });

    console.log("Languages table has been created. \n");

}

function create_metadata_table(db) {
    db.run("CREATE TABLE metadata (version TEXT, build_date TEXT, commonOnly INTEGER)");

    var common = 0;

    if (obj.commonOnly == true) {
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
}