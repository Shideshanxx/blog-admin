import { Icon, List, Tag } from 'antd';
import React from 'react';
import moment from 'moment';
import router from 'umi/router';
import styles from './index.less';

export default (props) => {
    const { data } = props;

    const IconText = ({ type, text }) => (
        <span>
            <Icon type={type} style={{ marginRight: 8 }} />
            {text}
        </span>
    );

    // 前往编辑
    const linkEdit = (id) => {
        router.push({
            pathname: '/articleManage/articleEdit',
            query: {
                id
            }
        })
    }

    return (
        <List
            size="large"
            className={styles.articleList}
            rowKey="id"
            itemLayout="vertical"
            dataSource={data}
            pagination={{
                onChange: () => {},
                pageSize: 5,
            }}
            renderItem={item => (
                <List.Item
                    key={item.id}
                    actions={[
                        <IconText key="view" type="fire" text={item.viewCount} />,
                        <IconText key="like" type="like" text={item.likeCount} />,
                        <IconText key="time" type="clock-circle" text={moment(item.createTime).format('YYYY-MM-DD HH:mm')} />,
                        <span onClick={() => linkEdit(item.id)}>
                            <Icon type="edit" style={{ marginRight: 8 }} />
                            编辑
                        </span>
                    ]}
                    extra={
                        item.cover && <div className={styles.itemCover} style={{ backgroundImage: `url(${item.cover})` }} />
                    }
                >
                    <List.Item.Meta
                        description={
                            <span>
                                {item.tags && item.tags.split(',').map((tag,index) => (
                                    <Tag color="blue" key={`${tag+index}`}>{tag}</Tag>
                                ))}
                            </span>
                        }
                        title={
                            <a className={styles.listItemMetaTitle} href={item.link}>
                                {item.title}
                            </a>
                        }
                    />
                    <div className={styles.listContent}>
                        <div className={styles.description}>{item.introduce}</div>
                    </div>
                </List.Item>
            )}
        />
    );
};