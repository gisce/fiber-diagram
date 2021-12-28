import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { GridUi } from "./GridUi";
import basic from "examples/basic.json";
import three from "examples/three.json";
import onelevel from "examples/onelevel.json";
import twolevels from "examples/twolevels.json";
import eight from "examples/8.json";

export default {
  title: "Components/GridUi",
  component: GridUi,
} as ComponentMeta<typeof GridUi>;

const Template: ComponentStory<typeof GridUi> = (args) => <GridUi {...args} />;

export const Basic = Template.bind({});
Basic.args = { inputJson: JSON.stringify(basic) };

export const Three = Template.bind({});
Three.args = { inputJson: JSON.stringify(three) };

export const OneLevel = Template.bind({});
OneLevel.args = { inputJson: JSON.stringify(onelevel) };

export const TwoLevels = Template.bind({});
TwoLevels.args = { inputJson: JSON.stringify(twolevels) };

export const Eight = Template.bind({});
Eight.args = { inputJson: JSON.stringify(eight) };
