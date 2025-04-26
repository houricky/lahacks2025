import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isGroupsLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/group");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/group/${groupId}/messages`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, selectedGroup, messages } = get();
    try {
      let res;
      if (selectedGroup) {
        res = await axiosInstance.post(
          `/group/${selectedGroup._id}/messages`,
          {
            ...messageData,
            groupId: selectedGroup._id,
          }
        );
      } else {
        res = await axiosInstance.post(
          `/message/send/${selectedUser._id}`,
          messageData
        );
      }
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/group/create", groupData);
      set((state) => ({ groups: [...state.groups, res.data] }));
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  addGroupMembers: async (groupId, newMembers) => {
    try {
      const res = await axiosInstance.post(`/group/${groupId}/members/add`, {
        newMembers,
      });
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId ? res.data : group
        ),
      }));
      toast.success("Members added successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  removeGroupMembers: async (groupId, membersToRemove) => {
    try {
      const res = await axiosInstance.post(`/group/${groupId}/members/remove`, {
        membersToRemove,
      });
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId ? res.data : group
        ),
      }));
      toast.success("Members removed successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, selectedGroup } = get();
    if (!selectedUser && !selectedGroup) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set({
          messages: [...get().messages, newMessage],
        });
      }
    });

    socket.on("newGroupMessage", (newMessage) => {
      if (selectedGroup && newMessage.groupId === selectedGroup._id) {
        set({
          messages: [...get().messages, newMessage],
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("newGroupMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null }),
}));
