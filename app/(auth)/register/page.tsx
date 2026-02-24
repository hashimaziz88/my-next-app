"use client";
import React from 'react';
import Link from 'next/link';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, Typography, Divider } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    GoogleOutlined
} from '@ant-design/icons';
import { useStyles } from '../style/style';

const { Text, Title } = Typography;

type FieldType = {
    username?: string;
    email?: string;
    password?: string;
    confirm?: string;
    agreement?: boolean;
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    // In Next.js, you'd typically call an API route here: /api/auth/register
    console.log('Register Success:', values);
};

const Register: React.FC = () => {
    const { styles } = useStyles();

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.headerSection}>
                    <Title level={2} className={styles.formHeading}>Create Account</Title>
                    <Text className={styles.formSubtitle}>Join us and start your journey today.</Text>
                </div>

                <Form
                    name="register_form"
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onFinish}
                    autoComplete="off"
                    className={styles.form}
                >
                    <Form.Item<FieldType>
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please choose a username' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#666' }} />}
                            placeholder="johndoe"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Email Address"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#666' }} />}
                            placeholder="name@company.com"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#666' }} />}
                            placeholder="••••••••"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Confirm Password"
                        name="confirm"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#666' }} />}
                            placeholder="Confirm your password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="agreement"
                        valuePropName="checked"
                        rules={[{
                            validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement'))
                        }]}
                    >
                        <Checkbox className={styles.checkbox}>
                            I agree to the <Link href="/terms" style={{ color: '#1890ff' }}>Terms & Conditions</Link>
                        </Checkbox>
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

                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <Text style={{ color: '#8c8c8c' }}>
                            Already have an account?{' '}
                            <Link href="/login" style={{ fontWeight: 600, color: '#1890ff' }}>
                                Log in
                            </Link>
                        </Text>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Register;