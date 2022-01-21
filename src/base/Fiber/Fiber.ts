import { Config } from "base/Config";
import { InitialPositionSize, PositionSize } from "base/Grid";
import { Splitter } from "base/Splitter";
import { Tube } from "base/Tube";
import { FiberApiType, FiberDataType } from "./Fiber.types";

export class Fiber {
  id: number;
  name: string;
  color: string;
  index: number;
  attr?: PositionSize;
  parent?: Tube | Splitter;
  parentType: "TUBE" | "SPLITTER";

  constructor({
    data,
    parent,
    index,
  }: {
    data: FiberDataType;
    parent?: Tube | Splitter;
    index: number;
  }) {
    const { id, name, color } = data;

    this.id = id;
    this.name = name;
    this.color = color;

    this.index = index;
    this.parent = parent;

    if (parent instanceof Tube) {
      this.parentType = "TUBE";
    } else if (parent instanceof Splitter) {
      this.parentType = "SPLITTER";
    }

    this.attr = { ...InitialPositionSize };
  }

  getApiJson(): FiberApiType {
    const { id, name, color } = this;
    return {
      id,
      name,
      color,
    };
  }

  getJson(): FiberDataType {
    const { id, name, color, attr, index } = this;
    return {
      id,
      name,
      color,
      attr,
      index,
    };
  }
}
