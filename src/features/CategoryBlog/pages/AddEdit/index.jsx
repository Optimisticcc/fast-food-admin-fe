import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Form, Button } from "antd";

AddEdit.propTypes = {
  name: PropTypes.string,
};

AddEdit.defaultProps = {
  name: "",
};

function AddEdit(props) {
  const { name } = props;
  const form = useRef();
  useEffect(() => {
    form.current.setFieldsValue({
      name: name,
    });
  });
  const finishForm = (data) => {
    console.log(data);
    form.current.resetFields();
  };
  return (
    <Form
      ref={form}
      name="Form category blog"
      layout="vertical"
      onFinish={finishForm}
    >
      <Form.Item
        label="Name category"
        name="name"
        rules={[
          { required: true, message: "Please input your category blog!" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  );
}

export default AddEdit;
