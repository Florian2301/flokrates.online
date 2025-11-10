export interface About {
  imageUrl: string | undefined;
  id: number;
  sectionKey: string;
  title: string;
  text: string;
  language: 'DE' | 'EN';
  dateCreated: string;
  dateModified: string | null;
}
