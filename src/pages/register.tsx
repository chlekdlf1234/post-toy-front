import React from "react";
import { useRouter } from "next/router";

import { Form, Formik } from "formik";

import { Box, Button } from "@chakra-ui/core";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";

import { useRegisterMutation } from "../generated/graphql";

import { toErrorMap } from "../utils/toErrorMap";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (value, { setErrors }) => {
          const response = await register({ userInput: value });

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="User Name"
              label="User Name"
            ></InputField>
            <Box mt={4}>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
              ></InputField>
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Password"
                label="Password"
                type="password"
              ></InputField>
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
