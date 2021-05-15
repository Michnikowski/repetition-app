export class RepetitionTimeButtonDto {
  repetitionTime: string;
  btn: string;
  buttonDescription: string;
  repeat?: boolean;
  arrowUp?: boolean;
  arrowDown?: boolean;
  wink?: boolean;
}

export type RepetitionTimeButtons = RepetitionTimeButtonDto[];
