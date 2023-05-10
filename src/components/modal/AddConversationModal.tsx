import { useSession } from "next-auth/react";
import React, { useState, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { notFound } from "next/navigation";
import { UserSchema } from "~/types/schema/db";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import Modal from "./Modal";

type Props = {
  isOpen: boolean;
  closeModalHandler: () => void;
};

const AddConversationModal: React.FC<Props> = ({
  isOpen,
  closeModalHandler,
}: Props) => {
  const { data: sessionData, update } = useSession();
  const user = sessionData?.user;
  const [usernameInput, setUsernameInput] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);

  const { data, error, isLoading, mutate } =
    api.user.updateCurrentUser.useMutation({
      onSuccess: async (data) => {
        await update({ user: data });
        closeModalHandler();
        setUsernameInput("");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to post! Please try again later.");
        }
      },
    });

  const {
    data: searchUsers,
    error: searchUsersError,
    isLoading: searchUsersIsLoading,
    refetch,
  } = api.user.getUsersByUsername.useQuery(usernameInput, {
    enabled: false,
  });

  const usernameChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameInput(e.currentTarget.value);
  };

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search for user");
    console.log(usernameInput);
    await refetch();
    // if (UserSchema.pick({ username: true }).parse({ usernameInput })) {
    //   mutate({ username: usernameInput });
    // }
  };

  const editingConversation = true;

  return (
    <Modal
      initialFocusRef={usernameRef}
      isOpen={isOpen}
      modalTitle={
        editingConversation ? "Update Conversation" : "Create a Conversation"
      }
      onClose={closeModalHandler}
    >
      <form onSubmit={onSearch} autoComplete="off">
        <div className="mt-6 flex flex-col gap-3 bg-slate-800">
          <label className="sr-only">Username</label>
          <input
            ref={usernameRef}
            type="text"
            placeholder="Enter a username"
            value={usernameInput}
            onChange={usernameChangeHandler}
            autoComplete="off"
            autoFocus
            className="block w-full rounded-md border-gray-700 bg-gray-800 text-zinc-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            className="h-9 w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:hover:bg-gray-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="mb-1 inline h-5 w-5 animate-spin fill-zinc-200 text-transparent"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <>Search</>
            )}
          </button>
        </div>
      </form>
      {searchUsers &&
        searchUsers.map((user) => <h1 key={user.userId}>{user.username}</h1>)}
      {/* {searchUsers && (
        <UserSearchList users={searchUsers} addParticipant={addParticipant} />
      )} */}
      {/* {participants.length !== 0 && (
        <>
          <Participants
            participants={participants}
            removeParticipant={removeParticipant}
          />
          <div className="mt-4">
            {existingConversation && (
              <ConversationItem
                toggleScroll={() => {}}
                userId={userId}
                conversation={existingConversation}
                onClick={() => onConversationClick()}
              />
            )}
          </div>
          <button
            disabled={!!existingConversation}
            onClick={onSubmit}
            className="mt-6 h-9 w-full rounded-md bg-green-700/100 text-sm font-medium text-green-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:hover:bg-gray-700"
          >
            {createConversationLoading || updateParticipantsLoading ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="mb-1 inline h-5 w-5 animate-spin fill-zinc-200 text-transparent"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : editingConversation ? (
              "Update Conversation"
            ) : (
              "Create Conversation"
            )}
          </button>
        </> 
      )} */}
    </Modal>
  );
};

export default AddConversationModal;
