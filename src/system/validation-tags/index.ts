import { tags } from 'typia';

export type Email = string & tags.Format<'email'>;
export type Uuid = string & tags.Format<'uuid'>;
export type Datetime = string &
  tags.Pattern<'(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+)|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d)|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d)'>;
