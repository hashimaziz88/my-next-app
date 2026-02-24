"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useStyles } from './style/style';
import LogoIcon from '@/assets/icons/logo.svg';

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { styles } = useStyles();

    return (
        <Layout className={styles.container}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className={styles.sider}
            >
                <Link href="/" className={styles.logoWrapper}>
                    <Image
                        src={LogoIcon}
                        alt="Logo"
                        width={collapsed ? 30 : 50}
                        height={30}
                        className={styles.imageIcon} // Reusing your brightness filter style
                    />
                </Link>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
                        {
                            key: '1',
                            icon: <UserOutlined />,
                            label: 'nav 1',
                        },
                        {
                            key: '2',
                            icon: <VideoCameraOutlined />,
                            label: 'nav 2',
                        },
                        {
                            key: '3',
                            icon: <UploadOutlined />,
                            label: 'nav 3',
                        },
                    ]}
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