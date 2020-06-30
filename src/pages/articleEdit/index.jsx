import React, { Component } from 'react';
import { connect } from 'dva';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { uploadQiniu } from '@/utils/uploadQiniu';

import {
    Modal,
    Form,
    Card,
    Row,
    Col,
    Icon,
    Button,
    Select,
    Upload,
    Input,
    message
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { router } from 'umi';
import TagsAdd from '../../components/TagsAdd';

import styles from './style.less';

const imageUrlBoxCss = {
    display: 'flex',
    justifTyContent: 'centeIr',
    alignItems: 'center',
    marginTop: '10px',
}

const imageUrlCss = {
    flex: '1',
    marginRight: '10px',
    height: '32px',
}

const maskOver = {
    overflow: 'hidden'
}

@connect(({ article, loading }) => ({
    article,
    loading: loading.models.user,
    uploading: loading.effects['article/uploadMdImg'],
    submitLoading: loading.effects['article/addEditArticle'],
}))

class ArticleEdit extends Component {
    constructor(props) {
        super(props);

        this.state = {
            articleId: null,
            currentItem: null,
            fileList: [],
            previewImage: '',
            previewVisible: false,
            editorModule: null,
            formulaVisible: false, // 公式模态框
            latexText: '',
            uploadImageVisible: false, // 上传图片模态框
            uploadImageUrl: null,	// 上传图片地址
            // 上传设置
            uploadProps: {
                name: 'file',
                style: { marginRight: 20 },
                showUploadList: false,
                customRequest: this.upLoadImgFn,
            },
        };
    }

    componentDidMount() {
        // 判断是否新增编辑， 新增没有id传过来，编辑有
        if (this.props.location.query.id) {
            this.props.dispatch({
                type: 'article/getArticleInfo',
                payload: {
                    id: this.props.location.query.id
                },
                callback: res => {
                    this.setState({
                        currentItem: res.data,
                        tags: res.data.tags ? res.data.tags.split(',') : [],
                        fileList: res.data.cover ? [{
                            uid: res.data.id,
                            name: 'cover.png',
                            status: 'done',
                            url: res.data.cover,
                        }] : [],

                    })
                    this.init(res.data.content)
                }
            })
        } else {
            this.init()
        }
    }

    init = (content) => {
        // let theStr = this.props.item.formValue ? this.props.item.formValue : '';
        window.editormd.emoji.path = "http://www.webpagefx.com/tools/emoji-cheat-sheet/graphics/emojis/";

        this.theEditormd = new window.editormd(`editormd`, {
            id: 123,
            width: "100%",
            height: 800,
            path: '/mdEditor/lib/',
            markdown: content || '',
            readOnly: false,
            placeholder: '请开始你的表演...',
            // delay : 1000, // Uint : ms, default value is 300, and this example is set value 1000
            theme: "dark",
            autoFocus: false, // 自动聚焦
            // previewTheme: "dark",
            editorTheme: "pastel-on-dark",
            saveHTMLToTextarea: true,    // 保存 HTML 到 Textarea
            searchReplace: true,
            // watch : false,                // 关闭实时预览
            htmlDecode: "style,script,iframe|on*",            // 开启 HTML 标签解析，为了安全性，默认不开启    
            //toolbar  : false,             //关闭工具栏
            //previewCodeHighlight : false, // 关闭预览 HTML 的代码块高亮，默认开启
            toolbarIcons: () => {
                const fullToolbar = window.editormd.toolbarModes.full;// 添加自定义toolbar
                return [...fullToolbar, 'uploadImgIcon', 'formulaIcon'];
            },
            toolbarIconsClass: {
                uploadImgIcon: "fa-file-image-o ",  // 指定一个FontAawsome的图标类
                formulaIcon: "fa-calculator",  // 指定一个FontAawsome的图标类
            },
            // 自定义工具栏按钮的事件处理
            toolbarHandlers: {
                /**
                 * @param {Object}      cm         CodeMirror对象
                 * @param {Object}      icon       图标按钮jQuery元素对象
                 * @param {Object}      cursor     CodeMirror的光标对象，可获取光标所在行和位置
                 * @param {String}      selection  编辑器选中的文本
                 */
                uploadImgIcon: (cm, icon, cursor, selection) => {
                    this.showUpdataModel()
                },
                formulaIcon: (cm, icon, cursor, selection) => {
                    this.showLatexModel()
                },
            },
            emoji: true,
            taskList: true,
            tocm: true,         // Using [TOCM]
            tex: true,                   // 开启科学公式TeX语言支持，默认关闭
            flowChart: true,             // 开启流程图支持，默认关闭
            sequenceDiagram: true,       // 开启时序/序列图支持，默认关闭,
            dialogLockScreen: false,   // 设置弹出层对话框不锁屏，全局通用，默认为true
            //dialogShowMask : false,     // 设置弹出层对话框显示透明遮罩层，全局通用，默认为true
            //dialogDraggable : false,    // 设置弹出层对话框不可拖动，全局通用，默认为true
            //dialogMaskOpacity : 0.4,    // 设置透明遮罩层的透明度，全局通用，默认值为0.1
            //dialogMaskBgColor : "#000", // 设置透明遮罩层的背景颜色，全局通用，默认为#fff
            imageUpload: false,
            setToolbarAutoFixed: true,
            onload: () => {
                this.theEditormd.watch();

                if (this.state.currentItem && this.state.currentItem.isPreview) {
                    this.theEditormd.hideToolbar();
                } else {
                    // 两次才起效？ 玄学？？？
                    this.theEditormd.showToolbar()
                    this.theEditormd.showToolbar()
                }
            }
        })
    }

    // 调取父组件回调
    callBackFn = () => {
        return this.props.callBack && this.props.callBack(this.props.id, this.theEditormd.getMarkdown());
    }

    handleCancel = () => {
        this.setState({
            uploadImageVisible: false,
        }, () => {
            this.setState({
                fileList: [],
                uploadImageUrl: null
            })
        })
    }

    // 编辑提交
    handleOk = () => {
        const { dispatch, form, location } = this.props;
        const { fileList } = this.state;

        form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            // 编辑 新增
            if (location.query.id) {
                fieldsValue.id = location.query.id
            }
            // 封面
            fieldsValue.cover = fileList && fileList[0] ? fileList[0].url : null;
            // 新增编辑文章
            const uploadArticle = (cover) => {
                if (cover) {
                    fieldsValue.cover = cover;
                }
                fieldsValue.content = this.theEditormd.getMarkdown();
                fieldsValue.tags = this.tagsRef.state.tags.join();

                return new Promise((resolve =>
                    dispatch({
                        type: 'article/addEditArticle',
                        payload: fieldsValue,
                        callback: () => {
                            message.success('成功')

                            router.push({
                                pathname: '/articleManage'
                            })
                            resolve();
                            // this.setState({
                            //   fileList: [{
                            //     uid:  fieldsValue.id,
                            //     name: 'cover.png',
                            //     status: 'done',
                            //     url: fieldsValue.cover,
                            //   }],
                            // })
                        }
                    })
                ))
            }

            // 判断封面是否更改
            if (fileList && fileList[0] && fileList[0].size) {
                uploadQiniu(dispatch, fileList[0], uploadArticle)
                return false;
            }
            uploadArticle()
        })
    }

    // 外部组件暴露方法 获取md内容
    getEditormdText = () => {
        return this.theEditormd.getMarkdown()
    }

    //打开上传图片模态框
    showUpdataModel = () => {
        this.setState({
            uploadImageVisible: true,
        })
    }

    // 上传函数
    upLoadImgFn = (fileList, file) => {
        if (!fileList.file) return

        uploadQiniu(this.props.dispatch, fileList.file, (res) => {
            this.setState({
                uploadImageUrl: `![avatar](${res})`
            })
            message.success('图片上传成功！')
        })
    }

    // 显示公式模态框
    showLatexModel = () => {
        this.setState({
            formulaVisible: true,
        })

        const eqEditorObj = new window.EqTextArea('equation', 'latex_formula');
        window.EqEditor.embed('editor', '', '', 'zh-cn');
        window.EqEditor.add(eqEditorObj, false);
    }

    hideLatexModal = () => {
        this.setState({
            formulaVisible: false,
        })
    }

    // 复制 图片上传地址
    onCopy1 = (text) => {
        if (text === this.state.uploadImageUrl) {
            message.success('复制成功！')
        } else {
            message.warning('复制失败！请手动复制')
        }
    }

    // 复制 公式
    onCopy2 = () => {
        let val = ""
        if (window.EqEditor.getTextArea().orgtxt !== "") {
            val = ` $$${window.EqEditor.getTextArea().orgtxt}$$`;
            document.addEventListener('copy', save); // 监听浏览器copy事件
            document.execCommand('copy'); // 执行copy事件，这时监听函数会执行save函数。
            document.removeEventListener('copy', save); // 移除copy事件
        }

        // 保存方法
        function save(e) {
            e.clipboardData.setData('text/plain', val); // 剪贴板内容设置
            e.preventDefault();
        }

        if (val !== "") {
            message.success('复制成功！')
        } else {
            message.warning('复制失败！请手动复制')
        }
    }

    // 解析为base64位 
    getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        // 读取文件
        reader.readAsDataURL(img);
    }

    // 图片预览
    handlePreview = file => {
        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });
    };

    render() {
        const {
            currentItem,
            fileList,
            previewVisible,
            previewImage,
            isPreview,
            uploadProps,
            formulaVisible,
            uploadImageVisible,
            uploadImageUrl
        } = this.state;

        const { form, form: { getFieldDecorator }, uploading, submitLoading } = this.props;

        const props = {
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                if (!isJpgOrPng) {
                    message.error('老铁你检查一下是不是JPG/PNG的图片文件!');
                    return false
                }

                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                    message.error('2MB以下!');
                    return false
                }

                this.getBase64(file, (imageUrl) => {
                    file.url = imageUrl
                    this.setState({
                        previewImage: imageUrl,
                        fileList: [file],
                    })
                });
                return false;
            },
            fileList: this.state.fileList
        };

        // 模态框底部按钮
        const footerBtn1 = (
            <div style={{ textAlign: 'center' }}>
                <Button type="primary" onClick={this.handleCancel}>返回</Button>
            </div>
        )

        // 模态框底部按钮
        const footerBtn2 = (
            <div style={{ textAlign: 'center' }}>
                <Button type="primary" onClick={this.hideLatexModal}>返回</Button>
            </div>
        )

        const PagesHeader = (
            <Card bordered={false} bodyStyle={{ padding: '0 24px' }} className={styles.articEditHeader}>
                <Form onSubmit={this.handleOk}>
                    <Row>
                        <Col sm={12} xs={24} style={{ paddingRight: 24 }}>
                            <Form.Item label="类型">
                                {getFieldDecorator('typeId', {
                                    initialValue: currentItem ? currentItem.typeId.toString() : undefined,
                                    rules: [{ required: true, message: '请选择类型!' }],
                                })(
                                    <Select disabled={currentItem && currentItem.isPreview} style={{ width: '100%' }} placeholder="请选择文章类型">
                                        <Select.Option value="1">技术</Select.Option>
                                        <Select.Option value="2">摄影</Select.Option>
                                        <Select.Option value="3">生活</Select.Option>
                                    </Select>
                                )}
                            </Form.Item>

                            <Form.Item label="标题">
                                {getFieldDecorator('title', {
                                    initialValue: currentItem ? currentItem.title : undefined,
                                    rules: [{ required: true, message: '请输入标题!' }],
                                })(
                                    <Input disabled={currentItem && currentItem.isPreview} placeholder="请输入标题" />
                                )}
                            </Form.Item>

                            <Form.Item label="介绍">
                                {getFieldDecorator('introduce', {
                                    initialValue: currentItem ? currentItem.introduce : undefined,
                                    rules: [{ required: true, message: '请输入介绍!' }],
                                })(
                                    <Input.TextArea disabled={currentItem && currentItem.isPreview} placeholder="请输入介绍" />
                                )}
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item label="标签">
                                <TagsAdd
                                    data={currentItem && currentItem.tags ? currentItem.tags.split(',') : []}
                                    ref={(dom) => { this.tagsRef = dom }}
                                    isEdit={(currentItem && currentItem.isPreview) ? false : true}
                                />
                            </Form.Item>
                            <Form.Item label="封面" className={styles.updateCoverBox}>
                                <Upload.Dragger
                                    {...props}
                                    name="files"
                                    listType="picture-card"
                                    onPreview={this.handlePreview}
                                    style={fileList.length >= 1 ? null : { padding: 18, border: '1px dashed #d9d9d9' }}
                                    disabled={currentItem && currentItem.isPreview}
                                >
                                    {fileList.length >= 1 ? null :
                                        <>
                                            <p className="ant-upload-drag-icon">
                                                <Icon type="picture" />
                                            </p>
                                            <p className="ant-upload-text">单击或拖动文件到此区域以上传</p>
                                            <p className="ant-upload-hint">只能上传限png、jpg 格式的图片，2m以下！</p>
                                        </>
                                    }
                                </Upload.Dragger>
                                <Modal visible={previewVisible} footer={null} onCancel={() => this.setState({ previewVisible: false })}>
                                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                </Modal>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        )

        return (
            <PageHeaderWrapper
                onBack={() => window.history.back()}
                title={currentItem ? (currentItem.isPreview ? "预览文章" : "编辑文章") : "新增文章"}
                content={PagesHeader}
                extra={
                    !currentItem || (currentItem && !currentItem.isPreview) ? [
                        <Button loading={submitLoading} onClick={this.handleOk} key="1" type="primary" icon="check" style={{ marginRight: 24 }}>
                            发布
                        </Button>,
                    ] : null}
            >
                <div className={styles.articDetail}>
                    <Card bordered={false} style={{ marginTop: 24 }}>
                        <div id="editormd"></div>
                    </Card>

                    <Modal
                        title="公式转换"
                        visible={formulaVisible}
                        onCancel={this.hideLatexModal}
                        maskClosable={false}
                        footer={footerBtn2}
                        wrapClassName={maskOver}
                        width={532}
                        destroyOnClose={true}
                    >
                        <div className="latexbox">
                            <div className="latex_mathjax">
                                <div id='editor'></div>
                                <div className="box">
                                    <textarea id="latex_formula" rows="4" cols="40"></textarea>
                                    <p className="link_src"></p>
                                    <p className="outlook">公式预览：</p>
                                    <div className="see"><img id="equation" /></div>
                                    <Button type="primary" onClick={this.onCopy2}>复制</Button>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    <Modal
                        title="图片上传"
                        visible={uploadImageVisible}
                        onCancel={this.handleCancel}
                        maskClosable={false}
                        destroyOnClose={true}
                        footer={footerBtn1}
                    >
                        <Upload.Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <Icon type={uploading ? "loading" : "picture"} />
                            </p>
                            <p className="ant-upload-text">点击或拖拽上传图片</p>
                            <p className="ant-upload-hint">仅限2M以下jpg、 png、 gif格式的图片</p>
                        </Upload.Dragger>

                        {
                            uploadImageUrl && uploadImageUrl !== '' &&
                            <div style={imageUrlBoxCss}>
                                <Input value={uploadImageUrl} style={imageUrlCss} onChange={() => false} />
                                <CopyToClipboard text={uploadImageUrl} onCopy={this.onCopy1}>
                                    <Button type="primary">复制</Button>
                                </CopyToClipboard>
                            </div>
                        }
                    </Modal>
                </div>
            </PageHeaderWrapper>
        )
    }
}

const ArticleEditForm = Form.create()(ArticleEdit);
export default ArticleEditForm;