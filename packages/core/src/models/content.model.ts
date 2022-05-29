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
export class ContentBlock implements IContent {
  id: string;

  constructor(
    public creatorUserId: string,
    public contentUrl: string,

    public contentType: ContentType,
    public blobType: string,

    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}

export enum ContentType {
  audio = 'audio',

  link = 'link',

  image = 'image',
}

export function isUrlImage(url: string) {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}
