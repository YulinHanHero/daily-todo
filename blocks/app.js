/* ================= 云服务客户端（值来自 publicConfig） ================= */
/* publicConfig 由构建脚本注入（见 build.py / public-config.json）。 */
__PUBLIC_CONFIG__

var cloud = null
try {
  cloud = WorkBuddyCloud.createWorkBuddyCloud({
    endpoint: publicConfig.endpoint,
    oauthRelayBaseUrl: publicConfig.oauthRelayBaseUrl,
    publishableKey: publicConfig.publishableKey
  })
} catch (e) {
  showLoginError('服务初始化失败，请刷新页面重试。')
}

/* ================= DOM ================= */
var $ = function (id) { return document.getElementById(id) }
var authView = $('authView'), appView = $('appView')
var phoneInput = $('phoneInput'), codeInput = $('codeInput')
var sendCodeBtn = $('sendCodeBtn'), loginBtn = $('loginBtn')
var phoneError = $('phoneError'), loginError = $('loginError')
var emailInput = $('emailInput'), emailCodeInput = $('emailCodeInput')
var emailSendCodeBtn = $('emailSendCodeBtn'), emailLoginBtn = $('emailLoginBtn')
var emailError = $('emailError')
var tabPhone = $('tabPhone'), tabEmail = $('tabEmail'), tabPwd = $('tabPwd')
var phoneForm = $('phoneForm'), emailForm = $('emailForm'), pwdForm = $('pwdForm')
var pwdPhoneInput = $('pwdPhoneInput'), pwdInput = $('pwdInput'), pwdLoginBtn = $('pwdLoginBtn')
var pwdPhoneError = $('pwdPhoneError'), pwdError = $('pwdError')
var toRegisterBtn = $('toRegisterBtn'), registerBox = $('registerBox')
var regPhoneInput = $('regPhoneInput'), regSendCodeBtn = $('regSendCodeBtn'), regCodeInput = $('regCodeInput'), regPwdInput = $('regPwdInput'), regError = $('regError'), registerBtn = $('registerBtn')
var todoInput = $('todoInput'), dueInput = $('dueInput'), todoList = $('todoList')
var startInput = $('startInput'), repeatStartRow = $('repeatStartRow')
var startDisplay = $('startDisplay'), dueDisplay = $('dueDisplay')
var batchToggle = $('batchToggle'), batchBox = $('batchBox'), batchInput = $('batchInput'), batchPreview = $('batchPreview'), addBtn = $('addBtn')
var repeatDaysBox = $('repeatDays')
var addMask = $('addMask'), fabBtn = $('fabBtn'), sheetClose = $('sheetClose')
var remainText = $('remainText'), doneText = $('doneText'), emptyState = $('emptyState'), emptyText = $('emptyText')
var avatarText = $('avatarText')
var logoutBtn = $('logoutBtn')
var navCenter = $('navCenter'), todayBtn = $('todayBtn')
var dayPane = $('dayPane'), weekPane = $('weekPane'), monthPane = $('monthPane'), monthGrid = $('monthGrid')
var statsPane = $('statsPane'), statsWrap = $('statsWrap')
var addForm = $('addForm')
var themeBtn = $('themeBtn')
var filterBar = $('filterBar'), searchInput = $('searchInput'), subjectChips = $('subjectChips'), sortSelect = $('sortSelect')
var bulkToggle = $('bulkToggle'), bulkSwitchWrap = $('bulkSwitchWrap'), bulkBar = $('bulkBar'), bulkCount = $('bulkCount')
var addSubjectPick = $('addSubjectPick'), addPriority = $('addPriority'), manageSubjectBtn = $('manageSubjectBtn')
var detailMask = $('detailMask'), detailCard = $('detailCard'), detailClose = $('detailClose')
var dTitleInput = $('dTitleInput'), dDueInput = $('dDueInput'), dPriority = $('dPriority')
var dStartInput = $('dStartInput'), dStartField = $('dStartField')
var dDueDisplay = $('dDueDisplay'), dStartDisplay = $('dStartDisplay')
var dRepeatDays = $('dRepeatDays'), dSubjectPick = $('dSubjectPick'), dNotes = $('dNotes')
var dSaveBtn = $('dSaveBtn'), dDeleteBtn = $('dDeleteBtn'), dCancelBtn = $('dCancelBtn')
var subjectMask = $('subjectMask'), subjectCard = $('subjectCard'), subjectClose = $('subjectClose')
var subjectList = $('subjectList'), subjectNameInput = $('subjectNameInput'), subjectColorLine = $('subjectColorLine')
var subjectAddBtn = $('subjectAddBtn'), subjectCancelBtn = $('subjectCancelBtn')
var confirmMask = $('confirmMask'), confirmCard = $('confirmCard'), confirmTitle = $('confirmTitle'), confirmText = $('confirmText')
var confirmCancelBtn = $('confirmCancelBtn'), confirmOkBtn = $('confirmOkBtn')
var settingsBtn = $('settingsBtn')
var settingsMask = $('settingsMask'), settingsCard = $('settingsCard'), settingsClose = $('settingsClose')
var settingsAvatar = $('settingsAvatar'), settingsName = $('settingsName'), settingsPhone = $('settingsPhone')
var menuNameBtn = $('menuNameBtn'), menuNameDesc = $('menuNameDesc'), menuPwdBtn = $('menuPwdBtn')
var soundToggle = $('soundToggle')
var nameMask = $('nameMask'), nameCard = $('nameCard'), nameBackBtn = $('nameBackBtn'), nameClose = $('nameClose')
var settingsNameInput = $('settingsNameInput'), settingsSaveNameBtn = $('settingsSaveNameBtn'), settingsNameError = $('settingsNameError')
var pwdMask = $('pwdMask'), pwdCard = $('pwdCard'), pwdBackBtn = $('pwdBackBtn'), pwdClose = $('pwdClose')
var settingsPwdHint = $('settingsPwdHint'), settingsOldPwd = $('settingsOldPwd'), settingsNewPwd = $('settingsNewPwd')
var settingsPwdError = $('settingsPwdError'), settingsSavePwdBtn = $('settingsSavePwdBtn'), settingsCancelPwdBtn = $('settingsCancelPwdBtn')
var settingsLogoutBtn = $('settingsLogoutBtn')

var WEEK_CN = ['日', '一', '二', '三', '四', '五', '六']
var WEEK_MON = ['一', '二', '三', '四', '五', '六', '日']
var THEME_KEY = 'todo_theme'

/* ================= 状态 ================= */
var session = null
var pendingOtp = null
var sending = false
var countdownTimer = null
var emailPendingOtp = null
var emailSending = false
var emailCountdownTimer = null
var regPendingOtp = null
var regSending = false
var regCountdownTimer = null
var currentUserPhone = ''
var currentUserEmail = ''
var profileNickname = ''   /* 用户在 profiles 表里自定义的用户名 */

var viewMode = 'day'      /* 'day' | 'week' | 'month' | 'stats' */
var cursor = startOfDay(new Date())
var allTodos = []
var rangeTodos = []
var selectedRepeat = {}
var batchMode = false

/* 新增功能状态 */
var customSubjects = []      /* subjects 表里的自定义科目 */
var addSubjectKey = null     /* 新增表单里选中的科目 key */
var filterSubject = 'all'    /* 筛选：科目 key，'all' = 全部 */
var searchKeyword = ''
var sortMode = 'default'
var bulkMode = false         /* 批量选择模式 */
var selectedIds = {}         /* 批量选中的 id */
var editingId = null         /* 详情面板正在编辑的 todo id */
var editingRepeat = {}       /* 详情面板选中的重复星期 */
var editingSubjectKey = null
var undoRecord = null        /* 待撤销的删除记录 */
var undoTimer = null
var undoBar = null
var soundOn = false          /* 完成音效开关（默认关闭） */
var SOUND_KEY = 'todo_sound'

/* ================= 日期工具 ================= */
function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n) }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1) }
function startOfWeek(d) { var wd = (d.getDay() + 6) % 7; return addDays(d, -wd) }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0) }
function fmtDate(d) {
  var m = d.getMonth() + 1, day = d.getDate()
  return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day)
}
function isToday(d) { return fmtDate(d) === fmtDate(startOfDay(new Date())) }
function parseDate(s) {
  var p = String(s).split('-')
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10))
}
/* 中文日期展示：'2026-11-08' -> '11 月 8 日 周日'（与头部日期风格一致） */
function fmtDateCN(s) {
  if (!s) return ''
  var d = parseDate(s)
  if (isNaN(d.getTime())) return ''
  return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 周' + WEEK_CN[d.getDay()]
}
/* 同步日期选择器的中文展示文本 */
function syncDateDisplay(input, display) {
  if (!input || !display) return
  display.textContent = fmtDateCN(input.value)
}
/* 日期选择器变化时实时更新中文展示 */
dueInput.addEventListener('change', function () { syncDateDisplay(dueInput, dueDisplay) })
startInput.addEventListener('change', function () { syncDateDisplay(startInput, startDisplay) })
dDueInput.addEventListener('change', function () { syncDateDisplay(dDueInput, dDueDisplay) })
dStartInput.addEventListener('change', function () { syncDateDisplay(dStartInput, dStartDisplay) })
function jsDowToIso(dow) { return dow === 0 ? 7 : dow }
function isoDowToJs(iso) { return iso === 7 ? 0 : iso }

function rangeFor(mode, c) {
  if (mode === 'day') return { start: startOfDay(c), end: startOfDay(c) }
  if (mode === 'week') { var s = startOfWeek(c); return { start: s, end: addDays(s, 6) } }
  return { start: startOfMonth(c), end: endOfMonth(c) }
}

/* ================= 科目系统 ================= */
var BUILTIN_SUBJECTS = [
  { key: 'yuwen',   name: '语文', color: '#e5484d', colorDark: '#ff7b7f', builtin: true },
  { key: 'shuxue',  name: '数学', color: '#2563eb', colorDark: '#7aa5ff', builtin: true },
  { key: 'yingyu',  name: '英语', color: '#16a34a', colorDark: '#4ade80', builtin: true },
  { key: 'kexue',   name: '科学', color: '#ea8600', colorDark: '#f5a742', builtin: true },
  { key: 'qita',    name: '其他', color: '#7a5cff', colorDark: '#a78bff', builtin: true }
]
var SUBJECT_PALETTE = ['#e5484d', '#2563eb', '#16a34a', '#ea8600', '#7a5cff', '#0891b2', '#db2777', '#65a30d', '#c2410c', '#4f7cff']

function subjectRegistry() {
  var list = BUILTIN_SUBJECTS.slice()
  customSubjects.forEach(function (s) {
    list.push({
      key: 'c' + s.id,
      name: s.name,
      color: s.color || '#4f7cff',
      colorDark: s.color || '#4f7cff',
      builtin: false,
      id: s.id
    })
  })
  return list
}
function subjectByKey(key) {
  if (!key) return null
  var reg = subjectRegistry()
  for (var i = 0; i < reg.length; i++) { if (reg[i].key === key) return reg[i] }
  return null
}
function subjectLabel(key) {
  var s = subjectByKey(key)
  return s ? s.name : '其他'
}
function subjectColor(key) {
  var s = subjectByKey(key)
  if (!s) return '#7a5cff'
  return document.body.classList.contains('dark') ? s.colorDark : s.color
}
/* 给标签元素套用科目色（兼容深色模式） */
function applySubjectStyle(el, key) {
  var s = subjectByKey(key)
  if (!s) return
  var c = subjectColor(key)
  el.style.color = c
  el.style.background = 'rgba(0,0,0,0)'
  el.style.backgroundColor = 'transparent'
  el.style.background = 'color-mix(in srgb, ' + c + ' 15%, transparent)'
  if (!CSS && !CSS.supports('color', 'color-mix(in srgb, red 15%, transparent)')) {
    el.style.background = 'rgba(128,128,128,.14)'
  }
}

/* ================= 通用 UI ================= */
/* id 列是 bigint：PostgREST 返回时可能是字符串，统一转成数字再查询，
   避免 .eq/.in 因类型不匹配而查不到行 */
function numId(v) {
  var n = Number(v)
  return isNaN(n) ? v : n
}
var toastTimer = null
function showToast(msg) {
  var t = $('toast')
  t.textContent = msg
  t.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(function () { t.classList.remove('show') }, 2600)
}
function showLoginError(msg) { loginError.textContent = msg || '' }
function setPhoneError(msg) { phoneError.textContent = msg || '' }
function showLoginView() {
  session = null; allTodos = []; rangeTodos = []; selectedRepeat = {}
  batchMode = false; updateBatchUI()
  viewMode = 'day'; cursor = startOfDay(new Date())
  updateTabs()
  closeAddSheet(); closeDetail(); closeSubjectManager(); closeConfirm(); closeSettings()
  appView.classList.remove('active')
  authView.classList.add('active')
  render()
}
function showAppView() {
  authView.classList.remove('active')
  appView.classList.add('active')
}

/* ================= 深色模式 ================= */
function isDark() { return document.body.classList.contains('dark') }
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark)
  try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light') } catch (e) {}
  themeBtn.textContent = dark ? '☀️' : '🌙'
  render()
}
themeBtn.addEventListener('click', function () { applyTheme(!isDark()) })

/* ================= 错误信息 ================= */
function friendlyError(error) {
  if (error && error.code === '42P01') return '数据表尚未就绪，请稍后重试'
  if (error && error.code === '42501') return '没有权限执行此操作，请退出后重新登录'
  if (error && error.kind === 'unauthenticated') return '登录已过期，请重新登录'
  if (error && error.code === '23505') return '该名称已存在，换一个试试'
  var msg = error && error.message ? String(error.message) : ''
  if (/password not set/i.test(msg)) return '该手机号还没设置过密码，请切换到「手机号」用验证码登录进入后即可正常使用'
  if (/invalid credentials|wrong password|incorrect/i.test(msg)) return '手机号或密码不正确'
  if (msg) return msg
  return '网络异常，请稍后重试'
}

/* ================= 启动：OAuth 回调分发 + 会话恢复 ================= */
async function restoreAuth() {
  var url = new URL(location.href)
  if (!url.searchParams.has('code') && !url.searchParams.has('error')) {
    await continueNormalStartup()
    return
  }
  var provider = url.searchParams.get('provider')
  if (provider !== 'wechat') {
    var errDesc = url.searchParams.get('error_description') || url.searchParams.get('error')
    showLoginError(errDesc ? ('登录失败：' + errDesc) : '授权回调缺少有效的登录方式，请重新登录。')
    return
  }
  // 微信 OAuth 已下线，旧回调统一走会话恢复
  await continueNormalStartup()
}

async function continueNormalStartup() {
  var res = await cloud.auth.getSession()
  if (res.error) {
    showLoginView()
    showToast('网络异常，未能恢复登录状态，请刷新重试')
    return
  }
  if (!res.data) { showLoginView(); return }
  await enterApp(res.data)
}

/* ================= 进入应用 ================= */
async function enterApp(s) {
  session = s
  syncDueInput()
  showAppView()
  await loadProfile()
  await loadSubjects()
  await loadView()
}

/* 从 profiles 表读取自定义用户名，回退到登录账号 name */
async function loadProfile() {
  profileNickname = ''
  try {
    var res = await cloud.database.from('profiles').select('*').limit(1)
    if (!res.error && Array.isArray(res.data) && res.data.length > 0) {
      profileNickname = String(res.data[0].nickname || '').trim()
    }
  } catch (e) {
    profileNickname = ''
  }
  var fallback = (session && session.user && session.user.name) || ''
  var displayName = profileNickname || fallback
  avatarText.textContent = displayName ? displayName.trim().charAt(0) : '我'
}

/* ================= 手机验证码登录 ================= */
phoneInput.addEventListener('input', function () { setPhoneError('') })

sendCodeBtn.addEventListener('click', async function () {
  if (sending) return
  var phone = phoneInput.value.trim()
  if (!/^1\d{10}$/.test(phone)) { setPhoneError('请输入正确的 11 位手机号'); return }
  setPhoneError(''); showLoginError('')
  sending = true
  sendCodeBtn.disabled = true
  sendCodeBtn.textContent = '发送中…'
  var sent = await cloud.auth.sendOtp({ phone: phone })
  sending = false
  if (sent.error) {
    sendCodeBtn.disabled = false
    sendCodeBtn.textContent = '获取验证码'
    showLoginError(friendlyError(sent.error))
    return
  }
  pendingOtp = {
    phone: phone,
    verificationId: sent.data.verificationId,
    isExistingUser: sent.data.isExistingUser
  }
  codeInput.focus()
  startCountdown(60)
})

function startCountdown(sec) {
  clearInterval(countdownTimer)
  sendCodeBtn.disabled = true
  sendCodeBtn.textContent = sec + 's'
  countdownTimer = setInterval(function () {
    sec--
    if (sec <= 0) {
      clearInterval(countdownTimer)
      sendCodeBtn.disabled = false
      sendCodeBtn.textContent = '重新获取'
    } else {
      sendCodeBtn.textContent = sec + 's'
    }
  }, 1000)
}

document.getElementById('phoneForm').addEventListener('submit', async function (e) {
  e.preventDefault()
  var phone = phoneInput.value.trim()
  var code = codeInput.value.trim()
  if (!pendingOtp || pendingOtp.phone !== phone) {
    showLoginError('请先获取当前手机号的验证码')
    return
  }
  if (!code) { showLoginError('请输入验证码'); return }
  loginBtn.disabled = true
  loginBtn.textContent = '登录中…'
  var completed = await cloud.auth.verifyOtp({
    phone: pendingOtp.phone,
    verificationId: pendingOtp.verificationId,
    isExistingUser: pendingOtp.isExistingUser,
    token: code
  })
  loginBtn.disabled = false
  loginBtn.textContent = '登录 / 注册'
  if (completed.error) {
    showLoginError(friendlyError(completed.error))
    return
  }
  pendingOtp = null
  showLoginError('')
  codeInput.value = ''
  await enterApp(completed.data)
})

/* ================= 邮箱验证码登录 ================= */
emailInput.addEventListener('input', function () { emailError.textContent = '' })

emailSendCodeBtn.addEventListener('click', async function () {
  if (emailSending) return
  var email = emailInput.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailError.textContent = '请输入正确的邮箱地址'; return }
  emailError.textContent = ''; showLoginError('')
  emailSending = true
  emailSendCodeBtn.disabled = true
  emailSendCodeBtn.textContent = '发送中…'
  var sent = await cloud.auth.sendOtp({ email: email })
  emailSending = false
  if (sent.error) {
    emailSendCodeBtn.disabled = false
    emailSendCodeBtn.textContent = '获取验证码'
    showLoginError(friendlyError(sent.error))
    return
  }
  emailPendingOtp = {
    email: email,
    verificationId: sent.data.verificationId,
    isExistingUser: sent.data.isExistingUser
  }
  emailCodeInput.focus()
  startEmailCountdown(60)
})

function startEmailCountdown(sec) {
  clearInterval(emailCountdownTimer)
  emailSendCodeBtn.disabled = true
  emailSendCodeBtn.textContent = sec + 's'
  emailCountdownTimer = setInterval(function () {
    sec--
    if (sec <= 0) {
      clearInterval(emailCountdownTimer)
      emailSendCodeBtn.disabled = false
      emailSendCodeBtn.textContent = '重新获取'
    } else {
      emailSendCodeBtn.textContent = sec + 's'
    }
  }, 1000)
}

emailForm.addEventListener('submit', async function (e) {
  e.preventDefault()
  var email = emailInput.value.trim()
  var code = emailCodeInput.value.trim()
  if (!emailPendingOtp || emailPendingOtp.email !== email) {
    showLoginError('请先获取当前邮箱的验证码')
    return
  }
  if (!code) { showLoginError('请输入验证码'); return }
  emailLoginBtn.disabled = true
  emailLoginBtn.textContent = '登录中…'
  var completed = await cloud.auth.verifyOtp({
    email: email,
    verificationId: emailPendingOtp.verificationId,
    isExistingUser: emailPendingOtp.isExistingUser,
    token: code
  })
  emailLoginBtn.disabled = false
  emailLoginBtn.textContent = '登录 / 注册'
  if (completed.error) {
    showLoginError(friendlyError(completed.error))
    return
  }
  emailPendingOtp = null
  showLoginError('')
  emailCodeInput.value = ''
  await enterApp(completed.data)
})

/* ================= 密码登录 / 注册 ================= */
tabPhone.addEventListener('click', function () { switchLoginTab('phone') })
tabEmail.addEventListener('click', function () { switchLoginTab('email') })
tabPwd.addEventListener('click', function () { switchLoginTab('pwd') })

function switchLoginTab(mode) {
  tabPhone.classList.toggle('active', mode === 'phone')
  tabEmail.classList.toggle('active', mode === 'email')
  tabPwd.classList.toggle('active', mode === 'pwd')
  phoneForm.classList.toggle('active', mode === 'phone')
  emailForm.classList.toggle('active', mode === 'email')
  pwdForm.classList.toggle('active', mode === 'pwd')
  loginError.textContent = ''
  phoneError.textContent = ''
  emailError.textContent = ''
  pwdPhoneError.textContent = ''
  pwdError.textContent = ''
  regError.textContent = ''
  setRegisterMode(false)
}

pwdPhoneInput.addEventListener('input', function () { pwdPhoneError.textContent = '' })
pwdInput.addEventListener('input', function () { pwdError.textContent = '' })

pwdForm.addEventListener('submit', async function (e) {
  e.preventDefault()
  var account = pwdPhoneInput.value.trim()
  var pwd = pwdInput.value
  if (!account) { pwdPhoneError.textContent = '请输入手机号或邮箱'; return }
  if (!pwd) { pwdError.textContent = '请输入密码'; return }
  var isPhone = /^1\d{10}$/.test(account)
  var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)
  if (!isPhone && !isEmail) { pwdPhoneError.textContent = '请输入正确的手机号或邮箱'; return }
  pwdLoginBtn.disabled = true
  pwdLoginBtn.textContent = '登录中…'
  var res = isPhone
    ? await cloud.auth.signInWithPassword({ phone: account, password: pwd })
    : await cloud.auth.signInWithPassword({ email: account, password: pwd })
  pwdLoginBtn.disabled = false
  pwdLoginBtn.textContent = '登录'
  if (res.error) {
    pwdError.textContent = friendlyError(res.error)
    return
  }
  pwdInput.value = ''
  await enterApp(res.data)
})

toRegisterBtn.addEventListener('click', function () {
  setRegisterMode(!registerBox.classList.contains('show'))
})

function setRegisterMode(show) {
  registerBox.classList.toggle('show', show)
  /* 进入注册模式：隐藏登录输入组与顶部登录方式标签，只展示注册内容；按钮改为「返回登录」 */
  var hideEls = [pwdPhoneInput, pwdPhoneError, pwdInput, pwdError, pwdLoginBtn]
  hideEls.forEach(function (el) { if (el) el.style.display = show ? 'none' : '' })
  var tabs = document.querySelector('.login-tabs')
  if (tabs) tabs.style.display = show ? 'none' : ''
  toRegisterBtn.textContent = show ? '返回登录' : '没有账号？用密码注册'
  if (!show) {
    regCodeInput.value = ''
    regPwdInput.value = ''
    regError.textContent = ''
  }
}

regSendCodeBtn.addEventListener('click', async function () {
  if (regSending) return
  var phone = regPhoneInput.value.trim()
  if (!/^1\d{10}$/.test(phone)) { regError.textContent = '请先填写正确的 11 位手机号'; return }
  regError.textContent = ''
  regSending = true
  regSendCodeBtn.disabled = true
  regSendCodeBtn.textContent = '发送中…'
  var sent = await cloud.auth.sendOtp({ phone: phone })
  regSending = false
  if (sent.error) {
    regSendCodeBtn.disabled = false
    regSendCodeBtn.textContent = '获取验证码'
    regError.textContent = friendlyError(sent.error)
    return
  }
  regPendingOtp = {
    phone: phone,
    verificationId: sent.data.verificationId,
    isExistingUser: sent.data.isExistingUser
  }
  if (sent.data.isExistingUser) {
    regError.style.color = '#b8860b'
    regError.textContent = '该手机号已注册过（老账号，未设密码），验证后将直接登录；密码仅对新注册的手机号生效'
  } else {
    regError.style.color = ''
    regError.textContent = ''
  }
  regCodeInput.focus()
  startRegCountdown(60)
})

function startRegCountdown(sec) {
  clearInterval(regCountdownTimer)
  regSendCodeBtn.disabled = true
  regSendCodeBtn.textContent = sec + 's'
  regCountdownTimer = setInterval(function () {
    sec--
    if (sec <= 0) {
      clearInterval(regCountdownTimer)
      regSendCodeBtn.disabled = false
      regSendCodeBtn.textContent = '重新获取'
    } else {
      regSendCodeBtn.textContent = sec + 's'
    }
  }, 1000)
}

registerBtn.addEventListener('click', async function () {
  var phone = regPhoneInput.value.trim()
  var code = regCodeInput.value.trim()
  var pwd = regPwdInput.value
  if (!regPendingOtp || regPendingOtp.phone !== phone) {
    regError.textContent = '请先获取当前手机号的验证码'
    return
  }
  if (!code) { regError.textContent = '请输入验证码'; return }
  var isExisting = regPendingOtp.isExistingUser
  if (!isExisting && (!pwd || pwd.length < 6)) { regError.textContent = '请设置至少 6 位密码'; return }
  registerBtn.disabled = true
  registerBtn.textContent = isExisting ? '登录中…' : '注册中…'
  var completed = await cloud.auth.verifyOtp({
    phone: phone,
    verificationId: regPendingOtp.verificationId,
    isExistingUser: isExisting,
    token: code,
    password: isExisting ? undefined : pwd
  })
  registerBtn.disabled = false
  registerBtn.textContent = '注册并登录'
  if (completed.error) {
    regError.textContent = friendlyError(completed.error)
    return
  }
  regPendingOtp = null
  setRegisterMode(false)
  pwdInput.value = ''
  await enterApp(completed.data)
})

/* ================= 退出登录 ================= */
async function doSignOut() {
  var res = await cloud.auth.signOut()
  if (res.error) { showToast(friendlyError(res.error)); return false }
  showLoginView()
  return true
}
logoutBtn.addEventListener('click', async function () {
  logoutBtn.disabled = true
  await doSignOut()
  logoutBtn.disabled = false
})

cloud.auth.onAuthStateChange(function (event) {
  if (event === 'SIGNED_OUT') showLoginView()
})

/* ================= 设置面板 ================= */
function closeSettings() {
  settingsMask.classList.remove('show')
  settingsCard.classList.remove('show')
  closeSubPanels()
}
function openSettings() {
  closeAddSheet(); closeDetail(); closeSubjectManager(); closeConfirm(); closeSettings(); closeSubPanels()
  renderSettingsAccount()
  syncSoundToggle()
  settingsMask.classList.add('show')
  settingsCard.classList.add('show')
}
settingsBtn.addEventListener('click', openSettings)
settingsClose.addEventListener('click', closeSettings)
settingsMask.addEventListener('click', closeSettings)

/* 完成音效开关 */
function syncSoundToggle() {
  soundToggle.classList.toggle('on', soundOn)
  soundToggle.setAttribute('aria-checked', soundOn ? 'true' : 'false')
}
soundToggle.addEventListener('click', function () {
  soundOn = !soundOn
  syncSoundToggle()
  try { localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off') } catch (e) {}
  if (soundOn) playDoneSound()
})

/* 关闭所有子功能弹窗 */
function closeSubPanels() {
  nameMask.classList.remove('show'); nameCard.classList.remove('show')
  pwdMask.classList.remove('show'); pwdCard.classList.remove('show')
}
/* 从功能清单跳转到修改用户名 */
function openNamePanel() {
  settingsNameInput.value = profileNickname
  settingsNameError.textContent = ''
  settingsMask.classList.remove('show')
  settingsCard.classList.remove('show')
  nameMask.classList.add('show')
  nameCard.classList.add('show')
}
/* 从功能清单跳转到修改密码 */
function openPwdPanel() {
  settingsOldPwd.value = ''
  settingsNewPwd.value = ''
  settingsPwdError.textContent = ''
  renderSettingsPwdHint()
  settingsMask.classList.remove('show')
  settingsCard.classList.remove('show')
  pwdMask.classList.add('show')
  pwdCard.classList.add('show')
}
/* 从子弹窗返回设置首页 */
function backToSettings() {
  closeSubPanels()
  settingsMask.classList.add('show')
  settingsCard.classList.add('show')
}
menuNameBtn.addEventListener('click', openNamePanel)
menuPwdBtn.addEventListener('click', openPwdPanel)
nameBackBtn.addEventListener('click', backToSettings)
pwdBackBtn.addEventListener('click', backToSettings)
settingsCancelPwdBtn.addEventListener('click', backToSettings)
nameClose.addEventListener('click', closeSettings)
pwdClose.addEventListener('click', closeSettings)
nameMask.addEventListener('click', closeSettings)
pwdMask.addEventListener('click', closeSettings)

/* 读取当前登录账号的手机号与邮箱 */
async function loadCurrentUserIdentity() {
  if (typeof cloud.auth.getUser !== 'function') return { phone: '', email: '' }
  var res = await cloud.auth.getUser()
  if (res.error || !res.data) return { phone: '', email: '' }
  return {
    phone: (res.data.phone && typeof res.data.phone === 'string') ? res.data.phone : '',
    email: (res.data.email && typeof res.data.email === 'string') ? res.data.email : ''
  }
}

function maskEmail(email) {
  var at = email.indexOf('@')
  if (at <= 0) return email
  var head = email.slice(0, at)
  var tail = email.slice(at)
  var visible = head.slice(0, Math.min(2, head.length))
  return visible + '***' + tail
}

/* 填充设置面板的账号信息与登录状态 */
async function renderSettingsAccount() {
  var fallback = (session && session.user && session.user.name) || ''
  var displayName = profileNickname || fallback
  settingsName.textContent = displayName || '未命名用户'
  settingsAvatar.textContent = displayName ? displayName.trim().charAt(0) : '我'
  settingsNameInput.value = profileNickname
  settingsNameError.textContent = ''
  menuNameDesc.textContent = displayName || '未设置'

  var idn = await loadCurrentUserIdentity()
  currentUserPhone = idn.phone
  currentUserEmail = idn.email

  if (currentUserPhone) {
    var masked = currentUserPhone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
    settingsPhone.textContent = masked
  } else if (currentUserEmail) {
    settingsPhone.textContent = maskEmail(currentUserEmail)
  } else {
    settingsPhone.textContent = '—'
  }
}

/* 根据登录方式生成修改密码提示文案 */
function renderSettingsPwdHint() {
  if (currentUserPhone) {
    settingsPwdHint.textContent = '当前账号已绑定手机号。设置密码后，可用手机号 + 密码登录。'
  } else if (currentUserEmail) {
    settingsPwdHint.textContent = '当前账号通过邮箱登录。设置密码后，可用邮箱 + 密码登录。'
  } else {
    settingsPwdHint.textContent = '设置密码后，可用手机号或邮箱 + 密码登录。'
  }
}

/* 保存用户名到 profiles 表（upsert：有则更新，无则插入） */
settingsSaveNameBtn.addEventListener('click', async function () {
  var name = settingsNameInput.value.trim()
  if (!name) { settingsNameError.textContent = '用户名不能为空'; return }
  if (name.length > 20) { settingsNameError.textContent = '用户名最多 20 个字符'; return }
  settingsNameError.textContent = ''
  settingsSaveNameBtn.disabled = true
  settingsSaveNameBtn.textContent = '保存中…'

  var res = await cloud.database.from('profiles').select('id').limit(1)
  var result
  if (!res.error && Array.isArray(res.data) && res.data.length > 0) {
    result = await cloud.database.from('profiles').update({ nickname: name }).eq('id', numId(res.data[0].id)).select()
  } else {
    result = await cloud.database.from('profiles').insert({ nickname: name }).select()
  }

  settingsSaveNameBtn.disabled = false
  settingsSaveNameBtn.textContent = '保存'
  if (result && result.error) { settingsNameError.textContent = friendlyError(result.error); return }

  profileNickname = name
  var displayName = profileNickname || ((session && session.user && session.user.name) || '')
  settingsName.textContent = displayName
  settingsAvatar.textContent = displayName ? displayName.trim().charAt(0) : '我'
  menuNameDesc.textContent = displayName || '未设置'
  avatarText.textContent = displayName ? displayName.trim().charAt(0) : '我'
  showToast('用户名已更新')
  backToSettings()
})

/* 设置/修改密码 —— 提交（resetPasswordForOld：需旧密码，仅对已设密码的账号有效） */
settingsSavePwdBtn.addEventListener('click', async function () {
  var oldPwd = settingsOldPwd.value
  var newPwd = settingsNewPwd.value
  if (!newPwd || newPwd.length < 6) { settingsPwdError.textContent = '请设置至少 6 位新密码'; return }
  if (!oldPwd) { settingsPwdError.textContent = '请输入当前密码（若从未设置过密码，当前账号暂无法补设，请用验证码登录）'; return }
  settingsPwdError.textContent = ''
  settingsSavePwdBtn.disabled = true
  settingsSavePwdBtn.textContent = '保存中…'
  var res = await cloud.auth.resetPasswordForOld({
    oldPassword: oldPwd,
    newPassword: newPwd
  })
  settingsSavePwdBtn.disabled = false
  settingsSavePwdBtn.textContent = '保存'
  if (res.error) {
    settingsPwdError.textContent = friendlyError(res.error)
    return
  }
  settingsOldPwd.value = ''
  settingsNewPwd.value = ''
  settingsPwdError.textContent = ''
  showToast('密码修改成功')
  closeSettings()
})

settingsLogoutBtn.addEventListener('click', async function () {
  settingsLogoutBtn.disabled = true
  await doSignOut()
  settingsLogoutBtn.disabled = false
  closeSettings()
})

/* ================= 视图切换与导航 ================= */
function updateTabs() {
  var tabs = document.querySelectorAll('.view-tabs .tab')
  tabs.forEach(function (t) {
    t.classList.toggle('active', t.getAttribute('data-mode') === viewMode)
  })
}

document.querySelectorAll('.view-tabs .tab').forEach(function (t) {
  t.addEventListener('click', function () {
    var m = t.getAttribute('data-mode')
    if (m === viewMode) return
    viewMode = m
    updateTabs()
    loadView()
  })
})

function shiftView(dir) {
  if (viewMode === 'day') cursor = addDays(cursor, dir)
  else if (viewMode === 'week') cursor = addDays(cursor, dir * 7)
  else cursor = addMonths(cursor, dir)
  syncDueInput()
  loadView()
}
$('prevBtn').addEventListener('click', function () { shiftView(-1) })
$('nextBtn').addEventListener('click', function () { shiftView(1) })
todayBtn.addEventListener('click', function () {
  cursor = startOfDay(new Date())
  syncDueInput()
  loadView()
})

function goToDay(date) {
  viewMode = 'day'
  cursor = startOfDay(date)
  updateTabs()
  syncDueInput()
  loadView()
}

function syncDueInput() {
  dueInput.value = fmtDate(cursor)
  if (!startInput.value) startInput.value = fmtDate(startOfDay(new Date()))
  syncDateDisplay(dueInput, dueDisplay)
  syncDateDisplay(startInput, startDisplay)
}

/* 根据是否勾选了重复，控制「起始」字段的显示 */
function updateRepeatStartUI() {
  var hasRepeat = Object.keys(selectedRepeat).length > 0
  repeatStartRow.classList.toggle('show', hasRepeat)
  if (hasRepeat && !startInput.value) startInput.value = fmtDate(startOfDay(new Date()))
}
function updateDetailStartUI() {
  var hasRepeat = Object.keys(editingRepeat).length > 0
  dStartField.classList.toggle('show', hasRepeat)
}

/* ================= 科目数据 ================= */
async function loadSubjects() {
  try {
    var res = await cloud.database.from('subjects').select('*').order('sort_order', { ascending: true })
    if (!res.error && Array.isArray(res.data)) {
      customSubjects = res.data
    }
  } catch (e) {
    customSubjects = []
  }
  renderSubjectChips()
  renderSubjectPickers()
  renderSubjectManager()
}

/* ================= 数据加载 ================= */
async function loadView() {
  var res = await cloud.database.from('todos').select('*')
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: true })
  if (res.error) {
    showToast(friendlyError(res.error))
    allTodos = []
    rangeTodos = []
    render()
    return
  }
  allTodos = Array.isArray(res.data) ? res.data : []
  expandRange()
  render()
}

function todoMatchesDay(t, day) {
  var key = fmtDate(day)
  var dueKey = String(t.due_date || '').slice(0, 10)
  if (dueKey === key) return true
  var rp = t.repeat_days
  if (Array.isArray(rp) && rp.length > 0) {
    var iso = jsDowToIso(day.getDay())
    if (rp.indexOf(iso) !== -1) return true
  }
  return false
}

/* 把全部待办按日期范围展开成实例（重复任务会出现在多个日期） */
function expandBetween(start, end) {
  var list = []
  allTodos.forEach(function (t) {
    var rp = t.repeat_days
    var isRepeat = Array.isArray(rp) && rp.length > 0
    if (!isRepeat) {
      var dueKey = String(t.due_date || '').slice(0, 10)
      if (dueKey >= fmtDate(start) && dueKey <= fmtDate(end)) {
        list.push(makeInstance(t, dueKey, false))
      }
      return
    }
    var startKey = String(t.due_date || '').slice(0, 10)
    var endKey = String(t.repeat_end || '').slice(0, 10)
    /* 重复周期 = [due_date, repeat_end]（repeat_end 为空则无限重复）。
       关键：必须遍历「任务的真实周期」，不能把周期裁剪到查询范围内。
       裁剪会让起止日落在范围外的任务错误地命中范围边界那一天。
       例：due=11-01、repeat_end=11-01、repeat_days=[3,5] 的任务，
           真实周期只有 11-01（周日）一天，周三不该有它；
           若把周期裁成 [11-04, 11-04]，周三就会被错误命中。 */
    var beginDate = parseDate(startKey)
    var endDate = endKey ? parseDate(endKey) : null
    var qStartKey = fmtDate(start)
    var qEndDate = startOfDay(end)

    /* 任务周期还没开始 → 本范围内不会有实例 */
    if (beginDate > qEndDate) return

    /* 遍历起点：任务起始日 与 「查询起点前 7 天」的较晚者。
       重复间隔最多 7 天，往前推 7 天足以覆盖边界，
       同时避免为很早的历史任务白跑成千上万天。 */
    var floorDate = addDays(startOfDay(start), -7)
    var iterDate = beginDate > floorDate ? beginDate : floorDate
    var limit = endDate && endDate < qEndDate ? endDate : qEndDate

    for (var d = iterDate; d <= limit; d = addDays(d, 1)) {
      var dKey = fmtDate(d)
      if (dKey < qStartKey) continue
      var iso = jsDowToIso(d.getDay())
      if (rp.indexOf(iso) !== -1) {
        list.push(makeInstance(t, dKey, true))
      }
    }
  })
  list.sort(function (a, b) {
    if (a.due_date < b.due_date) return -1
    if (a.due_date > b.due_date) return 1
    return 0
  })
  return list
}

function makeInstance(t, dateKey, isRepeat) {
  return {
    id: t.id,
    title: t.title,
    done: t.done,
    due_date: dateKey,
    repeat_days: t.repeat_days,
    isRepeat: isRepeat,
    subject: t.subject,
    priority: !!t.priority,
    notes: t.notes || '',
    created_at: t.created_at
  }
}

function expandRange() {
  var r = rangeFor(viewMode === 'stats' ? 'month' : viewMode, cursor)
  rangeTodos = expandBetween(r.start, r.end)
}

/* ================= 筛选 / 排序 ================= */
function applyFilter(list) {
  var kw = searchKeyword.trim().toLowerCase()
  var out = list.filter(function (t) {
    if (filterSubject !== 'all' && (t.subject || 'qita') !== filterSubject) return false
    if (kw) {
      var hay = (t.title || '').toLowerCase() + ' ' + (t.notes || '').toLowerCase()
      if (hay.indexOf(kw) === -1) return false
    }
    return true
  })
  out.sort(function (a, b) {
    /* 未完成永远排在已完成之前（已完成任务自动沉到下方，形成分组） */
    if (a.done !== b.done) return a.done ? 1 : -1
    if (sortMode === 'priority') {
      if (a.priority !== b.priority) return a.priority ? -1 : 1
    }
    if (sortMode === 'due') {
      if (a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1
    }
    if (sortMode === 'created') {
      var ca = a.created_at || '', cb = b.created_at || ''
      if (ca !== cb) return ca < cb ? 1 : -1
    }
    if (sortMode === 'title') {
      return (a.title || '').localeCompare(b.title || '', 'zh-Hans-CN')
    }
    if (a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1
    return 0
  })
  return out
}

searchInput.addEventListener('input', function () {
  searchKeyword = searchInput.value || ''
  render()
})
sortSelect.addEventListener('change', function () {
  sortMode = sortSelect.value
  render()
})

function renderSubjectChips() {
  subjectChips.innerHTML = ''
  var reg = subjectRegistry()
  var used = {}
  rangeTodos.forEach(function (t) { used[t.subject || 'qita'] = true })
  var items = [{ key: 'all', name: '全部' }]
  reg.forEach(function (s) { if (used[s.key]) items.push(s) })
  if (items.length === 1) {
    items.push({ key: 'all', name: '全部' })
    items = [{ key: 'all', name: '全部' }]
  }
  items.forEach(function (s) {
    var chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'chip' + (filterSubject === s.key ? ' active' : '')
    chip.textContent = s.name
    chip.addEventListener('click', function () {
      filterSubject = s.key
      renderSubjectChips()
      render()
    })
    subjectChips.appendChild(chip)
  })
}

/* ================= 待办：增删改 ================= */
addForm.addEventListener('submit', async function (e) {
  e.preventDefault()
  if (batchMode) {
    await addBatchTodos()
  } else {
    await addSingleTodo()
  }
})

async function addSingleTodo() {
  var title = todoInput.value.trim()
  if (!title) { todoInput.focus(); return }
  var ownerName = (session && session.user && session.user.name) || null
  var repArr = Object.keys(selectedRepeat).map(Number).sort(function (a, b) { return a - b })
  var due = dueInput.value || fmtDate(cursor)
  var payload = { title: title, owner_name: ownerName, due_date: due }
  if (addSubjectKey) payload.subject = addSubjectKey
  if (addPriority.checked) payload.priority = true
  if (repArr.length > 0) {
    payload.repeat_days = repArr
    payload.due_date = startInput.value || fmtDate(startOfDay(new Date()))
    if (dueInput.value) payload.repeat_end = due
  }
  var res = await cloud.database.from('todos').insert(payload).select()
  if (res.error) { showToast(friendlyError(res.error)); return }
  var created = Array.isArray(res.data) && res.data[0]
  if (!created) { showToast('添加失败，请重试'); return }
  allTodos.push(created)
  todoInput.value = ''
  addPriority.checked = false
  addSubjectKey = null
  renderSubjectPickers()
  clearRepeat()
  expandRange()
  render()
  closeAddSheet()
}

/* ---------- 批量：科目识别 + 编号拆分 ---------- */
function matchSubject(prefix) {
  prefix = prefix.replace(/^\s+/, '')
  var reg = subjectRegistry()
  for (var i = 0; i < reg.length; i++) {
    var names = [reg[i].name]
    if (reg[i].builtin) {
      var extra = { yuwen: ['语'], shuxue: ['数'], yingyu: ['英'], kexue: ['科'], qita: ['其它'] }
      if (extra[reg[i].key]) names = names.concat(extra[reg[i].key])
    }
    for (var j = 0; j < names.length; j++) {
      var n = names[j]
      if (prefix.indexOf(n) === 0) {
        var rest = prefix.slice(n.length)
        if (rest === '' || /^[\s:：、,，]/.test(rest)) return reg[i]
      }
    }
  }
  return null
}

function parseBatch(text) {
  text = (text || '').replace(/\r\n/g, '\n')
  var results = []
  var curSubject = null
  var lines = text.split('\n')
  lines.forEach(function (line) {
    var trimmed = line.trim()
    if (!trimmed) return
    var subj = matchSubject(trimmed)
    if (subj) {
      curSubject = subj.key
      trimmed = stripSubjectPrefix(trimmed)
      if (!trimmed) return
    }
    var items = splitNumbered(trimmed)
    items.forEach(function (it) {
      if (!it) return
      results.push({ subject: curSubject || 'qita', title: it })
    })
  })
  return results
}

function stripSubjectPrefix(s) {
  var reg = subjectRegistry()
  for (var i = 0; i < reg.length; i++) {
    var names = [reg[i].name]
    if (reg[i].builtin) {
      var extra = { yuwen: ['语'], shuxue: ['数'], yingyu: ['英'], kexue: ['科'], qita: ['其它'] }
      if (extra[reg[i].key]) names = names.concat(extra[reg[i].key])
    }
    for (var j = 0; j < names.length; j++) {
      var n = names[j]
      if (s.indexOf(n) === 0) {
        var rest = s.slice(n.length)
        if (rest === '' || /^[\s:：、,，]/.test(rest)) {
          return rest.replace(/^[\s:：、,，]+/, '')
        }
      }
    }
  }
  return s
}

function splitNumbered(s) {
  var parts = []
  var re = /(?:^|[\s,，;；])(?:\(\s*)?(\d{1,2})(?:\s*\))?\s*[.、．:：)]/g
  var last = 0
  var m
  var found = false
  while ((m = re.exec(s)) !== null) {
    found = true
    if (last < m.index) {
      var pre = s.slice(last, m.index).trim()
      if (pre) parts.push(pre)
    }
    last = re.lastIndex
  }
  if (last < s.length) {
    var tail = s.slice(last).trim()
    if (tail) parts.push(tail)
  }
  if (!found) {
    var whole = s.trim()
    if (whole) return [whole]
    return []
  }
  return parts.map(function (p) {
    return p.replace(/^\s*(?:\(\s*)?\d{1,2}(?:\s*\))?\s*[.、．:：)]\s*/, '').trim()
  }).filter(function (p) { return p })
}

function renderBatchPreview() {
  batchPreview.innerHTML = ''
  var items = parseBatch(batchInput.value)
  if (items.length === 0) { batchPreview.style.display = 'none'; return }
  batchPreview.style.display = 'block'
  items.forEach(function (it) {
    var row = document.createElement('div')
    row.className = 'bp-item'
    var subj = document.createElement('span')
    subj.className = 'subj-tag'
    applySubjectStyle(subj, it.subject)
    subj.textContent = subjectLabel(it.subject)
    var title = document.createElement('span')
    title.className = 'bp-title'
    title.textContent = it.title
    row.appendChild(subj)
    row.appendChild(title)
    batchPreview.appendChild(row)
  })
}

async function addBatchTodos() {
  var items = parseBatch(batchInput.value)
  if (items.length === 0) { batchInput.focus(); showToast('没有识别到有效的作业内容'); return }
  var due = dueInput.value || fmtDate(cursor)
  var ownerName = (session && session.user && session.user.name) || null
  var repArr = Object.keys(selectedRepeat).map(Number).sort(function (a, b) { return a - b })
  var okCount = 0
  for (var i = 0; i < items.length; i++) {
    var payload = { title: items[i].title, subject: items[i].subject, owner_name: ownerName, due_date: due }
    if (addSubjectKey && items[i].subject === 'qita') payload.subject = addSubjectKey
    if (addPriority.checked) payload.priority = true
    if (repArr.length > 0) {
      payload.repeat_days = repArr
      payload.due_date = startInput.value || fmtDate(startOfDay(new Date()))
      if (dueInput.value) payload.repeat_end = due
    }
    var res = await cloud.database.from('todos').insert(payload).select()
    if (res.error) { showToast(friendlyError(res.error)); return }
    var created = Array.isArray(res.data) && res.data[0]
    if (created) { allTodos.push(created); okCount++ }
  }
  batchInput.value = ''
  renderBatchPreview()
  addPriority.checked = false
  clearRepeat()
  expandRange()
  render()
  closeAddSheet()
  showToast('已添加 ' + okCount + ' 条作业')
}

/* ---------- 添加面板 ---------- */
function openAddSheet() {
  addMask.classList.add('show')
  addForm.classList.add('show')
  if (!startInput.value) startInput.value = fmtDate(startOfDay(new Date()))
  syncDateDisplay(dueInput, dueDisplay)
  syncDateDisplay(startInput, startDisplay)
  updateRepeatStartUI()
  todoInput.focus()
}
function closeAddSheet() {
  addMask.classList.remove('show')
  addForm.classList.remove('show')
}

fabBtn.addEventListener('click', openAddSheet)
sheetClose.addEventListener('click', closeAddSheet)
addMask.addEventListener('click', closeAddSheet)

batchToggle.addEventListener('change', function () {
  batchMode = batchToggle.checked
  updateBatchUI()
})

batchInput.addEventListener('input', renderBatchPreview)

function updateBatchUI() {
  batchToggle.checked = batchMode
  batchToggle.closest('.batch-toggle').classList.toggle('on', batchMode)
  batchBox.classList.toggle('show', batchMode)
  todoInput.style.display = batchMode ? 'none' : ''
  addBtn.textContent = batchMode ? '批量添加' : '添加'
  renderBatchPreview()
}

/* ================= 重复星期选择 ================= */
repeatDaysBox.addEventListener('click', function (e) {
  var btn = e.target.closest('.repeat-day')
  if (!btn) return
  var wd = btn.getAttribute('data-wd')
  if (selectedRepeat[wd]) {
    delete selectedRepeat[wd]
    btn.classList.remove('active')
  } else {
    selectedRepeat[wd] = true
    btn.classList.add('active')
  }
  updateRepeatStartUI()
})

dRepeatDays.addEventListener('click', function (e) {
  var btn = e.target.closest('.repeat-day')
  if (!btn) return
  var wd = btn.getAttribute('data-wd')
  if (editingRepeat[wd]) {
    delete editingRepeat[wd]
    btn.classList.remove('active')
  } else {
    editingRepeat[wd] = true
    btn.classList.add('active')
  }
  updateDetailStartUI()
})

function clearRepeat() {
  selectedRepeat = {}
  var btns = repeatDaysBox.querySelectorAll('.repeat-day')
  btns.forEach(function (b) { b.classList.remove('active') })
  startInput.value = ''
  updateRepeatStartUI()
}

/* ================= 科目选择器渲染 ================= */
function renderSubjectPickers() {
  var reg = subjectRegistry()
  /* 新增表单 */
  addSubjectPick.innerHTML = ''
  reg.forEach(function (s) {
    var chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'pick-chip' + (addSubjectKey === s.key ? ' active' : '')
    chip.textContent = s.name
    if (addSubjectKey === s.key) { chip.style.background = subjectColor(s.key) }
    chip.addEventListener('click', function () {
      addSubjectKey = (addSubjectKey === s.key) ? null : s.key
      renderSubjectPickers()
    })
    addSubjectPick.appendChild(chip)
  })
  /* 详情面板 */
  dSubjectPick.innerHTML = ''
  reg.forEach(function (s) {
    var chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'pick-chip' + (editingSubjectKey === s.key ? ' active' : '')
    chip.textContent = s.name
    if (editingSubjectKey === s.key) { chip.style.background = subjectColor(s.key) }
    chip.addEventListener('click', function () {
      editingSubjectKey = (editingSubjectKey === s.key) ? null : s.key
      renderSubjectPickers()
    })
    dSubjectPick.appendChild(chip)
  })
}

addPriority.addEventListener('change', function () { /* 状态读取即可 */ })

/* ================= 科目管理 ================= */
var pendingColor = SUBJECT_PALETTE[0]
manageSubjectBtn.addEventListener('click', function () { openSubjectManager() })
subjectClose.addEventListener('click', closeSubjectManager)
subjectCancelBtn.addEventListener('click', closeSubjectManager)
subjectMask.addEventListener('click', closeSubjectManager)

function openSubjectManager() {
  subjectMask.classList.add('show')
  subjectCard.classList.add('show')
  renderSubjectManager()
}
function closeSubjectManager() {
  subjectMask.classList.remove('show')
  subjectCard.classList.remove('show')
}

function renderSubjectManager() {
  if (!subjectList) return
  subjectList.innerHTML = ''
  var reg = subjectRegistry()
  reg.forEach(function (s) {
    var item = document.createElement('div')
    item.className = 'subject-item'
    var dot = document.createElement('span')
    dot.className = 'subject-dot'
    dot.style.background = subjectColor(s.key)
    var name = document.createElement('span')
    name.className = 'subject-name'
    name.textContent = s.name
    item.appendChild(dot)
    item.appendChild(name)
    if (s.builtin) {
      var tag = document.createElement('span')
      tag.className = 'builtin-tag'
      tag.textContent = '内置'
      item.appendChild(tag)
    } else {
      var del = document.createElement('button')
      del.type = 'button'
      del.className = 'mini-btn danger'
      del.textContent = '删除'
      del.addEventListener('click', function () { deleteSubject(s) })
      item.appendChild(del)
    }
    subjectList.appendChild(item)
  })
  /* 颜色选择 */
  subjectColorLine.innerHTML = ''
  SUBJECT_PALETTE.forEach(function (c) {
    var dot = document.createElement('button')
    dot.type = 'button'
    dot.className = 'color-dot' + (pendingColor === c ? ' active' : '')
    dot.style.background = c
    dot.setAttribute('aria-label', c)
    dot.addEventListener('click', function () {
      pendingColor = c
      renderSubjectManager()
    })
    subjectColorLine.appendChild(dot)
  })
}

subjectAddBtn.addEventListener('click', async function () {
  var name = subjectNameInput.value.trim()
  if (!name) { subjectNameInput.focus(); return }
  subjectAddBtn.disabled = true
  var res = await cloud.database.from('subjects').insert({
    name: name,
    color: pendingColor,
    sort_order: customSubjects.length
  }).select()
  subjectAddBtn.disabled = false
  if (res.error) { showToast(friendlyError(res.error)); return }
  subjectNameInput.value = ''
  await loadSubjects()
  showToast('已添加科目「' + name + '」')
})

async function deleteSubject(s) {
  if (!s.id) return
  var res = await cloud.database.from('subjects').delete().eq('id', numId(s.id)).select()
  if (res.error) { showToast(friendlyError(res.error)); return }
  await loadSubjects()
  showToast('已删除科目「' + s.name + '」')
}

/* ================= 详情 / 编辑 ================= */
detailClose.addEventListener('click', closeDetail)
dCancelBtn.addEventListener('click', closeDetail)
detailMask.addEventListener('click', closeDetail)

function findTodoById(id) {
  for (var i = 0; i < allTodos.length; i++) { if (String(allTodos[i].id) === String(id)) return allTodos[i] }
  return null
}

function openDetail(id) {
  var t = findTodoById(id)
  if (!t) return
  editingId = t.id
  dTitleInput.value = t.title || ''
  dPriority.checked = !!t.priority
  dNotes.value = t.notes || ''
  editingRepeat = {}
  var rp = Array.isArray(t.repeat_days) ? t.repeat_days : []
  var isRepeat = rp.length > 0
  var btns = dRepeatDays.querySelectorAll('.repeat-day')
  btns.forEach(function (b) {
    var on = rp.indexOf(Number(b.getAttribute('data-wd'))) !== -1
    b.classList.toggle('active', on)
    if (on) editingRepeat[b.getAttribute('data-wd')] = true
  })
  /* 重复任务：起始=due_date，截止=repeat_end；非重复：截止=due_date */
  dStartInput.value = String(t.due_date || '').slice(0, 10)
  if (isRepeat) {
    dDueInput.value = String(t.repeat_end || '').slice(0, 10)
  } else {
    dDueInput.value = String(t.due_date || '').slice(0, 10)
  }
  syncDateDisplay(dDueInput, dDueDisplay)
  syncDateDisplay(dStartInput, dStartDisplay)
  editingSubjectKey = t.subject || null
  renderSubjectPickers()
  updateDetailStartUI()
  detailMask.classList.add('show')
  detailCard.classList.add('show')
  setTimeout(function () { dTitleInput.focus() }, 60)
}

function closeDetail() {
  editingId = null
  detailMask.classList.remove('show')
  detailCard.classList.remove('show')
}

dSaveBtn.addEventListener('click', async function () {
  if (editingId === null) return
  var title = dTitleInput.value.trim()
  if (!title) { dTitleInput.focus(); showToast('标题不能为空'); return }
  var repArr = Object.keys(editingRepeat).map(Number).sort(function (a, b) { return a - b })
  var payload = {
    title: title,
    priority: dPriority.checked,
    notes: dNotes.value.trim()
  }
  if (repArr.length > 0) {
    payload.repeat_days = repArr
    payload.due_date = dStartInput.value || fmtDate(startOfDay(new Date()))
    if (dDueInput.value) payload.repeat_end = dDueInput.value
  } else {
    payload.repeat_days = null
    payload.repeat_end = null
    payload.due_date = dDueInput.value || fmtDate(cursor)
  }
  if (editingSubjectKey) payload.subject = editingSubjectKey
  else payload.subject = null

  dSaveBtn.disabled = true
  dSaveBtn.textContent = '保存中…'
  var res = await cloud.database.from('todos').update(payload).eq('id', numId(editingId)).select()
  dSaveBtn.disabled = false
  dSaveBtn.textContent = '保存'
  if (res.error) { showToast(friendlyError(res.error)); return }
  var affected = Array.isArray(res.data) ? res.data : []
  if (affected.length === 0) { showToast('保存失败，该待办可能已不存在'); return }
  for (var i = 0; i < allTodos.length; i++) {
    if (String(allTodos[i].id) === String(editingId)) {
      allTodos[i] = Object.assign({}, allTodos[i], payload)
      if (affected[0]) {
        if (payload.repeat_days !== undefined) allTodos[i].repeat_days = payload.repeat_days
      }
      break
    }
  }
  closeDetail()
  expandRange()
  render()
  showToast('已保存')
})

dDeleteBtn.addEventListener('click', async function () {
  if (editingId === null) return
  var id = editingId
  var rec = findTodoById(id)
  closeDetail()
  requestDelete(id, rec)
})

/* ================= 完成 / 删除 ================= */
function findTodo(id) {
  for (var i = 0; i < rangeTodos.length; i++) { if (String(rangeTodos[i].id) === String(id)) return rangeTodos[i] }
  return null
}

/* 完成鼓励语（随机） */
var PRAISES = ['太棒了！🎉', '完成一项！✅', '真厉害！👍', '继续加油！💪', '做得真好！🌟', '又完成啦！🎊']
function randomPraise() {
  return PRAISES[Math.floor(Math.random() * PRAISES.length)]
}

/* 完成音效（Web Audio 轻快"叮"声，无需音频文件） */
function playDoneSound() {
  if (!soundOn) return
  try {
    var ctx = window.__todoAudioCtx
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      ctx = new AC()
      window.__todoAudioCtx = ctx
    }
    if (ctx.state === 'suspended') ctx.resume()
    var now = ctx.currentTime
    var osc = ctx.createOscillator()
    var gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08)
    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.26)
  } catch (e) {}
}

async function toggleTodo(id) {
  var item = findTodo(id)
  if (!item) return
  var next = !item.done
  var res = await cloud.database.from('todos').update({ done: next }).eq('id', numId(id)).select()
  if (res.error) { showToast(friendlyError(res.error)); return }
  var affected = Array.isArray(res.data) ? res.data : []
  if (affected.length === 0) { showToast('修改失败，该待办可能已不存在'); return }
  for (var i = 0; i < allTodos.length; i++) {
    if (String(allTodos[i].id) === String(id)) { allTodos[i].done = next; break }
  }
  expandRange()
  if (next) {
    /* 完成：先播放打勾 + 淡出动画（停留原位），稍后再平滑下沉重排 */
    animateCompleteThenSettle(id)
  } else {
    render()
  }
  if (next) {
    /* 标记完成：激励反馈 */
    playDoneSound()
    showToast(randomPraise())
    celebrateIfDayAllDone(item)
  }
}

/* 完成任务：先打勾淡出（原位），再用 FLIP 平滑下沉到已完成分组 */
var completeSettleTimer = null
function animateCompleteThenSettle(id) {
  clearTimeout(completeSettleTimer)
  var container = viewMode === 'day' ? todoList : (viewMode === 'week' ? weekPane : monthPane)
  /* 1. 在旧 DOM 上标记视觉完成（打勾 + 淡出），但不重排 */
  var li = null
  var nodes = container ? container.querySelectorAll('[data-id]') : []
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].getAttribute('data-id') === String(id)) { li = nodes[i]; break }
  }
  if (li) li.classList.add('done', 'completing')
  /* 2. 稍后执行 FLIP 重排 */
  completeSettleTimer = setTimeout(function () {
    flipSettle(container)
  }, 300)
}

/* FLIP：记录旧位置 → 重建 → 从旧位置平滑滑动到新位置 */
function flipSettle(container) {
  var old = []
  var items = container.querySelectorAll('.todo-item, .w-item')
  items.forEach(function (el) {
    old.push({ el: el, id: el.getAttribute('data-id'), rect: el.getBoundingClientRect() })
  })
  render()
  var moved = []
  items = container.querySelectorAll('.todo-item, .w-item')
  items.forEach(function (el) {
    var id = el.getAttribute('data-id')
    var o = null
    for (var i = 0; i < old.length; i++) { if (old[i].id === id) { o = old[i]; break } }
    if (!o) return
    var nr = el.getBoundingClientRect()
    var dy = o.rect.top - nr.top
    if (Math.abs(dy) > 1) {
      moved.push({ el: el, dy: dy })
    }
  })
  /* 应用过渡：先瞬移到旧位置，再滑动到新位置 */
  moved.forEach(function (m) {
    m.el.style.transition = 'none'
    m.el.style.transform = 'translateY(' + m.dy + 'px)'
  })
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      moved.forEach(function (m) {
        m.el.style.transition = 'transform .45s cubic-bezier(.4, 0, .2, 1), opacity .45s ease'
        m.el.style.transform = 'translateY(0)'
      })
      setTimeout(function () {
        moved.forEach(function (m) {
          m.el.style.transition = ''
          m.el.style.transform = ''
          m.el.classList.remove('completing')
        })
      }, 500)
    })
  })
}

/* 某天任务全部完成时庆祝 */
function celebrateIfDayAllDone(item) {
  if (!item) return
  var key = String(item.due_date || '').slice(0, 10)
  if (!key) return
  var items = allTodos.filter(function (t) { return String(t.due_date || '').slice(0, 10) === key })
  if (items.length > 1 && items.every(function (t) { return t.done })) {
    var todayKey = fmtDate(startOfDay(new Date()))
    if (key === todayKey) showToast('今天的任务全部完成啦！🎉🏆')
    else showToast('这一天的任务全部完成啦！🎉')
    playDoneSound()
  }
}

async function togglePriority(id) {
  var t = findTodoById(id)
  if (!t) return
  var next = !t.priority
  var res = await cloud.database.from('todos').update({ priority: next }).eq('id', numId(id)).select()
  if (res.error) { showToast(friendlyError(res.error)); return }
  var affected = Array.isArray(res.data) ? res.data : []
  if (affected.length === 0) { showToast('修改失败，该待办可能已不存在'); return }
  for (var i = 0; i < allTodos.length; i++) {
    if (String(allTodos[i].id) === String(id)) { allTodos[i].priority = next; break }
  }
  expandRange()
  render()
}

async function deleteTodo(id, record) {
  var res = await cloud.database.from('todos').delete().eq('id', numId(id)).select()
  if (res.error) { showToast(friendlyError(res.error)); return }
  var removed = Array.isArray(res.data) ? res.data : []
  if (removed.length === 0) { showToast('删除失败，该待办可能已不存在'); return }
  var gone = removed[0] || record
  allTodos = allTodos.filter(function (t) { return String(t.id) !== String(id) })
  delete selectedIds[id]
  expandRange()
  render()
  showUndo(gone)
}

/* ---------- 删除确认（重复任务需先确认） ---------- */
var pendingDeleteId = null
var pendingDeleteRecord = null

function isRepeatTask(record) {
  return record && Array.isArray(record.repeat_days) && record.repeat_days.length > 0
}

/* 统计某重复任务的重复天数（有截止日则精确统计；无限重复则返回 -1 表示"持续重复"） */
function repeatInstanceCount(record) {
  var rp = record.repeat_days
  if (!Array.isArray(rp) || rp.length === 0) return 0
  var startKey = String(record.due_date || '').slice(0, 10)
  var endKey = String(record.repeat_end || '').slice(0, 10)
  var begin = parseDate(startKey)
  if (!begin) return 0
  if (!endKey) return -1   /* 无限重复 */
  var end = parseDate(endKey)
  var count = 0
  for (var d = startOfDay(begin); d <= end; d = addDays(d, 1)) {
    var iso = jsDowToIso(d.getDay())
    if (rp.indexOf(iso) !== -1) count++
  }
  return count
}

/* 把重复星期数字 [2,4,6] 转成中文「周二、周四、周六」 */
function repeatDaysText(rp) {
  var names = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return rp.map(function (w) { return names[w] || '' }).filter(Boolean).join('、')
}

function openConfirm(id, record) {
  pendingDeleteId = id
  pendingDeleteRecord = record
  var isRep = isRepeatTask(record)
  if (isRep) {
    var cnt = repeatInstanceCount(record)
    var dayText = repeatDaysText(record.repeat_days)
    var scopeText = cnt < 0
      ? '（' + dayText + '，持续重复）'
      : '（' + dayText + '，共 ' + cnt + ' 天）'
    confirmTitle.textContent = '删除重复任务'
    confirmText.textContent = '这是一个重复任务' + scopeText + '，删除后将同时移除所有日期的这条任务，无法只删除其中某一天。确定要删除吗？'
  } else {
    confirmTitle.textContent = '删除任务'
    confirmText.textContent = '确定要删除「' + (record && record.title ? record.title : '该任务') + '」吗？'
  }
  confirmMask.classList.add('show')
  confirmCard.classList.add('show')
}

function closeConfirm() {
  pendingDeleteId = null
  pendingDeleteRecord = null
  confirmMask.classList.remove('show')
  confirmCard.classList.remove('show')
}

confirmCancelBtn.addEventListener('click', closeConfirm)
confirmMask.addEventListener('click', closeConfirm)
confirmOkBtn.addEventListener('click', async function () {
  var id = pendingDeleteId
  var record = pendingDeleteRecord
  closeConfirm()
  if (id === null) return
  await deleteTodo(id, record)
})

/* 删除入口：重复任务先弹确认，非重复任务也统一走确认（避免误删） */
function requestDelete(id, record) {
  if (!record) record = findTodoById(id)
  openConfirm(id, record)
}

/* ---------- 撤销删除 ---------- */
function showUndo(record) {
  if (!record) return
  undoRecord = record
  clearTimeout(undoTimer)
  if (!undoBar) {
    undoBar = document.createElement('div')
    undoBar.className = 'bulk-bar show'
    undoBar.style.position = 'fixed'
    undoBar.style.left = '16px'
    undoBar.style.right = '16px'
    undoBar.style.bottom = 'calc(92px + env(safe-area-inset-bottom))'
    undoBar.style.margin = '0'
    undoBar.style.zIndex = '160'
    undoBar.innerHTML = '<span class="bulk-count">已删除 1 项</span><div class="bulk-acts"><button type="button" class="bulk-btn" id="undoBtn">撤销</button></div>'
    document.body.appendChild(undoBar)
    undoBar.querySelector('#undoBtn').addEventListener('click', undoDelete)
  }
  undoBar.classList.add('show')
  undoTimer = setTimeout(hideUndo, 6000)
}
function hideUndo() {
  if (undoBar) undoBar.classList.remove('show')
  undoRecord = null
}
async function undoDelete() {
  if (!undoRecord) return
  var rec = undoRecord
  var payload = {
    title: rec.title,
    due_date: String(rec.due_date || '').slice(0, 10),
    done: !!rec.done,
    priority: !!rec.priority,
    notes: rec.notes || '',
    subject: rec.subject || null
  }
  if (Array.isArray(rec.repeat_days) && rec.repeat_days.length > 0) {
    payload.repeat_days = rec.repeat_days
    payload.repeat_end = rec.repeat_end || null
  }
  var res = await cloud.database.from('todos').insert(payload).select()
  if (res.error) { showToast(friendlyError(res.error)); return }
  var created = Array.isArray(res.data) && res.data[0]
  if (created) allTodos.push(created)
  hideUndo()
  expandRange()
  render()
  showToast('已撤销删除')
}

/* ================= 批量操作 ================= */
bulkToggle.addEventListener('change', function () {
  bulkMode = bulkToggle.checked
  bulkSwitchWrap.classList.toggle('on', bulkMode)
  if (!bulkMode) { selectedIds = {} }
  renderBulkBar()
  render()
})
$('bulkCancelBtn').addEventListener('click', function () {
  bulkMode = false
  bulkToggle.checked = false
  bulkSwitchWrap.classList.remove('on')
  selectedIds = {}
  renderBulkBar()
  render()
})
$('bulkDoneBtn').addEventListener('click', async function () {
  var ids = Object.keys(selectedIds)
  if (ids.length === 0) { showToast('请先选择要操作的任务'); return }
  /* id 在数据库里是 bigint，统一转成数字，避免 .in() 类型不匹配 */
  var idNums = ids.map(function (v) { return Number(v) }).filter(function (n) { return !isNaN(n) })
  if (idNums.length === 0) { showToast('请先选择要操作的任务'); return }
  var res = await cloud.database.from('todos').update({ done: true }).in('id', idNums).select()
  if (res.error) { showToast(friendlyError(res.error)); return }
  var affected = Array.isArray(res.data) ? res.data : []
  affected.forEach(function (row) {
    for (var i = 0; i < allTodos.length; i++) {
      if (String(allTodos[i].id) === String(row.id)) { allTodos[i].done = true; break }
    }
  })
  selectedIds = {}
  renderBulkBar()
  expandRange()
  render()
  showToast('已标记完成 ' + affected.length + ' 项')
})
$('bulkDelBtn').addEventListener('click', async function () {
  var ids = Object.keys(selectedIds)
  if (ids.length === 0) { showToast('请先选择要操作的任务'); return }
  var removedRows = []
  for (var i = 0; i < ids.length; i++) {
    var res = await cloud.database.from('todos').delete().eq('id', Number(ids[i])).select()
    if (res.error) { showToast(friendlyError(res.error)); return }
    var removed = Array.isArray(res.data) ? res.data : []
    if (removed.length === 0) continue
    removedRows.push(removed[0])
    allTodos = allTodos.filter(function (t) { return String(t.id) !== String(ids[i]) })
  }
  selectedIds = {}
  bulkMode = false
  bulkToggle.checked = false
  bulkSwitchWrap.classList.remove('on')
  renderBulkBar()
  expandRange()
  render()
  showToast('已删除 ' + removedRows.length + ' 项')
})

function renderBulkBar() {
  var n = Object.keys(selectedIds).length
  bulkCount.textContent = '已选 ' + n + ' 项'
  /* 开启批量模式即显示操作条，即使还没选中任何项 */
  bulkBar.classList.toggle('show', bulkMode)
}

function toggleSelect(id) {
  var k = String(id)
  if (selectedIds[k]) delete selectedIds[k]
  else selectedIds[k] = true
  renderBulkBar()
  render()
}
/* ================= 渲染 ================= */
function render() {
  renderNav()
  filterBar.style.display = viewMode === 'stats' ? 'none' : ''
  dayPane.classList.toggle('active', viewMode === 'day')
  weekPane.classList.toggle('active', viewMode === 'week')
  monthPane.classList.toggle('active', viewMode === 'month')
  statsPane.classList.toggle('active', viewMode === 'stats')
  if (viewMode === 'day') renderDay()
  else if (viewMode === 'week') renderWeek()
  else if (viewMode === 'month') renderMonth()
  else renderStats()
  renderCounter()
  renderSubjectChips()
}

function renderNav() {
  navCenter.innerHTML = ''
  var title = document.createElement('span')
  title.className = 'range-title'
  var badge = null
  if (viewMode === 'day') {
    title.textContent = (cursor.getMonth() + 1) + '月' + cursor.getDate() + '日 星期' + WEEK_CN[cursor.getDay()]
    if (isToday(cursor)) badge = '今天'
    todayBtn.textContent = '今天'
    todoInput.placeholder = isToday(cursor) ? '想做点什么？' : ('为 ' + (cursor.getMonth() + 1) + '月' + cursor.getDate() + '日 安排一件事')
  } else if (viewMode === 'week') {
    var s = startOfWeek(cursor), e = addDays(s, 6)
    title.textContent = (s.getMonth() + 1) + '月' + s.getDate() + '日 – ' + (e.getMonth() + 1) + '月' + e.getDate() + '日'
    if (fmtDate(s) <= fmtDate(startOfDay(new Date())) && fmtDate(startOfDay(new Date())) <= fmtDate(e)) badge = '本周'
    todayBtn.textContent = '本周'
  } else if (viewMode === 'month') {
    title.textContent = cursor.getFullYear() + '年' + (cursor.getMonth() + 1) + '月'
    var now = new Date()
    if (now.getFullYear() === cursor.getFullYear() && now.getMonth() === cursor.getMonth()) badge = '本月'
    todayBtn.textContent = '本月'
  } else {
    title.textContent = cursor.getFullYear() + '年' + (cursor.getMonth() + 1) + '月 · 学习统计'
    var now2 = new Date()
    if (now2.getFullYear() === cursor.getFullYear() && now2.getMonth() === cursor.getMonth()) badge = '本月'
    todayBtn.textContent = '本月'
  }
  navCenter.appendChild(title)
  if (badge) {
    var b = document.createElement('span')
    b.className = 'today-badge'
    b.textContent = badge
    navCenter.appendChild(b)
  }
}

/* ---------- 日视图 ---------- */
function makeCheck(item) {
  var check = document.createElement('span')
  check.className = 'check'
  if (bulkMode) {
    check.textContent = selectedIds[String(item.id)] ? '✓' : ''
    check.setAttribute('role', 'checkbox')
    check.setAttribute('aria-checked', selectedIds[String(item.id)] ? 'true' : 'false')
    check.addEventListener('click', function (e) { e.stopPropagation(); toggleSelect(item.id) })
    return check
  }
  check.textContent = '✓'
  check.setAttribute('role', 'checkbox')
  check.setAttribute('aria-checked', item.done ? 'true' : 'false')
  check.addEventListener('click', function (e) { e.stopPropagation(); toggleTodo(item.id) })
  return check
}
function makeDel(item) {
  var del = document.createElement('button')
  del.className = 'del-btn'
  del.type = 'button'
  del.setAttribute('aria-label', '删除')
  del.textContent = '×'
  del.addEventListener('click', function (e) {
    e.stopPropagation()
    var rec = findTodoById(item.id)
    requestDelete(item.id, rec)
  })
  return del
}
function makeRepTag(item) {
  var tag = document.createElement('span')
  tag.className = 'rep-tag'
  tag.textContent = '重复'
  tag.setAttribute('aria-label', '重复任务')
  return tag
}
function makeSubjectTag(item) {
  if (!item.subject) return null
  var key = item.subject
  var tag = document.createElement('span')
  tag.className = 'subj-tag'
  applySubjectStyle(tag, key)
  tag.textContent = subjectLabel(key)
  return tag
}
function makeStar(item) {
  var star = document.createElement('button')
  star.className = 'star-btn' + (item.priority ? ' on' : '')
  star.type = 'button'
  star.textContent = item.priority ? '★' : '☆'
  star.setAttribute('aria-label', item.priority ? '取消重要标记' : '标为重要')
  star.addEventListener('click', function (e) { e.stopPropagation(); togglePriority(item.id) })
  return star
}

function bindRowTap(el, item) {
  /* 整行点击 → 切换完成（对儿童更友好，点击热区大） */
  el.addEventListener('click', function () {
    if (bulkMode) { toggleSelect(item.id); return }
    toggleTodo(item.id)
  })
}
/* 标题文字点击 → 打开详情（保留编辑/备注入口） */
function bindTitleTap(titleEl, item) {
  titleEl.addEventListener('click', function (e) {
    e.stopPropagation()
    if (bulkMode) { toggleSelect(item.id); return }
    openDetail(item.id)
  })
}

function renderDay() {
  todoList.innerHTML = ''
  var list = applyFilter(rangeTodos)
  var hasPending = false
  var insertedDivider = false
  list.forEach(function (t) {
    if (!t.done) hasPending = true
    /* 在第一个已完成项之前插入分组标题（仅当此前已有未完成项） */
    if (t.done && hasPending && !insertedDivider) {
      var divider = document.createElement('li')
      divider.className = 'done-group-divider'
      divider.textContent = '已完成'
      todoList.appendChild(divider)
      insertedDivider = true
    }
    var li = document.createElement('li')
    li.className = 'todo-item' + (t.done ? ' done' : '') + (t.priority ? ' pri' : '') + (bulkMode && selectedIds[String(t.id)] ? ' sel' : '')
    li.setAttribute('data-id', String(t.id))
    var title = document.createElement('span')
    title.className = 'todo-title'
    title.textContent = t.title
    li.appendChild(makeCheck(t))
    var subjTag = makeSubjectTag(t)
    if (subjTag) li.appendChild(subjTag)
    li.appendChild(title)
    bindTitleTap(title, t)
    if (t.isRepeat) li.appendChild(makeRepTag(t))
    li.appendChild(makeStar(t))
    li.appendChild(makeDel(t))
    if (t.notes) {
      var notes = document.createElement('div')
      notes.className = 'todo-notes'
      notes.textContent = '📝 ' + t.notes
      li.appendChild(notes)
    }
    bindRowTap(li, t)
    todoList.appendChild(li)
  })
  if (list.length === 0 && rangeTodos.length > 0) {
    emptyText.textContent = '没有符合筛选条件的待办'
  } else {
    emptyText.textContent = isToday(cursor) ? '今天还没有待办，添加一条吧' : '这一天还没有待办'
  }
  emptyState.classList.toggle('show', list.length === 0)
}

/* ---------- 周视图 ---------- */
function renderWeek() {
  weekPane.innerHTML = ''
  var s = startOfWeek(cursor)
  var filtered = applyFilter(rangeTodos)
  for (var i = 0; i < 7; i++) {
    (function (i) {
      var d = addDays(s, i)
      var key = fmtDate(d)
      var items = filtered.filter(function (t) { return String(t.due_date || '').slice(0, 10) === key })
      var pending = items.filter(function (t) { return !t.done }).length

      var card = document.createElement('div')
      card.className = 'week-day'

      var header = document.createElement('div')
      header.className = 'week-day-header'
      var ht = document.createElement('div')
      ht.className = 'week-day-title' + (isToday(d) ? ' today' : '')
      var wd = document.createElement('span')
      wd.textContent = '周' + WEEK_MON[i]
      ht.appendChild(wd)
      var dt = document.createElement('span')
      dt.className = 'wd-date'
      dt.textContent = (d.getMonth() + 1) + '/' + d.getDate()
      ht.appendChild(dt)
      if (isToday(d)) {
        var tb = document.createElement('span')
        tb.className = 'today-badge'
        tb.textContent = '今天'
        ht.appendChild(tb)
      }
      var cnt = document.createElement('div')
      cnt.className = 'week-day-count'
      var allDone = items.length > 0 && pending === 0
      if (allDone) {
        var cele = document.createElement('span')
        cele.className = 'week-celebrate'
        cele.textContent = '🎉 全部完成'
        cnt.appendChild(cele)
      } else {
        var pendEl = document.createElement('span')
        pendEl.className = 'pending'
        pendEl.textContent = pending + ' 项待办'
        cnt.appendChild(pendEl)
        var sep = document.createElement('span')
        sep.textContent = ' · 已完成 ' + (items.length - pending) + '/' + items.length
        cnt.appendChild(sep)
      }
      header.appendChild(ht)
      header.appendChild(cnt)
      header.addEventListener('click', function () { goToDay(d) })
      card.appendChild(header)

      var box = document.createElement('div')
      box.className = 'week-items'
      if (items.length === 0) {
        var em = document.createElement('div')
        em.className = 'week-empty'
        em.textContent = '无待办'
        box.appendChild(em)
      } else {
        items.forEach(function (t) {
          var it = document.createElement('div')
          it.className = 'w-item' + (t.done ? ' done' : '') + (t.priority ? ' pri' : '')
          it.setAttribute('data-id', String(t.id))
          var title = document.createElement('span')
          title.className = 'w-title'
          title.textContent = t.title
          it.appendChild(makeCheck(t))
          var st = makeSubjectTag(t)
          if (st) it.appendChild(st)
          it.appendChild(title)
          bindTitleTap(title, t)
          if (t.isRepeat) it.appendChild(makeRepTag(t))
          it.appendChild(makeStar(t))
          it.appendChild(makeDel(t))
          bindRowTap(it, t)
          box.appendChild(it)
        })
      }
      card.appendChild(box)
      weekPane.appendChild(card)
    })(i)
  }
}

/* ---------- 月视图 ---------- */
function renderMonth() {
  monthGrid.innerHTML = ''
  var first = startOfMonth(cursor)
  var gridStart = startOfWeek(first)
  var stats = {}
  rangeTodos.forEach(function (t) {
    var k = String(t.due_date || '').slice(0, 10)
    if (!stats[k]) stats[k] = { pending: 0, done: 0, pri: 0 }
    if (t.done) stats[k].done++
    else stats[k].pending++
    if (t.priority) stats[k].pri++
  })
  for (var i = 0; i < 42; i++) {
    (function (i) {
      var d = addDays(gridStart, i)
      var inMonth = d.getMonth() === cursor.getMonth()
      var cell = document.createElement('div')
      cell.className = 'month-cell' + (inMonth ? '' : ' dim') + (isToday(d) ? ' today' : '')
      var day = document.createElement('span')
      day.className = 'm-day'
      day.textContent = d.getDate()
      cell.appendChild(day)
      var k = fmtDate(d)
      var st = stats[k]
      if (st && (st.pending > 0 || st.done > 0)) {
        var badge = document.createElement('span')
        if (st.pending > 0) {
          badge.className = 'm-badge' + (st.pri > 0 ? ' pri' : '')
          badge.textContent = st.pending
          badge.setAttribute('aria-label', st.pending + ' 项待办')
        } else {
          badge.className = 'm-badge all-done'
          badge.textContent = '✓'
          badge.setAttribute('aria-label', '已全部完成')
        }
        cell.appendChild(badge)
      }
      cell.addEventListener('click', function () { goToDay(d) })
      monthGrid.appendChild(cell)
    })(i)
  }
}

/* ---------- 统计视图 ---------- */
function computeStats() {
  var monthStart = startOfMonth(cursor)
  var monthEnd = endOfMonth(cursor)
  var monthItems = expandBetween(monthStart, monthEnd)
  var monthDone = monthItems.filter(function (t) { return t.done }).length
  var monthTotal = monthItems.length

  /* 连续打卡：当天有任务且全部完成则算打卡 */
  var today = startOfDay(new Date())
  var streak = 0
  var probe = new Date(today)
  var todayItems = expandBetween(probe, probe)
  if (!(todayItems.length > 0 && todayItems.every(function (t) { return t.done }))) {
    probe = addDays(probe, -1)
  }
  for (var guard = 0; guard < 400; guard++) {
    var items = expandBetween(probe, probe)
    if (items.length > 0 && items.every(function (t) { return t.done })) {
      streak++
      probe = addDays(probe, -1)
    } else {
      break
    }
  }

  /* 近 7 天 */
  var last7 = []
  for (var i = 6; i >= 0; i--) {
    var d = addDays(today, -i)
    var its = expandBetween(d, d)
    last7.push({
      date: d,
      total: its.length,
      done: its.filter(function (t) { return t.done }).length
    })
  }

  /* 科目分布 */
  var bySubject = {}
  monthItems.forEach(function (t) {
    var k = t.subject || 'qita'
    if (!bySubject[k]) bySubject[k] = { total: 0, done: 0 }
    bySubject[k].total++
    if (t.done) bySubject[k].done++
  })

  return {
    monthTotal: monthTotal,
    monthDone: monthDone,
    monthRate: monthTotal ? Math.round(monthDone * 100 / monthTotal) : 0,
    streak: streak,
    last7: last7,
    bySubject: bySubject
  }
}

function renderStats() {
  var s = computeStats()
  statsWrap.innerHTML = ''

  /* 核心指标 */
  var card1 = document.createElement('div')
  card1.className = 'stat-card'
  card1.innerHTML = '<div class="stat-title">本月完成情况</div>'
  var grid = document.createElement('div')
  grid.className = 'stat-grid'
  var items = [
    { num: s.monthDone, lbl: '已完成', cls: 'accent' },
    { num: s.monthTotal - s.monthDone, lbl: '待完成', cls: 'warn' },
    { num: s.monthRate + '<small>%</small>', lbl: '完成率', cls: '' }
  ]
  items.forEach(function (it) {
    var box = document.createElement('div')
    var num = document.createElement('div')
    num.className = 'stat-num ' + it.cls
    num.innerHTML = it.num
    var lbl = document.createElement('div')
    lbl.className = 'stat-lbl'
    lbl.textContent = it.lbl
    box.appendChild(num)
    box.appendChild(lbl)
    grid.appendChild(box)
  })
  card1.appendChild(grid)
  var streakLine = document.createElement('div')
  streakLine.className = 'stat-note'
  streakLine.textContent = '🔥 连续打卡 ' + s.streak + ' 天' + (s.streak >= 3 ? '，继续保持！' : '')
  card1.appendChild(streakLine)
  statsWrap.appendChild(card1)

  /* 近 7 天 */
  var card2 = document.createElement('div')
  card2.className = 'stat-card'
  card2.innerHTML = '<div class="stat-title">近 7 天完成趋势</div>'
  var maxV = 1
  s.last7.forEach(function (d) { if (d.total > maxV) maxV = d.total })
  var spark = document.createElement('div')
  spark.className = 'spark'
  s.last7.forEach(function (d) {
    var col = document.createElement('div')
    col.className = 'spark-col'
    var barWrap = document.createElement('div')
    barWrap.className = 'spark-bar'
    var inner = document.createElement('i')
    var h = d.total ? Math.round(d.done * 100 / maxV) : 0
    inner.style.height = Math.max(h, d.total ? 6 : 0) + '%'
    barWrap.appendChild(inner)
    var x = document.createElement('span')
    x.className = 'spark-x'
    x.textContent = (d.date.getMonth() + 1) + '/' + d.date.getDate()
    col.appendChild(barWrap)
    col.appendChild(x)
    spark.appendChild(col)
  })
  card2.appendChild(spark)
  var note2 = document.createElement('p')
  note2.className = 'stat-note'
  note2.textContent = '柱子高度 = 当天已完成数量（浅色部分为当天任务总量）'
  card2.appendChild(note2)
  statsWrap.appendChild(card2)

  /* 科目分布 */
  var card3 = document.createElement('div')
  card3.className = 'stat-card'
  card3.innerHTML = '<div class="stat-title">各科目任务量（本月）</div>'
  var keys = Object.keys(s.bySubject)
  if (keys.length === 0) {
    var em = document.createElement('div')
    em.className = 'stat-empty'
    em.textContent = '本月还没有任务'
    card3.appendChild(em)
  } else {
    var maxT = 1
    keys.forEach(function (k) { if (s.bySubject[k].total > maxT) maxT = s.bySubject[k].total })
    keys.sort(function (a, b) { return s.bySubject[b].total - s.bySubject[a].total })
    keys.forEach(function (k) {
      var v = s.bySubject[k]
      var row = document.createElement('div')
      row.className = 'bar-row'
      var label = document.createElement('span')
      label.className = 'bar-label'
      label.textContent = subjectLabel(k)
      var track = document.createElement('span')
      track.className = 'bar-track'
      var fill = document.createElement('span')
      fill.className = 'bar-fill'
      fill.style.width = Math.round(v.total * 100 / maxT) + '%'
      fill.style.background = subjectColor(k)
      track.appendChild(fill)
      var val = document.createElement('span')
      val.className = 'bar-val'
      val.textContent = v.done + '/' + v.total
      row.appendChild(label)
      row.appendChild(track)
      row.appendChild(val)
      card3.appendChild(row)
    })
  }
  statsWrap.appendChild(card3)
}

/* ---------- 计数 ---------- */
function renderCounter() {
  var list = applyFilter(rangeTodos)
  var total = list.length
  var done = 0
  list.forEach(function (t) { if (t.done) done++ })
  var remain = total - done
  if (viewMode === 'day') {
    remainText.textContent = '还剩 ' + remain + ' 项待办'
  } else if (viewMode === 'week') {
    remainText.textContent = '本周还剩 ' + remain + ' 项待办'
  } else if (viewMode === 'month') {
    remainText.textContent = '本月还剩 ' + remain + ' 项待办'
  } else {
    remainText.textContent = '本月还剩 ' + remain + ' 项待办'
  }
  doneText.textContent = '已完成 ' + done + ' / ' + total
}

/* ================= 日期显示 & 启动 ================= */
(function initToday() {
  var d = new Date()
  $('todayText').textContent = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 星期' + WEEK_CN[d.getDay()]
  var dark = false
  try { dark = localStorage.getItem(THEME_KEY) === 'dark' } catch (e) {}
  document.body.classList.toggle('dark', dark)
  themeBtn.textContent = dark ? '☀️' : '🌙'
  try { soundOn = localStorage.getItem(SOUND_KEY) === 'on' } catch (e) {}

  /* 密码可见性切换：点击小眼睛切换明文/密文 */
  var eyeBtns = document.querySelectorAll('.pwd-eye')
  eyeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.pwd-wrap')
      var input = wrap ? wrap.querySelector('input') : null
      if (!input) return
      var reveal = input.type === 'password'
      input.type = reveal ? 'text' : 'password'
      if (wrap) wrap.classList.toggle('revealed', reveal)
      btn.setAttribute('aria-label', reveal ? '隐藏密码' : '显示密码')
    })
  })
})()

if (cloud) restoreAuth()
