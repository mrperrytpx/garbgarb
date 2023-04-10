import { useSession, signIn, signOut } from "next-auth/react";
import React from "react";

const LoginPage = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        Signed in as {session?.user?.email} <br />
        <button className="rounded-md border-2 p-2" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div>
      Not signed in <br />
      <button className="rounded-md border-2 p-2" onClick={() => signIn()}>
        Sign in
      </button>
    </div>
  );
};

export default LoginPage;
