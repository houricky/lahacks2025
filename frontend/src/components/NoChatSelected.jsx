import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Nexus!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;