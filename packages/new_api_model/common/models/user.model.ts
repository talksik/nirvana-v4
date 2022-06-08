export class User {
  lastUpdatedDate?: Date;

  priorityConversations?: string[]; // id of all priority convos

  constructor(
    public id: string,
    public uid: string,
    public providerId: string,
    public email: string,
    public displayName?: string,
    public photoUrl?: string,
    public phoneNumber?: string,
    public createdDate: Date = new Date(),
  ) {}
}
