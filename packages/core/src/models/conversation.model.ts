import { FieldValue, serverTimestamp, Timestamp } from 'firebase/firestore';
export default class Conversation {
  id: string;

  constructor(
    public createdByUserId: string,

    public name: string | null = null,

    public createdDate = Timestamp.now(),

    public membersInRoom: string[] = [],

    public lastActivityDate: Timestamp = Timestamp.now(),
  ) {}
}

export class ConversationMember {
  constructor(
    public id: string, // NOTE: serves as the user ID
    public conversationId: string,

    public role: MemberRole,

    public memberState: MemberState,

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
