import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  UserPlus, 
  Plus, 
  LogOut, 
  Search,
  ChevronDown,
  Hash,
  MessageSquare
} from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const { getUsers, getGroups, users, groups, selectedUser, selectedGroup, setSelectedUser, setSelectedGroup } = useChatStore();
  const { onlineUsers, authUser, logout } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // For the new unified chat list
  const [allChats, setAllChats] = useState([]);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  // Simulate timestamps for sorting (this would come from your backend)
  useEffect(() => {
    // Combine users and groups into a single array with type indicator
    const userChats = users.map(user => ({
      ...user,
      type: 'direct',
      lastMessage: {
        // This would come from your backend in real implementation
        timestamp: new Date(Date.now() - Math.random() * 1000000000),
        content: 'Last message preview...'
      }
    }));
    
    const groupChats = groups.map(group => ({
      ...group,
      type: 'group',
      lastMessage: {
        // This would come from your backend in real implementation
        timestamp: new Date(Date.now() - Math.random() * 1000000000),
        content: 'Last group message preview...'
      }
    }));
    
    // Combine both types
    const combined = [...userChats, ...groupChats];
    
    // Sort by most recent message
    combined.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
    
    setAllChats(combined);
  }, [users, groups]);

  // Filter the combined list
  const filteredChats = allChats.filter(chat => {
    const matchesSearch = searchTerm === "" || 
      chat.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (chat.type === 'direct') {
      return matchesSearch && (showOnlineOnly ? onlineUsers.includes(chat._id) : true);
    }
    
    return matchesSearch;
  });

  // Handle selection of a chat
  const handleChatSelect = (chat) => {
    if (chat.type === 'direct') {
      setSelectedUser(chat);
      setSelectedGroup(null);
    } else {
      setSelectedGroup(chat);
      setSelectedUser(null);
    }
  };

  // Get the currently selected chat (either user or group)
  const getSelectedChat = () => {
    if (selectedUser) return { ...selectedUser, type: 'direct' };
    if (selectedGroup) return { ...selectedGroup, type: 'group' };
    return null;
  };

  const selectedChat = getSelectedChat();

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 flex flex-col h-full shadow-lg">
      {/* Logo and App Name */}
      <div className="px-4 py-5 flex items-center border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Nexus</h1>
      </div>

      {/* Search and Actions */}
      <div className="px-4 py-3">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={() => setShowOnlineOnly(!showOnlineOnly)}
                className="sr-only"
              />
              <div className={`w-8 h-4 rounded-full transition-colors ${showOnlineOnly ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`absolute top-0 left-0 w-4 h-4 rounded-full transition-transform transform ${showOnlineOnly ? 'translate-x-4 bg-white' : 'bg-white'}`}></div>
            </div>
            <span>Online only</span>
          </label>
          <div className="flex space-x-2">
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <UserPlus size={16} />
            </button>
            <button 
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => setShowCreateGroupModal(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
          All Conversations
        </h3>
        <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
      </div>

      {/* Unified Chat List */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="py-2 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              {searchTerm ? "No matching conversations found" : "No conversations available"}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={`${chat.type}-${chat._id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  (selectedChat && selectedChat.type === chat.type && selectedChat._id === chat._id)
                    ? "bg-indigo-100 dark:bg-indigo-900/30" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleChatSelect(chat)}
              >
                {chat.type === 'direct' ? (
                  // User avatar with online indicator
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.profilePic || "/avatar.png"}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-50 dark:border-gray-900 ${
                        onlineUsers.includes(chat._id) ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                ) : (
                  // Group icon
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {chat.groupImage ? (
                      <img
                        src={chat.groupImage}
                        alt={chat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Hash size={18} className="text-white" />
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {chat.lastMessage.timestamp.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    {chat.type === 'group' && (
                      <Hash size={12} className="mr-1 text-gray-400" />
                    )}
                    {chat.type === 'direct' && (
                      <MessageSquare size={12} className="mr-1 text-gray-400" />
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {chat.lastMessage.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="flex items-center">
          {/* Profile button - 80% width */}
          <button 
            className="flex items-center gap-3 flex-grow rounded-lg px-3 py-2 transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => window.location.href = "/profile"}
            style={{ width: "80%" }}
          >
            <div className="relative">
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt={authUser?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-50 dark:border-gray-900 bg-green-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate text-left">{authUser?.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-left">Online</p>
            </div>
          </button>
          
          {/* Logout button - 20% width */}
          <button 
            className="ml-2 px-3 py-2 h-14 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            onClick={logout}
            style={{ width: "20%" }}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;