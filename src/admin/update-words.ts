import { Definition } from "src/words/entities/definition.entity";
import { Example } from "src/words/entities/example.entity";
import { WordFunction } from "src/words/entities/word-function.entity";
import { Word } from "src/words/entities/word.entity";
import { fetchData } from "./fetch-data";

export async function updateWords(words: Word[]) {
  let countWords: number;
  let wordFunction: WordFunction;
  let definitionEntity: Definition;
  let exampleEntity: Example;

  for (const word of words) {
    let wordName: string
    if (word.name.includes("(")){
      wordName = word.name.slice(0, word.name.indexOf("("))
    } else {
      wordName = word.name
    }

    let data = await fetchData(wordName);

    if (!data) continue;

    try {
      if (data.phonetics.length) {
        let phonetics = data.phonetics[0];

        if (phonetics.text !== undefined) {
          word.phoneticNotation = phonetics.text
        }

        if (phonetics.audio !== undefined) {
          word.audioUrl = phonetics.audio
        }

        await word.save();
      }

      if (!data.meanings.length) continue;

      let meanings = data.meanings;

      for (const meaning of meanings) {
        if (meaning.partOfSpeech === undefined) continue;
        if (!meaning.definitions.length) continue;

        let { partOfSpeech, definitions } = meaning;

        for (const item of definitions) {
          if (item.definition !== undefined) {
            let { definition } = item;

            countWords = await Word.createQueryBuilder('word')
              .leftJoin('word.wordFunctions', 'wordFunction')
              .leftJoin('wordFunction.definitions', 'definition')
              .where('word.id = :id', { id: word.id })
              .andWhere('wordFunction.function = :function', { function: partOfSpeech })
              .andWhere('definition.definement = :definement', { definement: definition })
              .getCount();

            if (!countWords) {
              wordFunction = await getWordFunction(word, partOfSpeech)

              definitionEntity = new Definition();
              definitionEntity.definement = definition;
              definitionEntity.wordFunction = wordFunction;
              await definitionEntity.save();
            }
          }

          if (item.example !== undefined) {
            let { example } = item;

            countWords = await Word.createQueryBuilder('word')
              .leftJoin('word.wordFunctions', 'wordFunction')
              .leftJoin('wordFunction.examples', 'example')
              .where('word.id = :id', { id: word.id })
              .andWhere('wordFunction.function = :function', { function: partOfSpeech })
              .andWhere('example.usage = :usage', { usage: example })
              .getCount();

            if (!countWords) {
              wordFunction = await getWordFunction(word, partOfSpeech)

              exampleEntity = new Example();
              exampleEntity.usage = example;
              exampleEntity.wordFunction = wordFunction;
              await exampleEntity.save();
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}

async function getWordFunction(word: Word, partOfSpeech: string): Promise<WordFunction> {
  let wordFunction = await WordFunction.createQueryBuilder( 'wordFunction' )
    .leftJoinAndSelect('wordFunction.word', 'word')
    .where('word.id = :id', { id: word.id })
    .andWhere('wordFunction.function = :function', { function: partOfSpeech })
    .getOne();

  if (!wordFunction) {
    wordFunction = new WordFunction();
    wordFunction.function = partOfSpeech;
    wordFunction.word = word;
    await wordFunction.save();
  }

  return wordFunction
}
