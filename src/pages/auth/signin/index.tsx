import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import { useState } from "react";

const SignInPage: NextPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginDiscordHandler = async () => {
    try {
      console.log("login handler:");
      const result = await signIn("discord");
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <button onClick={loginDiscordHandler}>Login Discord</button>
      <button
        onClick={async (e) => {
          e.preventDefault();
          await signIn("credentials", {});
        }}
      >
        Demo
      </button>
    </div>
  );
};

export default SignInPage;
