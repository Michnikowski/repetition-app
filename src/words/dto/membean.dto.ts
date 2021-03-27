export class MembeanWord {
  order: number;
  root:  string;
  meaning:  string;
  leafs: object;
}

export type GetMembeanWordsResponse = MembeanWord[];
