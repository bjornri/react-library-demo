// CSS modules: `import styles from "./X.module.css"`
declare module "*.module.css" {
  const classes: { readonly [className: string]: string };
  export default classes;
}

// Plain global CSS, imported for side effects only: `import "../../tokens.css"`
declare module "*.css";
