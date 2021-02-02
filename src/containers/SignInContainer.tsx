import React, { useContext, useState } from "react";
// import data from '../../session_storage/storage.json'
import { globalContext } from '../contexts/globalContext' 
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Typography from "antd/es/typography";
import authApi from './authApi';
const { Title } = Typography;






function SignIn():JSX.Element {
  // console.log('DATA', data);
  // TODO deconstruct secret from login
  const { verification, setVerification, setServerAddress, } = useContext(globalContext)
  
  
  
  const onFinish = async (values: any) => {
    // create get request here to ratify the tokenization process. 
    // currently compares to a local json file. 
    // commmit token to local state.
    
    // deconstruct values object (serverIP, secret)
    const { serverIP, secret } = values;
    
    // invoke authApi.login with serverIP and secret in the body object
    const res = await authApi.login({ serverIP, secret });
    console.log('CLIENT RESPONSE', res);
    if (res.status === 200) {
      const { accessToken, refreshToken } = res.data;
      console.log('RES DATA', res.data)
      console.log('ACCESS TOKEN', accessToken)
      console.log('REFRESH TOKEN', refreshToken)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      // if(data[values.serverIP]){
      setServerAddress(values.serverIP)
      setVerification(true)
    }
    // } 
    
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
          // TODO onsubmit handler
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


