const sqlite3 = require('sqlite3').verbose();

var fs = require('fs');

try{
    fs.unlinkSync("./test.db");
    console.log("Cleaned up existing database file.\n");
}catch(err){
    console.log("Failed to clean up existing database file.");
    console.log(err);
}

const db = new sqlite3.Database('./test.db');

var obj = JSON.parse(fs.readFileSync('data/jmdict-eng-3.5.0.json', 'utf8'));

init();

async function init() {
    db.exec("CREATE TABLE metadata (version TEXT, build_date TEXT, commonOnly INTEGER)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Metadata table has been created.");
    });
    db.exec("CREATE TABLE languages (language TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Languages table has been created.");
    });

    db.exec("CREATE TABLE revisions(revision TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Revisions table has been created.");
    });

    db.exec("CREATE TABLE tags (tag_type TEXT, tag TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Tags table has been created.");
    });
    db.exec("CREATE TABLE kana (id TEXT, applies_to_kanji TEXT, common TEXT, tag TEXT, txt TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Kana table has been created.");
    });

    db.exec("CREATE TABLE kanji (id TEXT, common TEXT, tag TEXT, txt TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Kanji table has been created.");
    });

    db.exec("CREATE TABLE sense (id TEXT, part_of_speech TEXT, applies_to_kanji TEXT, applies_to_kana TEXT, related TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Sense table has been created.");
    });

    db.exec("CREATE TABLE gloss (id TEXT, lang TEXT, gender TEXT, type TEXT, txt TEXT)", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Gloss table has been created.");
    });

    insert_metadata(db);
    insert_revisions(db);
    insert_languages(db);
    insert_tags(db);

    /**
     * This is probably not a great solution to the concurrency problems I am having,
     * but it's the only thing I've tried that seems to work, so this is the solution
     * for now.
     */


    await sleep(1000);

    console.log("\n");
    console.log("Finished creating all tables. \n");

    console.log("Parsing data into tables...");
    parse_data(db);
    console.log("Parsing complete.");
    console.log("Writing database to file. Program will exit upon completion.");
}



/**
 * Source: Aminadav Glickshtein
 * https://stackoverflow.com/questions/14249506/how-can-i-wait-in-node-js-javascript-l-need-to-pause-for-a-period-of-time
 * @param {*} ms 
 * @returns 
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function parse_data(db) {
    console.time("Parser Time");

    var tmp = JSON.stringify(obj.words);
    var words = JSON.parse(tmp);
    
    db.run("BEGIN TRANSACTION");
    for (var i = 0; i < words.length; i++) {
        var word = words[i];

        /**
        * Parse this word's kanji fields.
        */

        if (word.kanji.length != 0) {
            parse_kanji(word, db);
        }

        /**
        * Parse this word's kana fields.
        */
        if (word.kana.length != 0) {
            parse_kana(word, db);
        }


        /**
        * Parse this word's sense fields.
        */

        if (word.sense.length != 0) {
            parse_sense(word, db);
        }
        
    }
    db.run("COMMIT");
    console.timeEnd("Parser Time");

}

function parse_gloss(gloss, id, db) {
    // console.log(gloss);

    var lang, gender, type, text = "";
    for (var i = 0; i < gloss.length; i++) {
        lang = gloss[i].lang;
        gender = gloss[i].gender;
        type = gloss[i].type;
        text = gloss[i].text;
    }

    db.run(`INSERT INTO gloss(id, lang, gender, type, txt) VALUES(?, ?, ?, ?, ?)`, [id, lang, gender, type, text], function (err) {
        if (err) {
            return console.error(err.message);
        }
    });

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

            for (var n = 0; n < related.length; n++) {
                _related = related[n];
                // console.log(_related);
            }
        }

        var gloss = sense.gloss;
        if (gloss.length != 0) {
            parse_gloss(gloss, word.id, db);
        }

        db.run(`INSERT INTO sense(id, part_of_speech, applies_to_kanji, applies_to_kana, related) VALUES (?, ?, ?, ?, ?)`, [word.id, pos, _appliesToKanji, appliesToKana, _related], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });

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

        db.run(`INSERT INTO kana(id, applies_to_kanji, common, tag, txt) VALUES (?, ?, ?, ?, ?)`, [word.id, appliesToKanji, kana.common, current_tag, kana.text], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
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

        db.run(`INSERT INTO kanji(id, common, tag, txt) VALUES (?, ?, ?, ?)`, [word.id, kanji.common, current_tag, kanji.text], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });

    }
}

function insert_tags(db) {
    for (var tag in obj.tags) {
        db.run(`INSERT INTO tags(tag_type, tag) VALUES (?, ?)`, [tag, obj.tags[tag]], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });

    }
}

function insert_revisions(db) {
    for (var i = 0; i < obj.dictRevisions.length; i++) {
        var rev = obj.dictRevisions[i];

        // stmt = db.prepare(`INSERT INTO revisions(revision) VALUES (?)`, rev);
        // stmt.run();
        // stmt.finalize();
        db.run(`INSERT INTO revisions(revision) VALUES (?)`, [rev], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });

    }
}

function insert_languages(db) {
    obj.languages.forEach(async (lang) => {
        db.run(`INSERT INTO languages(language) VALUES (?)`, [lang], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
    });
}

function insert_metadata(db) {
    var common = 0;

    if (obj.commonOnly == true) {
        common = 1;
    }

    db.run(`INSERT INTO metadata(version, build_date, commonOnly) VALUES (?, ?, ?)`, [obj.version, obj.dictDate, common], function (err) {
        if (err) {
            return console.error(err.message);
        }
    });
    
}