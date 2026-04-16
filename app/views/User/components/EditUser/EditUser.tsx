import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  getSingleUserFn,
  deleteUserFn,
  updateUserFn,
} from '../../../../controllers/user.controller';
import { IUser } from '../../../../models/user';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

export interface EditUserProps {
  userId: string | number;
  onUpdate?: () => void;
}

const EditUser: React.FC<EditUserProps> = ({
  userId,
  onUpdate,
}: EditUserProps) => {
  const [user, setUser] = useState<IUser>({} as IUser);
  const [values, setValues] = useState({
    fullName: '',
    username: '',
    role: '',
  });
  const { closeSideContent } = useSidebarContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSingleUserFn(Number(userId));
        if (!response) return;
        setUser(response);
        setValues({
          fullName: response.fullName || '',
          username: response.username || '',
          role: response.role || '',
        });
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to load user');
      }
    };
    fetchData();
  }, [userId]);

  const deleteUser = async () => {
    try {
      await deleteUserFn(Number(userId));
      toast.success('User deleted');
      onUpdate?.();
      closeSideContent();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserFn(values, Number(userId));
      toast.success('User updated');
      onUpdate?.();
      closeSideContent();
    } catch {
      toast.error('Failed to update user');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Full Name"
          type="text"
          value={values.fullName}
          onChange={(e) => setValues({ ...values, fullName: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="Username"
          type="text"
          value={values.username}
          onChange={(e) => setValues({ ...values, username: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="role">Role</Label>
        <Select
          value={values.role}
          onValueChange={(val) => setValues({ ...values, role: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="newbie">Newbie</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        Update
      </Button>
      <Button
        className="w-full mt-2"
        onClick={deleteUser}
        type="button"
        variant="destructive"
      >
        Delete
      </Button>
    </form>
  );
};
export default EditUser;
