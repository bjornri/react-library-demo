import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { cx } from "../../cx";
import "../../tokens.css";
import styles from "./TextField.module.css";

export interface TextFieldProps extends Omit<Input.Props, "className"> {
  label: string;
  /** Helper text shown under the input when there is no error. */
  hint?: string;
  /** Error message. When set, the field is marked invalid. */
  error?: string;
  className?: string;
}

export function TextField({
  label,
  hint,
  error,
  className,
  disabled,
  name,
  ...rest
}: TextFieldProps) {
  return (
    <Field.Root
      className={cx(styles.root, className)}
      invalid={error ? true : undefined}
      disabled={disabled}
      name={name}
    >
      <Field.Label className={styles.label}>{label}</Field.Label>
      <Input {...rest} className={styles.input} />
      {hint && !error && (
        <Field.Description className={styles.hint}>{hint}</Field.Description>
      )}
      {error ? (
        <Field.Error className={styles.error} match>
          {error}
        </Field.Error>
      ) : (
        // Surfaces native constraint messages (required, pattern, …).
        <Field.Error className={styles.error} />
      )}
    </Field.Root>
  );
}

export default TextField;
