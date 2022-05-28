import { FieldValue, serverTimestamp, Timestamp } from 'firebase/firestore';
export default class Conversation {
  constructor(
    public id: string,
    public name: string,

    public createdByUserId: string,

    public lastUpdatedDate = Timestamp.now(),

    public createdDate = Timestamp.now(),

    public membersInRoom: string[] = [],
  ) {}
}

export class Member {
  constructor(
    public id: string,
    public userId: string,
    public role: 'admin' | 'regular',
    public joinedDate = Timestamp.now(),
  ) {}
}
