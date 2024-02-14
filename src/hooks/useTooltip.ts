import { Config } from "@/base/Config";
import { useCallback, useState } from "react";

const DEFAULT_WAIT_MS = 500;

export const useTooltip = () => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("left");

  const handleOnMouseEnter = useCallback((e: any) => {
    const stage = e.target.getStage();
    const container = stage.container();
    container.style.cursor = "context-menu";
    const id = setTimeout(() => {
      const { x, y } = stage.getPointerPosition();
      const elementWidth = Config.baseUnits.tube.width * Config.pixelsPerUnit;

      if (x > stage.getStage().width() - elementWidth) {
        setDirection("right");
      }

      setTooltipPosition({ x, y });
      setTooltipVisible(true);
    }, DEFAULT_WAIT_MS);

    setTimeoutId(id);
  }, []);

  const handleOnMouseLeave = useCallback(
    (e: any) => {
      if (timeoutId) clearTimeout(timeoutId);
      const container = e.target.getStage().container();
      container.style.cursor = "default";
      setTooltipVisible(false);
    },
    [timeoutId],
  );

  return {
    tooltipVisible,
    tooltipPosition,
    handleOnMouseEnter,
    handleOnMouseLeave,
    direction,
  };
};
