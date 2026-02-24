"use client";

import styles from "./page.module.css";
import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleCLickLogin = () => {
    router.push("/login");
  }

  const handleClickRegister = () => {
    router.push("/register");
  }

  return (

    <div className={styles.page}>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to my App
        </h1>

        <div>
          <Button type="primary" onClick={handleCLickLogin}>Login</Button>
          <Button type="default" onClick={handleClickRegister}>Register</Button>
        </div>
      </main>
    </div >
  );
}
