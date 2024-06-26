"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

import Login from "@/public/profile/login.svg";
import { StaticUiContent } from "@/types/static-ui-content";
import { UiContent } from "@/types/ui-content";

import { handleLogin } from "./handle-login";
import ProfileModal from "./profile-modal";

type LoginProps = {
  uiContent: UiContent;
  domain: string;
  staticUiContent: StaticUiContent;
  lang: string;
};

export const LoginButton = ({
  staticUiContent,
  uiContent,
  domain,
  lang,
}: LoginProps) => {
  const { data: session, status } = useSession();
  console.log(session);
  useEffect(() => {
    if (status === "authenticated") {
      handleLogin(domain, session);
    }
  }, [status, session, domain]);

  const initiateLogin = async () => {
    await signIn("google", {
      callbackUrl: `${window.location.origin}/${lang}`,
    });
  };

  return (
    <>
      {session ? (
        <ProfileModal
          staticUiContent={staticUiContent}
          uiContent={uiContent}
          domain={domain}
        />
      ) : (
        <button onClick={initiateLogin} className="h-10 w-10">
          <Login className="h-10 w-10 !fill-none" />
        </button>
      )}
    </>
  );
};
