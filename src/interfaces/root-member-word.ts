export enum MemberType {
  Membean,
  Other,
}

export interface RootMemberWordInterface {
  id: string;
  name: string;
  definition: string;
  type: MemberType | string;
}
