import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "tertiary"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} size="small">Small</Button>
      <Button {...args} size="medium">Medium</Button>
      <Button {...args} size="large">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

/** Tokens are CSS custom properties, so any subtree can re-theme them. */
export const Themed: Story = {
  decorators: [
    (Story) => (
      <div
        style={
          {
            "--lib-color-primary": "#276ef1",
            "--lib-color-primary-hover": "#1e54b7",
            "--lib-radius": "999px",
          } as CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};
