import { Timestamp } from 'firebase/firestore';

export interface IContent {
  id: string;
  creatorUserId: string;
  contentUrl: string; // remote resource of file/media
  createdDate: Timestamp;

  // visitCount
}

// ? persist length of clip for easier viewing for others...
// ?they have to load it anyway and will get metadata anyway?
export class AudioClip implements IContent {
  id: string;

  constructor(
    public creatorUserId: string,
    public contentUrl: string,
    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}

export class Link implements IContent {
  id: string;
  constructor(
    public creatorUserId: string,
    public contentUrl: string,
    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}

export class Image implements IContent {
  id: string;

  constructor(
    public creatorUserId: string,
    public contentUrl: string,
    public thumbnailUrl?: string,
    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}
