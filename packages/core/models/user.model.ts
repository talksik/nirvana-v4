import { Timestamp } from 'firebase/firestore';

export class User {
  id: string;
  lastUpdatedDate?: Timestamp;

  priorityConversations?: string[]; // id of all priority convos

  constructor(
    public uid: string,
    public providerId: string,
    public email: string,
    public displayName?: string,
    public photoUrl?: string,
    public phoneNumber?: string,
    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}
