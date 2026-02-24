"use client";
import { Typography } from 'antd';

const DashboardPage = () => {


    return (
        <div>
            <Typography.Title level={2} style={{ color: 'white' }}>Dashboard</Typography.Title>
            <Typography.Text style={{ color: '#8c8c8c' }}>Welcome to your dashboard. Here you can manage your account and view your statistics.</Typography.Text>
        </div>
    );
}

export default DashboardPage;