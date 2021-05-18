import axios from 'axios';

export async function fetchData(word: string) {
  try {
    const { data } = await axios.get(
      `${process.env.DICTIONARY_URL_API}${word}`,
    );
    return data[0];
  } catch (err) {
    console.log('Word:', word, err.response.data.message);
    return null;
  }
}
