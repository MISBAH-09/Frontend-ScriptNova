
import { useEffect, useState } from "react";
import { updateUser ,getUserById} from "../../services/auth";

export default function Settings() {

  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ FETCH USER DATA (REAL DATA)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(userId);

        setForm((prev) => ({
          ...prev,
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
        }));

      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // image → base64
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profile: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (form.password && form.password !== form.confirmPassword) {
        return alert("Passwords do not match");
      }

      const payload = {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
      };

      if (form.password) payload.password = form.password;
      if (form.profile) payload.profile = form.profile;

      await updateUser(payload);
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    // <div className="text-black px-6 py-5">

      <div className="max-w-4xl ">

        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT SIDE */}
          <div className="space-y-5">

            <div>
              <label className="">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded bg-pink-400 border border-slate-600"
              />
            </div>

            <div>
              <label className="">First Name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded bg-pink-400 border border-slate-600"
              />
            </div>

            <div>
              <label className="">Last Name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded bg-pink-400 border border-slate-600"
              />
            </div>

            <div>
              <label className="">Profile Image</label>
              <input
                type="file"
                onChange={handleImage}
                className="mt-2"
              />
            </div>

    

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-5">

            {/* EMAIL LOCKED */}
            <div>
              <label className="">Email</label>
              <input
                value={form.email}
                disabled
                className="w-full mt-1 p-3 rounded bg-pink-400 border border-slate-600"
              />
            </div>

            <div>
              <label className="">New Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded bg-pink-400 border border-slate-600"
              />
            </div>

            <div>
              <label className="">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded bg-pink-400 border border-slate-600"
              />
            </div>


            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full text-white tracking-widest bg-slate-900 hover:bg-pink-700 py-3 rounded  mt-4"
            >
              {saving ? "Updating..." : "Update Profile"}
            </button>

          </div>

        </div>
      </div>
  );
}