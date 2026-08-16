import { App, Modal, Form, Input, Button } from "antd";
import { Lock } from "lucide-react";
import { useChangePassword } from "@/api/auth.api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const { message } = App.useApp();
  const changePassword = useChangePassword();
  const [form] = Form.useForm<UserChangePasswordInput>();

  const close = () => {
    form.resetFields();
    onClose();
  };

  const submit = (values: UserChangePasswordInput) => {
    changePassword.mutate(values, {
      onSuccess: () => {
        message.success("Password updated");
        close();
      },
      onError: (error) => message.error(error.message),
    });
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      title="Change password"
      destroyOnHidden
      width={440}
    >
      <Form<UserChangePasswordInput>
        form={form}
        layout="vertical"
        onFinish={submit}
        className="pt-2"
      >
        <Form.Item
          label="Current password"
          name="old_password"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
        >
          <Input.Password
            autoFocus
            placeholder="••••••••"
            prefix={<Lock className="size-4 text-muted-foreground" />}
          />
        </Form.Item>

        <Form.Item
          label="New password"
          name="password"
          hasFeedback
          rules={[
            { required: true, message: "Please enter a new password" },
            { min: 8, message: "Must be at least 8 characters" },
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            prefix={<Lock className="size-4 text-muted-foreground" />}
          />
        </Form.Item>

        <Form.Item
          label="Confirm new password"
          name="confirm_password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords don't match"));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            prefix={<Lock className="size-4 text-muted-foreground" />}
          />
        </Form.Item>

        <Form.Item className="mb-0! mt-2 flex justify-end">
          <Button
            htmlType="submit"
            type="primary"
            loading={changePassword.isPending}
          >
            Update password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
