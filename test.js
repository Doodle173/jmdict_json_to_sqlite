var fs = require('fs');

var obj = JSON.parse(fs.readFileSync('data/jmdict-eng-3.5.0.json', 'utf8'));

var tmp = JSON.stringify(obj.words);
var words = JSON.parse(tmp);


for (var i = 0; i < words.length; i++) {
    var word = words[i];

    for (var j = 0; j < word.sense.length; j++) {
        var sense = word.sense[j];
        console.log(sense);
        
    }


    break;
}
