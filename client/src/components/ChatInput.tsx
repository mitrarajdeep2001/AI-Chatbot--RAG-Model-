import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Paperclip,
  FileText,
  X,
  Send,
  CirclePause,
  UploadCloud,
} from "lucide-react";
import {
  deleteUploadedDocument,
  fetchUploadedDocument,
} from "../services/apis/chat.ts";

interface Props {
  onSend: (message: string) => void;
  onUpload: (file: File) => Promise<string>;
  uploadProgress?: number | null;
  docStatus?: "IDLE" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  disabled?: boolean;
  setUploadProgress?: (p: number | null) => void;
  setDocStatus?: (
    status: "IDLE" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED"
  ) => void;
}

interface FilePreview {
  documentId: string;
  source: string;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const ChatInput = ({
  onSend,
  onUpload,
  uploadProgress = null,
  docStatus = "IDLE",
  disabled = false,
  setUploadProgress,
  setDocStatus,
}: Props) => {
  const [input, setInput] = useState("");
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);

  /* ---------------- SHARED FILE HANDLER ---------------- */

  const handleFileUpload = async (file: File) => {
    if (disabled) return;
    if (filePreview?.documentId) {
      await handleRemoveFile(filePreview?.documentId);
    }

    const isAllowed = Object.keys(ACCEPTED_TYPES).includes(file.type);
    if (!isAllowed) {
      alert("Only PDF, DOC, DOCX, and TXT files are allowed.");
      return;
    }

    const documentId = await onUpload(file);
    setFilePreview({ documentId, source: file.name });
  };

  /* ---------------- DROPZONE ---------------- */

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      await handleFileUpload(acceptedFiles[0]);
    },
    [disabled]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled,
  });

  /* ---------------- FULL PASTE HANDLING ---------------- */

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    const clipboard = e.clipboardData;

    // 1️⃣ Prefer clipboard files (best case)
    if (clipboard.files && clipboard.files.length > 0) {
      e.preventDefault();
      await handleFileUpload(clipboard.files[0]);
      return;
    }

    // 2️⃣ Fallback to items (browser-specific)
    for (const item of clipboard.items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          await handleFileUpload(file);
          return;
        }
      }
    }

    // 3️⃣ Otherwise → allow normal text paste
  };

  /* ---------------- SEND MESSAGE ---------------- */

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  /* ---------------- REMOVE FILE ---------------- */

  const handleRemoveFile = async (id: string) => {
    if (!id) return;
    await deleteUploadedDocument(id);
    setFilePreview(null);
    setUploadProgress?.(null);
    setDocStatus?.("IDLE");
  };

  /* ---------------- RESTORE FILE ON REFRESH ---------------- */

  useEffect(() => {
    (async () => {
      const result = await fetchUploadedDocument();
      if (!result.ok) return;

      const { data } = await result.json();
      if (data) {
        setFilePreview({
          documentId: data.documentId,
          source: data.source,
        });
      }
    })();
  }, []);

  return (
    <div
      {...getRootProps()}
      onPaste={handlePaste}
      className={`border-t bg-white px-4 py-3 relative transition-all
        ${isDragActive ? "bg-blue-50 ring-2 ring-blue-500" : ""}
      `}
    >
      <input {...getInputProps()} />

      {/* Drag Overlay */}
      {isDragActive && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center
                        bg-blue-50/90 backdrop-blur-sm text-blue-700"
        >
          <UploadCloud className="w-10 h-10 mb-2 animate-bounce" />
          <p className="font-medium text-sm">Drop file to upload</p>
        </div>
      )}

      {/* File Preview */}
      {filePreview && (
        <div className="mb-2 flex items-center justify-between rounded-lg border px-3 py-2 text-sm bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="truncate max-w-50">{filePreview.source}</span>
          </div>

          <div className="flex gap-3 items-center w-[60%] justify-end">
            {uploadProgress !== null && docStatus !== "IDLE" && (
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {docStatus}
                </p>
              </div>
            )}

            <button
              onClick={() => handleRemoveFile(filePreview.documentId)}
              className="p-1 rounded-full border hover:bg-gray-100 cursor-pointer"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={openFileDialog}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>

        <input
          type="text"
          placeholder={
            docStatus === "PROCESSING"
              ? "Document is processing…"
              : "Ask a question…"
          }
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none
                     focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
        />

        <button
          onClick={handleSend}
          disabled={disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {disabled ? <CirclePause /> : <Send />}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
