import { useState } from "react";
import GrassGround from "./GrassGround";
import "./RegisterPage.css"; // same colour scheme
const EMPTY = { email: "", password: "" };
import PixelGator from "../PixelGator";
function validate(v) {
  const e = {};
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
  if (!v.password) e.password = "Enter your password.";
  return e;
}

// plain language error messages
function friendlyError(err) {
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Can't reach the server. Check your connection and try again.";
    default:
      return "Couldn't log you in. Try again.";
  }
}
export default function LoginPage({ onLogin, onSwitchToRegister }) {
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
      await onLogin?.({ email: values.email.trim(), password: values.password });
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="cg-scene">
      <section className="cg-content">
        <p className="cg-welcome">welcome back to...</p>
        <h1 className="cg-title">Club Gator</h1>
        <div className="cg-login-wrapper"></div>
          <form className="cg-panel" onSubmit={handleSubmit} noValidate>
            <h2 className="cg-panel-title">Log in</h2>
            <div className="cg-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p className="cg-error" id="email-error">{errors.email}</p>
              )}
            </div>

            <div className="cg-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p className="cg-error" id="password-error">{errors.password}</p>
              )}
            </div>

            {formError && (
              <p className="cg-error cg-form-error" role="alert">{formError}</p>
            )}

            <button className="cg-button" type="submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </button>

            <p className="cg-switch">
              New to Club Gator?{" "}
              <button type="button" className="cg-link" onClick={onSwitchToRegister}>
                Create an account
              </button>
            </p>
          </form>
        </section>
        <PixelGator />
        <GrassGround />
      </main>
    );
  }
