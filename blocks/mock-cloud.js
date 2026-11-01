/* ============ 测试用 mock 云服务 ============
   模拟 @tencent-ai/workbuddy-cloud-sdk 的 auth / database 接口，
   让页面在无登录、无网络的情况下走通完整渲染链路。 */
(function () {
  function todayStr() {
    var d = new Date()
    var m = d.getMonth() + 1, day = d.getDate()
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day)
  }
  var TODAY = todayStr()
  var store = {
    todos: [
      { id: 1, title: '预习语文 P54', done: false, due_date: TODAY, repeat_days: null, subject: 'yuwen', priority: false, notes: '', created_at: TODAY + 'T08:00:00Z', owner_id: 'u1', owner_name: '小测' },
      { id: 2, title: '数学口算 20 题', done: true, due_date: TODAY, repeat_days: null, subject: 'shuxue', priority: true, notes: '限时 5 分钟', created_at: TODAY + 'T08:05:00Z', owner_id: 'u1' },
      { id: 3, title: '背英语单词 Unit 3', done: false, due_date: TODAY, repeat_days: [1, 2, 3, 4, 5, 6, 7], repeat_end: null, subject: 'yingyu', priority: false, notes: '', created_at: TODAY + 'T08:10:00Z', owner_id: 'u1' },
      { id: 4, title: '科学观察日记', done: false, due_date: TODAY, repeat_days: null, subject: 'kexue', priority: false, notes: '', created_at: TODAY + 'T08:12:00Z', owner_id: 'u1' },
      { id: 5, title: '钢琴练习 30 分钟', done: false, due_date: TODAY, repeat_days: null, subject: 'c99', priority: false, notes: '音阶 1-8', created_at: TODAY + 'T08:20:00Z', owner_id: 'u1' },
      { id: 6, title: '只到今天为止的重复', done: false, due_date: TODAY, repeat_days: [1, 2, 3, 4, 5, 6, 7], repeat_end: TODAY, subject: 'qita', priority: false, notes: '', created_at: TODAY + 'T08:30:00Z', owner_id: 'u1' }
    ],
    subjects: [
      { id: 99, owner_id: 'u1', name: '音乐', color: '#0891b2', sort_order: 0, created_at: TODAY + 'T07:00:00Z' }
    ],
    nextId: 100
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)) }

  function Builder(table, op, payload) {
    this.table = table
    this.op = op || 'select'
    this.payload = payload || null
    this.filters = []
    this.orders = []
  }
  Builder.prototype.select = function () { return this }
  Builder.prototype.order = function (col, opts) { this.orders.push([col, opts && opts.ascending]); return this }
  Builder.prototype.eq = function (col, val) { this.filters.push([col, val]); return this }
  Builder.prototype.in = function (col, arr) { this.filters.push([col, arr]); return this }

  Builder.prototype.match = function () { return this }
  Builder.prototype.single = function () { return this }
  Builder.prototype.maybeSingle = function () { return this }
  Builder.prototype.limit = function () { return this }
  Builder.prototype.range = function () { return this }

  Builder.prototype.then = function (resolve, reject) {
    var self = this
    /* 标准 thenable：同步计算结果，把 {data,error} 交给 resolve。
       注意不能返回 Promise —— await 会再次 then 它，导致 self 丢失。 */
    try {
      if (!self || typeof self.exec !== 'function') {
        throw new Error('MOCK_DEBUG bad this: type=' + typeof self + ' hasExec=' + !!(self && self.exec) + ' keys=' + (self ? Object.keys(self).join(',') : 'null'))
      }
      var out = self.exec()
      if (typeof resolve === 'function') resolve(out)
    } catch (e) {
      if (typeof reject === 'function') reject(e)
      else throw e
    }
  }

  Builder.prototype.exec = function () {
    /* 注意：浏览器里 window.self === window，这里必须用局部变量，不能直接用 self */
    var self = this
    var rows = clone(store[self.table] || [])
    var i
    if (!self.orders) {
      throw new Error('MOCK_DEBUG orders undefined | table=' + self.table + ' op=' + self.op +
        ' | ownKeys=' + Object.getOwnPropertyNames(self).join(',') +
        ' | isBuilder=' + (self instanceof Builder) +
        ' | ctor=' + (self.constructor && self.constructor.name))
    }

    if (self.op === 'insert') {
      var list = Array.isArray(self.payload) ? self.payload : [self.payload]
      var inserted = []
      list.forEach(function (p) {
        var row = Object.assign({
          id: store.nextId++,
          owner_id: 'u1',
          owner_name: '小测',
          done: false,
          created_at: new Date().toISOString(),
          due_date: TODAY,
          repeat_days: null,
          repeat_end: null,
          subject: null,
          priority: false,
          notes: ''
        }, clone(p))
        store[self.table].push(row)
        inserted.push(clone(row))
      })
      return { data: inserted, error: null }
    }

    if (self.op === 'update') {
      var upd = []
      for (i = 0; i < rows.length; i++) {
        if (matchFilters(rows[i], self.filters)) {
          Object.assign(rows[i], clone(self.payload))
          upd.push(clone(rows[i]))
        }
      }
      /* 写回 store（clone 后需要按 id 定位） */
      upd.forEach(function (u) {
        for (var j = 0; j < store[self.table].length; j++) {
          if (store[self.table][j].id === u.id) { store[self.table][j] = clone(u); break }
        }
      })
      return { data: upd, error: null }
    }

    if (self.op === 'delete') {
      var del = []
      store[self.table] = store[self.table].filter(function (r) {
        if (matchFilters(r, self.filters)) { del.push(clone(r)); return false }
        return true
      })
      return { data: del, error: null }
    }

    /* select */
    var out = rows.filter(function (r) { return matchFilters(r, self.filters) })
    self.orders.forEach(function (o) {
      var col = o[0], asc = o[1] !== false
      out.sort(function (a, b) {
        var av = a[col], bv = b[col]
        if (av === bv) return 0
        var r = av > bv ? 1 : -1
        return asc ? r : -r
      })
    })
    return { data: out, error: null }
  }

  function matchFilters(row, filters) {
    for (var i = 0; i < filters.length; i++) {
      var col = filters[i][0], val = filters[i][1]
      if (Array.isArray(val)) {
        if (val.indexOf(row[col]) === -1) return false
      } else if (row[col] !== val) return false
    }
    return true
  }

  Builder.prototype.insert = function (payload) { var n = new Builder(this.table, 'insert', payload); return n }
  Builder.prototype.update = function (payload) { var n = new Builder(this.table, 'update', payload); return n }
  Builder.prototype.delete = function () { var n = new Builder(this.table, 'delete', null); return n }

  var db = {
    from: function (table) { return new Builder(table, 'select', null) }
  }

  var auth = {
    getSession: function () {
      return Promise.resolve({ data: { user: { name: '小测', id: 'u1' } }, error: null })
    },
    onAuthStateChange: function () { },
    signOut: function () { return Promise.resolve({ data: null, error: null }) },
    sendOtp: function () { return Promise.resolve({ data: {}, error: null }) },
    verifyOtp: function () { return Promise.resolve({ data: {}, error: null }) },
    signInWithPassword: function () { return Promise.resolve({ data: {}, error: null }) },
    signInWithOAuth: function () { return Promise.resolve({ data: {}, error: null }) }
  }

  window.WorkBuddyCloud = {
    createWorkBuddyCloud: function () {
      return { database: db, auth: auth, storage: {}, llm: {} }
    },
    CLOUD_MODULE_PATHS: {}
  }
  window.__mockStore = store
})()
