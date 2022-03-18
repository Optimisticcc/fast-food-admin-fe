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
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { saveBl, deleteBlog, getById, getAllBl } from "features/Blog/blogSlice";
import { getAllUs } from "features/User/userSlice";
import { QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
import BraftEditor from "braft-editor";
import "braft-editor/dist/index.css";
import { getAllCat } from "features/CategoryBlog/categoryBlog";
import ImageDisplay from "features/Blog/ImageDisplay";
import HinhAnh from "features/HinhAnh";
import { useTranslation } from "react-i18next";
import { removeBlog, saveBlog } from "api/blogApi";
ListBlog.propTypes = {};

function ListBlog(props) {
  const { t, i18n } = useTranslation();
  const { Option } = Select;
  const { TextArea } = Input;
  const data = useSelector((state) => state.blogs.blogs);
  const total = useSelector((state) => state.blogs.totalCount);
  const categories = useSelector((state) => state.categoryBlogs.categoryBlogs);
  const users = useSelector((state) => state.users.users);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [visibleImg, setVisibleImg] = useState(false);
  const [add, setAdd] = useState(false);
  const [submit, setSubmit] = useState(false);
  const loading = useSelector((state) => state.blogs.loading);
  const [value, setValue] = useState({
    id: 0,
    source: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
  });
  const handleSetValue = (a) => {
    setValue({ ...value, ...a });
  };
  // BlogCategory?: BlogCategoryCreateNestedOneWithoutBlogsInput
  // image?: ImageCreateNestedOneWithoutBlogInput
  // User?
  const [valueForm, setValueForm] = useState({
    id: 0,
    userId: 0,
    title: "",
    summary: "",
    content: "",
    blogCategoryId: 0,
    image: 0,
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
          </Space>
        </div>
      ),
      filterIcon: () => {
        return <SearchOutlined />;
      },
    },
    {
      title: t && t("blog.userName"),
      dataIndex: "User",
      key: "User",
      render: (record) => <span>{record?.name}</span>,
    },

    {
      title: t && t("blog.title"),
      dataIndex: "title",
      key: "title",
    },

    // {
    //   title: t&&t ("blog.content"),
    //   dataIndex: "NoiDung",
    //   key: "NoiDung",
    // },

    {
      title: t && t("blog.summary"),
      dataIndex: "summary",
      key: "summary",
    },
    {
      title: t && t("blog.category"),
      dataIndex: "BlogCategory",
      key: "BlogCategory",
      render: (record) => <span>{record?.name}</span>,
    },
    {
      title: t && t("blog.images"),
      dataIndex: "image",
      key: "image",
      render: (record) => (
        <img src={`${record?.source}`} alt="" style={{ width: "50px" }} />
      ),
    },

    {
      title: t && t("blog.action"),
      dataIndex: "",
      key: "x",
      render: (record) => (
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
      ),
    },
  ];

  const handleOpen = (valueForm) => {
    console.log(
      "🚀 ~ file: index.jsx ~ line 175 ~ handleOpen ~ valueForm",
      valueForm
    );
    if (valueForm.id) {
      setAdd(false);
      setValueForm({
        id: valueForm.id,
        userId: valueForm.userId,
        title: valueForm.title,
        summary: valueForm.summary,
        content: BraftEditor.createEditorState(valueForm.content),
        blogCategoryId: valueForm.blogCategoryId,
        image: valueForm.image,
      });
      console.log(valueForm);
    } else {
      setAdd(true);
      form.current?.setFieldsValue({
        id: 0,
        userId: null,
        title: "",
        summary: "",
        content: "",
        blogCategoryId: null,
        image: 0,
      });
      setValueForm({
        id: 0,
        userId: null,
        title: "",
        summary: "",
        content: "",
        blogCategoryId: null,
        image: 0,
      });
    }
    setVisible(true);
  };

  const handleOpenImg = () => {
    setVisibleImg(true);
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
      if (filters && filters.id && filters.id.length) {
        action = getAllBl({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sort: sort,
          keywords: filters?.id[0],
        });
      } else {
        action = getAllBl({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sort: sort,
        });
      }
    } else {
      if (filters && filters.id && filters.id.length) {
        action = getAllBl({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          keywords: filters?.id[0],
        });
      } else {
        action = getAllBl({
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
      userId: null,
      title: "",
      summary: "",
      content: "",
      blogCategoryId: null,
      image: 0,
    });
  };

  const handleReloadData = async () => {
    const action = getAllBl();
    await dispatch(action);
  };

  const addImage = () => {
    setValueForm({ ...valueForm, image: value });
    setVisibleImg(false);
    setValue({
      id: 0,
      source: "",
    });
  };
  const handleConfirmDelete = async (id) => {
    const action = await removeBlog(id)
      .then((res) => message.success("Delete blog success", 0.4))
      .catch((err) => {
        message.error(err.response.data.message, 0.2);
      });
    handleReloadData();
  };

  const handleDeleteImage = (id) => {
    setValueForm({ ...valueForm, image: null });
  };

  const finishForm = async (data) => {
    console.log("🚀 ~ file: index.jsx ~ line 312 ~ finishForm ~ data", data);
    setSubmit(true);
    const action = await saveBlog({ ...data, id: valueForm.id })
      .then((res) => message.success("Success", 0.5))
      .catch((err) => message.error(err.response.data.message, 1));
    setSubmit(false);
    form.current.resetFields();
    setValueForm({
      id: 0,
      Image: null,
    });
    handleReloadData();
    setVisible(false);
  };

  const handleChangeEditor = async (content) => {
    const str = content
      .toHTML()
      .toString()
      .slice(2, content.toHTML().toString().indexOf(">"));
    const newContent = content.toHTML().toString().replace(str, "");
    if (!newContent.match(/^\<p\>\s*<\/p\>$/)) {
      const htmlContent = content.toHTML();
      setValueForm({ ...valueForm, content: htmlContent });
    } else {
      setValueForm({ ...valueForm, content: null });
    }
  };

  const getCategorySearch = async (value) => {
    try {
      let timeout;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => {
        const action = getAllCat({
          keywords: value,
          pageNo: 1,
          pageSize: 10,
        });
        dispatch(action);
      }, 300);
    } catch (err) {
      console.log(err);
    }
  };
  const getUserBlog = async (value) => {
    try {
      let timeout;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => {
        const action = getAllUs({
          keywords: value,
          pageNo: 1,
          pageSize: 10,
        });
        dispatch(action);
      }, 300);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (!add) {
      console.log(valueForm?.content);
      form?.current?.setFieldsValue({
        id: valueForm?.id,
        userId: valueForm?.userId,
        title: valueForm?.title,
        summary: valueForm?.summary,
        content: valueForm.content,
        blogCategoryId: valueForm?.blogCategoryId,
        image: valueForm?.image,
      });
    } else {
      form.current?.setFieldsValue({
        id: valueForm.id,
        content: valueForm.content,
        image: valueForm.image,
      });
    }
  }, [valueForm]);

  useEffect(() => {
    handleReloadData();
    const actionCategory = getAllCat();
    dispatch(actionCategory);
    const actionUser = getAllUs();
    dispatch(actionUser);
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
        {t("blog.add")}
      </Button>
      <Drawer
        visible={visible}
        placement="right"
        title={t("blog.blogForm")}
        width={window.innerWidth > 900 ? "50%" : "100%"}
        onClose={handleClose}
        footer={
          <Space style={{ float: "right" }}>
            <Button onClick={handleClose}>{t("button.cancel")}</Button>
            <Button
              type="primary"
              form="formBlog"
              htmlType="submit"
              disabled={submit}
            >
              {t("button.submit")}
            </Button>
          </Space>
        }
      >
        <Form
          id="formBlog"
          ref={form}
          name="Form blog"
          layout="vertical"
          onFinish={finishForm}
        >
          <Row gutter={10}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="userId"
                label={t && t("blog.userName")}
                rules={[
                  {
                    required: true,
                    message: t("blog.Pleaseenteryourusername"),
                  },
                ]}
              >
                <Select
                  placeholder="Select Username"
                  onSearch={getUserBlog}
                  defaultActiveFirstOption={false}
                  filterOption={false}
                >
                  {users.map((user, index) => (
                    <Option key={index} value={user.id}>
                      {user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={t && t("blog.title")}
                name="title"
                rules={[
                  {
                    required: true,
                    message: t("blog.Pleaseenteryourtitle"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="blogCategoryId"
                label={t && t("blog.category")}
                rules={[
                  { required: true, message: t("blog.Pleaseselectcategory") },
                ]}
              >
                <Select
                  placeholder="Select Category"
                  showSearch
                  onSearch={getCategorySearch}
                  defaultActiveFirstOption={false}
                  filterOption={false}
                >
                  {categories.map((category, index) => (
                    <Option key={index} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={t && t("blog.summary")}
                name="summary"
                rules={[
                  {
                    required: true,
                    message: t("blog.Pleaseenteryoursummary"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="image"
                label={t && t("blog.images")}
                rules={[
                  { required: true, message: t("blog.Pleaseselectimages") },
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
                  imageOnly={valueForm.image}
                  onOpenImg={handleOpenImg}
                  onDelete={handleDeleteImage}
                />
              </Form.Item>
            </Col>
            <Row style={{ marginTop: "50px" }}>
              <Form.Item
                name="content"
                label={t && t("blog.content")}
                style={{ flexDirection: "row" }}
                rules={[
                  {
                    required: true,
                    message: t("blog.Pleaseenteryourcontent"),
                  },
                ]}
              >
                <BraftEditor
                  style={{
                    border: "1px solid gray",
                  }}
                  language="en"
                  placeholder="Enter yout content"
                  value={valueForm.content}
                  onChange={handleChangeEditor}
                />
              </Form.Item>
            </Row>
          </Row>
        </Form>
      </Drawer>
      <Drawer
        visible={visibleImg}
        placement="left"
        title={t("blog.imageSelector")}
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
        rowKey={(record) => record.id}
        pagination={{ ...pagination, total: total }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: 1500 }}
      />
    </div>
  );
}

export default ListBlog;
