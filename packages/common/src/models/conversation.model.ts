import { User } from './user.model';
export default class Conversation {
  constructor(
    public id: string,
    public createdByUserId: string,

    public memberIdsList: string[],

    public members: MemberMap,

    public userCache: User[],

    public name: string | null = null,

    public lastUpdatedDate: Date,

    public createdDate: Date,

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
    public lastActiveDate: Date = null,
    public joinedDate = Date,
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
