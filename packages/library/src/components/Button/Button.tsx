import { Button as BaseButton } from "@base-ui/react/button";
import { cx } from "../../cx";
import "../../tokens.css";
import styles from "./Button.module.css";

export interface ButtonProps extends Omit<BaseButton.Props, "className"> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className,
  ...rest
}: ButtonProps) {
  return (
    <BaseButton
      {...rest}
      className={cx(
        styles.root,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
    />
  );
}

export default Button;
