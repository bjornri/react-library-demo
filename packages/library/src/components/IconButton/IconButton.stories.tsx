import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Gear, Heart, MagnifyingGlass, Plus, Trash } from "@phosphor-icons/react";
import { IconButton } from "./IconButton";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: { icon: Heart, label: "Like", onClick: fn() },
  argTypes: {
    icon: { control: false },
    variant: { control: "inline-radio", options: ["primary", "secondary", "tertiary"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    weight: { control: "select", options: ["thin", "light", "regular", "bold", "fill", "duotone"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <IconButton {...args} variant="primary" icon={Plus} label="Add" />
      <IconButton {...args} variant="secondary" icon={Gear} label="Settings" />
      <IconButton {...args} variant="tertiary" icon={Trash} label="Delete" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <IconButton {...args} size="small" />
      <IconButton {...args} size="medium" />
      <IconButton {...args} size="large" />
    </div>
  ),
};

export const Weights: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      {(["thin", "light", "regular", "bold", "fill", "duotone"] as const).map((w) => (
        <IconButton key={w} {...args} variant="secondary" weight={w} label={`Like (${w})`} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, icon: MagnifyingGlass, label: "Search" },
};

export const Themed: Story = {
  decorators: [
    (Story) => (
      <div style={{ "--lib-color-primary": "#e0245e", "--lib-color-primary-hover": "#b81c4c", "--lib-radius": "999px" } as CSSProperties}>
        <Story />
      </div>
    ),
  ],
};
