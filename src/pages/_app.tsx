import { ColorModeProvider, CSSReset, ThemeProvider } from "@chakra-ui/core";
import theme from "../theme";

import Amplify from "aws-amplify";
import config from "../aws-exports";

Amplify.configure({
  ...config,
  ssr: true,
});

function MyApp({ Component, pageProps }: any) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  );
}

export default MyApp;
