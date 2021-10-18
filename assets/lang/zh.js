module.exports = {
  components: {
    header: {
      closeTitle: '确定退出 UniPass 吗？',
      exit: '退出',
      cancel: '取消',
      logout: '退出',
      lang: 'English',
      wechat: '关注微信公众号',
    },
    wechat: {
      title: 'UniPass 公众号',
      scan: '微信扫一扫关注公众号',
    },
    qrcode: {
      UniPassAddress: '接收地址',
      CopySuccess: '复制成功',
    },
    tx: {
      title: '交易成功！',
      from: '来自：',
      to: '去往：',
      fee: '手续费：',
      hash: '哈希：',
      block: '区块：',
      remark: '备注：',
      browser: '在区块链浏览器中查看',
    },
  },
  default: {
    AssetFailed: '资产获取失败',
  },
  index: {
    title: '社交代币',
    Welcome: 'Welcome',
    AssetList: '资产列表',
  },
  asset: {
    title: '资产详情',
    Collection: '收款',
    Send: '转账',
    TokenDetails: '代币详情',
    Publisher: '发行人',
    TokenTotal: '代币总量：',
    Circulation: '流通量：',
    IssueDate: '发行日期：',
    SocialStyle: '社交方式：',
    TransactionRecord: '交易记录',
    All: '全部',
    In: '收入',
    Out: '转出',
    loadMore: '加载更多',
    Pending: '交易进行中',
    RequestFailed: '请求失败',
  },
  send: {
    title: '转账',
    CollectionAddress: '收款地址',
    CKBAddress: 'CKB 地址',
    Money: '金额',
    Fee: '手续费',
    Send: '发送',
    BadAddress: '错误的地址格式',
    Minimum: '最小金额为 {data} CKB',
    LessThan: '转账金额必须小于余额',
    Maximum: '小数点后最多 {data} 位',
    Integer: '请输入整数',
    PleaseAddress: '请填写收款地址',
    PleaseMoney: '请填写金额',
    RejectSign: '拒绝签名',
    PubkeyMismatch: '公钥不匹配',
    CannotYour: '收款地址不能为自己',
    DoesNot: '对方地址暂无此资产，无法转账',
    BeCareful: '注意',
    SendAllTip: '剩余金额过低，无法发送交易。是否要发送全部的？',
    SendAll: '发送全部',
    cancel: '取消',
    SendSuccess: '发送成功',
    SendFailed: '交易失败',
    // tip send cell
    Tip1Title: '提示',
    Tip1: '他还没有这个代币，是否转一个CELL给对方？',
    Tip1Confirm: '确认',
    Tip1Cancel: '取消',
    // tip send cell no enough ckb
    Tip2Title: '提示',
    Tip2: '他还没有这个代币，且你没有足够的CKB，无法发送给对方',
    Tip2Confirm: '好吧',
  },
}
