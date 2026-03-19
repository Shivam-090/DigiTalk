import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { LoaderIcon } from "react-hot-toast";
import {
  CameraIcon,
  MailIcon,
  GlobeIcon,
  ImagePlusIcon,
  MapPinIcon,
  PencilLineIcon,
  ShuffleIcon,
  SparklesIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { completeOnboarding } from "../lib/api";
import { fileToCompressedDataUrl } from "../lib/image.js";
import { getLanguageFlag } from "../lib/language.jsx";
import { LANGUAGES } from "../constants";

const emptyForm = {
  fullName: "",
  username: "",
  bio: "",
  nativeLanguage: "",
  learningLanguage: "",
  location: "",
  profilePic: "",
};

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState(emptyForm);

  useEffect(() => {
    if (!authUser) return;

    setFormState({
      fullName: authUser.fullName || "",
      username: authUser.username || "",
      bio: authUser.bio || "",
      nativeLanguage: authUser.nativeLanguage || "",
      learningLanguage: authUser.learningLanguage || "",
      location: authUser.location || "",
      profilePic: authUser.profilePic || "",
    });
  }, [authUser]);

  const { mutate: saveProfileMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formState.fullName.trim() ||
      !formState.username.trim() ||
      !formState.bio.trim() ||
      !formState.nativeLanguage ||
      !formState.learningLanguage ||
      !formState.location.trim()
    ) {
      toast.error("Please complete every field before saving.");
      return;
    }

    saveProfileMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    setFormState((current) => ({
      ...current,
      profilePic: `https://avatar.iran.liara.run/public/${idx}`,
    }));
    toast("Random avatar generated!");
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    try {
      const compressedImage = await fileToCompressedDataUrl(file);
      setFormState((current) => ({ ...current, profilePic: compressedImage }));
      toast.success("Profile image selected.");
    } catch (error) {
      toast.error(error.message || "Could not read that image.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-2.5 sm:p-3.5 lg:p-4">
      <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[320px,1fr]">
        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm">
          <div className="bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent p-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Profile
            </p>
            <h1 className="mt-1.5 text-2xl font-bold">Your public card</h1>
            <p className="mt-1.5 text-sm opacity-70">
              This is how other learners see you before they start a chat.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex flex-col items-center text-center">
              <div className="avatar">
                <div className="size-24 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-100">
                  {formState.profilePic ? (
                    <img src={formState.profilePic} alt={formState.fullName || "Profile"} />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-base-300">
                      <CameraIcon className="size-10 opacity-40" />
                    </div>
                  )}
                </div>
              </div>
              <h2 className="mt-3 text-xl font-semibold">
                {formState.fullName || "Your name"}
              </h2>
              <p className="mt-1 max-w-full break-all text-sm text-primary">
                {formState.username ? `@${formState.username}` : "@username"}
              </p>
              <p className="mt-1.5 break-words text-sm opacity-70">
                {formState.bio || "Add a short bio to tell people what you want to practice."}
              </p>
            </div>

            <div className="grid gap-2.5">
              <div className="rounded-xl bg-base-100 p-3">
                <div className="flex items-center gap-3">
                  <MailIcon className="size-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.18em] opacity-60">Email</p>
                    <p className="break-all font-medium">{authUser?.email || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-base-100 p-3">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="size-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.18em] opacity-60">Location</p>
                    <p className="break-words font-medium">{formState.location || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-base-100 p-3">
                <div className="flex items-center gap-3">
                  <GlobeIcon className="size-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.18em] opacity-60">Languages</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="badge badge-secondary max-w-full gap-1 px-2.5 py-2 text-[11px]">
                        {getLanguageFlag(formState.nativeLanguage)}
                        Native: {capitalize(formState.nativeLanguage)}
                      </span>
                      <span className="badge badge-outline max-w-full gap-1 px-2.5 py-2 text-[11px]">
                        {getLanguageFlag(formState.learningLanguage)}
                        Learning: {capitalize(formState.learningLanguage)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-base-100 p-3">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="size-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] opacity-60">Status</p>
                    <p className="font-medium">Profile active and visible to friends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-base-300 bg-base-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-base-300 px-4 py-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Edit Details
              </p>
              <h2 className="mt-1.5 text-xl font-bold">Update your profile</h2>
            </div>
            <PencilLineIcon className="size-4 text-primary" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="btn btn-accent btn-sm"
              >
                <ShuffleIcon className="size-4 mr-2" />
                Generate Random Avatar
              </button>
              <label className="btn btn-outline btn-sm">
                <ImagePlusIcon className="size-4 mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Profile Image URL</span>
                </label>
                <input
                  type="url"
                  value={formState.profilePic}
                  onChange={(e) =>
                    setFormState((current) => ({ ...current, profilePic: e.target.value }))
                  }
                  className="input input-bordered w-full"
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={authUser?.email || ""}
                  className="input input-bordered w-full"
                  disabled
                  readOnly
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState((current) => ({ ...current, fullName: e.target.value }))
                  }
                  className="input input-bordered w-full"
                  placeholder="Your full name"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  value={formState.username}
                  onChange={(e) =>
                    setFormState((current) => ({ ...current, username: e.target.value.toLowerCase() }))
                  }
                  className="input input-bordered w-full"
                  placeholder="Unique username"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  value={formState.bio}
                  onChange={(e) =>
                    setFormState((current) => ({ ...current, bio: e.target.value }))
                  }
                  className="textarea textarea-bordered min-h-24 w-full"
                  placeholder="Tell others about yourself and your language goals"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState((current) => ({
                      ...current,
                      nativeLanguage: e.target.value,
                    }))
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  value={formState.learningLanguage}
                  onChange={(e) =>
                    setFormState((current) => ({
                      ...current,
                      learningLanguage: e.target.value,
                    }))
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 opacity-70" />
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState((current) => ({ ...current, location: e.target.value }))
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <button className="btn btn-primary btn-sm w-full sm:w-auto" disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <LoaderIcon className="mr-2 size-5 animate-spin" />
                  Saving profile...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

const capitalize = (value) => {
  if (!value) return "Not set";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default ProfilePage;
