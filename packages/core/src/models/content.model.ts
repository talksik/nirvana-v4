import { Timestamp } from 'firebase/firestore';

interface IContent {
  id: string;
  creatorUserId: string;
  contentUrl: string; // remote resource of file/media
  createdDate: Timestamp;

  // visitCount
}

// ? persist length of clip for easier viewing for others...
// ?they have to load it anyway and will get metadata anyway?
export class AudioClip implements IContent {
  constructor(
    public id: string,
    public creatorUserId: string,
    public contentUrl: string,
    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}

export class Link implements IContent {
  constructor(
    public id: string,
    public creatorUserId: string,
    public contentUrl: string,
    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}

export class Image implements IContent {
  constructor(
    public id: string,
    public creatorUserId: string,
    public contentUrl: string,
    public thumbnailUrl?: string,
    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}
