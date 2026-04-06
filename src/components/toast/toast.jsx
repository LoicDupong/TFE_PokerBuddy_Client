"use client";

import useToastStore from "@/stores/useToastStore.js";
import "./toast.scss";

export default function Toast() {
  const { toast, clearToast } = useToastStore();
  if (!toast) return null;
  return (
    <div className={`toast toast--${toast.type}`} onClick={clearToast}>
      {toast.message}
    </div>
  );
}
