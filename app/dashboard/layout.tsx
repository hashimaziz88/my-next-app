"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useStyles } from './style/style';
import LogoImage from '@/components/logoImage/LogoImage';

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { styles } = useStyles();
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/dashboard/profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
    ];

    return (
        <Layout className={styles.container}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className={styles.sider}
                width={200}
                collapsedWidth={80}
            >
                <Link href="/" className={styles.logoWrapper}>
                    <LogoImage height={80} width={70} />
                </Link>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    onClick={({ key }) => router.push(key)}
                    items={menuItems}
                />
            </Sider>
            <Layout style={{ background: 'transparent' }}>
                <Header className={styles.header}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className={styles.triggerBtn}
                    />
                </Header>
                <Content className={styles.content}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;