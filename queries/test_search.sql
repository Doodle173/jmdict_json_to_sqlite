-- SQLite
SELECT kanji.id, kanji.txt, kana.txt, gloss.txt FROM kanji
INNER JOIN kana ON kanji.id = kana.id
INNER JOIN gloss ON kanji.id = gloss.id
WHERE kanji.txt = "漢字";

