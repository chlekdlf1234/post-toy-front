import { Box, IconButton, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";
import {
  useDeletePostMutation,
  useVerifyLoginQuery,
} from "../generated/graphql";

interface EditDeletePostButtonProps {
    id: number;
    creatorId: number;
}

export const EditDeletePostButton: React.FC<EditDeletePostButtonProps> = ({
    id,
    creatorId
}) => {
  const [{ data: userData }] = useVerifyLoginQuery();
  const [, deletePost] = useDeletePostMutation();

  if (userData?.verifyLogin?.id !== creatorId) {
    return null;
  } else {
    return (
      <Box>
        <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
          <IconButton as={Link} icon="edit" aria-label="Edit Post" mr={2} />
        </NextLink>
        <IconButton
          icon="delete"
          aria-label="Delete Post"
          onClick={() => {
            deletePost({ id });
          }}
        />
      </Box>
    );
  }
};
