import { Flex, IconButton } from "@chakra-ui/core";
import React, { useState } from "react";
import {
  PostsDocument,
  PostSnippetFragment,
  useVoteMutation,
} from "../generated/graphql";

interface VoteProps {
  post: PostSnippetFragment;
}

export const Vote: React.FC<VoteProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  const [loadingState, setLoadingState] = useState<
    "upVote-loading" | "downVote-loading" | "not-loading"
  >("not-loading");

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("upVote-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        variantColor={post.voteStatus == 1 ? "green" : undefined}
        isLoading={loadingState == "upVote-loading"}
        icon="chevron-up"
        aria-label="chevron-up"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downVote-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        variantColor={post.voteStatus == -1 ? "green" : undefined}
        isLoading={loadingState == "downVote-loading"}
        icon="chevron-down"
        aria-label="chevron-down"
      />
    </Flex>
  );
};
