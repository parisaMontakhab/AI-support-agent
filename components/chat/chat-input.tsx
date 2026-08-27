"use client";

import { useState, type FormEvent } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
};

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMessage = value.trim();
    if (!nextMessage) return;
    onSend(nextMessage);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-[#EEE8F4] bg-white px-3 py-3 sm:px-4"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <input
          id="chat-message"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type a message..."
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full border border-[#E8E2F0] bg-[#F7F4FA] px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path
              d="M4 10h11M10.5 5.5 15.5 10l-5 4.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
