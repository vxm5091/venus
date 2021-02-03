/**
 * @name SignInContainer
 * @desc Component that renders to the page upon initial load of application for user to sign in
 * 
 */

import React, { useContext, useState } from "react";
import { globalContext } from '../contexts/globalContext' 
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Typography from "antd/es/typography";
const { Title } = Typography;


function SignIn():JSX.Element {
  const { verification, setVerification, setServerAddress, } = useContext(globalContext)
  const onFinish = (values: any) => {
      setServerAddress(values.serverIP)
      setVerification(true)
  }
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  return (
    <div className="loginContainer">
      <Card 
        style={{height: 'fit-content', width: 600, textAlign: 'center'}}
        bordered={true}
        title={<Title>VENUS</Title>}
        hoverable={true}
        >
        <Form
          {...layout}
          name="Login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}>
          <Form.Item
            label="Server Address"
            name="serverIP"
            rules={[{ required: true, message: 'Please enter valid Server Address.' }]}
          >
            <Input placeholder="Enter Server Address"/>
          </Form.Item>
          <Form.Item
            label="Secret"
            name="secret"
            rules={[{ required: true, message: 'Please enter valid Secret.' }]}
          >
            <Input.Password placeholder="Enter Secret" />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Sign In
            </Button>
        </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export { SignIn };


