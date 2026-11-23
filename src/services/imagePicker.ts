import { Platform } from 'react-native';

export interface PickedImage {
  uri: string;
  base64?: string;
  mimeType: string;
}

async function pickImageMobile(): Promise<PickedImage | null> {
  const ImagePicker = await import('expo-image-picker');
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão para acessar a galeria é necessária.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64 ?? undefined,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

async function takePictureMobile(): Promise<PickedImage | null> {
  const ImagePicker = await import('expo-image-picker');
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão para usar a câmera é necessária.');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64 ?? undefined,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

function pickImageWeb(): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({ uri: dataUrl, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export async function pickFromGallery(): Promise<PickedImage | null> {
  if (Platform.OS === 'web') return pickImageWeb();
  return pickImageMobile();
}

export async function pickFromCamera(): Promise<PickedImage | null> {
  if (Platform.OS === 'web') return pickImageWeb();
  return takePictureMobile();
}

export function imageToBase64(picked: PickedImage): string {
  if (picked.uri.startsWith('data:')) {
    return picked.uri.split(',')[1];
  }
  if (picked.base64) return picked.base64;
  throw new Error('Não foi possível obter base64 da imagem');
}
