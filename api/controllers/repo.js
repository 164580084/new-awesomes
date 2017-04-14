const Repo = require('../models/repo')
const Oper = require('../models/oper')

module.exports = {

  // repo 列表
  get_index: (req, res) => {
    let limit = Math.min((req.query.limit || 10), 100)
    let skip = parseInt(req.query.skip || 0)
    let where = {}
    let query = {
      limit: limit,
      offset: skip,
      orderByRaw: 'id desc',
      select: ['id', 'name', 'cover', 'description_cn', 'owner', 'alia', 'using', 'mark']
    }

    if (req.query['sort'] === 'hot') {
      query.orderByRaw = '(stargazers_count + forks_count + subscribers_count) desc'
    }

    ;['rootyp', 'typcd'].forEach(key => {
      let val = req.query[key]
      if (val) {
        where[key] = val
      }
    })

    query.where = where

    Promise.all([Repo.where(where).count('id'), Repo.query(query).fetchAll()])
    .then(([count, repos]) => {
      res.send({
        items: repos,
        count: count
      })
    }).catch((err) => {
      console.error(err)
    })
  },

  get_index_id: (req, res) => {
    Repo.query({where: { owner: req.params.owner, alia: req.params.alia }}).fetch().then(data => {
      let _repo = data.toJSON()
      Oper.query({
        where: {opertyp: 'USING', typ: 'REPO', idcd: data.id},
        limit: 5,
        orderByRaw: 'id desc'
      }).fetchAll({
        withRelated: [{
          'mem': function (mqu) {
            return mqu.select('id', 'nc', 'avatar')
          }
        }]
      }).then(using => {
        _repo.usings = using
        res.send(_repo)
      })
    })
  },

  // 最新发布
  get_latest: (req, res) => {
    // let limit = Math.min((req.query.limit || 10), 100)
    // let skip = req.query.skip || 0
    Repo.query({limit: 15, offset: 0, orderByRaw: 'id desc', select: ['id', 'name', 'cover', 'description_cn', 'owner', 'alia']}).fetchAll().then((repo) => {
      res.send(repo)
    }).catch((err) => {
      console.error(err)
    })
  }
}
