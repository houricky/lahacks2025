import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Users, Plus, Check } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { users, createGroup } = useChatStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedUsers.length < 2) {
      toast.error("Please select at least 2 users");
      return;
    }

    try {
      await createGroup({
        name: groupName.trim(),
        members: selectedUsers,
      });
      onClose();
      toast.success("Group created successfully");
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("Failed to create group");
    }
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-750 flex items-center justify-center z-50">
      <div className="bg-[#0d1220] rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create a Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-[#1a1d29] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              placeholder="Enter group name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Members
            </label>
            <div className="max-h-48 overflow-y-auto bg-[#1a1d29] rounded-md p-2">
              {users.length === 0 ? (
                <div className="text-center py-4 text-gray-400">No users available</div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 p-2 hover:bg-[#272b3a] rounded-md cursor-pointer"
                    onClick={() => toggleUser(user._id)}
                  >
                    <div className="relative">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1a1d29] ${
                          user.isOnline ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                    </div>
                    <span className="text-white">{user.name}</span>
                    {selectedUsers.includes(user._id) ? (
                      <Check className="ml-auto text-[#5865f2]" size={16} />
                    ) : (
                      <Plus className="ml-auto text-gray-400" size={16} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#5865f2] text-white rounded-md hover:bg-[#4752c4] transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
