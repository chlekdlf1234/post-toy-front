import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { Router, useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";

const EditPost = ({}) => {
  const router = useRouter();

  const queryId =
    typeof router.query.id == "string" ? parseInt(router.query.id) : -1;

  const [{ data, fetching }] = usePostQuery({
    pause: queryId == -1,
    variables: {
      id: queryId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();

  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (value, { setErrors }) => {
          await updatePost({ id: queryId, ...value });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Title"
              label="Title"
            ></InputField>
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="Text..."
                label="Body"
              ></InputField>
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
