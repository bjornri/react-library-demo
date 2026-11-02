import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LoginForm } from "./LoginForm";

const meta = {
  title: "Components/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  args: { onSubmit: fn() },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: "Invalid email or password" },
};

export const CustomLabels: Story = {
  args: { title: "Welcome back", submitLabel: "Sign in" },
};

/** Submits take 1.5s; fails unless the password is "secret". */
export const SimulatedLogin: Story = {
  render: (args) => {
    const [error, setError] = useState<string>();
    return (
      <LoginForm
        {...args}
        error={error}
        onSubmit={async (values) => {
          args.onSubmit(values);
          setError(undefined);
          await new Promise((r) => setTimeout(r, 1500));
          if (values.password !== "secret") setError("Invalid email or password");
        }}
      />
    );
  },
};

/** The whole form re-themed by overriding tokens on a wrapper. */
export const Themed: Story = {
  decorators: [
    (Story) => (
      <div
        style={
          {
            "--lib-color-primary": "#0f766e",
            "--lib-color-primary-hover": "#115e59",
            "--lib-color-focus": "#14b8a6",
            "--lib-radius": "4px",
            "--lib-font-family": "Georgia, serif",
          } as CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};
