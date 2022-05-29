import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const storage = getStorage();

export const uploadAudioClip = async (uniqueFileName: string, blob: Blob) => {
  try {
    const audioClipsRef = ref(storage, `audioClips/${uniqueFileName}`);

    // 'file' comes from the Blob or File API
    const snapshot = await uploadBytes(audioClipsRef, blob);

    return await getDownloadURL(audioClipsRef);
  } catch (error) {
    console.warn('problem in uploading audio clip');

    throw Error('problem in uploading audio clip');
  }
};
