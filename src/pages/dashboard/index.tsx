import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import EditUsernameModal from "~/components/modal/EditUsernameModal";
import { useState } from "react";
import AddConversationModal from "~/components/modal/AddConversationModal";

const Dashboard: NextPage = () => {
  const { data } = useSession();

  const [editUsernameIsOpen, setEditUsernameIsOpen] = useState(
    !!!data?.user.username
  );
  const openEditUsernameModal = () => setEditUsernameIsOpen(true);
  const closeEditUsernameModal = () => setEditUsernameIsOpen(false);

  const [addConversationIsOpen, setAddConversationIsOpen] = useState(false);
  const openAddConversationModal = () => setAddConversationIsOpen(true);
  const closeAddConversationModal = () => setAddConversationIsOpen(false);

  return (
    <>
      <Head>
        <title>Messenger</title>
        <meta name="description" content="messenger" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <EditUsernameModal
            isOpen={editUsernameIsOpen}
            closeModalHandler={closeEditUsernameModal}
          />
          <AddConversationModal
            isOpen={addConversationIsOpen}
            closeModalHandler={closeAddConversationModal}
          />
          <button onClick={openEditUsernameModal}>Edit Username</button>
          <button onClick={openAddConversationModal}>Search for users</button>
          <h1 className=" text-3xl text-slate-300">
            User info:{data?.user.username ? data.user.username : "No username"}
          </h1>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
