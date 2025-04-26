import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    getGroupMessages,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    } else if (selectedUser) {
      getMessages(selectedUser._id);
    }

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    selectedGroup?._id,
    getMessages,
    getGroupMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const getMessageSender = (message) => {
    if (selectedGroup) {
      return message.senderId;
    }
    return message.senderId === authUser._id ? authUser : selectedUser;
  };

  // Group messages by sender and date
  const groupedMessages = [];
  
  messages.forEach((message, index) => {
    const sender = getMessageSender(message);
    const isCurrentUser = message.senderId === authUser._id;
    
    // Check if this message should be grouped with the previous one
    // (same sender and sent within 5 minutes)
    const previousMessage = messages[index - 1];
    const shouldGroup = previousMessage && 
                         previousMessage.senderId === message.senderId &&
                         new Date(message.createdAt) - new Date(previousMessage.createdAt) < 5 * 60 * 1000;
    
    if (shouldGroup) {
      // Add to the last group
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    } else {
      // Create a new group
      groupedMessages.push({
        sender,
        isCurrentUser,
        messages: [message],
        date: new Date(message.createdAt)
      });
    }
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-800">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => {
            const isLastGroup = groupIndex === groupedMessages.length - 1;
            
            return (
              <div
                key={group.messages[0]._id}
                className="group hover:bg-gray-700 px-4 py-2"
              >
                {/* Discord-style layout with horizontal alignment of avatar, name and first message */}
                <div className="flex items-start gap-3 w-full">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                    <img
                      src={group.sender.profilePic || "/avatar.png"}
                      alt="profile pic"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Content container */}
                  <div className="flex-1">
                    {/* Username and timestamp */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-50">
                        {group.sender.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(group.messages[0].createdAt)}
                      </span>
                    </div>
                    
                    {/* First message */}
                    <div className="ml-0">
                      {group.messages[0].image && (
                        <div className="mb-1 max-w-lg rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={group.messages[0].image}
                            alt="Attachment"
                            className="max-w-full"
                          />
                        </div>
                      )}
                      {group.messages[0].text && (
                        <div className="text-gray-50">
                          {group.messages[0].text}
                        </div>
                      )}
                    </div>

                    {/* Subsequent messages */}
                    {group.messages.length > 1 && (
                      <div className="space-y-1 mt-1">
                        {group.messages.slice(1).map((message, messageIndex) => {
                          const isLastMessage = isLastGroup && messageIndex === group.messages.length - 2;
                          
                          return (
                            <div 
                              key={message._id} 
                              ref={isLastMessage ? messageEndRef : null}
                              className="ml-0"
                            >
                              {message.image && (
                                <div className="mb-1 max-w-lg rounded-md overflow-hidden border border-gray-200">
                                  <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="max-w-full"
                                  />
                                </div>
                              )}
                              {message.text && (
                                <div className="text-gray-50">
                                  {message.text}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;