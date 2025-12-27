import { RotateCw } from "lucide-react";

interface Props {
  onReset: () => void;
}
const ChatHeader = ({ onReset }: Props) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <div className="flex items-center gap-4 w-full">
        <div className="w-[50%]">
          <h1 className="text-lg font-semibold text-gray-900">
            AI Knowledge Assistant
          </h1>
          <p className="text-sm text-gray-500">
            Ask questions from uploaded documents
          </p>
        </div>
        <div className="w-[50%] flex justify-end">
          <button
            onClick={onReset}
            title="Reset Chat"
            className="bg-red-600 text-white p-2 rounded-lg flex items-center gap-2 hover:bg-red-700 cursor-pointer"
          >
            <RotateCw />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
