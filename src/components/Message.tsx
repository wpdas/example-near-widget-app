import { useEffect, useState } from "react";
import { Avatar, Box, Image, Text } from "@chakra-ui/react";
import { useAuth } from "near-social-bridge/auth";
import ImageViewer from "react-simple-image-viewer";
import { RoomMessage } from "../services/getRoomData";
import extractUrlFromString from "../utils/extractUrlFromString";
import isImageUrl from "../utils/isImageUrl";
import MessageParagraph from "./MessageParagraph";

type Props = {
  message: RoomMessage;
};

const IPFS_NEAR_SOCIAL_THUMBNAIL_URL =
  "https://i.near.social/thumbnail/https://ipfs.near.social/ipfs/";

const Message: React.FC<Props> = ({ message }) => {
  const auth = useAuth();
  const itsMe = auth.user?.accountId === message.accountId;
  const hasAvatarImage = !!message.value.userAvatarImage;

  // Get regular image url or ipfs stored image url
  const avatarUrl =
    hasAvatarImage && message.value.userAvatarImage.includes("http")
      ? message.value.userAvatarImage
      : message.value.userAvatarImage
      ? `${IPFS_NEAR_SOCIAL_THUMBNAIL_URL}${message.value.userAvatarImage}`
      : undefined;

  const [medias, setMedias] = useState<string[]>([]);
  const [viewImageUrl, setViewImageUrl] = useState("");

  // Check medias
  useEffect(() => {
    const urls = extractUrlFromString(message.value.text);
    if (urls) {
      const messageMedias = urls.filter((url) => {
        return isImageUrl(url);
      });
      setMedias(messageMedias || []);
    }
  }, [message.value.text]);

  const onClickImageMedia = (mediaUrl: string) => {
    setViewImageUrl(mediaUrl);
  };

  const onCloseImageView = () => {
    setViewImageUrl("");
  };

  if (itsMe) {
    return (
      <Box display="flex" flexDirection="column" mb={8}>
        <Box display="flex" alignItems="center">
          <Avatar name={message.value.userName} src={avatarUrl} />
          <Text
            textTransform="capitalize"
            as="b"
            fontSize="sm"
            ml={4}
            color="#515151"
          >
            {message.value.userName}
          </Text>
        </Box>
        <MessageParagraph
          text={message.value.text}
          onClickLink={onClickImageMedia}
          itsMe
        />

        {/* Show images (medias) if found */}
        {medias.length > 0 && (
          <Box ml={10} display="flex" flexWrap="wrap">
            {medias.map((media) => (
              <Image
                borderRadius={12}
                cursor="pointer"
                src={media}
                key={media}
                mt={2}
                ml={2}
                maxHeight={200}
                onClick={() => onClickImageMedia(media)}
              />
            ))}
          </Box>
        )}
        {viewImageUrl && (
          <ImageViewer
            src={[viewImageUrl]}
            currentIndex={0}
            onClose={onCloseImageView}
            disableScroll={false}
            backgroundStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
            }}
            closeOnClickOutside={true}
          />
        )}
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="end" mb={8}>
      <Box display="flex" alignItems="center" flexDirection="row-reverse">
        <Avatar name={message.value.userName} src={avatarUrl} />
        <Text
          textTransform="capitalize"
          as="b"
          fontSize="sm"
          mr={4}
          color="#515151"
        >
          {message.value.userName}
        </Text>
      </Box>
      <MessageParagraph
        text={message.value.text}
        onClickLink={onClickImageMedia}
      />

      {/* Show images (medias) if found */}
      {medias.length > 0 && (
        <Box mr={10} display="flex" flexDirection="row-reverse" flexWrap="wrap">
          {medias.map((media) => (
            <Image
              borderRadius={12}
              cursor="pointer"
              src={media}
              key={media}
              mt={2}
              mr={2}
              maxHeight={200}
              onClick={() => onClickImageMedia(media)}
            />
          ))}
        </Box>
      )}
      {viewImageUrl && (
        <ImageViewer
          src={[viewImageUrl]}
          currentIndex={0}
          onClose={onCloseImageView}
          disableScroll={false}
          backgroundStyle={{
            backgroundColor: "rgba(0,0,0,0.9)",
          }}
          closeOnClickOutside={true}
        />
      )}
    </Box>
  );
};

export default Message;
