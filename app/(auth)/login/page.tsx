"use client";
import React from 'react';
import Link from 'next/link';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useStyles } from '../style/style';

const { Text, Title } = Typography;

type FieldType = {
    username?: string;
    password?: string;
    remember?: boolean;
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    // Integrate with NextAuth.js or your custom API route
    console.log('Login Success:', values);
};

const Login: React.FC = () => {
    const { styles } = useStyles();

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.headerSection}>
                    <Title level={2} className={styles.formHeading}>Welcome Back</Title>
                    <Text className={styles.formSubtitle}>Enter your credentials to access your account.</Text>
                </div>

                <Form
                    name="login_form"
                    layout="vertical"
                    requiredMark={false}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    className={styles.form}
                >
                    <Form.Item<FieldType>
                        label="Username or Email"
                        name="username"
                        rules={[{ required: true, message: 'Please enter your username' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#666' }} />}
                            placeholder="Enter your username"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#666' }} />}
                            placeholder="••••••••"
                            size="large"
                        />
                    </Form.Item>

                    <div className={styles.checkBoxContainer}>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox className={styles.checkbox}>Remember me</Checkbox>
                        </Form.Item>
                        <Link href="/forgot-password" style={{ fontSize: '14px', color: '#1890ff' }}>
                            Forgot password?
                        </Link>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            Log In
                        </Button>
                    </Form.Item>

                    <Divider className={styles.divider} plain>OR</Divider>

                    <Button className={styles.socialButton} icon={<GoogleOutlined />}>
                        Continue with Google
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <Text style={{ color: '#8c8c8c' }}>
                            Don't have an account?{' '}
                            <Link href="/register" style={{ fontWeight: 600, color: '#1890ff' }}>
                                Sign up for free
                            </Link>
                        </Text>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Login;