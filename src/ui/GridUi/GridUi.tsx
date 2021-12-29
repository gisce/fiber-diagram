import React, { useEffect, useState, useCallback, useRef } from "react";
import { Stage, Layer } from "react-konva";
import { WireUi } from "ui/WireUi";
import { Grid, GridDataType } from "base/Grid";
import { Config } from "base/Config";
import { FiberConnectionUi } from "ui/Connections/FiberConnectionUi";

export const GridUi = ({
  inputJson,
  onChange,
}: {
  inputJson: string;
  onChange: (outputJson: string) => void;
}) => {
  const [grid, setGrid] = useState<Grid>();
  const [gridData, setGridData] = useState<GridDataType>();

  const onChangeGrid = useCallback(
    (newGrid: Grid) => {
      if (JSON.stringify(newGrid.getJson()) !== JSON.stringify(gridData)) {
        setGridData(newGrid.getJson());
        onChange(JSON.stringify(newGrid.getApiJson()));
      }
    },
    [grid, gridData]
  );

  useEffect(() => {
    const input = JSON.parse(inputJson);
    setGrid(new Grid({ input, onChange: onChangeGrid }));
  }, [inputJson]);

  useEffect(() => {
    if (!gridData) {
      return;
    }

    setGrid(new Grid({ input: gridData, onChange: onChangeGrid }));
  }, [gridData]);

  if (!grid) {
    return null;
  }

  const leftWires = grid.leftWires.map((wire, i) => {
    return <WireUi key={i} wire={wire} />;
  });
  const rightWires = grid.rightWires.map((wire, i) => {
    return <WireUi key={i} wire={wire} />;
  });

  return (
    <Stage
      width={grid.size.width * Config.pixelsPerUnit}
      height={grid.size.height * Config.pixelsPerUnit}
    >
      <Layer>
        {leftWires}
        {rightWires}
        {grid.connections?.map((connection, i) => {
          return <FiberConnectionUi key={i} connection={connection} />;
        })}
      </Layer>
    </Stage>
  );
};
