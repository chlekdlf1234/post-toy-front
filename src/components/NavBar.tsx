import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/core";

import { Auth } from "aws-amplify";

import NextLink from "next/link";

import { useLogoutMutation, useVerifyLoginQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

import {useRouter} from 'next/router'

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
  const router = useRouter();
  const [user, setUser] = useState({ username: "", checked: false });

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  const [{ data, fetching }] = useVerifyLoginQuery({
    pause: isServer() || user.username != "" || user.checked == false,
  });

  useEffect(() => {
    (async () => {
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();

        setUser({ ...cognitoUser, checked: true });
      } catch (e) {
        setUser({ username: "", checked: true });
      }
    })();
  }, []);

  let body = null;

  if (fetching) {
    return null;
  } else if (!data?.verifyLogin && user.username == "") {
    body = (
      <>
        {/* <NextLink href="/profile">
          <Link color="white" mr={5}>
            Cognito Login
          </Link>
        </NextLink> */}
        <NextLink href="/login">
          <Link color="white" mr={5}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white"> Register</Link>
        </NextLink>
      </>
    );
  } else if (data?.verifyLogin) {
    body = (
      <Flex align= "center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        {/* <Box mr={2} color="white">
          [Self Made]
        </Box> */}
        <Box mr={2} color="white">
          {data.verifyLogin.username}
        </Box>
        <Button
          onClick={async () => {
            await logout();
            router.reload();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  } else {
    body = (
      <Flex>
        <Box mr={2} color="white">
          [Cognito User]
        </Box>
        <Box mr={2} color="white">
          {user.username}
        </Box>
        <Button
          onClick={async () => {
            await Auth.signOut();
            setUser({ username: "", checked: false });
          }}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <div>
      <Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4}>
        <Flex align="center" maxW = {800} margin = "auto" flex = {1}>
          <NextLink href="/">
            <Link>
              <Heading>Toy</Heading>
            </Link>
          </NextLink>
          <Box ml={"auto"}>{body}</Box>
        </Flex>
      </Flex>
    </div>
  );
};
