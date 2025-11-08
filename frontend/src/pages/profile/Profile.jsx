import { Card, Avatar, Tag } from "antd";
import {
  BriefcaseMedical,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
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

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const displayName = fullName || user?.name || user?.username || "User";
  const initials = getInitials(displayName);
  const email = user?.email ?? "Not provided";
  const phone = user?.phoneNumber ?? user?.phone ?? "Not provided";
  const role = user?.role ?? "Member";
  const isDoctor = user?.role === "doctor";
  const specialtyValue = typeof user?.specialty === "string" ? user.specialty.trim() : "";
  const specialty = isDoctor
    ? specialtyValue || "Not specified"
    : specialtyValue || "General Practice";
  const username = user?.username ?? "Not provided";

  const personalDetails = [
    {
      icon: User,
      label: "First name",
      value: firstName || "Not provided",
    },
    {
      icon: User,
      label: "Last name",
      value: lastName || "Not provided",
    },
    {
      icon: Mail,
      label: "Email address",
      value: username,
    },
    {
      icon: Phone,
      label: "Phone number",
      value: phone || "Not provided",
    }    
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <Avatar
              size={100}
              className="bg-blue-500 text-white shadow-md"
              icon={initials ? undefined : <User />}
            >
              {initials}
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground">{displayName}</h1>
              <p className="text-muted-foreground">{username}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {(isDoctor || specialtyValue) && (
                  <Tag color="blue" className="flex items-center gap-2">
                    <BriefcaseMedical className="h-4 w-4" />
                    <span>{specialty}</span>
                  </Tag>
                )}
                <Tag color="green" className="flex items-center gap-2 capitalize">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{role}</span>
                </Tag>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Personal Details" bordered={false} className="shadow-sm">
          <div className="space-y-5">
            {personalDetails.map(({ icon, label, value }) => {
              const DetailIcon = icon;
              return (
                <div key={label} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-blue-50 p-2 text-blue-600">
                    <DetailIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-base text-foreground">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Professional Details" bordered={false} className="shadow-sm">
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-base capitalize text-foreground">{role}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-muted-foreground">Specialty</p>
              <p className="text-base text-foreground">{specialty}</p>
            </div>
            {user?.bio && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-muted-foreground">About</p>
                <p className="text-base text-foreground whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
