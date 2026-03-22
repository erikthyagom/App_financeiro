"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type DialogOptions = {
  title?: string;
  type?: "info" | "warning" | "error" | "success";
};

type DialogContextType = {
  alert: (message: string, options?: DialogOptions) => Promise<void>;
  confirm: (message: string, options?: DialogOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("Atenção");
  const [type, setType] = useState<"info" | "warning" | "error" | "success">("warning");
  const [isConfirm, setIsConfirm] = useState(false);
  
  // Store the resolver function so we can resolve the promise when user clicks a button
  const [resolveFn, setResolveFn] = useState<(value: boolean) => void>(() => () => {});

  const openDialog = (msg: string, isConfirmMode: boolean, opts?: DialogOptions) => {
    setMessage(msg);
    setIsConfirm(isConfirmMode);
    setTitle(opts?.title || (isConfirmMode ? "Atenção" : "Aviso"));
    setType(opts?.type || (isConfirmMode ? "warning" : "info"));
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setResolveFn(() => resolve);
    });
  };

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    resolveFn(value);
  };

  const alert = async (msg: string, opts?: DialogOptions) => {
    await openDialog(msg, false, opts);
  };

  const confirm = async (msg: string, opts?: DialogOptions) => {
    return await openDialog(msg, true, opts);
  };

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      
      {isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="card" style={{ width: "90%", maxWidth: "400px", position: "relative", borderTop: type === "error" ? "4px solid var(--danger)" : type === "warning" ? "4px solid #f59e0b" : type === "success" ? "4px solid var(--success)" : "4px solid var(--primary)" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {type === "error" || type === "warning" ? <AlertCircle size={24} color={type === "error" ? "var(--danger)" : "#f59e0b"} /> : null}
              {type === "success" ? <CheckCircle2 size={24} color="var(--success)" /> : null}
              {type === "info" ? <Info size={24} color="var(--primary)" /> : null}
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>{title}</h3>
            </div>
            
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.5, fontSize: "1rem" }}>
              {message}
            </p>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              {isConfirm && (
                <button type="button" className="btn" onClick={() => handleClose(false)}>
                  Cancelar
                </button>
              )}
              <button 
                type="button" 
                className={`btn ${type === "error" ? "btn-danger" : "btn-primary"}`} 
                onClick={() => handleClose(true)}
              >
                {isConfirm ? "Confirmar" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
