"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import cn from "clsx";
import { ModeToggle } from "@/components/ui/modeToggle";

const suggestions = [
  {
    id: 1,
    title: "What are the key regulations for launching a token in the UK?",
    description: "Summarize the legal framework for token launches in the UK.",
  },
  {
    id: 2,
    title: "How is staking taxed under UK crypto regulations?",
    description: "Get insights on how staking rewards are taxed in the UK.",
  },
  {
    id: 3,
    title: "Is my crypto project considered a security?",
    description:
      "Understand the criteria for crypto assets being classified as securities.",
  },
  {
    id: 4,
    title: "How does the FCA regulate DeFi projects?",
    description:
      "Summarize the FCA’s stance on decentralized finance (DeFi) platforms.",
  },
];

const MAX_CHARS = 2000;

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { id: string; content: string; role: "user" | "bot" }[]
  >([]);
  const [showInitialUI, setShowInitialUI] = useState(true);
  const [centerInput, setCenterInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate Bot Response
  const simulateBotResponse = () => {
    setTimeout(() => {
      const botMessage: { id: string; content: string; role: "user" | "bot" } =
        {
          id: Date.now().toString(),
          content: "This is a simulated response from the bot.",
          role: "bot",
        };
      setMessages((prev) => [...prev, botMessage]);
      scrollToBottom();
    }, 1000);
  };

  // Handle Suggestion Click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleFormSubmit();
  };

  // Handle Form Submit
  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const newMessage: { id: string; content: string; role: "user" | "bot" } = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setShowInitialUI(false);
    setCenterInput(false); // Move input box to bottom
    simulateBotResponse();
    scrollToBottom();
  };

  // Scroll to Bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl">
          {showInitialUI && (
            <h1 className="text-4xl font-semibold text-center mt-20 mb-8">
              How can I assist you?
            </h1>
          )}

          {/* Suggestions Section */}
          {showInitialUI && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 mb-1">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  className="text-left w-full p-4 space-y-1 bg-[#ffffff] hover:bg-[#f9f9f9] dark:bg-[#171717] rounded-lg shadow-md dark:hover:bg-[#171717]/60 transition"
                  onClick={() => handleSuggestionClick(s.title)}
                >
                  <span className="block text-sm font-medium">{s.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {s.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4 px-4 pb-2 pt-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[75%]",
                  message.role === "user"
                    ? "ml-auto dark:bg-[#171717] bg-[#f3f3f3] "
                    : ""
                )}
              >
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Section (Initially Centered) */}
      <div
        className={cn(
          "w-full max-w-3xl mx-auto transition-all duration-500",
          centerInput
            ? "absolute inset-x-0 bottom-[50%] translate-y-[50%]"
            : "sticky bottom-0"
        )}
      >
        <div className="relative px-4 py-4">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-muted">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit();
                  }
                }}
                placeholder="Start a new conversation..."
                className="w-full min-h-[60px] resize-none border-0 bg-transparent p-4 text-foreground focus:ring-0"
                maxLength={MAX_CHARS}
              />
              <div className="absolute bottom-5 right-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {input.length}/{MAX_CHARS}
                </span>
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!input.trim()}
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
