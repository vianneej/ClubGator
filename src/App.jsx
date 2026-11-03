import PhaserGame from "./game/PhaserGame";
import { useState, useEffect } from "react";
import RegisterPage from "./frontend/RegisterPage";
import LoginPage from "./frontend/LoginPage";
import CustomisationMenu from "./frontend/CustomisationMenu";
import GrassGround from "./frontend/GrassGround";
import "./frontend/RegisterPage.css";
import { auth } from "./firebase";
import {
  registerPlayer,
  loginPlayer,
  logoutPlayer,
  subscribeToAuthState,
} from "./services/authService";
import {
  getPlayerPenguin,
  createPenguin,
  hasSavedLook,
  normalizeAppearance,
} from "./services/penguinService";

export default function App() {
  const [page, setPage] = useState("login");
  // only used while logged in with a profile
  const [screen, setScreen] = useState("welcome");
  const [session, setSession] = useState({ user: null, profile: null });
  const [penguin, setPenguin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingPenguin, setCreatingPenguin] = useState(false);
  const [penguinError, setPenguinError] = useState("");

  // automatically detect persistent session on page load
  useEffect(() => {
    let active = true;
    let latestRequest = 0;

    const unsubscribe = subscribeToAuthState(async (authSession) => {
      const uid = authSession.user?.uid ?? null;

      //ignore outdated profile request that finished after logging out
      if (!active || (auth.currentUser?.uid ?? null) !== uid) return;

      const request = ++latestRequest;
      setSession(authSession);
      setPenguin(null);
      setPenguinError("");
      setScreen("welcome");

      if (!authSession.user || !authSession.profile) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const savedPenguin = await getPlayerPenguin(uid);

        if (
          active &&
          request === latestRequest &&
          auth.currentUser?.uid === uid
        ) {
          setPenguin(savedPenguin);
        }
      } catch {
        if (
          active &&
          request === latestRequest &&
          auth.currentUser?.uid === uid
        ) {
          setPenguinError(
            "Couldn't load your penguin. Refresh to try again."
          );
        }
      } finally {
        if (
          active &&
          request === latestRequest &&
          (auth.currentUser?.uid ?? null) === uid
        ) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      latestRequest++;
      unsubscribe();
    };
  }, []);

  async function handleLogout() {
    try {
      await logoutPlayer();

      setSession({ user: null, profile: null });
      setPenguin(null);
      setPenguinError("");
      setCreatingPenguin(false);
      setLoading(false);
      setScreen("welcome");
      setPage("login");
    } catch {
      setPenguinError("Couldn't log out. Please try again.");
    }
  }

  function handleEnterCampus() {
    setPenguinError("");
    if (hasSavedLook(penguin)) {
      setScreen("map");
      return;
    }
    setScreen("customise");
  }

  function handleBackToHub() {
    setPenguinError("");
    // if user goes back to hub w/o saving, clear all penguin data
    if (!hasSavedLook(penguin)) {
      setPenguin(null);
    }
    setScreen("welcome");
  }

  async function handleConfirmAppearance(appearance) {
    if (creatingPenguin) return;

    setCreatingPenguin(true);
    setPenguinError("");

    try {
      const saved = await createPenguin(normalizeAppearance(appearance));
      setPenguin(saved);
      setScreen("map");
    } catch {
      setPenguinError("Couldn't save your look. Please try again.");
    } finally {
      setCreatingPenguin(false);
    }
  }

  if (loading) {
    return (
      <main
        className="cg-scene"
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100dvh",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <p role="status" style={{ margin: 0, color: "white", fontSize: "1.2rem" }}>
          Loading Club Gator...
        </p>
      </main>
    );
  }

  if (session.user && !session.profile && page !== "register") {
    return (
      <main className="cg-scene">
        <section className="cg-content">
          <h1 className="cg-title">Club Gator</h1>

          <div className="cg-panel">
            <h2 className="cg-panel-title">Finish registration</h2>

            <p style={{ margin: "0 0 24px", lineHeight: 1.6 }}>
              Your account setup is incomplete. Return to registration
              and use the same email with an available username.
            </p>

            <div style={{ display: "grid", gap: "20px" }}>
              <button
                className="cg-button"
                type="button"
                onClick={() => setPage("register")}
              >
                Finish registration
              </button>

              <button
                className="cg-button"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>

            {penguinError && (
              <p
                className="cg-error"
                role="alert"
                style={{ marginTop: "20px" }}
              >
                {penguinError}
              </p>
            )}
          </div>
        </section>

        <GrassGround />
      </main>
    );
  }

  if (session.user && page !== "register") {
    if (screen === "customise") {
      return (
        <CustomisationMenu
          username={session.profile?.username || ""}
          onConfirm={handleConfirmAppearance}
          onBack={handleBackToHub}
          onLogout={handleLogout}
          submitting={creatingPenguin}
          error={penguinError}
        />
      );
    }

    if (screen === "map") {
      return (
        <main
          className="cg-scene"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
            overflowY: "auto",
            padding: "2rem 1rem",
            color: "white",
          }}
        >
          <section
            className="cg-panel"
            style={{
              textAlign: "center",
              width: "100%",
              maxWidth: "420px",
              marginBottom: "1rem",
            }}
          >
            <h2 className="cg-panel-title">Campus map</h2>
            <p style={{ margin: "0.5rem 0 1rem" }}>
              Playing as{" "}
              <strong>{session.profile?.username || session.user.email}</strong>
            </p>
            {penguinError && (
              <p className="cg-error" role="alert" style={{ marginBottom: "1rem" }}>
                {penguinError}
              </p>
            )}
            <div style={{ display: "grid", gap: "12px" }}>
              <button
                className="cg-button"
                type="button"
                onClick={() => setScreen("welcome")}
              >
                Back to hub
              </button>
              <button
                className="cg-button"
                type="button"
                style={{ background: "#475569" }}
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </section>
          <PhaserGame />
        </main>
      );
    }

    // default rn, no Phaser until they choose Enter campus
    return (
      <main className="cg-scene">
        <section className="cg-content">
          <h1 className="cg-title">Club Gator</h1>

          <div className="cg-panel">
            <h2 className="cg-panel-title">Welcome back!</h2>

            <p style={{ margin: "0 0 16px", lineHeight: 1.6 }}>
              Logged in as{" "}
              <strong>{session.profile?.username || session.user.email}</strong>
            </p>

            <p style={{ margin: "0 0 20px", lineHeight: 1.6, opacity: 0.9 }}>
              {hasSavedLook(penguin)
                ? "Your gator is now ready! Head over to campus whenever you'd like."
                : "Create your gator look before you hit campus for the first time!"}
            </p>

            {penguinError && (
              <p className="cg-error" role="alert" style={{ marginBottom: "16px" }}>
                {penguinError}
              </p>
            )}

            <div style={{ display: "grid", gap: "12px" }}>
              <button
                className="cg-button"
                type="button"
                onClick={handleEnterCampus}
              >
                Enter campus
              </button>
              <button
                className="cg-button"
                type="button"
                style={{ background: "#a28866" }}
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </section>
        <GrassGround />
      </main>
    );
  }

  // unauthenticated routing
  return page === "login" ? (
    <LoginPage
      onLogin={async ({ email, password }) => {
        await loginPlayer({ email, password });
      }}
      onSwitchToRegister={() => setPage("register")}
    />
  ) : (
    <RegisterPage
      onRegister={async (data) => {
        const { profile } = await registerPlayer(data);
        await logoutPlayer();
        window.alert(
          `Account created! Welcome, ${profile.username}. Please log in.`
        );
        setPage("login");
      }}
      onSwitchToLogin={() => setPage("login")}
    />
  );
}