import React, { useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { WireUi } from "@/ui/WireUi";
import { Grid, GridData } from "@/base/Grid";
import { Config } from "@/base/Config";
import { FiberConnectionUi } from "@/ui/FiberConnectionUi/FiberConnectionUi";
import { FiberConnectionContextProvider } from "@/ui/FiberConnectionUi/FiberConnectionContext";
import { sanitize } from "@/utils/sanitizer";
import { TubeConnectionUi } from "@/ui/TubeConnectionUi/TubeConnectionUi";
import { SplitterUi } from "@/ui/SplitterUi/SplitterUi";
import { AddSplitterButton } from "@/ui/AddSplitterButton/AddSplitterButton";
import { SplitterOpts } from "@/base/Splitter/Splitter.types";
import LocaleContextProvider from "@/ui/locales/LocaleContext";
import { Splitter } from "@/base/Splitter";
import { RemoveSplitterButton } from "@/ui/RemoveSplitterButton/RemoveSplitterButton";
import { Space } from "antd";

export const GridUi = ({
  inputJson,
  onChange,
  locale = "en_US",
  readonly = false,
}: {
  inputJson: string;
  onChange: (outputJson: string) => void;
  locale?: "en_US" | "ca_ES" | "es_ES";
  readonly?: boolean;
}) => {
  const [grid, setGrid] = useState<Grid>();
  const [gridData, setGridData] = useState<GridData>();
  const [selectedSplitter, setSelectedSplitter] = useState<Splitter>();

  const onChangeGrid = useCallback(
    (newGrid: Grid) => {
      if (JSON.stringify(newGrid.getJson()) !== JSON.stringify(gridData)) {
        setGridData(newGrid.getJson());
        onChange(JSON.stringify(sanitize(newGrid.getJson())));
      }
    },
    [grid, gridData],
  );

  useEffect(() => {
    const input = sanitize(JSON.parse(inputJson));
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
    return <WireUi key={i} wire={wire} readonly={readonly} />;
  });
  const rightWires = grid.rightWires.map((wire, i) => {
    return <WireUi key={i} wire={wire} readonly={readonly} />;
  });

  return (
    <LocaleContextProvider lang={locale}>
      <div
        style={{
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
          backgroundColor: "#EEEEEE",
        }}
      >
        {!readonly && (
          <Space>
            <AddSplitterButton
              disabled={selectedSplitter !== undefined}
              onAddSplitter={(splitterOpts: SplitterOpts) => {
                grid.addNewSplitter(splitterOpts);
              }}
            />
            <RemoveSplitterButton
              onRemoveSelectedSplitter={() => {
                if (readonly) {
                  return;
                }

                selectedSplitter.remove();
                setSelectedSplitter(undefined);
              }}
              disabled={selectedSplitter === undefined}
            />
          </Space>
        )}
      </div>
      <Stage
        style={{ backgroundColor: "#EEEEEE" }}
        width={grid.size.width * Config.pixelsPerUnit}
        height={grid.size.height * Config.pixelsPerUnit}
      >
        <FiberConnectionContextProvider>
          <Layer>
            <Rect
              x={grid.leftSideWidth * Config.pixelsPerUnit}
              y={0}
              width={1}
              height={grid.size.height * Config.pixelsPerUnit}
              fill={"#cccccc"}
            />

            {grid.tubeConnections?.map((connection, i) => {
              return (
                <TubeConnectionUi
                  key={i}
                  connection={connection}
                  readonly={readonly}
                />
              );
            })}
            {grid.splitters?.map((splitter) => {
              return (
                <SplitterUi
                  key={splitter.id}
                  splitter={splitter}
                  readonly={readonly}
                  splitterIsSelected={splitter.id === selectedSplitter?.id}
                  onSplitterSelected={(splitterToSelect: Splitter) => {
                    if (readonly) {
                      return;
                    }
                    if (splitterToSelect.id === selectedSplitter?.id) {
                      setSelectedSplitter(undefined);
                    } else {
                      setSelectedSplitter(splitterToSelect);
                    }
                  }}
                />
              );
            })}
            <LocaleContextProvider lang={locale}>
              {grid.fiberConnections?.map((connection, i) => {
                return (
                  <FiberConnectionUi
                    key={i}
                    connection={connection}
                    readonly={readonly}
                  />
                );
              })}
            </LocaleContextProvider>
            {leftWires}
            {rightWires}
            {/* {
            // For debugging purposes
            Object.keys(
              grid.pathController.tubeFusionColumnController.indexController
                .indexes
            ).map((key, i) => {
              return (
                <Rect
                  key={i}
                  x={grid.leftSideWidth * Config.pixelsPerUnit}
                  y={parseInt(key) * Config.pixelsPerUnit}
                  width={1}
                  height={1 * Config.pixelsPerUnit}
                  fill={"#ff0000"}
                />
              );
            })
          }
          {
            // For debugging purposes
            [
              ...Object.keys(
                grid.pathController.rightAngleRowController.indexController
                  .indexes
              ),
              ...Object.keys(
                grid.pathController.leftAngleRowController.indexController
                  .indexes
              ),
            ].map((key, i) => {
              return (
                <Rect
                  key={i}
                  x={parseInt(key) * Config.pixelsPerUnit}
                  y={1}
                  width={1 * Config.pixelsPerUnit}
                  height={1}
                  fill={"#ff0000"}
                />
              );
            })
          } */}
          </Layer>
        </FiberConnectionContextProvider>
      </Stage>
    </LocaleContextProvider>
  );
};
