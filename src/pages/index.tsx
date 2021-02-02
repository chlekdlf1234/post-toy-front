import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { EditDeletePostButton } from "../components/EditDeletePostButton";
import { Layout } from "../components/Layout";
import { Vote } from "../components/Vote";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 5,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  return (
    <Layout>
      {!data ? null : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => {
            const posts = !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <Vote post={p} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>Posted by {p.creator.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {p.textSnippet + "..."}
                    </Text>
                      <Box ml="auto">
                      <EditDeletePostButton id={p.id} creatorId={p.creator.id}/>
                      </Box>
                  </Flex>
                </Box>
              </Flex>
            );
            return posts;
          })}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : (
        <Box mt={8}></Box>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
