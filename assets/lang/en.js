module.exports = {
  components: {
    back: {},
    password: {
      Password: 'Password',
      PasswordNotSame: 'Password doesn’t match',
      re1: 'Needs 8-20 characters',
      re2: 'At least one capital letter',
      re3: 'At least one letter',
      re4: 'At least one number',
      ConfirmPassword: 'Confirm Password',
      Confirm: 'Confirm',
    },
    pin: {
      // set
      SetPIN: 'Set Up a PIN',
      KeepSafe:
        'UniPass will verify your PIN every time when you login or sign message with UniPass to keep your assets safe.',
      NewPIN: 'New PIN',
      ConfirmNewPIN: 'Confirm New PIN',
      Confirm: 'Confirm',
      // check
      InputPIN: 'Input PIN to Unlock',
      Account: 'Account',
      CheckTip: '6-digit-PIN',
      ForgetPIN: 'Forgot PIN',
      // forgot
      ResetPIN: 'Reset PIN',
      ResetContent:
        'UniPass will verify your PIN every time when you login or sign message with UniPass to keep your assets safe.',
      ResetTip: 'Please input your password first before reset PIN.',
      Password: 'Password',
      ForgetPassword: 'Forgot Password',
      // forgot-new & forgot-confirm
      ForgetContent:
        'UniPass will verify your PIN every time when you login or sign message with UniPass to keep your assets safe.',
      // success
      PINRested: 'PIN Rested',
      Signed: 'Signed',
      Login: 'Login',
      Successfully: 'Successfully!',
      // error
      ErrorPIN: 'PIN code is incorrect.',
      ErrorPassword: 'Password is incorrect.',
      ErrorDigit: 'Please enter 6 digits',
      ErrorNotEqual: 'The two entered PINs do not match',
    },
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
    help: {
      PleaseContact: 'Please contact',
      Email: 'support@unipass.me',
      NeedHelp: 'if you need help.',
    },
  },
  login: {
    title: 'Log In With',
    titleContinue: 'Already Logged In',
    subtitle: 'Your UniPass Account',
    account: 'Email',
    password: 'Password',
    forget: 'Forgot Password',
    login: 'Log In',
    signUp: 'Sign Up',
    continue: 'Continue',
    another: 'Log In With Another Account',
    // error
    warning: 'Wrong email or password',
    recovering:
      'This account is still under recovery and is temporarily unavailable. For assistance, please contact support@unipass.me',
    unknown: 'Unknown Error',
  },
  password: {
    title: 'Set Password',
    content:
      'This password is very important, related to the security of all assets in your UniPass account. Please set a new and complicated password.',
  },
  recover: {
    ForgetPassword: 'Forgot Password',
    Because:
      'There are some agreements you need to know before starting asset recovery progress:',
    Because1:
      '1. Start assets recovery means you need to set a new password to generate a new address, please do not use the old address to receive assets anymore.',
    Because2:
      '2. If there are assets in your account, you need to recover your assets by forwarding  an email, which is a decentralized on-chain asset social recovery method.',
    Start: 'Start Assets Recovery',
    NotNow: 'Not Now',
    step1: 'Verification',
    step2: 'Property scan',
    step3: 'Recovery',
    step4: 'Finish',
    Email: 'Email',
    VerificationCode: 'Verification Code',
    Send: 'Send',
    Resend: 'Resend',
    Verify: 'Verify',
    noEmail: "I didn't bind an email address",
    // 无法恢复账号
    Unable: 'Unable to Recover',
    Account: 'Account',
    TrulySorry:
      'We are truly sorry that we are unable to help you recovering your account because you have not bound an email address with your UniPass account.',
    Please:
      'You can check those previously logged-in environments and try to transfer your assets directly.',
    ReturnLogin: 'Return to Log In',
    YourUniPass: '', // 干掉邮箱
    HasAssets:
      'There are assets in your UniPass account. After setting a new password, you need to forward an email to start assets recovery. All your assets would be locked up for 48 hours before transferring to your new address',
    NoAssets:
      'There are no assets in your UniPass account. You can set a new password to restore your account directly.',
    Next: 'Next',
    ConfirmRecover: 'Confirm to Recover Account',
    NewPassword: 'New Password',
    PleaseForward:
      'Make sure to start assets recovery, and you will receive an assets recovery email, please forward it to: recovery@mail.unipass.me.',
    SendEmail: 'Send Me Recovery Email',
    RecoveredSuccessfully1: 'UniPass Account',
    RecoveredSuccessfully2: 'Recovered Successfully!',
    NewAddress:
      'Your new address has been generated, and you can immediately log in with the new password.',
    OldAddress:
      'Please do not use the old address to accept assets. UniPass will not be responsible for any loss caused by this.',
    Login: 'Log In',
    AccountRecovery: 'Account Recovery',
    HasBeenReceived:
      'After you have successfully forward the email, all your assets would be locked for 48 hours before transferring to your new address.',
    OK: 'OK',
    // error
    ErrorMailBox: 'Mailbox format is incorrect',
    ErrorEmailNotExist: 'This email address has not been registered.',
    ErrorCodeSix: 'Verification code is six digits',
    ErrorCodeIncorrect: 'Verification code is incorrect.',
  },
  register: {
    Sign: 'Sign Up UniPass',
    Email: 'Email',
    SupportedEmail: 'Supported Mailbox',
    UniPassDKIM:
      'UniPass implements secure and decentralized account recovery by verifying the DKIM signature via emails on the chain. Therefore, currently, UniPass account registration only supports large-scale email service providers with high credibility.',
    VerificationCode: 'Verification Code',
    Send: 'Send',
    Resend: 'Resend',
    Next: 'Next',
    WithUniPass: 'Log In With UniPass Account',
    // error
    ErrorMailBox: 'Mailbox format is incorrect',
    ErrorEmailRegistered: 'This email address have already been registered.',
    ErrorCodeSix: 'Verification code is six digits',
    ErrorCodeIncorrect: 'Verification code is incorrect',
  },
  sign: {
    SignMessage: 'Sign Message',
    From: 'From:',
    Message: 'Message',
    Sign: 'Sign',
    Reject: 'Reject',
    RejectedMessage1: 'You Rejected the',
    RejectedMessage2: 'Message!',
    // 弹窗
    DialogTitle:
      'The requested signature account is inconsistent with the current account',
    Still: 'Current Account',
    Check: 'Change Account',
    Error: 'Missing parameter:',
  },
  home: {
    NFTAssets: 'NFT PROPERTY',
    RedPacket: 'Red Packet',
    Ticket: 'Ticket',
    Store: 'Store',
    Wallet: 'Wallet',
    UniPassAddress: 'Unipass Address',
    CopySuccess: 'Copied',
    Disabled: 'Developing, comming soon...',
    Claiming: 'Claiming',
    NoAssets: 'Sorry, there are no assets in your account',
  },
  nft: {
    have: 'Own',
    quantum: 'Limited',
    unlimited: 'Unlimited',
  },
  demo: {
    Demo: 'Demo',
    Sign: 'Sign',
    Login: 'Login',
    PopupWindow: 'Popup Window',
    Jump: 'Jump',
    PleaseLogin: 'Please Login',
    Low: 'Low compatibility browser list',
    LowTip: 'Popup Window is not supported by low compatibility browser',
  },
}
