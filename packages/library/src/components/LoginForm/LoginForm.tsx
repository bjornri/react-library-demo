"use client";

import { useState, type FormEvent } from "react";
// Other components are imported through their entry file ("../Button/Button"),
// never their internal files or CSS. See README "How to avoid breaking it".
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import { cx } from "../../cx";
import "../../tokens.css";
import styles from "./LoginForm.module.css";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormProps {
  /** Called with the entered values. Return a promise to show a pending state until it settles. */
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  /** Form-level error, e.g. "Invalid email or password". */
  error?: string;
  title?: string;
  submitLabel?: string;
  className?: string;
}

export function LoginForm({
  onSubmit,
  error,
  title = "Log in",
  submitLabel = "Log in",
  className,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      await onSubmit({ email, password });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={cx(styles.root, className)} onSubmit={handleSubmit}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onValueChange={setEmail}
        disabled={pending}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onValueChange={setPassword}
        disabled={pending}
      />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Logging in…" : submitLabel}
      </Button>
    </form>
  );
}

export default LoginForm;
