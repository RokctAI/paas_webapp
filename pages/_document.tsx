import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentProps,
  DocumentContext,
} from "next/document";
import createEmotionServer from "@emotion/server/create-instance";
import {
  createEmotionCache,
  createRtlEmotionCache,
} from "utils/createEmotionCache";
import { JSX, useMemo } from "react";
import { getCookie } from "utils/session";
import informationService from "services/information";
import createSettings from "utils/createSettings";
import { PRIMARY_BUTTON_FONT_COLOR, PRIMARY_COLOR } from "constants/config";
import { hexToRgba } from "utils/hexToRgba";

interface MyDocumentProps extends DocumentProps {
  emotionStyleTags: JSX.Element[];
  settings: any;
}

export default function MyDocument({
  emotionStyleTags,
  settings,
}: MyDocumentProps) {
  const settingsData = createSettings(settings?.data || []);
  const css = `
      :root {
         --primary: ${settingsData?.primary_color || PRIMARY_COLOR};
         --primary-selected: ${hexToRgba(settingsData?.primary_color || PRIMARY_COLOR, 0.1)};
         --primary-button-font-color: ${settingsData?.primary_button_font_color || PRIMARY_BUTTON_FONT_COLOR};
      }
      [data-theme="dark"] {
        --primary: ${settingsData?.primary_color || PRIMARY_COLOR};
        --primary-selected: ${hexToRgba(settingsData?.primary_color || PRIMARY_COLOR, 0.1)};
        --primary-button-font-color: ${settingsData?.primary_button_font_color || PRIMARY_BUTTON_FONT_COLOR};
      }
  `;
  return (
    <Html>
      <Head>
        <meta name="emotion-insertion-point" content="" />
        {emotionStyleTags}
        <style>{css}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const settings = await informationService.getSettings();
  const originalRenderPage = ctx.renderPage;
  const appDirection = getCookie("dir", ctx);
  const cache =
    appDirection === "rtl" ? createRtlEmotionCache() : createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
    settings,
  };
};
