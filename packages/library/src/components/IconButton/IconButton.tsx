// Type-only import: compiles to nothing. Apps import the icons they use and pass them in,
// so the library never bundles any icons itself.
import type { Icon, IconWeight } from "@phosphor-icons/react";
import Button from "../Button/Button";
import type { ButtonProps } from "../Button/Button";
import { cx } from "../../cx";
import "../../tokens.css";
import styles from "./IconButton.module.css";

const iconSizes = { small: 16, medium: 20, large: 24 } as const;

export interface IconButtonProps extends Omit<ButtonProps, "children" | "fullWidth"> {
  /** A Phosphor icon component, e.g. `Heart` from `@phosphor-icons/react`. */
  icon: Icon;
  /** Accessible name (`aria-label`), also shown as a native tooltip. Required: there's no visible text. */
  label: string;
  /** Phosphor icon weight. */
  weight?: IconWeight;
}

export function IconButton({
  icon: IconComponent,
  label,
  weight = "regular",
  size = "medium",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      {...rest}
      size={size}
      aria-label={label}
      title={label}
      className={cx(styles.root, styles[size], className)}
    >
      <IconComponent className={styles.icon} size={iconSizes[size]} weight={weight} aria-hidden />
    </Button>
  );
}

export default IconButton;
