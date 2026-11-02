import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./TextField";

const meta = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: {
    label: "Name",
    placeholder: "Jane Doe",
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "What should we call you?" },
};

export const WithError: Story = {
  args: { error: "Name is required" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Can't touch this" },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <TextField
        {...args}
        value={value}
        onValueChange={setValue}
        hint={`${value.length}/20 characters`}
        error={value.length > 20 ? "Too long" : undefined}
      />
    );
  },
};
