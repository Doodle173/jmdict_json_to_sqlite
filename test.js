var fs = require('fs');

var obj = JSON.parse(fs.readFileSync('data/jmdict-eng-3.5.0.json', 'utf8'));

var tmp = JSON.stringify(obj.words);
var words = JSON.parse(tmp);


for (var i = 0; i < words.length; i++) {
    var word = words[i];

    for (var j = 0; j < word.kana.length; j++) {
        var kana = word.kana[j];

        console.log(kana);

        /**
         * Get the fields in the kana's 'tags' array
         */
        var kana_tags = kana.tags;
        for(var k = 0; k < kana_tags.length; k++){
            var tag = kana_tags[k];

        }

        /**
         * Get the fields in the kana's 'appliesToKanji' array
         */
        var kana_applies_to_kanji = kana.appliesToKanji;
        for(var l = 0; l < kana_tags.length; l++){
            var appliesToKanji = kana_applies_to_kanji[l];

        }
        
    }


    break;
}
