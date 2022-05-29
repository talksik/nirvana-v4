import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const storage = getStorage();

export const uploadAudioClip = async (uniqueFileName: string, blob: Blob) => {
  try {
    const audioClipsRef = ref(storage, `content/${uniqueFileName}`);

    const metadata = {
      contentType: blob.type,
    };

    // 'file' comes from the Blob or File API
    const snapshot = await uploadBytes(audioClipsRef, blob, metadata);

    return await getDownloadURL(audioClipsRef);
  } catch (error) {
    console.warn(error);

    throw Error('problem in uploading audio clip');
  }
};
