A WIP utility to convert Scriptin's jmdict-simplified JSON files into a SQLite database.

TO-DO (strikethrough = done):
~~Fix issue where values in the related column is only ever '[object Object]' for the Sense table~~
Automate the downloading & importing of jmdict-simplified
Better documentation / comments
Write utility SQL queries

Throughout this project I've used external articles/code to help solve certain issues I was having. 
Here is the source to each one that contributed to solving an important problem: 

jmdict-simplified by scriptin:
https://github.com/scriptin/jmdict-simplified

Inserting data into SQLite databases:
https://www.sqlitetutorial.net/sqlite-nodejs/insert/

Creating SQLite databases:
https://www.sqlitetutorial.net/sqlite-create-table/

Reading JSON into memory:
https://stackoverflow.com/questions/10011011/using-node-js-how-do-i-read-a-json-file-into-server-memory

Speeding up SQLite I/O times:
https://github.com/TryGhost/node-sqlite3/issues/437


NOTE:

If any of the original authors stumble across this and you have any issues with me using / adapting code from these sources, please contact me.

