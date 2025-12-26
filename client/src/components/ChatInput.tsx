import { useEffect, useRef, useState } from "react";
import { Paperclip, FileText, X, Send, CirclePause } from "lucide-react";
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

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only PDF, DOC, DOCX, and TXT files are allowed.");
      return;
    }
    // await handleRemoveFile(filePreview?.documentId || "");
    const documentId = await onUpload(file);
    setFilePreview({ documentId, source: file.name });
    e.target.value = "";
  };

  const handleRemoveFile = async (id: string) => {
    console.log(id, "id");

    if (id) {
      await deleteUploadedDocument(id);
      setFilePreview(null);
      setUploadProgress && setUploadProgress(null);
      setDocStatus && setDocStatus("IDLE");
    }
  };

  // Restore previously uploaded document (on refresh)
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
    <div className="border-t bg-white px-4 py-3">
      {/* Selected File Preview */}
      {filePreview && (
        <div className="mb-2 flex items-center justify-between rounded-lg border px-3 py-2 text-sm bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="truncate max-w-50">{filePreview.source}</span>
          </div>
          <div className="w-full flex gap-4 items-center justify-end">
            {/* Upload / Processing Progress */}
            {uploadProgress !== null && docStatus !== "IDLE" && (
              <div className="mb-2 w-[50%]">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {docStatus}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRemoveFile(filePreview.documentId)}
              className="text-gray-500 hover:text-red-500 cursor-pointer border p-1 rounded-full hover:bg-gray-100"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          title="Attach document"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Text Input */}
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
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? <CirclePause /> : <Send />}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
