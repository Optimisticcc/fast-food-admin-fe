import React from 'react';
import PropTypes from 'prop-types';
import { Space, Tag } from 'antd';

ProductDisplay.propTypes = {
    product: PropTypes.object,
};

function ProductDisplay(props) {
    const { product } = props
    return (
        <Space>
            <img src={product?.images[0]?.souce}/>
            <Tag>{product?.name}</Tag>
        </Space>
    );
}

export default ProductDisplay;