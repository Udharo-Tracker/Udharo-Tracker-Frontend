import { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Button,
  Alert,
  Select,
  DatePicker,
  App,
  Skeleton,
} from "antd";
import { Save, Camera, User as UserIcon, Phone } from "lucide-react";
import dayjs, { type Dayjs } from "dayjs";
import { Panel } from "@/components/shared/Panel";
import { useProfile, useUpdateProfile } from "@/api/profile.api";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

interface ProfileFormValues {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: Gender | "";
  date_of_birth?: Dayjs | null;
}

export function Profile() {
  const { data: profile, isLoading, isError, error } = useProfile();

  return (
    <div className="max-w-3xl space-y-6 pb-24">
      <header>
        <h1 className="text-xl font-semibold">Profile settings</h1>
        <p className="text-sm text-muted-foreground ">
          Manage your personal details.
        </p>
      </header>

      {isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load profile"
          description={(error as Error).message}
        />
      )}

      <Panel padding="lg">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <ProfileForm key={profile?.id} existing={profile} />
        )}
      </Panel>
    </div>
  );
}

function ProfileForm({ existing }: { existing?: UserProfile }) {
  const updateProfile = useUpdateProfile();

  const { message } = App.useApp();
  const [form] = Form.useForm<ProfileFormValues>();
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pictureObjectUrl = useMemo(
    () => (pictureFile ? URL.createObjectURL(pictureFile) : null),
    [pictureFile],
  );

  useEffect(() => {
    return () => {
      if (pictureObjectUrl) URL.revokeObjectURL(pictureObjectUrl);
    };
  }, [pictureObjectUrl]);

  // Prefer a freshly picked file's preview; fall back to the saved picture.
  const picturePreview = pictureObjectUrl ?? existing?.profile_picture ?? null;

  const pickPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPictureFile(file);
    e.target.value = "";
  };

  const submit = (values: ProfileFormValues) => {
    const payload: UserProfileUpdateInput = {
      first_name: values.first_name?.trim(),
      last_name: values.last_name?.trim(),
      phone_number: values.phone_number?.trim(),
      gender: values.gender || "",
      date_of_birth: values.date_of_birth
        ? values.date_of_birth.format("YYYY-MM-DD")
        : null,
    };
    // Only attach the picture when a new file was picked; omitting it
    // leaves the existing profile picture untouched on update.
    if (pictureFile) payload.profile_picture = pictureFile;

    updateProfile.mutate(payload, {
      onSuccess: () => {
        message.success("Profile updated");
        setPictureFile(null);
      },
      onError: (err) => message.error(err.message),
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 pb-5 mb-6 border-b border-border">
        <div className="relative shrink-0">
          <div className="size-17 rounded-full bg-primary-soft text-primary grid place-items-center text-lg font-semibold overflow-hidden">
            {picturePreview ? (
              <img
                src={picturePreview}
                alt="Profile picture preview"
                className="size-full object-cover"
              />
            ) : (
              <UserIcon />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary text-primary-foreground grid place-items-center border-2 border-surface"
            aria-label="Upload profile picture"
          >
            <Camera className="size-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pickPicture}
          />
        </div>
        <div>
          <h2 className="font-semibold text-base">Personal details</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            This information is private and only visible to you.
          </p>
        </div>
      </div>

      <Form<ProfileFormValues>
        form={form}
        layout="vertical"
        onFinish={submit}
        initialValues={{
          first_name: existing?.first_name,
          last_name: existing?.last_name,
          phone_number: existing?.phone_number,
          gender: existing?.gender ?? "",
          date_of_birth: existing?.date_of_birth
            ? dayjs(existing.date_of_birth)
            : null,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Form.Item label="First name" name="first_name">
            <Input placeholder="e.g. Hari" autoFocus maxLength={150} />
          </Form.Item>
          <Form.Item label="Last name" name="last_name">
            <Input placeholder="e.g. Sharma" maxLength={150} />
          </Form.Item>
          <Form.Item label="Phone number" name="phone_number">
            <Input
              prefix={<Phone className="size-4 text-muted-foreground" />}
              placeholder="98xxxxxxxx"
              maxLength={15}
            />
          </Form.Item>
          <Form.Item label="Gender" name="gender">
            <Select
              placeholder="Select gender"
              allowClear
              options={GENDER_OPTIONS}
            />
          </Form.Item>
        </div>
        <Form.Item label="Date of birth" name="date_of_birth">
          <DatePicker
            className="w-full"
            format="YYYY-MM-DD"
            maxDate={dayjs()}
          />
        </Form.Item>

        <Form.Item className="mb-0! mt-2 flex justify-end">
          <Button
            htmlType="submit"
            type="primary"
            loading={updateProfile.isPending}
          >
            <Save className="size-4" /> Save changes
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
