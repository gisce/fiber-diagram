import { PositionSize } from "base/Grid";
import { TubeApiType, TubeDataType } from "base/Tube";

export type WireDisposition = "LEFT" | "RIGHT";

export type WireType<T> = {
  id: number;
  name: string;
  disposition: WireDisposition;
  tubes?: T;
};

export type WireApiType = WireType<TubeApiType[]>;

export type WireDataType = WireType<TubeDataType[]> & {
  attr?: PositionSize;
  expanded?: boolean;
};
