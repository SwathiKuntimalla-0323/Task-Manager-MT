import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("wss://10.50.48.48:5001", {
    transports: ["websocket"],
    secure: true,
});
const Chat = ({ userId }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const chatContainerRef = useRef(null);
    const lastMessageRef = useRef(null);
    
    useEffect(() => {
        if (userId) {
            localStorage.setItem("userId", userId);
        }
    }, [userId]);

    const localUserId = userId || localStorage.getItem("userId");

    useEffect(() => {
        if (!localUserId) return;

        fetchUsers();
        socket.emit("join_chat", { user_id: localUserId });

        const handleNewMessage = (data) => {
            setMessages((prevMessages) => {
                const messageExists = prevMessages.some((msg) => msg.timestamp === data.timestamp);
                return messageExists ? prevMessages : [...prevMessages, data];
            });

            // **Smooth scroll down when receiving new messages**
            setTimeout(() => {
                if (chatContainerRef.current) {
                    const isAtBottom =
                        chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop <=
                        chatContainerRef.current.clientHeight + 50; // Buffer for smooth scrolling

                    if (isAtBottom && lastMessageRef.current) {
                        lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }, 200);
        };

        socket.on("new_message", handleNewMessage);

        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [selectedUser, localUserId]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("https://10.50.48.48:5001//api/users");
            if (res.data.success) {
                setUsers(res.data.users);
                setFilteredUsers(res.data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchMessages = async (contactId) => {
        if (!localUserId || !contactId) return;

        try {
            const res = await axios.get(
                `https://10.50.48.48:5001/api/messages?user_id=${localUserId}&contact_id=${contactId}`
            );
            setMessages(res.data.messages);

            setTimeout(() => {
                scrollToBottom(); // Scroll when loading messages
            }, 100);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        fetchMessages(user._id);
    };

    const sendMessage = () => {
        if (message.trim() && selectedUser) {
            const messageData = {
                sender_id: localUserId,
                receiver_id: selectedUser._id,
                message: message,
                timestamp: new Date().toISOString(),
            };

            socket.emit("private_message", messageData);
            setMessage("");

            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = users.filter((user) => user.name.toLowerCase().includes(term));
        setFilteredUsers(filtered);
    };

    // **Function to Smooth Scroll to Bottom**
    const scrollToBottom = () => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="w-full h-[calc(100vh-8rem)] flex bg-gradient-to-br from-blue-500 to-teal-400 text-white">
            {/* Sidebar - User List (20%) */}
            <div className="w-1/5 border-r bg-white flex flex-col">
                {/* Search Bar */}
                <div className="p-3 border-b bg-gray-100">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search users..."
                        className="w-full p-2 border rounded-md text-gray-800 focus:outline-none"
                    />
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleUserSelect(user)}
                            className={`p-3 cursor-pointer border-b hover:bg-gray-200 ${
                                selectedUser?.id === user._id ? "bg-blue-300 text-white font-bold" : "text-gray-800"
                            }`}
                        >
                            {user.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window (80%) */}
            <div className="w-4/5 flex flex-col">
                {/* Fixed Header - Selected User Info */}
                {selectedUser && (
                    <div className="p-4 bg-white border-b flex items-center shadow-md sticky top-0">
                        <div className="text-gray-800 text-lg font-bold">{selectedUser.name}</div>
                    </div>
                )}

                {/* Chat Messages */}
                <div 
                    ref={chatContainerRef} 
                    className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-100"
                    style={{ maxHeight: "calc(100vh - 12rem)" }} 
                >
                    {!selectedUser ? (
                   <div className="flex flex-col items-center justify-center h-full">
                   {/* Chat Bubble */}
                   <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center max-w-[90%] md:max-w-[50%]">
                       {/* Emoji Illustration */}
                       <img 
                           src="https://cdn-icons-png.flaticon.com/512/869/869636.png" // You can replace this with any emoji/image
                           alt="Chat Icon" 
                           className="w-16 h-16 mb-4"
                       />
               
                       {/* Title */}
                       <h2 className="text-gray-700 text-xl font-bold flex items-center">
                           Chat with your colleagues 
                           <span className="ml-2 text-yellow-400 text-2xl">💬</span>
                       </h2>
               
                       {/* Subtitle */}
                       <p className="text-gray-500 text-sm text-center mt-2">
                           Select a user from the left panel to start a conversation. <br />
                           Stay connected and collaborate efficiently! 🚀
                       </p>
                   </div>
               </div>
               
                
                 
                   
                    ) : messages.length === 0 ? (
                        <div className="text-gray-500 text-lg font-semibold text-center">
                            No messages yet. Start chatting with {selectedUser.name}!
                        </div>
                    ) : (
                        <div className="w-full">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    ref={index === messages.length - 1 ? lastMessageRef : null} // **Track last message**
                                    className={`w-fit max-w-[30rem] p-3 rounded-lg text-sm shadow mb-2 ${
                                        msg.sender_id === localUserId
                                            ? "bg-blue-500 text-white ml-auto"
                                            : "bg-gray-300 text-gray-900"
                                    }`}
                                >
                                    {msg.message}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Fixed Chat Input Box at Bottom */}
                {selectedUser && (
                    <div className="w-full bg-white flex items-center p-4 border-t">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 p-3 border rounded-md text-gray-800 focus:outline-none"
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-3 px-4 py-2 bg-gradient-to-br from-blue-500 to-teal-400 text-white font-semibold rounded-lg hover:opacity-90 transition duration-300"
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
