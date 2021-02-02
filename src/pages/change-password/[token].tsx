import React, { useState } from "react";

import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { Form, Formik } from "formik";

import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";

import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";

import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";

import { NextPage } from "next";
import { useRouter } from "next/router";
import NextLink from "next/link";

interface Token {
  token: string;
}

const ChangePassword: NextPage<Token> = ({ token }) => {
  const [, changePassword] = useChangePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (value, { setErrors }) => {
          const response = await changePassword({
            newPassword: value.newPassword,
            token,
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenError(errorMap.token);
            }

            setErrors(toErrorMap(response.data.changePassword.errors));
          } else if (response.data?.changePassword.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            ></InputField>
            {tokenError ? (
              <Flex>
                <Box mr={2}style={{ color: "red" }}>{tokenError}</Box>
                <NextLink href="/forgot-password">
                  <Link>Token Refresh</Link>
                </NextLink>
              </Flex >
            ) : null}
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword as any);
