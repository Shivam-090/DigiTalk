export const getMessagePreview = (channel) => {
  const latestMessage = channel?.state?.messages?.at(-1);
  if (!latestMessage) return "No messages yet";
  if (latestMessage.text?.trim()) return latestMessage.text;
  return "Shared an attachment";
};

export const getUnreadCount = (channel) => {
  if (!channel) return 0;
  if (typeof channel.countUnread === "function") {
    return channel.countUnread() || 0;
  }

  return channel.state?.unreadCount || 0;
};

export const formatChatTime = (value, options = {}) => {
  if (!value) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
};
