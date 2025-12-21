const ChatHeader = () => {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
            <div>
                <h1 className="text-lg font-semibold text-gray-900">
                    AI Knowledge Assistant
                </h1>
                <p className="text-sm text-gray-500">
                    Ask questions from uploaded documents
                </p>
            </div>
        </header>
    );
};

export default ChatHeader;
