import { useState } from "react";
import Button from "library/components/Button";
import TextField from "library/components/TextField";
import LoginForm from "library/components/LoginForm";
import IconButton from "library/components/IconButton";
import { Heart, Trash } from "@phosphor-icons/react";
import styles from "./App.module.css";

function NameForm() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [liked, setLiked] = useState(false);
  const error = submitted && !name ? "Name is required" : undefined;

  return (
    <form
      className={styles.section}
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <TextField
        label="Name"
        hint="What should we call you?"
        error={error}
        value={name}
        onValueChange={setName}
      />
      <Button type="submit" fullWidth>
        Submit
      </Button>
      <div className={styles.row}>
        <Button type="button" variant="secondary" onClick={() => setName("")}>
          Clear
        </Button>
        <IconButton
          variant={liked ? "primary" : "secondary"}
          icon={Heart}
          weight={liked ? "fill" : "regular"}
          label={liked ? "Unlike" : "Like"}
          onClick={() => setLiked(!liked)}
        />
        <IconButton variant="tertiary" icon={Trash} label="Clear name" onClick={() => setName("")} />
      </div>
      {submitted && name && <p>Hello, {name}!</p>}
    </form>
  );
}

function LoginExample() {
  const [error, setError] = useState<string>();
  const [user, setUser] = useState<string>();

  if (user) return <p>Logged in as {user}.</p>;

  return (
    <LoginForm
      error={error}
      onSubmit={async ({ email, password }) => {
        setError(undefined);
        await new Promise((r) => setTimeout(r, 800));
        if (password === "secret") setUser(email);
        else setError("Invalid email or password (hint: secret)");
      }}
    />
  );
}

export default function App() {
  return (
    <main className={styles.page}>
      <NameForm />
      <hr className={styles.divider} />
      <LoginExample />
    </main>
  );
}
