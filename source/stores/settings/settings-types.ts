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
  displayName: "",
  email: "",
  organization: "",
  collectionViewMode: "cards",
  defaultStashMode: "note",
  confirmBeforeDelete: true,
  emailDigest: false,
  stashToasts: true,
};
