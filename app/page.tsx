"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Typography } from "antd";
import { useStyles } from './style/style';
import LogoIcon from '@/assets/icons/logo.svg';

const { Title, Text } = Typography;

export default function Home() {
  const { styles, cx } = useStyles(); // cx is used to combine classes

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow} />

      <main className={styles.heroSection}>
        <div className={styles.logoContainer}>
          <Image
            src={LogoIcon}
            alt="App Logo"
            width={100}
            height={60}
            className={styles.imageIcon}
          />
        </div>

        <Title className={styles.heroTitle}>
          Welcome to App
        </Title>

        <Text className={styles.heroSubtitle}>
          The modern platform for building high-performance
          interfaces with Ant Design and Next.js.
        </Text>

        <div className={styles.buttonGroup}>
          <Link href="/login">
            <Button
              type="primary"
              size="large"
              className={styles.actionButton}
            >
              Login
            </Button>
          </Link>

          <Link href="/register">
            <Button
              size="large"
              /* We combine the base button style and the specific register style */
              className={cx(styles.actionButton, styles.registerButton)}
            >
              Register
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}