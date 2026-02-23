import Image from "next/image";
import LoginPage from "./login/page";
import UserPage from "./users/page";
import {debugColumns} from "@/lib/actions/debug";

export default async function Home() {
    await debugColumns();
  return (
    <>
      <div>Home</div>
      {/*<LoginPage />*/}
        <UserPage/>
    </>
  );
}
