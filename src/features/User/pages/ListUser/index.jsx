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
import { removeUser, saveUser } from "api/userApi";

ListUser.propTypes = {};

function ListUser(props) {
  const { Option } = Select;
  const { TextArea } = Input;
  const { t, i18n } = useTranslation();
  const data = useSelector((state) => state.users.users);
  // const permisions = useSelector((state) => state.users.permisions);
  const total = useSelector((state) => state.users.totalCount);
  const user = useSelector((state) => state.me.user);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [visibleImg, setVisibleImg] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [add, setAdd] = useState(false);
  const loading = useSelector((state) => state.users.loading);

  const [value, setValue] = useState({
    id: 0,
    source: "",
  });
  const handleSetValue = (a) => {
    setValue({ ...value, ...a });
  };
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [valueForm, setValueForm] = useState({
    id: 0,
    email: "",
    password: "",
    name: "",
    status: true,
    phoneNumber: "",
    address: "",
    avatar: null,
  });
  const form = useRef();
  const column = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => {
              confirm();
            }}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
              onClick={() => confirm()}
            >
              Search
            </Button>
            <Button
              size="small"
              style={{ width: 90 }}
              onClick={() => clearFilters()}
            >
              Reset
            </Button>
            {/* <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              
            }}
          >
            Filter
          </Button> */}
          </Space>
        </div>
      ),
      filterIcon: () => {
        return <SearchOutlined />;
      },
    },

    {
      title: t && t("user.userName"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t && t("user.pers"),
      dataIndex: "pers",
      key: "pers",
      render: (record) => (
        <>
          {/* {record == 0 && <Tag color="orange">{t && t("Administrator")}</Tag>} */}
          <Tag color="cyan">{t && t("Nhân viên")}</Tag>
        </>
      ),
    },
    {
      title: t && t("user.status"),
      dataIndex: "status",
      key: "status",
      render: (record) => (
        <>
          {record == true && <Tag color="orange">Active</Tag>}
          {record == false && <Tag color="cyan">InActive</Tag>}
        </>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: t && t("user.phoneNumber"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (record) => <Tag color="volcano">{formatPhone(record)}</Tag>,
    },
    {
      title: t && t("user.address"),
      dataIndex: "address",
      key: "address",
    },
    {
      title: t && t("user.avatar"),
      dataIndex: "avatar",
      key: "avatar",
      render: (record) => (
        <img src={`${record?.source}`} alt="" style={{ width: "50px" }} />
      ),
    },
    {
      title: t && t("button.action"),
      dataIndex: "",
      key: "x",
      render: (record) => (
        <div>
          {user.id != record.id && (
            <div>
              <Popconfirm
                title="Are you sure？"
                onConfirm={() => handleConfirmDelete(record.id)}
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              >
                <Button type="link" danger>
                  {t("button.delete")}
                </Button>
              </Popconfirm>
              <Button type="link" onClick={() => handleOpen(record)}>
                {t("button.edit")}
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleOpen = (valueForm) => {
    if (valueForm.id) {
      setAdd(false);
      setValueForm({
        id: valueForm.id,
        email: valueForm.email,
        password: valueForm.password,
        name: valueForm.name,
        status: valueForm.status,
        phoneNumber: valueForm.phoneNumber,
        pers: valueForm.pers,
        address: valueForm.address,
        avatar: valueForm?.avatar,
      });
    } else {
      setAdd(true);
      form.current?.setFieldsValue({
        id: 0,
        email: "",
        password: "",
        name: "",
        status: true,
        phoneNumber: "",
        pers: null,
        address: "",
        avatar: null,
      });
      setValueForm({
        id: 0,
        email: "",
        password: "",
        name: "",
        status: true,
        phoneNumber: "",
        pers: null,
        address: "",
        avatar: null,
      });
    }
    setVisible(true);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    let sort = "";
    console.log(filters);
    if (sorter) {
      sort += sorter.order == "ascend" ? "" : "-";
    }
    sort += sorter.field ? sorter.field : "id";
    let action;
    if (sort != "") {
      if (filters && filters.id) {
        action = getAllUs({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sort: sort,
          keywords: filters?.id[0],
        });
      } else {
        action = getAllUs({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sort: sort,
        });
      }
    } else {
      if (filters && filters.id) {
        action = getAllUs({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          keywords: filters?.id[0],
        });
      } else {
        action = getAllUs({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        });
      }
    }
    dispatch(action);
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

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

  const handleClose = () => {
    setVisible(false);
    setValueForm({
      id: 0,
      email: "",
      password: "",
      name: "",
      status: true,
      phoneNumber: "",
      pers: null,
      address: "",
      avatar: null,
    });
  };

  const handleReloadData = () => {
    const action = getAllUs();
    dispatch(action);
  };

  const addImage = () => {
    // let newImg = []
    // newImg = valueForm.Avatar ? [...valueForm.Avatar] : Object.assign([], value.Avatar);
    // newImg.push(valueForm.Avatar);
    setValueForm({ ...valueForm, avatar: value });
    setVisibleImg(false);
    setValue({
      id: 0,
      source: "",
    });
  };
  const handleConfirmDelete = async (id) => {
    const action = await removeUser(id)
      .then((res) => message.success("Delete user success", 0.4))
      .catch((err) => {
        message.success(err.response.data.message, 0.2);
      });
    handleReloadData();
  };

  const handleDeleteImage = () => {
    setValueForm({ ...valueForm, avatar: null });
  };

  const finishForm = async (data) => {
    console.log("🚀 ~ file: index.jsx ~ line 356 ~ finishForm ~ data", data);
    setSubmit(true);

    if (data.password.match(/^\s*$/)) {
      console.log("Vao day password k doi");
      const action = await saveUser({ ...data, id: valueForm.id })
        .then((res) => message.success("Success", 0.5))
        .catch((err) => {
          console.log(
            "🚀 ~ file: index.jsx ~ line 364 ~ finishForm ~ err",
            err
          );

          message.error(err.response.data.message, 1);
        });
    } else {
      console.log("Vao day password doi");
      const action = await saveUser({
        ...data,
        id: valueForm.id,
      })
        .then((res) => message.success("Success", 0.5))
        .catch((err) => {
          message.error(err.response.data.message, 1);
        });
    }
    // let arrImg = data.Avatar.map((p) => p.id);
    setSubmit(false);

    form.current.resetFields();
    setValueForm({
      id: 0,
      avatar: null,
    });
    handleReloadData();
    setVisible(false);
  };

  // const handleChangeEditor = async (content) => {
  //   const htmlContent = content.toHTML();
  //   setValueForm({ ...valueForm, MoTa: htmlContent });
  // };

  useEffect(() => {
    if (!add)
      form.current?.setFieldsValue({
        id: valueForm?.id,
        email: valueForm?.email,
        password: "",
        name: valueForm?.name,
        status: valueForm?.status,
        phoneNumber: valueForm?.phoneNumber,
        pers: valueForm?.pers,
        address: valueForm?.address,
        avatar: valueForm?.avatar,
      });
    else {
      form.current?.setFieldsValue({
        id: valueForm.id,
        avatar: valueForm.avatar,
      });
    }
  }, [valueForm]);
  useEffect(() => {
    handleReloadData();
    console.log(user?.id);
  }, []);
  return (
    <div>
      <Button
        onClick={handleOpen}
        style={{
          margin: "10px 0px",
          backgroundColor: "#40a9ff",
          color: "white",
        }}
      >
        {t("user.add")}
      </Button>
      <Drawer
        visible={visible}
        placement="right"
        title="User form"
        width={window.innerWidth > 900 ? "50%" : "100%"}
        onClose={handleClose}
        footer={
          <Space style={{ float: "right" }}>
            <Button onClick={handleClose}>{t("button.cancel")}</Button>
            <Button
              type="primary"
              form="formUser"
              htmlType="submit"
              disabled={submit}
            >
              {t("button.submit")}
            </Button>
          </Space>
        }
      >
        <Form
          id="formUser"
          ref={form}
          name="Form user"
          layout="vertical"
          onFinish={finishForm}
        >
          <Row gutter={10}>
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
              <Form.Item
                label={t && t("user.password")}
                name="password"
                rules={[
                  {
                    required: add,
                    message: t("user.pleaseEnterYourPassword"),
                  },
                  { min: 6, message: "Password must be minimum 6 characters." },
                ]}
              >
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

              <Form.Item
                label={t && t("user.pers")}
                name="pers"
                rules={[
                  {
                    required: true,
                    message: t("user.pleaseChooseYourpers"),
                  },
                ]}
              >
                <Select>
                  <Option value={"admin"}>
                    {t && t("user.Administrator")}
                  </Option>
                  <Option value={"staff"}>{t && t("user.Staff")}</Option>
                </Select>
              </Form.Item>
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
              <Form.Item
                label={t && t("user.status")}
                name="status"
                valuePropName="checked"
              >
                <Switch
                  defaultValue="Active"
                  checkedChildren="Active"
                  unCheckedChildren="InActive"
                />
              </Form.Item>
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
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="avatar"
                label={t && t("user.avatar")}
                rules={[
                  { required: true, message: t("user.pleaseSelectImage") },
                ]}
                style={{
                  height: "100%",
                  flexDirection:
                    i18n.language == "en"
                      ? window.innerWidth > 900
                        ? "column"
                        : "row"
                      : "row",
                }}
              >
                <ImageDisplay
                  imageOnly={valueForm.avatar}
                  onOpenImg={handleOpenImg}
                  onDelete={handleDeleteImage}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
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
      <Table
        columns={column}
        dataSource={[...data]}
        pagination={{ ...pagination, total: total }}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
        loading={loading}
      />
    </div>
  );
}

export default ListUser;
