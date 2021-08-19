module.exports = {
  components: {
    back: {},
    password: {
      Password: '密码',
      PasswordNotSame: '两次输入密码不一致',
      re1: '8-20 字符',
      re2: '至少一个大写字母',
      re3: '至少一个字母',
      re4: '至少一个数字',
      ConfirmPassword: '确认密码',
      Confirm: '确认',
    },
    pin: {
      // set
      SetPIN: '设置一个 PIN 码',
      KeepSafe:
        '每次登录或使用 UniPass 进行签名时，都需要验证您的 PIN 码，以保证您的资产安全。',
      NewPIN: '新 PIN 码',
      ConfirmNewPIN: '确认 PIN 码',
      Confirm: '确认',
      // check
      InputPIN: '请输入 PIN 码解锁',
      Account: '',
      CheckTip: '6 位 PIN 码',
      ForgetPIN: '忘记 PIN 码',
      // forget
      ResetPIN: '重置 PIN 码',
      ResetContent:
        '为了确保您资产的安全，UniPass 会在您每次登录和签名时验证您的 PIN 码。',
      ResetTip: '请在重置 PIN 码前验证您的密码',
      Password: '密码',
      ForgetPassword: '忘记密码',
      // forget-new & forget-confirm
      ForgetContent:
        '为了确保您资产的安全，UniPass 会在您每次登录和签名时验证您的 PIN 码。',
      // success
      PINRested: 'PIN 码重置成功',
      Signed: '签名成功',
      Login: '登录成功',
      Successfully: '',
      // error
      ErrorPIN: 'PIN 码错误',
      ErrorPassword: '密码不正确',
      ErrorDigit: '请输入 6 位数字',
      ErrorNotEqual: '两次输入 PIN 码不一致',
    },
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
    help: {
      PleaseContact: '如需帮助请联系',
      Email: 'support@unipass.me',
      NeedHelp: '',
    },
  },
  login: {
    title: '登录',
    titleContinue: '您已登录',
    subtitle: '您的 UniPass 账户',
    account: '邮箱',
    password: '密码',
    forget: '忘记密码',
    login: '登录',
    signUp: '注册',
    continue: '继续',
    another: '用其他账号登录',
    // error
    warning: '账号或密码错误',
    recovering:
      '此账户尚在恢复中，暂不可用。如需帮助，请联系 support@unipass.me。',
    unknown: '未知错误',
  },
  password: {
    title: '设置密码',
    content:
      '这个密码至关重要，关系到您 UniPass 账号中的资产安全。请设置一个全新且复杂的密码。',
  },
  recover: {
    ForgetPassword: '忘记密码',
    Because: '资产恢复，用户须知:',
    Because1:
      '1. 进行资产恢复时，您需要设置新密码生成新的地址，请不用再使用旧地址接收资产。',
    Because2:
      '2. 如果您账户内有资产，您需要通过转发邮件进行资产恢复，这是一种去中心化的链上资产社交恢复方式。',
    Start: '开始资产恢复',
    NotNow: '暂不进行资产恢复',
    step1: '账号验证',
    step2: '资产扫描',
    step3: '资产恢复',
    step4: '完成',
    Email: '邮箱',
    VerificationCode: '验证码',
    Send: '发送',
    Resend: '再次发送',
    Verify: '验证',
    noEmail: '尚未绑定邮箱',
    // 无法恢复账号
    Unable: '无法恢复账号',
    Account: '',
    TrulySorry:
      '非常抱歉，因为您的 UniPass 暂未绑定邮箱地址，所以我们无法帮助您恢复账号。',
    Please: '您可以检查曾登录 UniPass 的环境，尝试直接转移资产。',
    ReturnLogin: '返回登录',
    YourUniPass: '', // 干掉邮箱
    HasAssets:
      '您的 UniPass 账户中拥有资产。在设置新密码后，您需要转发一封电子邮件开始恢复资产，在转移至新地址前，您的资产将被锁定 48 小时。',
    NoAssets:
      '您的 UniPass 账户中没有资产。您可以通过设置新密码，直接恢复您的账户。',
    Next: '下一步',
    ConfirmRecover: '确认恢复帐户',
    NewPassword: '新密码',
    PleaseForward:
      '确定开始资产恢复后，您会收到一封资产恢复邮件，请将邮件转发至：recovery@mail.unipass.me',
    SendEmail: '发送恢复邮件',
    RecoveredSuccessfully1: 'UniPass 账号',
    RecoveredSuccessfully2: '恢复成功！',
    NewAddress: '您的新地址已生成，您可以立即使用新密码进行登录。',
    OldAddress:
      '请不要再使用旧地址接受资产。对此造成的任何损失，UniPass 概不负责。',
    Login: '登录',
    AccountRecovery: '账号恢复',
    HasBeenReceived:
      '在您成功转发资产恢复邮件后，您的所有资产将被锁定 48 小时，然后会自动转移至新地址。',
    OK: '好的',
    // error
    ErrorMailBox: '邮箱格式不正确',
    ErrorEmailRegistered: '此电子邮件地址已被注册',
    ErrorEmailNotExist: '此电子邮件地址未注册',
    ErrorCodeSix: '验证码需为六位数字',
    ErrorCodeIncorrect: '验证码不正确.',
  },
  register: {
    Sign: '注册 UniPass',
    Email: '邮箱',
    SupportedEmail: '支持邮箱列表',
    UniPassDKIM:
      'UniPass 通过在链上验证电子邮件的 DKIM 签名，实现了安全和去中心化的帐户恢复。因此，目前 UniPass 账号注册只支持高可信度的大型邮件服务商。',
    VerificationCode: '验证码',
    Send: '发送',
    Resend: '再次发送',
    Next: '下一步',
    WithUniPass: '用 UniPass 账号进行登录',
    // error
    ErrorMailBox: '邮箱格式不正确',
    ErrorEmailRegistered: '此电子邮件地址已被注册',
    ErrorCodeSix: '验证码需为六位数字',
    ErrorCodeIncorrect: '验证码不正确',
  },
  sign: {
    SignMessage: '签名',
    From: '来自：',
    Message: '消息',
    Sign: '签名',
    Reject: '拒绝',
    RejectedMessage1: '您拒绝了签名',
    RejectedMessage2: '',
    // 弹窗
    DialogTitle: '请求签名账户与当前账户不一致',
    Still: '仍使用当前地址',
    Check: '切换地址',
    Error: '缺少参数：',
  },
  home: {
    NFTAssets: 'NFT 资产',
    RedPacket: '红包',
    Ticket: '门票',
    Store: '商城',
    Wallet: '钱包',
    UniPassAddress: 'UniPass 接收地址',
    CopySuccess: '复制成功',
    Disabled: '开发中，敬请期待！',
    Claiming: '领取中',
    NoAssets: '抱歉，您账户内暂无资产',
  },
  nft: {
    have: '拥有',
    quantum: '限量',
    unlimited: '无限',
  },
  demo: {
    Demo: '演示',
    Sign: '签名',
    Login: '登录',
    PopupWindow: '弹窗',
    Jump: '跳转',
    PleaseLogin: '请先登录',
    Low: '低兼容性浏览器列表',
    LowTip: '低兼容性浏览器不支持弹出窗口',
  },
}
