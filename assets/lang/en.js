module.exports = {
  components: {
    header: {
      closeTitle: 'Are you sure to exit UniPass?',
      exit: 'Exit',
      cancel: 'Cancel',
      logout: 'Log out',
      lang: '中文',
      wechat: 'Follow Wechat',
    },
    wechat: {
      title: 'UniPass Wechat',
      scan: 'Follow the Wechat official account',
    },
    qrcode: {
      UniPassAddress: 'CKB Address',
      CopySuccess: 'Copied',
    },
    tx: {
      title: 'Transaction succeed!',
      from: 'From: ',
      to: 'To: ',
      fee: 'Fee: ',
      hash: 'Hash: ',
      block: 'Block: ',
      remark: 'Notes: ',
      browser: 'Open in blockchain explorer',
    },
  },
  default: {
    AssetFailed: 'Request assets failed',
  },
  index: {
    title: 'Social Token',
    Welcome: 'Welcome',
    AssetList: 'Assets List',
  },
  asset: {
    title: 'Asset details',
    Collection: 'Receive',
    Send: 'Send',
    TokenDetails: 'Token details',
    Publisher: 'Publisher',
    TokenTotal: 'Total supply: ',
    Circulation: 'Circulating supply: ',
    IssueDate: 'Issuing date: ',
    SocialStyle: 'Community: ',
    TransactionRecord: 'Transaction records',
    All: 'All',
    In: 'In',
    Out: 'Out',
    loadMore: 'Loading more',
    Pending: 'Pending',
    RequestFailed: 'Request failed',
  },
  send: {
    title: 'Transfer',
    CollectionAddress: 'To',
    CKBAddress: 'CKB Address',
    Money: 'Amount',
    Fee: 'Fee',
    Send: 'Send',
    BadAddress: 'Incorrect address',
    Minimum: 'Minimum amount {data} CKB',
    LessThan: 'Not enough amount',
    Maximum: 'Out of {data} decimal',
    Integer: 'Please enter an interger',
    PleaseAddress: 'Please type in receiver address',
    PleaseMoney: 'Please type in amount',
    RejectSign: 'Refuse to sign',
    PubkeyMismatch: 'Incorrect pubkey',
    CannotYour: 'Unable to tansfer to yourself',
    DoesNot: 'The receiver has no cell to store this asset, unable to transfer',
    BeCareful: 'Attention',
    SendAllTip: 'The left amount is too low, do you want to send all?',
    SendAll: 'Send all',
    cancel: 'Cancel',
    SendSuccess: 'Transfer submitted',
    SendFailed: 'Transaction failed',
    // tip send cell
    Tip1Title: 'Note',
    Tip1: `The receiver has no cell to store this asset, would you like to spend 143 CKB to create one?`,
    Tip1Confirm: 'Confirm',
    Tip1Cancel: 'Cancel',
    // tip send cell no enough ckb
    Tip2Title: 'Note',
    Tip2: `The receiver has no cell to store this asset, unable to transfer`,
    Tip2Confirm: 'OK',
  },
  scanner: {
    title: 'Scanner',
    scan: 'Scan',
  },
}
