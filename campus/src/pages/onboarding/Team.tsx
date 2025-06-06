import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import roles from "../../../../common/data/defaultInstituteRoles";

interface InvitedMember {
  email: string;
  role: string;
}

const Team = ({
  invitedMembers,
  setInvitedMembers,
  loading,
}: {
  invitedMembers: InvitedMember[];
  setInvitedMembers: React.Dispatch<React.SetStateAction<InvitedMember[]>>;
  loading: boolean;
}) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInvite = () => {
    if (!email || !selectedRole) {
      toast.error("Please enter both an email and a role.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Invalid email format. Please enter a valid email.");
      return;
    }

    const existingMemberIndex = invitedMembers.findIndex(
      (member) => member.email === email
    );

    if (existingMemberIndex !== -1) {
      const updatedMembers = [...invitedMembers];
      updatedMembers[existingMemberIndex] = {
        email,
        role: selectedRole,
      };
      setInvitedMembers(updatedMembers);
      toast.success("Member updated successfully.");
    } else {
      setInvitedMembers([...invitedMembers, { email, role: selectedRole }]);
      toast.success("Member added successfully.");
    }

    setEmail("");
    setSelectedRole("");
  };

  const handleDeleteInvitedMember = (index: number) => {
    const updatedMembers = invitedMembers.filter((_, i) => i !== index);
    setInvitedMembers(updatedMembers);
    toast.success("Member removed successfully.");
  };

  return (
    <div>
      <p className="opacity-50 mt-1">
        Finally, add your team members to your institute.
      </p>

      <div className="mt-5 w-[700px] flex gap-5 items-center">
        <Input
          label="Team Member Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select
          label="Role"
          className="w-[350px]"
          placeholder="Select a role"
          selectedKeys={selectedRole ? [selectedRole] : []}
          onSelectionChange={(keys) =>
            setSelectedRole(Array.from(keys)[0] as string)
          }
        >
          {roles.map((role) => (
            <SelectItem key={role.slug} value={role.slug}>
              {role.name}
            </SelectItem>
          ))}
        </Select>
        <Button
          color="success"
          variant="flat"
          onClick={handleInvite}
          isDisabled={loading}
        >
          Add
        </Button>
      </div>

      <div>
        {invitedMembers.length > 0 && (
          <div className="mt-5 w-full bg-card rounded-xl p-5 max-h-[290px] overflow-y-auto drop-shadow-glow-light-dark">
            <table className="w-full ">
              <tbody>
                {invitedMembers.map((member, index) => (
                  <tr key={index} className="h-14">
                    <td>{member.email}</td>
                    <td>{roles.find((r) => r.slug === member.role)?.name}</td>
                    <td>
                      <Button
                        color="danger"
                        variant="flat"
                        onClick={() => handleDeleteInvitedMember(index)}
                        isIconOnly
                      >
                        <Trash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
