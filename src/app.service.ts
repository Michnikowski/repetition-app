import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { MemberRootWord } from './words/entities/member-root-word.entity';

@Injectable()
export class AppService {
  async getAlphabet(): Promise<Object[]> {

    const alphabetBasedOnMemberRootWords = await getConnection()
      .createQueryBuilder()
      .select('UPPER(LEFT(memberRootWord.name,1))', 'letter')
      .distinctOn(['letter'])
      .from(MemberRootWord, 'memberRootWord')
      .orderBy('letter', 'ASC')
      .getRawMany()
      
    return alphabetBasedOnMemberRootWords
  }
}
