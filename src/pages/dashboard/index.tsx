import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import EditUsernameModal from "~/components/modal/EditUsernameModal";

import { api } from "~/utils/api";

const Dashboard: NextPage = () => {
  const { data } = useSession();

  return (
    <>
      <Head>
        <title>Messenger</title>
        <meta name="description" content="messenger" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {/* <AuthShowcase /> */}
          {!data?.user.username && <EditUsernameModal />}
        </div>
      </main>
    </>
  );
};

export default Dashboard;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();
  const session = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  console.log(session);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
      <button onClick={() => console.log(session)}>session console log</button>
    </div>
  );
};
