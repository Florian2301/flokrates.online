export interface About {
  id: number;
  sectionKey: string;
  title: string;
  text: string;
  language: 'DE' | 'EN';
  dateCreated: string;
  dateModified: string | null;
}
