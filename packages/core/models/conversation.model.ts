import { FieldValue, serverTimestamp, Timestamp } from 'firebase/firestore';
import { User } from './user.model';
export default class Conversation {
  id: string;

  constructor(
    public createdByUserId: string,

    public memberIdsList: string[],

    public members: MemberMap,

    public userCache: User[],

    public name: string | null = null,

    public lastUpdatedDate = Timestamp.now(),

    public createdDate = Timestamp.now(),

    public membersInRoom: string[] = [],
  ) {}
}

export type MemberMap = {
  [memberId: string]: ConversationMember;
};

export class ConversationMember {
  constructor(
    public userId: string, // NOTE: serves as the user ID

    public role: MemberRole,

    public memberState: MemberState,
    public isActive: boolean = true,
    public lastActiveDate: Timestamp | null = null,
    public joinedDate = Timestamp.now(),
  ) {}
}

export enum MemberRole {
  admin = 'admin',
  regular = 'regular',
}
export enum MemberState {
  priority = 'priority',
  inbox = 'inbox',
  // deleted = "deleted"
}
