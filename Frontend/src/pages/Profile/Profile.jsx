import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  AtSign,
  BriefcaseBusiness,
  Save,
  RotateCcw,
} from "lucide-react";
import api from "../../services/api";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    designation_name: "",
  });

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.get("profile/");
      const data = response.data;

      setProfile(data);
      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your profile. Please log in again if your session has expired."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setMessage("");
  };

  const validateForm = () => {
    const errors = {};

    if (form.first_name.trim().length < 2) {
      errors.first_name = "First name must contain at least 2 characters.";
    }

    if (form.last_name.trim().length < 2) {
      errors.last_name = "Last name must contain at least 2 characters.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      const response = await api.patch("profile/", {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
      });

      const data = response.data;

      setProfile((previous) => ({ ...previous, ...data }));
      setForm({
        first_name: data.first_name ?? form.first_name.trim(),
        last_name: data.last_name ?? form.last_name.trim(),
        email: data.email ?? form.email.trim(),
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const errors = {};

        ["first_name", "last_name", "email"].forEach((field) => {
          if (responseData[field]) {
            errors[field] = Array.isArray(responseData[field])
              ? responseData[field][0]
              : responseData[field];
          }
        });

        setFieldErrors(errors);

        const detail = responseData.detail;
        setError(
          detail ||
            (Object.keys(errors).length
              ? ""
              : "Unable to update your profile. Please try again.")
        );
      } else {
        setError("Unable to update your profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
    });
    setFieldErrors({});
    setError("");
    setMessage("");
  };

  const initials =
    `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() ||
    profile.username?.[0]?.toUpperCase() ||
    "U";

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <div>
          <h1>My Profile</h1>
          <h1>PROFILE COMPONENT IS RENDERING</h1>
          <p>View and manage your personal information.</p>
        </div>
      </header>

      {error && <div className="profile-alert profile-alert-error">{error}</div>}
      {message && (
        <div className="profile-alert profile-alert-success">{message}</div>
      )}

      <section className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-identity">
            <h2>
              {[profile.first_name, profile.last_name]
                .filter(Boolean)
                .join(" ") || profile.username}
            </h2>
            <p>{profile.designation_name || "No designation assigned"}</p>
          </div>
        </div>

        <div className="profile-divider" />

        <form onSubmit={handleSubmit} noValidate>
          <div className="profile-section-heading">
            <h3>Personal Information</h3>
            <p>Update the details associated with your account.</p>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="profile-username">
                <AtSign size={16} /> Username
              </label>
              <input
                id="profile-username"
                value={profile.username || ""}
                readOnly
                disabled
              />
              <small>Username cannot be changed here.</small>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-designation">
                <BriefcaseBusiness size={16} /> Designation
              </label>
              <input
                id="profile-designation"
                value={profile.designation_name || "Not assigned"}
                readOnly
                disabled
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-first-name">
                <UserRound size={16} /> First Name
              </label>
              <input
                id="profile-first-name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                autoComplete="given-name"
                aria-invalid={Boolean(fieldErrors.first_name)}
              />
              {fieldErrors.first_name && (
                <small className="profile-field-error">
                  {fieldErrors.first_name}
                </small>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="profile-last-name">
                <UserRound size={16} /> Last Name
              </label>
              <input
                id="profile-last-name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                autoComplete="family-name"
                aria-invalid={Boolean(fieldErrors.last_name)}
              />
              {fieldErrors.last_name && (
                <small className="profile-field-error">
                  {fieldErrors.last_name}
                </small>
              )}
            </div>

            <div className="profile-field profile-field-full">
              <label htmlFor="profile-email">
                <Mail size={16} /> Email Address
              </label>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <small className="profile-field-error">
                  {fieldErrors.email}
                </small>
              )}
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="profile-reset-button"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw size={16} /> Reset
            </button>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Profile;