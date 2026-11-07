import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { uid } from './id';

/** Takes or picks a site photo and keeps a private copy, so it survives the camera roll being cleared. */
export async function addPhoto(source: 'camera' | 'library'): Promise<string | undefined> {
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, allowsEditing: false };
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Camera access is off. Turn it on in your phone’s Settings to take site photos.');
  }
  const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets[0]) return undefined;
  const picked = res.assets[0].uri;
  if (Platform.OS === 'web') return picked;
  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create({ intermediates: true });
  const dest = new File(dir, `${uid()}.jpg`);
  await new File(picked).copy(dest);
  return dest.uri;
}

export function deletePhoto(uri: string) {
  if (Platform.OS === 'web') return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // already gone
  }
}

/** Photo as a data URI for embedding in the PDF. */
export async function photoDataUri(uri: string): Promise<string | undefined> {
  if (Platform.OS === 'web' || uri.startsWith('data:')) return uri;
  try {
    return `data:image/jpeg;base64,${await new File(uri).base64()}`;
  } catch {
    return undefined;
  }
}

/** Saves a backup file and opens the share sheet (Google Drive, email, WhatsApp to yourself…). */
export async function shareBackup(snapshot: object) {
  const name = `graft-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const json = JSON.stringify(snapshot);
  if (Platform.OS === 'web') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = name;
    a.click();
    return;
  }
  const f = new File(Paths.cache, name);
  if (f.exists) f.delete();
  f.create();
  await f.write(json);
  await Sharing.shareAsync(f.uri, { mimeType: 'application/json', dialogTitle: 'Save your Graft backup' });
}

/** Lets the user pick a spreadsheet export (CSV/TSV/text) and returns its text. */
export async function pickTextFile(): Promise<{ name: string; text: string } | undefined> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', 'text/tab-separated-values', 'text/plain', 'application/vnd.ms-excel', '*/*'], copyToCacheDirectory: true });
  if (res.canceled || !res.assets[0]) return undefined;
  const a = res.assets[0];
  if (/\.xlsx?$/i.test(a.name)) throw new Error('That’s an Excel file. In Excel or Google Sheets, use File → Download / Save as → CSV, then import the CSV.');
  const text = Platform.OS === 'web' ? await (await fetch(a.uri)).text() : await new File(a.uri).text();
  return { name: a.name, text };
}

/** Lets the user pick a backup file and returns its parsed contents. */
export async function pickBackup(): Promise<unknown | undefined> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', '*/*'], copyToCacheDirectory: true });
  if (res.canceled || !res.assets[0]) return undefined;
  const text = Platform.OS === 'web' ? await (await fetch(res.assets[0].uri)).text() : await new File(res.assets[0].uri).text();
  return JSON.parse(text);
}
