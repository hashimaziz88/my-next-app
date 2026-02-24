"use client";
import React from 'react';
import Link from 'next/link';
import { Button, Checkbox, Form, Input, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
import { useStyles } from '../style/style';

const { Text, Title } = Typography;

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
                    layout="vertical"
                    requiredMark={false}
                    className={styles.form}
                >
                    <Form.Item label="Username" name="username">
                        <Input prefix={<UserOutlined />} placeholder="johndoe" size="large" />
                    </Form.Item>

                    <Form.Item label="Email Address" name="email">
                        <Input prefix={<MailOutlined />} placeholder="name@company.com" size="large" />
                    </Form.Item>

                    <Form.Item label="Password" name="password">
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                    </Form.Item>

                    <Form.Item name="agreement" valuePropName="checked">
                        <Checkbox className={styles.checkbox}>
                            I agree to the <Link href="/terms">Terms & Conditions</Link>
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

                    <div className={styles.footerLinkSection}>
                        <Text className={styles.footerLinkText}>Already have an account?</Text>
                        <Link href="/login">Log in</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Register;