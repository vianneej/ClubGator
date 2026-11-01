import { useState } from "react";
import GrassGround from "./GrassGround";
import "./RegisterPage.css";
const EMPTY = { username: "", email: "", password: "", confirm: "" };
const FIELDS = [
  { name: "username", label: "Username", type: "text", autoComplete: "username" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
  { name: "confirm", label: "Confirm password", type: "password", autoComplete: "new-password" },
];

// user validation checks
function validate(v) {
  const e = {};
  if (!/^[A-Za-z0-9_]{3,16}$/.test(v.username))
    e.username = "Use 3-16 letters, numbers, or underscores.";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
  if (v.password.length < 6) e.password = "Use at least 6 characters.";
  if (v.confirm !== v.password) e.confirm = "Passwords don't match.";
  return e;
}

// converting firebase auth error codes to plain messages.
function friendlyError(err) {
  switch (err?.code) {
    case "registration/invalid-username":
    case "registration/username-taken":
    case "registration/profile-exists":
      return err.message;
    case "permission-denied":
      return "Profile save was blocked. Check the Firestore rules, then retry.";
    case "unavailable":
      return "Couldn't save your profile. Check your connection and retry.";
    case "auth/email-already-in-use":
      return "That email already has an account. Please try logging in.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Choose a stronger password (6+ characters).";
    case "auth/network-request-failed":
      return "Can't reach the server. Check your connection and try again.";
    default:
      return "Couldn't create your account. Please try again later.";
  }
}

/**
 *  onRegister({ username, email, password }) ->
 *   (connect this to firebase auth + firestore profile creation.)
 *  onSwitchToLogin() -> navigates to login page.
 */
export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    try {
      await onRegister?.({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="cg-scene">
      <section className="cg-content">
        <p className="cg-welcome">welcome to...</p>
        <h1 className="cg-title">Club Gator</h1>
        <form className="cg-panel" onSubmit={handleSubmit} noValidate>
          <h2 className="cg-panel-title">Create your account</h2>

          {FIELDS.map((f) => (
            <div className="cg-field" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>
              <input
                id={f.name}
                name={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                value={values[f.name]}
                onChange={handleChange}
                aria-invalid={!!errors[f.name]}
                aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
              />
              {errors[f.name] && (
                <p className="cg-error" id={`${f.name}-error`}>
                  {errors[f.name]}
                </p>
              )}
            </div>
          ))}

          {formError && (
            <p className="cg-error cg-form-error" role="alert">
              {formError}
            </p>
          )}

          <button className="cg-button" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="cg-switch">
            Already have an account?{" "}
            <button type="button" className="cg-link" onClick={onSwitchToLogin}>
              Log in
            </button>
          </p>
        </form>
      </section>

      <GrassGround />
    </main>
  );
}
