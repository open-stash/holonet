export type CollectionViewMode = "cards" | "grouped" | "list";

export type StashMode = "note" | "link" | "upload";

export interface UserSettings {
  displayName: string;
  email: string;
  organization: string;
  collectionViewMode: CollectionViewMode;
  defaultStashMode: StashMode;
  confirmBeforeDelete: boolean;
  emailDigest: boolean;
  stashToasts: boolean;
}

export const defaultUserSettings: UserSettings = {
  displayName: "Alkush Pipania",
  email: "alkushpipania2006@gmail.com",
  organization: "Alkush Pipania",
  collectionViewMode: "cards",
  defaultStashMode: "note",
  confirmBeforeDelete: true,
  emailDigest: false,
  stashToasts: true,
};
