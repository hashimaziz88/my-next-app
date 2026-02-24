"use client";
import { Typography } from 'antd';

export default function ProfilePage() {


    return (
        <div>
            <Typography.Title level={2} style={{ color: 'white' }}>User Profile</Typography.Title>
            <Typography.Text style={{ color: '#8c8c8c' }}>Manage your account settings here.</Typography.Text>
        </div>
    );
}