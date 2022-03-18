import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Form, Button } from "antd";
import { useTranslation } from "react-i18next";

AddEdit.propTypes = {
  name: PropTypes.string,
};

AddEdit.defaultProps = {
  name: "",
};

function AddEdit(props) {
  const { name } = props;
  const { t } = useTranslation();
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
      name="Form category product"
      layout="vertical"
      onFinish={finishForm}
    >
      <Form.Item
        label={t("categoryProduct.category")}
        name="name"
        rules={[{ required: true, message: "Please input your category!" }]}
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
