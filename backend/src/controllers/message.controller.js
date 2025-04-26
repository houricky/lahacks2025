import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find users that have conversations with the logged-in user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
        },
      },
    ]);

    const userIds = conversations.map((conv) => conv._id);

    // Get user details for these conversations
    const users = await User.find({
      _id: { $in: userIds },
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      messageType: "direct",
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    // Emit socket event to notify other users
    if (message.messageType === "direct") {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", messageId);
      }
    } else if (message.messageType === "group") {
      // For group messages, notify all group members
      const group = await Group.findById(message.groupId);
      if (group) {
        group.members.forEach((memberId) => {
          if (memberId.toString() !== userId.toString()) {
            const memberSocketId = getReceiverSocketId(memberId);
            if (memberSocketId) {
              io.to(memberSocketId).emit("messageDeleted", messageId);
            }
          }
        });
      }
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const startConversation = async (req, res) => {
  try {
    const { email } = req.body;
    const loggedInUserId = req.user._id;

    // Find user by email
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() === loggedInUserId.toString()) {
      return res
        .status(400)
        .json({ error: "Cannot start conversation with yourself" });
    }

    // Check if conversation already exists
    const existingConversation = await Message.findOne({
      $or: [
        { senderId: loggedInUserId, receiverId: user._id },
        { senderId: user._id, receiverId: loggedInUserId },
      ],
    });

    if (existingConversation) {
      return res.status(400).json({ error: "Conversation already exists" });
    }

    // Create initial message
    const newMessage = new Message({
      senderId: loggedInUserId,
      receiverId: user._id,
      text: "Hello! 👋",
      messageType: "direct",
    });

    await newMessage.save();

    // Get the sender's user data
    const sender = await User.findById(loggedInUserId).select("-password");

    // Notify both users about the new conversation
    const receiverSocketId = getReceiverSocketId(user._id);
    const senderSocketId = getReceiverSocketId(loggedInUserId);

    // Emit to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newConversation", {
        user: sender,
        message: newMessage,
      });
    }

    // Emit to sender
    if (senderSocketId) {
      io.to(senderSocketId).emit("newConversation", {
        user: user,
        message: newMessage,
      });
    }

    res.status(201).json(user);
  } catch (error) {
    console.error("Error in startConversation: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
