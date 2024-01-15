var fs = require('fs');

var obj = JSON.parse(fs.readFileSync('data/jmdict-eng-3.5.0.json', 'utf8'));

var tmp = JSON.stringify(obj.words);
var words = JSON.parse(tmp);


for (var i = 0; i < words.length; i++) {
    var word = words[i];


    for (var i = 0; i < word.sense.length; i++) {
        var sense = word.sense[i];

        var temp = sense.languageSource;
        console.log(temp);
        if(temp.length != 0){
            console.log(temp);
            break;
        }else{
            
        }
    }


}

