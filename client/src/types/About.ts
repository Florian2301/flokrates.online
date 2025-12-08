export interface About {
  imageUrl: string | null;
  id: number;
  sectionKey: string;
  title: string;
  text: string;
  language: 'DE' | 'EN';
  dateCreated: string;
  dateModified: string | null;
}

export type AboutSectionKey =
  | 'project'
  | 'author'
  | 'flokrates'
  | 'lotharius'
  | 'pablo';
