import { useEffect } from "react";
import { useRouter } from "next/router";

import { Auth } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";

function Profile() {
  const router = useRouter();
  useEffect(() => {
    Auth.currentAuthenticatedUser().then((user) => {
      router.push("/");
    });
  }, []);

  return <div></div>;
}

export default withAuthenticator(Profile);
