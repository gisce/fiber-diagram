import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GridUi } from "./GridUi";
import basic from "../../examples/basic.json";
import eight from "../../examples/8.json";
import nine from "../../examples/9.json";
import ten from "../../examples/10.json";
import simpleConnections from "../../examples/simpleConnections.json";
import basic1Splitter from "../../examples/basic1Splitter.json";
import basic2Splitter from "../../examples/basic2Splitter.json";
import "antd/dist/antd.css";

const meta: Meta<typeof GridUi> = {
  title: "Components/GridUi",
  component: GridUi,
};

export default meta;
type Story = StoryObj<typeof GridUi>;

// export default {
//   title: "Components/GridUi",
//   component: GridUi,
// } as ComponentMeta<typeof GridUi>;

// const Template: ComponentStory<typeof GridUi> = (args) => <GridUi {...args} />;

export const Basic: Story = {
  args: { inputJson: JSON.stringify(basic) },
};

export const Eight: Story = {
  args: { inputJson: JSON.stringify(eight) },
};

export const Nine: Story = {
  args: { inputJson: JSON.stringify(nine) },
};

export const Ten: Story = {
  args: { inputJson: JSON.stringify(ten) },
};

export const SimpleConnections: Story = {
  args: { inputJson: JSON.stringify(simpleConnections) },
};

export const BasicW1Splitter: Story = {
  args: { inputJson: JSON.stringify(basic1Splitter) },
};

export const BasicW2Splitter: Story = {
  args: { inputJson: JSON.stringify(basic2Splitter) },
};

export const Error: Story = {
  args: {
    // inputJson: JSON.stringify({
    //   res: {
    //     connections: {
    //       fibers: [
    //         { fiber_out: 53, fiber_in: 4 },
    //         { fiber_out: 59, fiber_in: 24 },
    //         { fiber_out: 16, fiber_in: 52 },
    //         { fiber_out: 14, fiber_in: 12 },
    //         { fiber_out: 8, fiber_in: 10 },
    //         { fiber_out: 18, fiber_in: 6 },
    //         { fiber_out: 22, fiber_in: 20 },
    //         { fiber_out: 34, fiber_in: 32 },
    //         { fiber_out: 40, fiber_in: 38 },
    //         { fiber_out: 44, fiber_in: 42 },
    //         { fiber_out: 50, fiber_in: 48 },
    //         { fiber_out: 26, fiber_in: 36 },
    //         { fiber_out: 30, fiber_in: 28 },
    //         { fiber_out: 55, fiber_in: 2 },
    //         { fiber_out: 46, fiber_in: 57 },
    //       ],
    //     },
    //     elements: {
    //       splitters: [],
    //       wires: [
    //         {
    //           tubes: [
    //             {
    //               color: "#FFFFFF",
    //               fibers: [
    //                 {
    //                   color: "#00FF00",
    //                   id: 2,
    //                   name: "Cable 1 - Tube 1 - Fiber 1",
    //                 },
    //                 {
    //                   color: "#FF0000",
    //                   id: 4,
    //                   name: "Cable 1 - Tube 1 - Fiber 2",
    //                 },
    //               ],
    //               id: 1,
    //               name: "Cable 1 - Tube 1",
    //             },
    //           ],
    //           id: 1,
    //           disposition: "LEFT",
    //           name: "Cable 1",
    //         },
    //         {
    //           tubes: [
    //             {
    //               color: "#0000FF",
    //               fibers: [
    //                 {
    //                   color: "#00FF00",
    //                   id: 6,
    //                   name: "Cable 2 - Tube 1 - Fiber 1",
    //                 },
    //                 {
    //                   color: "#FF0000",
    //                   id: 8,
    //                   name: "Cable 2 - Tube 1 - Fiber 2",
    //                 },
    //                 {
    //                   color: "#0000FF",
    //                   id: 10,
    //                   name: "Cable 2 - Tube 1 - Fiber 3",
    //                 },
    //                 {
    //                   color: "#FFFF00",
    //                   id: 12,
    //                   name: "Cable 2 - Tube 1 - Fiber 4",
    //                 },
    //                 {
    //                   color: "#888888",
    //                   id: 14,
    //                   name: "Cable 2 - Tube 1 - Fiber 5",
    //                 },
    //                 {
    //                   color: "#8800FF",
    //                   id: 16,
    //                   name: "Cable 2 - Tube 1 - Fiber 6",
    //                 },
    //               ],
    //               id: 2,
    //               name: "Cable 2 - Tube 1",
    //             },
    //             {
    //               color: "#FF8800",
    //               fibers: [
    //                 {
    //                   color: "#00FF00",
    //                   id: 18,
    //                   name: "Cable 2 - Tube 2 - Fiber 1",
    //                 },
    //                 {
    //                   color: "#FF0000",
    //                   id: 20,
    //                   name: "Cable 2 - Tube 2 - Fiber 2",
    //                 },
    //                 {
    //                   color: "#0000FF",
    //                   id: 22,
    //                   name: "Cable 2 - Tube 2 - Fiber 3",
    //                 },
    //                 {
    //                   color: "#FFFF00",
    //                   id: 24,
    //                   name: "Cable 2 - Tube 2 - Fiber 4",
    //                 },
    //                 {
    //                   color: "#888888",
    //                   id: 26,
    //                   name: "Cable 2 - Tube 2 - Fiber 5",
    //                 },
    //                 {
    //                   color: "#8800FF",
    //                   id: 28,
    //                   name: "Cable 2 - Tube 2 - Fiber 6",
    //                 },
    //               ],
    //               id: 3,
    //               name: "Cable 2 - Tube 2",
    //             },
    //             {
    //               color: "#00FF00",
    //               fibers: [
    //                 {
    //                   color: "#00FF00",
    //                   id: 30,
    //                   name: "Cable 2 - Tube 3 - Fiber 1",
    //                 },
    //                 {
    //                   color: "#FF0000",
    //                   id: 32,
    //                   name: "Cable 2 - Tube 3 - Fiber 2",
    //                 },
    //                 {
    //                   color: "#0000FF",
    //                   id: 34,
    //                   name: "Cable 2 - Tube 3 - Fiber 3",
    //                 },
    //                 {
    //                   color: "#FFFF00",
    //                   id: 36,
    //                   name: "Cable 2 - Tube 3 - Fiber 4",
    //                 },
    //                 {
    //                   color: "#888888",
    //                   id: 38,
    //                   name: "Cable 2 - Tube 3 - Fiber 5",
    //                 },
    //                 {
    //                   color: "#8800FF",
    //                   id: 40,
    //                   name: "Cable 2 - Tube 3 - Fiber 6",
    //                 },
    //               ],
    //               id: 4,
    //               name: "Cable 2 - Tube 3",
    //             },
    //             {
    //               color: "#884400",
    //               fibers: [
    //                 {
    //                   color: "#00FF00",
    //                   id: 42,
    //                   name: "Cable 2 - Tube 4 - Fiber 1",
    //                 },
    //                 {
    //                   color: "#FF0000",
    //                   id: 44,
    //                   name: "Cable 2 - Tube 4 - Fiber 2",
    //                 },
    //                 {
    //                   color: "#0000FF",
    //                   id: 46,
    //                   name: "Cable 2 - Tube 4 - Fiber 3",
    //                 },
    //                 {
    //                   color: "#FFFF00",
    //                   id: 48,
    //                   name: "Cable 2 - Tube 4 - Fiber 4",
    //                 },
    //                 {
    //                   color: "#888888",
    //                   id: 50,
    //                   name: "Cable 2 - Tube 4 - Fiber 5",
    //                 },
    //                 {
    //                   color: "#8800FF",
    //                   id: 52,
    //                   name: "Cable 2 - Tube 4 - Fiber 6",
    //                 },
    //               ],
    //               id: 5,
    //               name: "Cable 2 - Tube 4",
    //             },
    //           ],
    //           id: 2,
    //           disposition: "LEFT",
    //           name: "Cable 2",
    //         },
    //         {
    //           tubes: [
    //             {
    //               color: "#FFFFFF",
    //               fibers: [
    //                 {
    //                   color: "#00FF00",
    //                   id: 53,
    //                   name: "Cable 3 - Tube 1 - Fiber 1",
    //                 },
    //                 {
    //                   color: "#FF0000",
    //                   id: 55,
    //                   name: "Cable 3 - Tube 1 - Fiber 2",
    //                 },
    //                 {
    //                   color: "#0000FF",
    //                   id: 57,
    //                   name: "Cable 3 - Tube 1 - Fiber 3",
    //                 },
    //                 {
    //                   color: "#FFFF00",
    //                   id: 59,
    //                   name: "Cable 3 - Tube 1 - Fiber 4",
    //                 },
    //               ],
    //               id: 6,
    //               name: "Cable 3 - Tube 1",
    //             },
    //           ],
    //           id: 3,
    //           disposition: "RIGHT",
    //           name: "Cable 3",
    //         },
    //       ],
    //     },
    //   },
    // }),
    inputJson: JSON.stringify({
      res: {
        connections: {
          fibers: [
            { fiber_in: 24, fiber_out: 59 },
            { fiber_in: 57, fiber_out: 46 },
            { fiber_in: 2, fiber_out: 53 },
            { fiber_in: 4, fiber_out: 55 },
          ],
        },
        elements: {
          wires: [
            {
              id: 1,
              name: "Cable 1",
              disposition: "LEFT",
              tubes: [
                {
                  id: 1,
                  color: "#FFFFFF",
                  name: "Cable 1 - Tube 1",
                  fibers: [
                    {
                      id: 2,
                      name: "Cable 1 - Tube 1 - Fiber 1",
                      color: "#00FF00",
                    },
                    {
                      id: 4,
                      name: "Cable 1 - Tube 1 - Fiber 2",
                      color: "#FF0000",
                    },
                  ],
                },
              ],
            },
            {
              id: 2,
              name: "Cable 2",
              disposition: "LEFT",
              tubes: [
                {
                  id: 2,
                  color: "#0000FF",
                  name: "Cable 2 - Tube 1",
                  fibers: [
                    {
                      id: 6,
                      name: "Cable 2 - Tube 1 - Fiber 1",
                      color: "#00FF00",
                    },
                    {
                      id: 8,
                      name: "Cable 2 - Tube 1 - Fiber 2",
                      color: "#FF0000",
                    },
                    {
                      id: 10,
                      name: "Cable 2 - Tube 1 - Fiber 3",
                      color: "#0000FF",
                    },
                    {
                      id: 12,
                      name: "Cable 2 - Tube 1 - Fiber 4",
                      color: "#FFFF00",
                    },
                    {
                      id: 14,
                      name: "Cable 2 - Tube 1 - Fiber 5",
                      color: "#888888",
                    },
                    {
                      id: 16,
                      name: "Cable 2 - Tube 1 - Fiber 6",
                      color: "#8800FF",
                    },
                  ],
                },
                {
                  id: 3,
                  color: "#FF8800",
                  name: "Cable 2 - Tube 2",
                  fibers: [
                    {
                      id: 18,
                      name: "Cable 2 - Tube 2 - Fiber 1",
                      color: "#00FF00",
                    },
                    {
                      id: 20,
                      name: "Cable 2 - Tube 2 - Fiber 2",
                      color: "#FF0000",
                    },
                    {
                      id: 22,
                      name: "Cable 2 - Tube 2 - Fiber 3",
                      color: "#0000FF",
                    },
                    {
                      id: 24,
                      name: "Cable 2 - Tube 2 - Fiber 4",
                      color: "#FFFF00",
                    },
                    {
                      id: 26,
                      name: "Cable 2 - Tube 2 - Fiber 5",
                      color: "#888888",
                    },
                    {
                      id: 28,
                      name: "Cable 2 - Tube 2 - Fiber 6",
                      color: "#8800FF",
                    },
                  ],
                },
                {
                  id: 4,
                  color: "#00FF00",
                  name: "Cable 2 - Tube 3",
                  fibers: [
                    {
                      id: 30,
                      name: "Cable 2 - Tube 3 - Fiber 1",
                      color: "#00FF00",
                    },
                    {
                      id: 32,
                      name: "Cable 2 - Tube 3 - Fiber 2",
                      color: "#FF0000",
                    },
                    {
                      id: 34,
                      name: "Cable 2 - Tube 3 - Fiber 3",
                      color: "#0000FF",
                    },
                    {
                      id: 36,
                      name: "Cable 2 - Tube 3 - Fiber 4",
                      color: "#FFFF00",
                    },
                    {
                      id: 38,
                      name: "Cable 2 - Tube 3 - Fiber 5",
                      color: "#888888",
                    },
                    {
                      id: 40,
                      name: "Cable 2 - Tube 3 - Fiber 6",
                      color: "#8800FF",
                    },
                  ],
                },
                {
                  id: 5,
                  color: "#884400",
                  name: "Cable 2 - Tube 4",
                  fibers: [
                    {
                      id: 42,
                      name: "Cable 2 - Tube 4 - Fiber 1",
                      color: "#00FF00",
                    },
                    {
                      id: 44,
                      name: "Cable 2 - Tube 4 - Fiber 2",
                      color: "#FF0000",
                    },
                    {
                      id: 46,
                      name: "Cable 2 - Tube 4 - Fiber 3",
                      color: "#0000FF",
                    },
                    {
                      id: 48,
                      name: "Cable 2 - Tube 4 - Fiber 4",
                      color: "#FFFF00",
                    },
                    {
                      id: 50,
                      name: "Cable 2 - Tube 4 - Fiber 5",
                      color: "#888888",
                    },
                    {
                      id: 52,
                      name: "Cable 2 - Tube 4 - Fiber 6",
                      color: "#8800FF",
                    },
                  ],
                },
              ],
            },
            {
              id: 3,
              name: "Cable 3",
              disposition: "RIGHT",
              tubes: [
                {
                  id: 6,
                  color: "#FFFFFF",
                  name: "Cable 3 - Tube 1",
                  fibers: [
                    {
                      id: 53,
                      name: "Cable 3 - Tube 1 - Fiber 1",
                      color: "#00FF00",
                    },
                    {
                      id: 55,
                      name: "Cable 3 - Tube 1 - Fiber 2",
                      color: "#FF0000",
                    },
                    {
                      id: 57,
                      name: "Cable 3 - Tube 1 - Fiber 3",
                      color: "#0000FF",
                    },
                    {
                      id: 59,
                      name: "Cable 3 - Tube 1 - Fiber 4",
                      color: "#FFFF00",
                    },
                  ],
                },
              ],
            },
          ],
          splitters: [],
        },
      },
    }),
  },
};
