import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Drawer,
  Table,
  Form,
  Space,
  Input,
  Select,
  Popconfirm,
  InputNumber,
  Row,
  Col,
  DatePicker,
  Tag,
  Switch,
  Typography,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUs,
  getAllUs,
  getUsById,
  saveUs,
} from "features/User/userSlice.js";
import { formatPhone } from "app/format";
import { QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
import BraftEditor from "braft-editor";
import "braft-editor/dist/index.css";
import ImageDisplay from "features/User/components/ImageDisplay";
import HinhAnh from "features/HinhAnh";
import axiosClient from "api/axiosClient";
import { boolean } from "yup/lib/locale";
import { useTranslation } from "react-i18next";
import { removeUser, editUserProfile } from "api/userApi";
import ImageUser from "./ImageUser";
import { getMe, setToken } from "features/Login/loginSlice";

MeInfo.propTypes = {};

function MeInfo(props) {
  // const handleOpen = (valueForm) => {
  //     if (valueForm.id) {
  //       setAdd(false);
  //       setValueForm({
  //         id: valueForm.id,
  //         email: valueForm.email,
  //         password: valueForm.password,
  //         name: valueForm.name,
  //         status: valueForm.status,
  //         phoneNumber: valueForm.phoneNumber,
  //         roles: valueForm.roles,
  //         address: valueForm.address,
  //         Avatar: valueForm.Avatar,
  //       });
  //     } else {
  //       setAdd(true);
  //       form.current?.setFieldsValue({
  //         id: 0,
  //         email: "",
  //         password: "",
  //         name: "",
  //         status: true,
  //         phoneNumber: "",
  //         roles: null,
  //         address: "",
  //         Avatar: 0,
  //       });
  //       setValueForm({
  //         id: 0,
  //         email: "",
  //         password: "",
  //         name: "",
  //         status: true,
  //         phoneNumber: "",
  //         roles: null,
  //         address: "",
  //         Avatar: 0,
  //       });
  //     }
  //     setVisible(true);
  //   };
  const { Option } = Select;
  const { TextArea } = Input;
  const { t, i18n } = useTranslation();
  const data = useSelector((state) => state.users.users);
  const total = useSelector((state) => state.users.totalCount);
  const user = useSelector((state) => state.me.user);
  const permision = useSelector((state) => state.me.permision);
  const dispatch = useDispatch();
  const [visibleImg, setVisibleImg] = useState(false);
  const [add, setAdd] = useState(false);
  const [value, setValue] = useState({
    id: 0,
    source: "",
  });
  const [valueForm, setValueForm] = useState({
    id: user?.id,
    email: user?.email,
    password: user?.password,
    name: user?.name,
    // status: user?.status,
    phoneNumber: user?.phoneNumber,
    address: user?.address,
    avatar: user?.avatar,
  });
  const handleSetValue = (a) => {
    // console.log(a);
    setValue({ ...value, ...a });
    console.log(value);
  };
  const form = useRef();
  const handleOpenImg = () => {
    setVisibleImg(true);
  };

  const handleCloseImg = () => {
    setVisibleImg(false);
    setValue({
      id: 0,
      source: "",
    });
  };

  const addImage = () => {
    // let newImg = []
    // newImg = valueForm.Avatar ? [...valueForm.Avatar] : Object.assign([], value.Avatar);
    // newImg.push(valueForm.Avatar);
    setValueForm({ ...valueForm, avatar: value });
    console.log(valueForm);
    setVisibleImg(false);
    setValue({
      id: 0,
      source: "",
    });
  };

  const handleDeleteImage = () => {
    setValueForm({ ...valueForm, avatar: null });
  };

  const finishForm = async (data) => {
    console.log("🚀 ~ file: index.jsx ~ line 145 ~ finishForm ~ data", data);
    try {
      if (!data.password) {
        console.log("Pass k doi");
        const action = await editUserProfile({
          ...data,
          id: valueForm.id,
          avatar: valueForm.avatar,
        })
          .then((res) => {
            message.success("Success", 0.3);
            const setTok = setToken(res.token);
            dispatch(setTok);
          })
          .catch((err) => message.success(err.response.data.message, 0.2));
      } else {
        console.log("Pass doi");
        const action = await editUserProfile({
          ...data,
          id: user.id,
          password: valueForm.password,
        })
          .then((res) => {
            message.success("Success", 0.3);
            const setTok = setToken(res.token);
            dispatch(setTok);
          })
          .catch((err) => message.success(err.response.data.message, 0.2));
      }
      const actionMe = getMe();
      await dispatch(actionMe);
      console.log("OKE");
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const action = getMe();
    dispatch(action);
  }, []);
  useEffect(() => {
    const fetchApi = async () => {
      form?.current?.setFieldsValue({
        id: valueForm?.id,
        email: valueForm?.email,
        password: "",
        name: valueForm?.name,
        // status: valueForm?.status,
        phoneNumber: valueForm?.phoneNumber,
        address: valueForm?.address,
        avatar: valueForm?.avatar,
      });
    };
    fetchApi();
  }, [valueForm]);
  return (
    <div>
      <Typography>
        <Typography.Text>Role: {permision[0].name}</Typography.Text>
      </Typography>
      <Form
        id="formUser"
        ref={form}
        name="Form user"
        layout="vertical"
        onFinish={finishForm}
        initialValues={valueForm}
      >
        <Row gutter={10}>
          <Col xs={24} lg={12}>
            <Form.Item
              name="avatar"
              label={t && t("user.avatar")}
              rules={[{ required: true, message: t("user.pleaseSelectImage") }]}
            >
              <ImageUser
                imageOnly={valueForm?.avatar}
                onOpenImg={handleOpenImg}
                onDelete={handleDeleteImage}
              />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item
              label={t && t("user.email")}
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: t("user.pleaseEnterYourEmail"),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={t && t("user.password")} name="password">
              <Input />
            </Form.Item>
            <Form.Item
              label={t && t("user.userName")}
              name="name"
              rules={[
                {
                  required: true,
                  message: t("user.pleaseEnterYourName"),
                },
              ]}
            >
              <Input />
            </Form.Item>

            {/* <Form.Item
              label={t && t("user.roles")}
              name="roles"
              rules={[
                {
                  required: true,
                  message: t("user.pleaseChooseYourRoles"),
                },
              ]}
            >
              <Select>
                <Option value={0}>{t && t("user.Administrator")}</Option>
                <Option value={1}>{t && t("user.Staff")}</Option>
              </Select>
            </Form.Item> */}
            <Form.Item
              label={t && t("user.address")}
              name="address"
              rules={[
                {
                  required: true,
                  message: t("user.pleaseEnterYourAddress"),
                },
              ]}
            >
              <Input />
            </Form.Item>
            {/* <Form.Item
              label={t && t("user.status")}
              name="status"
              valuePropName="checked"

            >
              <Switch
                defaultValue="Active"
                checkedChildren="Active"
                unCheckedChildren="InActive"
              />
            </Form.Item> */}
            <Form.Item
              label={t && t("user.phoneNumber")}
              name="phoneNumber"
              rules={[
                {
                  pattern: /((09|03|07|08|05)+([0-9]{8})\b)/g,
                  message: t("user.phoneNumberNotValid"),
                },
                {
                  required: true,
                  message: t("user.pleaseEnterYourPhoneNumber"),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Drawer
        visible={visibleImg}
        placement="left"
        title={t("user.imageSelector")}
        width={1500}
        onClose={handleCloseImg}
        footer={
          <div style={{ textAlign: "end" }}>
            <Button disabled={!value.id} onClick={addImage} type="primary">
              {t("button.submit")}
            </Button>
          </div>
        }
      >
        <HinhAnh
          isChoose={true}
          value={value}
          handleSetValue={handleSetValue}
        />
      </Drawer>
    </div>
  );
}

export default MeInfo;
