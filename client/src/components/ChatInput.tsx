import { useEffect, useRef, useState } from "react";
import { Paperclip, FileText, X } from "lucide-react";
import type { ChatFile } from "../types/chat.ts";
import {
  deleteUploadedDocument,
  fetchUploadedDocument,
} from "../services/apis/chat.ts";

interface Props {
  onSend: (message: string, file?: ChatFile) => void;
  onUpload: (file: File) => void;
  disabled?: boolean;
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

const ChatInput = ({ onSend, onUpload, disabled }: Props) => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;

    onSend(input);

    setInput("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only PDF, DOC, DOCX, and TXT files are allowed.");
      return;
    }

    setSelectedFile(file);
    setFilePreview({ documentId: "", source: file.name });
    onUpload(file);
    e.target.value = "";
  };

  const handleRemoveFile = async (id: string) => {
    setSelectedFile(null);
    setFilePreview(null);
    await deleteUploadedDocument(id);
  };

  useEffect(() => {
    (async () => {
      const result = await fetchUploadedDocument();
      const { data } = await result.json();
      if (result.ok && data) {
        setFilePreview({ documentId: data?.documentId || "", source: data?.source });
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
          <button
            type="button"
            onClick={() => handleRemoveFile(filePreview.documentId)}
            className="text-gray-500 hover:text-red-500 cursor-pointer"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
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
          placeholder="Ask a question..."
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
