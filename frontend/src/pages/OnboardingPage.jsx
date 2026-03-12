import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { LoaderIcon } from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { fileToCompressedDataUrl } from "../lib/image.js";
import { CameraIcon, ImagePlusIcon, ShuffleIcon, MapPinIcon, ShipWheelIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarding successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error)=>{
      toast.error(error?.response?.data?.message)
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formState.fullName.trim() ||
      !formState.bio.trim() ||
      !formState.nativeLanguage ||
      !formState.learningLanguage ||
      !formState.location.trim()
    ) {
      toast.error("Please complete every field before continuing.");
      return;
    }

    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random()*100)+1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}`;
    setFormState({...formState, profilePic: randomAvatar});
    toast("Random avatar generated!")
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
    <div className="min-h-screen bg-base-100 px-4 py-10 flex items-center justify-center">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-accent"
                >
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
                <label className="btn btn-outline">
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

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Profile Image URL</span>
                </label>
                <input
                  type="url"
                  name="profilePic"
                  value={formState.profilePic}
                  onChange={(e) =>
                    setFormState({ ...formState, profilePic: e.target.value })
                  }
                  className="input input-bordered w-full"
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState({ ...formState, fullName: e.target.value })
                  }
                  className="input input-bordered w-full"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formState.bio}
                  onChange={(e) =>
                    setFormState({ ...formState, bio: e.target.value })
                  }
                  className="textarea textarea-bordered w-full min-h-28"
                  placeholder="Tell others about yourself and your language learning goals"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select name="nativeLanguage" value={formState.nativeLanguage} onChange={(e) => setFormState({...formState, nativeLanguage:e.target.value})} className="select select-bordered w-full" required>
                  <option value="">Select your language</option>
                  {LANGUAGES.map((lang)=>(
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                  </select>              
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select name="learningLanguage" value={formState.learningLanguage} onChange={(e) => setFormState({...formState, learningLanguage:e.target.value})} className="select select-bordered w-full" required>
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang)=>(
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input type="text" name="location" value={formState.location} onChange={(e) => setFormState({...formState, location: e.target.value})} className="input input-bordered w-full pl-10" placeholder="City, Country" required />
              </div>
            </div>

            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {isPending ? (
                <>
                <LoaderIcon className="animate-spin size-5 mr-2" />
                Saving profile...
                </>
              ) : (
                <>
                <ShipWheelIcon className="size-5 mr-2" />
                Complete Onboarding
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
