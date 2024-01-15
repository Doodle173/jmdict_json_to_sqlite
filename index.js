const sqlite3 = require('sqlite3').verbose();

var fs = require('fs');
const { exit } = require('process');

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
    db.run("CREATE TABLE metadata (version TEXT, build_date TEXT, commonOnly INTEGER)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Metadata table has been created.");
    });
    db.run("CREATE TABLE languages (language TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Metadata table has been created.");
    });
    
    db.run("CREATE TABLE revisions(revision TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Revisions table has been created.");
    });
    
    db.run("CREATE TABLE tags (tag_type TEXT, tag TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Tags table has been created.");
    });
    db.run("CREATE TABLE kana (id TEXT, applies_to_kanji TEXT, common TEXT, tag TEXT, txt TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Kana table has been created.");
    });
    
    db.run("CREATE TABLE kanji (id TEXT, common TEXT, tag TEXT, txt TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Kanji table has been created.");
    });
    
    db.run("CREATE TABLE sense (id TEXT, part_of_speech TEXT, applies_to_kanji TEXT, applies_to_kana TEXT, related TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Sense table has been created.");
    });
    
    db.run("CREATE TABLE gloss (id TEXT, lang TEXT, gender TEXT, type TEXT, txt TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Gloss table has been created.");
    });

    insert_metadata(db);
    insert_revisions(db);
    insert_languages(db);
    insert_tags(db);
});

function create_all_tables(db) {


    console.log("All tables created.");
    console.log("Parsing data into tables...");

    parse_data(db);

    console.log("Parsing complete.");
}

function parse_gloss(gloss, id, db) {
    // console.log(gloss);

    var lang, gender, type, text = "";
    for(var i=0; i < gloss.length; i++){
        lang = gloss[i].lang;
        gender = gloss[i].gender;
        type = gloss[i].type;
        text = gloss[i].text;
    }

    // stmt = db.prepare(`INSERT INTO gloss(id, lang, gender, type, txt) VALUES("${id}", "${lang}", "${gender}", "${type}", "${text}")`);
    stmt = db.prepare(`INSERT INTO gloss(id, lang, gender, type, txt) VALUES(?, ?, ?, ?, ?)`, id, lang, gender, type, text);

    stmt.run();
    stmt.finalize();
}

function parse_sense(word, db) {
    /**
     * Handle this word's kana field
     */
    for (var i = 0; i < word.sense.length; i++) {
        var sense = word.sense[i];

        /**
         * Get the entry's part of speech data
         */
        var pos = "";
        for (var j = 0; j < sense.partOfSpeech.length; j++) {
            pos = sense.partOfSpeech[j];
            // console.log(pos);
        }

        /**
         * Get the entry's appliesToKanji data
         */
        var _appliesToKanji = "";
        for (var k = 0; k < sense.appliesToKanji.length; k++) {
            _appliesToKanji = sense.appliesToKanji[k];
            // console.log(_appliesToKanji);
        }

        /**
         * Get the entry's appliesToKana data
         */
        var appliesToKana = "";
        for (var l = 0; l < sense.appliesToKana.length; l++) {
            appliesToKana = sense.appliesToKana[l];
            // console.log(appliesToKana);
        }

        /**
         * Get the entry's related data
         */
        var _related = "";
        for (var m = 0; m < sense.related.length; m++) {
            var related = sense.related[m];
            
            for(var n = 0; n < related.length; n++){
                _related = related[n];
                // console.log(_related);
            }
        }

        var gloss = sense.gloss;
        if(gloss.length != 0){
            parse_gloss(gloss, word.id, db);
        }


        // stmt = db.prepare(`INSERT INTO sense(id, part_of_speech, applies_to_kanji, applies_to_kana, related) VALUES ("${word.id}", "${pos}", "${_appliesToKanji}", "${appliesToKana}", "${_related}")`);
        stmt = db.prepare(`INSERT INTO sense(id, part_of_speech, applies_to_kanji, applies_to_kana, related) VALUES (?, ?, ?, ?, ?)`, word.id, pos, _appliesToKanji, appliesToKana, related);

        stmt.run();
        stmt.finalize();

    }
}

function parse_kana(word, db) {
    /**
     * Handle this word's kana field
     */
    for (var j = 0; j < word.kana.length; j++) {
        var kana = word.kana[j];
        /**
         * Insert the ID into the current word's kana entry
         */

        /**
         * Get the fields in the kana's 'tags' array
         */
        var kana_tags = kana.tags;
        var current_tag = "";
        for (var k = 0; k < kana_tags.length; k++) {
            current_tag = kana_tags[k];
        }

        /**
         * Get the fields in the kana's 'appliesToKanji' array
         */
        var kana_applies_to_kanji = kana.appliesToKanji;
        var appliesToKanji = "";
        for (var l = 0; l < kana_applies_to_kanji.length; l++) {
            appliesToKanji = kana_applies_to_kanji[l];
        }
        // stmt = db.prepare(`INSERT INTO kana(id, applies_to_kanji, common, tag, txt) VALUES ("${word.id}", "${appliesToKanji}", "${kana.common}", "${current_tag}", "${kana.text}")`);
        stmt = db.prepare(`INSERT INTO kana(id, applies_to_kanji, common, tag, txt) VALUES (?, ?, ?, ?, ?)`, word.id, appliesToKanji, kana.common, current_tag, kana.text);
        

        stmt.run();
        stmt.finalize();
    }
}

function parse_kanji(word, db) {
    /**
     * Handle parsing of kanji table
     */
    for (var i = 0; i < word.kanji.length; i++) {
        var kanji = word.kanji[i];

        /**
         * Get the fields in the kanji's 'tags' array
         */
        var kanji_tags = kanji.tags;
        var current_tag = "";
        for (var j = 0; j < kanji_tags.length; j++) {
            current_tag = kanji_tags[j];
        }

        // console.log(current_tag);

        // stmt = db.prepare(`INSERT INTO kanji(id, common, tag, txt) VALUES ("${word.id}", "${kanji.common}", "${current_tag}", "${kanji.text}")`);
        stmt = db.prepare(`INSERT INTO kanji(id, common, tag, txt) VALUES (?, ?, ?, ?)`, word.id, kanji.common, current_tag, kanji.text);
        stmt.run();
        stmt.finalize();
    }
}


function parse_data(db) {

    console.time("Parser Time");



    var tmp = JSON.stringify(obj.words);
    var words = JSON.parse(tmp);

    for (var i = 0; i < words.length; i++) {
        var word = words[i];

        /**
        * Parse this word's kana fields.
        */
        if (word.kana.length != 0) {
            parse_kana(word, db);
        }

        /**
         * Parse this word's kanji fields.
         */
        if (word.kanji.length != 0) {
            parse_kanji(word, db);
        }

        /**
        * Parse this word's kanji fields.
        */
        if (word.sense.length != 0) {
            parse_sense(word, db);
        }
    }

    console.timeEnd("Parser Time");

}

function insert_tags(db) {
    for (var tag in obj.tags) {
        // console.log(tag+": "+obj.tags[tag]);
        // stmt = db.prepare(`INSERT INTO tags(tag_type, tag) VALUES ("${tag}", "${obj.tags[tag]}")`);
        stmt = db.prepare(`INSERT INTO tags(tag_type, tag) VALUES (?, ?)`, tag, obj.tags[tag]);
        stmt.run();
        stmt.finalize();
    }
}

function insert_revisions(db) {
    obj.dictRevisions.forEach(async (rev) => {
        stmt = db.prepare(`INSERT INTO revisions(revision) VALUES (?)`, rev);
        stmt.run();
        stmt.finalize();
    });

    console.log("Revisions table has been created. \n");
}

function insert_languages(db) {
    obj.languages.forEach(async (lang) => {
        stmt = db.prepare(`INSERT INTO languages(language) VALUES (?)`, lang);
        stmt.run();
        stmt.finalize();
    });
}

function insert_metadata(db) {
    var common = 0;

    if (obj.commonOnly == true) {
        common = 1;
    }

    // var stmt = db.prepare(`INSERT INTO metadata(version, build_date, commonOnly) VALUES ("${obj.version}", "${obj.dictDate}", ${common})`);
    var stmt = db.prepare(`INSERT INTO metadata(version, build_date, commonOnly) VALUES (?, ?, ?)`, obj.version, obj.dictDate, common);

    stmt.run();
    stmt.finalize();
}