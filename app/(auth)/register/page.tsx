"use client";
import React from 'react';
import Link from 'next/link';
import { Button, Form, Input, Typography, Divider, FormProps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
import { useStyles } from '../style/style';
import LogoImage from '@/components/logoImage/LogoImage';

const { Text, Title } = Typography;

type FieldType = {
    username?: string;
    email?: string;
    password?: string;
    remember?: boolean;
};


const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
};

const Register: React.FC = () => {
    const { styles } = useStyles();

    return (
        <div className={styles.container}>
            <div className={styles.backgroundGlow} />
            <div className={styles.formContainer}>
                <Link href="/" className={styles.logoContainer}>
                    <LogoImage height={80} width={160} />
                </Link>

                <div className={styles.headerSection}>
                    <Title level={2} className={styles.formHeading}>Create Account</Title>
                    <Text className={styles.formSubtitle}>Join us and start your journey today.</Text>
                </div>

                <Form
                    layout="vertical"
                    requiredMark={false}
                    className={styles.form}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please enter your username' }]}>
                        <Input prefix={<UserOutlined />} placeholder="johndoe" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Email Address"
                        name="email"
                        rules={[{ required: true, message: 'Please enter your email address' }]}>
                        <Input prefix={<MailOutlined />} placeholder="name@company.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                    </Form.Item>


                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            Create Account
                        </Button>
                    </Form.Item>

                    <Divider className={styles.divider} plain>OR</Divider>

                    <Button className={styles.socialButton} icon={<GoogleOutlined />}>
                        Sign up with Google
                    </Button>

                    <div className={styles.footerLinkSection}>
                        <Text className={styles.footerLinkText}>Already have an account?</Text>
                        <Link href="/login">Log in</Link>
                    </div>
                </Form>
            </div>
        </div >
    );
};

export default Register;