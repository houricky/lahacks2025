import { X, Users, Hash } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, selectedGroup, setSelectedUser, setSelectedGroup } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const handleClose = () => {
    if (selectedUser) {
      setSelectedUser(null);
    } else if (selectedGroup) {
      setSelectedGroup(null);
    }
  };

  if (!selectedUser && !selectedGroup) return null;

  return (
    <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          {selectedGroup && !selectedGroup.groupImage ? (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Hash size={16} className="text-white" />
            </div>
          ) : (
            <img
              src={
                selectedGroup
                  ? selectedGroup.groupImage || "/group-avatar.png"
                  : selectedUser.profilePic || "/avatar.png"
              }
              alt={selectedGroup ? selectedGroup.name : selectedUser.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Name and Status */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {selectedGroup ? selectedGroup.name : selectedUser.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selectedGroup ? (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {selectedGroup.members.length} {selectedGroup.members.length === 1 ? 'member' : 'members'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${onlineUsers.includes(selectedUser._id) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center">
        <button 
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;