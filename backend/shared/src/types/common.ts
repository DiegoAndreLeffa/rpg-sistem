export type Id = string;

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}
