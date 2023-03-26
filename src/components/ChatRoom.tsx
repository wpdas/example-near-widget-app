import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Heading, IconButton, Input, Icon, Text } from "@chakra-ui/react";
import truncate from "../utils/truncate";
import Message from "../components/Message";
import Loading from "../components/Loading";
import sendMessage from "../services/sendMessage";
import getRoomData, { RoomMessage } from "../services/getRoomData";
import { useAuth } from "near-social-bridge/auth";
import { RiSendPlaneLine } from "react-icons/ri";

type Props = {
  roomId: string;
};

const ChatRoom: React.FC<Props> = ({ roomId }) => {
  const [currentRoomMessages, setCurrentRoomMessages] = useState<RoomMessage[]>(
    []
  );
  const [pendingMessages, setPendingMessages] = useState<RoomMessage[]>([]);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const messageBoxRef = useRef<any>();
  const auth = useAuth();

  // Auto scrolling
  const scrollMessageBoxToBottom = useCallback(() => {
    if (messageBoxRef.current) {
      const messageBox = messageBoxRef.current;
      messageBox.scrollTo(0, messageBox.scrollHeight);
    }
  }, [messageBoxRef]);

  // Load initial messages
  useEffect(() => {
    getRoomData({ roomId }).then((roomData) => {
      setCurrentRoomMessages(roomData.messages ?? []);
      setPendingMessages([]);
      scrollMessageBoxToBottom();

      setReady(true);
    });
  }, [roomId, scrollMessageBoxToBottom]);

  // Listen to messages
  useEffect(() => {
    const subscription = setInterval(() => {
      if (roomId) {
        getRoomData({ roomId }).then((roomData) => {
          // Update the messages list only if there are new messages
          if (roomData.messages?.length !== currentRoomMessages.length) {
            setCurrentRoomMessages(roomData.messages ?? []);

            // Clean up the pending messages
            setPendingMessages([]);
            scrollMessageBoxToBottom();
          }
        });
      }
    }, 5000);

    return () => {
      clearInterval(subscription);
    };
  }, [roomId, currentRoomMessages.length, scrollMessageBoxToBottom]);

  // Send message handler
  const sendMessageClick = async () => {
    if (message) {
      const messageCopy = message;

      // Populate the pending messages to display in advance
      setPendingMessages([
        {
          accountId: auth.user?.accountId!,
          blockHeight: 0,
          value: {
            text: messageCopy,
            userName: auth.user?.profileInfo?.name!,
            userAvatarImage: auth.user?.profileInfo?.image?.ipfs_cid!,
          },
        },
      ]);

      setMessage("");
      const result = await sendMessage({
        roomId,
        message: messageCopy,
        userName: auth.user?.profileInfo?.name!,
        userAvatarImage: auth.user?.profileInfo?.image?.ipfs_cid!,
      });

      if (result?.error) {
        console.error(result.error);
        setPendingMessages([]);
        return;
      }

      scrollMessageBoxToBottom();
    }
  };

  // Truncated room name
  const roomName = roomId ? truncate(roomId.replaceAll("-", " "), 25) : "";

  // Last messages on the bottom
  const sortedMessages = useMemo(
    () => currentRoomMessages.sort((m1, m2) => m1.blockHeight - m2.blockHeight),
    [currentRoomMessages]
  );

  // Scroll message box to the bottom as soon as the box is rendered
  useEffect(() => {
    if (messageBoxRef.current) {
      scrollMessageBoxToBottom();
    }
  }, [messageBoxRef, scrollMessageBoxToBottom]);

  useEffect(() => {
    scrollMessageBoxToBottom();
  }, [pendingMessages, scrollMessageBoxToBottom]);

  return (
    <Box w="100%" display="flex" flexDirection="column" alignItems="center">
      <Box w="100%">
        <Heading
          textTransform="capitalize"
          size="lx"
          bg="teal.100"
          textColor="teal.700"
          p={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          Room: {roomName}
        </Heading>
        {ready ? (
          <>
            {/* Messages */}
            <Box
              ref={messageBoxRef}
              bg="teal.50"
              p={4}
              overflowX="scroll"
              height={604}
              background="#F7F8FA"
            >
              {sortedMessages.length === 0 && (
                <Text
                  color="#888888"
                  textAlign="center"
                  p={4}
                  w="248px"
                  margin="auto"
                >
                  No messages yet. Be the first to send a "Hi!"
                </Text>
              )}
              {sortedMessages.map((message) => (
                <Message key={message.blockHeight} message={message} />
              ))}

              {pendingMessages.map((message) => (
                <Message key={message.blockHeight} message={message} />
              ))}
            </Box>

            {/* Input */}
            <Box display="flex" alignItems="center" p={4} bg="#eaeaea">
              <Input
                _hover={{ borderColor: "#eaeaea" }}
                _focus={{ borderColor: "#eaeaea" }}
                _active={{ borderColor: "#eaeaea" }}
                outline="none"
                borderColor="#eaeaea"
                bg="#eaeaea"
                placeholder="Type your message here..."
                fontSize="sm"
                fontWeight="600"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessageClick();
                  }
                }}
              />
              <IconButton
                aria-label="Send message"
                colorScheme="teal.500"
                bg="teal"
                h="1.75rem"
                size="xs"
                fontSize="22px"
                width="42px"
                height="42px"
                borderRadius={999}
                onClick={sendMessageClick}
                icon={<Icon as={RiSendPlaneLine} color="white" />}
              />
            </Box>
          </>
        ) : (
          <Loading pt="30%" height={400} />
        )}
      </Box>
    </Box>
  );
};

export default ChatRoom;
