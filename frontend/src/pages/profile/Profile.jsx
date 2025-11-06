import { Card, Avatar, Descriptions, Tag, Divider } from "antd";
import { User, Mail, Phone, BriefcaseMedical } from "lucide-react";
import React from "react";
import { useUser } from "../../context/UserContext.jsx";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

export const Profile = () => {
  const { user } = useUser();

  const displayName = user?.name ?? user?.username ?? "User";
  const initials = getInitials(displayName);
  const email = user?.email ?? "Not provided";
  const phone = user?.phone ?? "Not provided";
  const role = user?.role ?? "Member";
  const specialty = user?.specialty ?? "General";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="text-center">
        <Avatar
          size={96}
          className="mx-auto mb-4 bg-blue-500"
          icon={initials ? undefined : <User />}
        >
          {initials}
        </Avatar>
        <h2 className="text-2xl font-semibold text-foreground">{displayName}</h2>
        <p className="text-muted-foreground capitalize">{role}</p>
      </Card>

      <Card title="Contact Information" bordered={false}>
        <Descriptions column={1} colon={false}>
          <Descriptions.Item label={<Mail className="w-4 h-4" />}>
            <span className="ml-2">{email}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<Phone className="w-4 h-4" />}>
            <span className="ml-2">{phone}</span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Professional Details" bordered={false}>
        <div className="flex flex-wrap items-center gap-2">
          <Tag color="blue" className="flex items-center gap-2">
            <BriefcaseMedical className="w-4 h-4" />
            <span>{specialty}</span>
          </Tag>
          <Tag color="default" className="capitalize">
            {role}
          </Tag>
        </div>
        {user?.bio && (
          <>
            <Divider />
            <p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;
