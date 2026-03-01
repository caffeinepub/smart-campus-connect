import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetChatMessages, useSendChatMessage } from "../hooks/useQueries";
import { formatRelativeTime, getInitials } from "../utils/timeUtils";

// Rotating background colors for avatars
const AVATAR_COLORS = [
  "bg-blue-500/20 text-blue-300",
  "bg-purple-500/20 text-purple-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-amber-500/20 text-amber-300",
  "bg-cyan-500/20 text-cyan-300",
  "bg-rose-500/20 text-rose-300",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ChatPage() {
  const { identity } = useInternetIdentity();
  const { data: messages = [], isLoading } = useGetChatMessages();
  const sendMessage = useSendChatMessage();

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentPrincipal = identity?.getPrincipal().toString();

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    try {
      await sendMessage.mutateAsync(content);
    } catch {
      toast.error("Failed to send message");
      setText(content);
    }
  };

  const sortedMessages = [...messages].sort((a, b) =>
    Number(a.timestamp - b.timestamp),
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          Student Chat
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Live campus chat — refreshes every 5 seconds
        </p>
      </div>

      {/* Chat container */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-16">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="font-medium text-foreground/70">
                  No messages yet
                </p>
                <p className="text-muted-foreground text-sm">
                  {identity
                    ? "Be the first to say hello!"
                    : "Login to join the conversation."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {sortedMessages.map((msg, idx) => {
                const isOwn = currentPrincipal === msg.author.toString();
                const isSameAuthorAsPrev =
                  idx > 0 &&
                  sortedMessages[idx - 1].author.toString() ===
                    msg.author.toString();

                return (
                  <motion.div
                    key={String(msg.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    {!isOwn && (
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          isSameAuthorAsPrev
                            ? "invisible"
                            : getAvatarColor(msg.authorName)
                        }`}
                      >
                        {getInitials(msg.authorName)}
                      </div>
                    )}

                    <div
                      className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}
                    >
                      {!isSameAuthorAsPrev && !isOwn && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-medium text-foreground/70">
                            {msg.authorName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary text-foreground/90 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {isOwn && !isSameAuthorAsPrev && (
                        <span className="text-xs text-muted-foreground mt-1 px-1">
                          {formatRelativeTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border p-3">
          {identity ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-secondary border-border flex-1"
                autoComplete="off"
              />
              <Button
                type="submit"
                disabled={sendMessage.isPending || !text.trim()}
                size="icon"
                className="bg-primary text-primary-foreground flex-shrink-0"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-2">
              Login to join the conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
